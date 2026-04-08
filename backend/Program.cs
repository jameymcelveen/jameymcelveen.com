using System.Text.Json;
using GenerativeAI;
using GenerativeAI.Types;
using Interview.Api;
using Interview.Api.Data;
using Interview.Api.Middleware;
using Interview.Api.Services;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
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

app.MapAnalyticsRoutes();

app.MapPost("/api/chat", async (
    ChatRequest request,
    IConfiguration config,
    ILoggerFactory loggerFactory,
    IHostEnvironment host,
    AnalyticsDbContext db,
    GeminiCostEstimator costEstimator,
    CancellationToken ct) =>
{
    var apiKey = config["Gemini:ApiKey"];
    if (string.IsNullOrWhiteSpace(apiKey))
        apiKey = SysEnvironment.GetEnvironmentVariable("GEMINI_API_KEY");
    if (string.IsNullOrWhiteSpace(apiKey))
    {
        return Results.Json(
            new ChatResponse(null, "Server configuration error: missing Gemini API key."),
            statusCode: StatusCodes.Status500InternalServerError);
    }

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

    var chatLog = loggerFactory.CreateLogger("Interview.Chat");

    GenerateContentResponse? geminiRaw = null;

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

        geminiRaw = await model.GenerateContentAsync(request.Message!, ct);
        string? text;
        try
        {
            text = geminiRaw.Text();
        }
        catch (Exception tex)
        {
            chatLog.LogWarning(
                tex,
                "Gemini response had no extractable text. Model={Model} PromptLength={PromptLength}",
                modelName,
                request.Message?.Length ?? 0);
            await ChatTurnLog.SaveAsync(
                db,
                costEstimator,
                request,
                modelName,
                StatusCodes.Status502BadGateway,
                null,
                host.IsDevelopment() ? tex.GetBaseException().Message : "no extractable text",
                geminiRaw,
                ct);
            return Results.Json(
                new ChatResponse(
                    null,
                    "The model could not produce a reply (content may have been blocked). Try rephrasing your question.",
                    host.IsDevelopment() ? tex.GetBaseException().Message : null),
                statusCode: StatusCodes.Status502BadGateway);
        }

        if (string.IsNullOrWhiteSpace(text))
        {
            await ChatTurnLog.SaveAsync(
                db,
                costEstimator,
                request,
                modelName,
                StatusCodes.Status502BadGateway,
                null,
                "empty model text",
                geminiRaw,
                ct);
            return Results.Json(
                new ChatResponse(null, "The model returned an empty response. Try rephrasing your question."),
                statusCode: StatusCodes.Status502BadGateway);
        }

        text = text.Trim();
        await ChatTurnLog.SaveAsync(
            db,
            costEstimator,
            request,
            modelName,
            StatusCodes.Status200OK,
            text,
            null,
            geminiRaw,
            ct);

        return Results.Json(new ChatResponse(text, null));
    }
    catch (Exception ex)
    {
        var root = ex.GetBaseException();
        chatLog.LogError(
            ex,
            "Gemini request failed. Model={Model} Environment={Environment} ExceptionType={ExceptionType} Message={Message}",
            modelName,
            host.EnvironmentName,
            root.GetType().Name,
            root.Message);
        var detail = host.IsDevelopment() ? root.Message : null;
        await ChatTurnLog.SaveAsync(
            db,
            costEstimator,
            request,
            modelName,
            StatusCodes.Status502BadGateway,
            null,
            root.Message,
            geminiRaw,
            ct);
        return Results.Json(
            new ChatResponse(
                null,
                "The interview service is temporarily unavailable. Please try again shortly.",
                detail),
            statusCode: StatusCodes.Status502BadGateway);
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
