using Microsoft.Extensions.Caching.Memory;

namespace Interview.Api.Middleware;

/// <summary>
/// Fixed window (UTC hour) rate limit: 10 POST /api/chat requests per client IP.
/// </summary>
public sealed class ChatRateLimitMiddleware(RequestDelegate next, IMemoryCache cache, ILogger<ChatRateLimitMiddleware> logger)
{
    public const int MaxRequestsPerHour = 10;

    private sealed class Counter
    {
        public int Value;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!HttpMethods.IsPost(context.Request.Method) ||
            !context.Request.Path.StartsWithSegments("/api/chat"))
        {
            await next(context);
            return;
        }

        var ip = ClientIpResolver.Resolve(context);
        var cacheKey = $"chat-rl:{ip}:{UtcHourKey()}";

        if (!cache.TryGetValue(cacheKey, out Counter? counter))
        {
            counter = new Counter();
            var nextHour = RoundUpToNextUtcHour(DateTime.UtcNow);
            cache.Set(cacheKey, counter, new MemoryCacheEntryOptions { AbsoluteExpiration = nextHour });
        }

        int newCount;
        lock (counter!)
        {
            counter.Value++;
            newCount = counter.Value;
        }

        context.Response.Headers.Append("X-RateLimit-Limit", MaxRequestsPerHour.ToString());
        context.Response.Headers.Append("X-RateLimit-Remaining", Math.Max(0, MaxRequestsPerHour - newCount).ToString());

        if (newCount > MaxRequestsPerHour)
        {
            logger.LogWarning("Rate limit exceeded for {Ip}", ip);
            context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            context.Response.Headers.Append("Retry-After", ((int)TimeSpan.FromHours(1).TotalSeconds).ToString());
            await context.Response.WriteAsJsonAsync(new ChatErrorResponse(
                "Too many interview requests from this network this hour. Please try again later."));
            return;
        }

        await next(context);
    }

    private static string UtcHourKey() =>
        DateTime.UtcNow.ToString("yyyyMMddHH", System.Globalization.CultureInfo.InvariantCulture);

    private static DateTime RoundUpToNextUtcHour(DateTime utcNow)
    {
        var trimmed = new DateTime(utcNow.Year, utcNow.Month, utcNow.Day, utcNow.Hour, 0, 0, DateTimeKind.Utc);
        return trimmed <= utcNow ? trimmed.AddHours(1) : trimmed;
    }
}

internal static class ClientIpResolver
{
    public static string Resolve(HttpContext context)
    {
        var xff = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(xff))
        {
            var first = xff.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                .FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(first))
                return first;
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}

internal sealed record ChatErrorResponse(string Error);
