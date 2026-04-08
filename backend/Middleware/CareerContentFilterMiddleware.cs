using System.Text.Json;

namespace Interview.Api.Middleware;

/// <summary>
/// Rejects non-professional or off-topic questions before they reach the model (POST /api/chat only).
/// </summary>
public sealed class CareerContentFilterMiddleware(RequestDelegate next)
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
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new ChatResponse(null, rejection));
            return;
        }

        await next(context);
    }
}
