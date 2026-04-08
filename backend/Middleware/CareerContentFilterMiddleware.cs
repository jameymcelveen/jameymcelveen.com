using System.Text.Json;
using Interview.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Interview.Api.Middleware;

/// <summary>
/// Rejects non-professional or off-topic questions before they reach the model (POST /api/chat only).
/// </summary>
public sealed class CareerContentFilterMiddleware(
    RequestDelegate next,
    IDbContextFactory<AnalyticsDbContext> dbFactory)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    public async Task InvokeAsync(HttpContext context)
    {
        if (!HttpMethods.IsPost(context.Request.Method) ||
            !context.Request.Path.StartsWithSegments("/api/chat"))
        {
            await next(context);
            return;
        }

        context.Request.EnableBuffering();

        ChatRequest? body;
        try
        {
            body = await JsonSerializer.DeserializeAsync<ChatRequest>(context.Request.Body, JsonOptions, context.RequestAborted);
        }
        catch (JsonException)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new ChatResponse(null, "Expected a JSON body with a \"message\" field."));
            return;
        }
        finally
        {
            context.Request.Body.Position = 0;
        }

        if (!CareerQuestionValidator.IsAllowed(body?.Message, out var rejection))
        {
            await LogRejectedTurnAsync(dbFactory, body, rejection);
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new ChatResponse(null, rejection));
            return;
        }

        await next(context);
    }

    private static async Task LogRejectedTurnAsync(
        IDbContextFactory<AnalyticsDbContext> dbFactory,
        ChatRequest? body,
        string rejection)
    {
        try
        {
            await using var db = await dbFactory.CreateDbContextAsync();
            db.AiChatTurns.Add(new AiChatTurn
            {
                Id = Guid.NewGuid(),
                VisitSessionId = body?.SessionId,
                VisitorKey = TruncVis(body?.VisitorKey),
                UserMessage = Trunc(body?.Message, 8000),
                ModelName = "",
                HttpStatus = StatusCodes.Status400BadRequest,
                ErrorSummary = Trunc(rejection, 2000),
                CreatedAtUtc = DateTimeOffset.UtcNow,
            });
            await db.SaveChangesAsync();
        }
        catch
        {
            // ignore analytics failures
        }
    }

    private static string Trunc(string? s, int max) =>
        string.IsNullOrEmpty(s) ? "" : (s.Length <= max ? s : s[..max]);

    private static string? TruncVis(string? s) =>
        string.IsNullOrEmpty(s) ? null : (s.Length <= 64 ? s : s[..64]);
}
