using System.Text.Json;
using GenerativeAI;
using GenerativeAI.Types;
using Interview.Api;
using Interview.Api.Data;
using Interview.Api.Middleware;
using Interview.Api.Services;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Scalar.AspNetCore;
using SysEnvironment = global::System.Environment;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMemoryCache();

builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    o.SerializerOptions.PropertyNameCaseInsensitive = true;
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

var configuredOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>();
var allowedOrigins = configuredOrigins is { Length: > 0 }
    ? configuredOrigins
    : new[] { "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5273" };

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var sqliteConn = ResolveSqliteConnectionString(builder);
var dataDir = Path.GetDirectoryName(SqlitePathFromConnectionString(sqliteConn));
if (!string.IsNullOrEmpty(dataDir))
    Directory.CreateDirectory(dataDir);

builder.Services.AddDbContextFactory<AnalyticsDbContext>(o => o.UseSqlite(sqliteConn));
builder.Services.AddDbContext<AnalyticsDbContext>(o => o.UseSqlite(sqliteConn));
builder.Services.AddSingleton<GeminiCostEstimator>();

var openApiPublicBaseUrl = builder.Configuration["OpenApi:PublicBaseUrl"]?.Trim().TrimEnd('/');
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, _, _) =>
    {
        document.Info = new OpenApiInfo
        {
            Title = "Jamey McElveen — Interview API",
            Version = "v1",
            Description =
                "Career-interview chat (Gemini), site analytics ingestion, and protected stats. "
                + "CORS allows configured front-end origins. "
                + "`/api/stats` requires header `X-Stats-Key`.",
        };
        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes["StatsApiKey"] = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.ApiKey,
            In = ParameterLocation.Header,
            Name = "X-Stats-Key",
            Description = "Server-side stats key (`STATS_API_KEY` or `Stats:ApiKey`).",
        };

        if (!string.IsNullOrEmpty(openApiPublicBaseUrl))
        {
            document.Servers = new List<OpenApiServer> { new() { Url = openApiPublicBaseUrl } };
        }

        return Task.CompletedTask;
    });

    options.AddOperationTransformer((operation, context, _) =>
    {
        var relative = context.Description.RelativePath;
        if (relative is not null
            && relative.Contains("api/stats", StringComparison.OrdinalIgnoreCase))
        {
            var req = new OpenApiSecurityRequirement
            {
                [new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "StatsApiKey" },
                }] = new List<string>(),
            };
            operation.Security ??= new List<OpenApiSecurityRequirement>();
            operation.Security.Add(req);
        }

        return Task.CompletedTask;
    });
});

var systemPromptPath = Path.Combine(builder.Environment.ContentRootPath, "Prompts", "system_prompt.md");
if (!File.Exists(systemPromptPath))
    throw new InvalidOperationException($"Missing system prompt: {systemPromptPath}");
var systemPromptText = File.ReadAllText(systemPromptPath);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AnalyticsDbContext>();
    db.Database.Migrate();
}

app.UseForwardedHeaders();
app.UseCors();

app.UseMiddleware<ChatRateLimitMiddleware>();
app.UseMiddleware<CareerContentFilterMiddleware>();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapOpenApi();
app.MapScalarApiReference("/", options =>
{
    options
        .WithTitle("Interview API")
        .ForceDarkMode()
        .DisableAgent();
});

app.MapAnalyticsRoutes();

