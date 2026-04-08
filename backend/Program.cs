using GenerativeAI;
using GenerativeAI.Types;
using Interview.Api;
using Interview.Api.Middleware;
using Microsoft.AspNetCore.HttpOverrides;
using SysEnvironment = global::System.Environment;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMemoryCache();

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

var systemPromptPath = Path.Combine(builder.Environment.ContentRootPath, "Prompts", "system_prompt.md");
if (!File.Exists(systemPromptPath))
  throw new InvalidOperationException($"Missing system prompt: {systemPromptPath}");
var systemPromptText = File.ReadAllText(systemPromptPath);

var app = builder.Build();

app.UseForwardedHeaders();
app.UseCors();

app.UseMiddleware<ChatRateLimitMiddleware>();
app.UseMiddleware<CareerContentFilterMiddleware>();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/api/chat", async (
    ChatRequest request,
    IConfiguration config,
    ILoggerFactory loggerFactory,
    IHostEnvironment host,
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
  // Prefer GoogleAIModels.* so ids match the SDK / current API (gemini-2.0-flash is deprecated for new keys).
  if (string.IsNullOrWhiteSpace(modelName))
    modelName = GoogleAIModels.GeminiFlashLatest;
  else
  {
    modelName = modelName.Trim();
    if (IsLegacyGemini2FlashAlias(modelName))
      modelName = GoogleAIModels.GeminiFlashLatest;
  }

  var chatLog = loggerFactory.CreateLogger("Interview.Chat");

  try
  {
    // SDK docs also read GOOGLE_API_KEY; keep it aligned when calling other helpers.
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

    var response = await model.GenerateContentAsync(request.Message!, ct);
    string? text;
    try
    {
      text = response.Text();
    }
    catch (Exception tex)
    {
      chatLog.LogWarning(
          tex,
          "Gemini response had no extractable text. Model={Model} PromptLength={PromptLength}",
          modelName,
          request.Message?.Length ?? 0);
      return Results.Json(
          new ChatResponse(
              null,
              "The model could not produce a reply (content may have been blocked). Try rephrasing your question.",
              host.IsDevelopment() ? tex.GetBaseException().Message : null),
          statusCode: StatusCodes.Status502BadGateway);
    }

    if (string.IsNullOrWhiteSpace(text))
    {
      return Results.Json(
          new ChatResponse(null, "The model returned an empty response. Try rephrasing your question."),
          statusCode: StatusCodes.Status502BadGateway);
    }

    return Results.Json(new ChatResponse(text.Trim(), null));
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
