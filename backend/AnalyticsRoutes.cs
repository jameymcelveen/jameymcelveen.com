using Interview.Api.Data;
using Interview.Api.Middleware;
using Microsoft.EntityFrameworkCore;

namespace Interview.Api;

public static class AnalyticsRoutes
{
    public static void MapAnalyticsRoutes(this WebApplication app)
    {
        app.MapPost("/api/analytics/session", HandleStartSession);
        app.MapPost("/api/analytics/pageview", HandlePageView);
        app.MapPost("/api/analytics/session/end", HandleEndSession);
        app.MapGet("/api/stats", HandleStats);
    }

    private static async Task<IResult> HandleStartSession(
        StartSessionRequest req,
        AnalyticsDbContext db,
        HttpContext http,
        CancellationToken ct)
    {
        if (req.SessionId == Guid.Empty || string.IsNullOrWhiteSpace(req.VisitorKey))
            return Results.BadRequest();

        var now = DateTimeOffset.UtcNow;
        var ip = ClientIpResolver.Resolve(http);
        var refHost = ReferrerHost(req.Referrer);
        var existing = await db.VisitSessions.FindAsync([req.SessionId], ct);
        if (existing != null)
            return Results.Ok(new { sessionId = req.SessionId });

        db.VisitSessions.Add(new VisitSession
        {
            Id = req.SessionId,
            VisitorKey = TruncVis(req.VisitorKey),
            StartedAtUtc = now,
            Referrer = Trunc(req.Referrer, 2048),
            ReferrerHost = Trunc(refHost, 512),
            LandingPath = string.IsNullOrWhiteSpace(req.LandingPath) ? "/" : Trunc(req.LandingPath, 1024)!,
            UserAgent = Trunc(req.UserAgent, 1024),
            AcceptLanguage = Trunc(req.AcceptLanguage, 128),
            ScreenWidth = req.ScreenWidth,
            ScreenHeight = req.ScreenHeight,
            ViewportWidth = req.ViewportWidth,
            ViewportHeight = req.ViewportHeight,
            TimeZone = Trunc(req.TimeZone, 128),
            IpAddress = Trunc(ip, 64),
        });

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            // e.g. parallel Strict Mode double-mount with the same session id
        }

        return Results.Ok(new { sessionId = req.SessionId });
    }

    private static async Task<IResult> HandlePageView(
        PageViewRequest req,
        AnalyticsDbContext db,
        CancellationToken ct)
    {
        if (req.SessionId == Guid.Empty || string.IsNullOrWhiteSpace(req.Path))
            return Results.BadRequest();

        var session = await db.VisitSessions.FindAsync([req.SessionId], ct);
        if (session == null)
            return Results.NotFound();

        var now = DateTimeOffset.UtcNow;
        await CloseOpenPageViewAsync(db, req.SessionId, now, ct);

        var pv = new PageView
        {
            Id = Guid.NewGuid(),
            VisitSessionId = req.SessionId,
            Path = Trunc(req.Path, 2048)!,
            Title = Trunc(req.Title, 512),
            EnteredAtUtc = now,
        };
        db.PageViews.Add(pv);
        await db.SaveChangesAsync(ct);
        return Results.Ok(new PageViewResponse(pv.Id));
    }

    private static async Task<IResult> HandleEndSession(
        EndSessionRequest req,
        AnalyticsDbContext db,
        CancellationToken ct)
    {
        if (req.SessionId == Guid.Empty)
            return Results.BadRequest();

        var now = DateTimeOffset.UtcNow;
        await CloseOpenPageViewAsync(db, req.SessionId, now, ct);
        var session = await db.VisitSessions.FindAsync([req.SessionId], ct);
        if (session != null)
            session.EndedAtUtc = now;

        await db.SaveChangesAsync(ct);
        return Results.Ok();
    }

    private static async Task<IResult> HandleStats(
        HttpContext ctx,
        IConfiguration config,
        AnalyticsDbContext db,
        CancellationToken ct)
    {
        if (!StatsAuthorized(ctx, config))
            return Results.Unauthorized();

        var dashboard = await StatsQueries.BuildAsync(db, ct);
        return TypedResults.Json(dashboard);
    }

    internal static async Task CloseOpenPageViewAsync(
        AnalyticsDbContext db,
        Guid sessionId,
        DateTimeOffset now,
        CancellationToken ct)
    {
        var open = await db.PageViews
            .Where(p => p.VisitSessionId == sessionId && p.LeftAtUtc == null)
            .OrderByDescending(p => p.EnteredAtUtc)
            .FirstOrDefaultAsync(ct);
        if (open == null)
            return;
        open.LeftAtUtc = now;
        var secs = (int)Math.Clamp((now - open.EnteredAtUtc).TotalSeconds, 0, 864000);
        open.DurationSeconds = secs;
    }

    private static bool StatsAuthorized(HttpContext ctx, IConfiguration config)
    {
        var expected = config["Stats:ApiKey"];
        if (string.IsNullOrWhiteSpace(expected))
            expected = Environment.GetEnvironmentVariable("STATS_API_KEY");
        if (string.IsNullOrWhiteSpace(expected))
            return false;
        if (!ctx.Request.Headers.TryGetValue("X-Stats-Key", out var key))
            return false;
        return string.Equals(key.ToString(), expected, StringComparison.Ordinal);
    }

    private static string TruncVis(string key) =>
        string.IsNullOrEmpty(key) ? "" : (key.Length <= 64 ? key : key[..64]);

    private static string? Trunc(string? s, int max)
    {
        if (string.IsNullOrEmpty(s))
            return s;
        return s.Length <= max ? s : s[..max];
    }

    private static string? ReferrerHost(string? referrer)
    {
        if (string.IsNullOrWhiteSpace(referrer))
            return null;
        if (!Uri.TryCreate(referrer, UriKind.Absolute, out var u))
            return null;
        return string.IsNullOrEmpty(u.Host) ? null : u.Host;
    }
}