app.MapPost("/api/chat", async (
    ChatRequest request,
    IConfiguration config,
    ILoggerFactory loggerFactory,
    IHostEnvironment host,
    AnalyticsDbContext db,
    GeminiCostEstimator costEstimator,
    HttpContext httpContext,
    CancellationToken ct) =>
{
    var chatLog = loggerFactory.CreateLogger("Interview.Chat");

    // ── resolve API key (before starting stream so we can return a proper HTTP error) ──
    var apiKey = config["Gemini:ApiKey"];
    if (string.IsNullOrWhiteSpace(apiKey))
        apiKey = SysEnvironment.GetEnvironmentVariable("GEMINI_API_KEY");
    if (string.IsNullOrWhiteSpace(apiKey))
    {
        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await httpContext.Response.WriteAsJsonAsync(
            new ChatResponse(null, "Server configuration error: missing Gemini API key."), ct);
        return;
    }

    // ── resolve model name ─────────────────────────────────────────────────────────────
    var modelName = config["Gemini:Model"];
    if (string.IsNullOrWhiteSpace(modelName))
        modelName = SysEnvironment.GetEnvironmentVariable("GEMINI_MODEL");
    if (string.IsNullOrWhiteSpace(modelName))
        modelName = GoogleAIModels.GeminiFlashLatest;
    else
    {
        modelName = modelName.Trim();
        if (IsLegacyGemini2FlashAlias(modelName))
            modelName = GoogleAIModels.GeminiFlashLatest;
    }

    // ── begin SSE response ─────────────────────────────────────────────────────────────
    // text/event-stream keeps the connection alive and lets the browser read tokens
    // as they arrive instead of waiting for the full Gemini response (fixes Vercel timeouts).
    httpContext.Response.ContentType = "text/event-stream";
    httpContext.Response.Headers.CacheControl = "no-cache";
    httpContext.Response.Headers["X-Accel-Buffering"] = "no"; // disable Railway/nginx response buffering

    var fullText = new System.Text.StringBuilder();
    GenerateContentResponse? lastChunk = null;

    try
    {
        SysEnvironment.SetEnvironmentVariable("GOOGLE_API_KEY", apiKey);

        var googleAi = new GoogleAi(apiKey, string.Empty, null, null);
        var generationConfig = new GenerationConfig
        {
            Temperature = 0.65f,
            MaxOutputTokens = 1024,
        };

        var model = googleAi.CreateGenerativeModel(
            modelName,
            config: generationConfig,
            safetyRatings: null,
            systemInstruction: systemPromptText);

        await foreach (var chunk in model.GenerateContentStreamAsync(request.Message!, ct))
        {
            lastChunk = chunk;

            string? delta = null;
            try { delta = chunk.Text(); }
            catch { /* safety-filtered chunk — skip */ }

            if (!string.IsNullOrEmpty(delta))
            {
                fullText.Append(delta);
                var payload = JsonSerializer.Serialize(new { delta });
                await httpContext.Response.WriteAsync($"data: {payload}\n\n", ct);
                await httpContext.Response.Body.FlushAsync(ct);
            }
        }

        var assembledText = fullText.ToString().Trim();
        if (string.IsNullOrEmpty(assembledText))
        {
            // Gemini returned nothing (all tokens safety-filtered or empty model output).
            var emptyPayload = JsonSerializer.Serialize(new
            {
                error = "The model returned an empty response. Try rephrasing your question.",
            });
            await httpContext.Response.WriteAsync($"data: {emptyPayload}\n\n", ct);
            await ChatTurnLog.SaveAsync(db, costEstimator, request, modelName,
                StatusCodes.Status502BadGateway, null, "empty stream", lastChunk, ct);
        }
        else
        {
            await httpContext.Response.WriteAsync("data: [DONE]\n\n", ct);
            await ChatTurnLog.SaveAsync(db, costEstimator, request, modelName,
                StatusCodes.Status200OK, assembledText, null, lastChunk, ct);
        }

        await httpContext.Response.Body.FlushAsync(ct);
    }
    catch (OperationCanceledException)
    {
        // Client disconnected — normal, not an error.
    }
    catch (Exception ex)
    {
        var root = ex.GetBaseException();
        chatLog.LogError(
            ex,
            "Gemini stream failed. Model={Model} Environment={Environment} ExceptionType={ExceptionType} Message={Message}",
            modelName,
            host.EnvironmentName,
            root.GetType().Name,
            root.Message);

        var userMsg = "The interview service is temporarily unavailable. Please try again shortly.";
        var errorPayload = JsonSerializer.Serialize(new
        {
            error = userMsg,
            detail = host.IsDevelopment() ? root.Message : (string?)null,
        });

        try
        {
            await httpContext.Response.WriteAsync($"data: {errorPayload}\n\n", ct);
            await httpContext.Response.Body.FlushAsync(ct);
        }
        catch { /* response may already be closed by the time we get here */ }

        await ChatTurnLog.SaveAsync(db, costEstimator, request, modelName,
            StatusCodes.Status502BadGateway, null, root.Message, lastChunk, ct);
    }
});

var port = SysEnvironment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port) && int.TryParse(port, out var p))
    app.Urls.Add($"http://0.0.0.0:{p}");

app.Run();

static bool IsLegacyGemini2FlashAlias(string modelName) =>
    string.Equals(modelName, "models/gemini-2.0-flash", StringComparison.OrdinalIgnoreCase)
    || string.Equals(modelName, "gemini-2.0-flash", StringComparison.OrdinalIgnoreCase)
    || string.Equals(modelName, GoogleAIModels.Gemini2Flash, StringComparison.OrdinalIgnoreCase);

static string SqlitePathFromConnectionString(string conn)
{
    const string prefix = "Data Source=";
    if (!conn.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        return Path.Combine(Directory.GetCurrentDirectory(), "data", "analytics.db");
    return conn[prefix.Length..].Trim();
}

static string ResolveSqliteConnectionString(WebApplicationBuilder builder)
{
    var raw = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(raw))
    {
        var fallback = Path.Combine(builder.Environment.ContentRootPath, "data", "analytics.db");
        return $"Data Source={fallback}";
    }

    if (!raw.Trim().StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase))
    {
        var fallback = Path.Combine(builder.Environment.ContentRootPath, "data", "analytics.db");
        return $"Data Source={fallback}";
    }

    var pathPart = raw["Data Source=".Length..].Trim();
    var fullPath = Path.IsPathRooted(pathPart)
        ? pathPart
        : Path.Combine(builder.Environment.ContentRootPath, pathPart);
    return $"Data Source={fullPath}";
}
