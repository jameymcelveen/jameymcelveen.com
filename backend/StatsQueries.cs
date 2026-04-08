using Interview.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Interview.Api;

internal static class StatsQueries
{
    public static async Task<StatsDashboardResponse> BuildAsync(AnalyticsDbContext db, CancellationToken ct)
    {
        var successTurns = await db.AiChatTurns.AsNoTracking().CountAsync(t => t.HttpStatus == 200, ct);
        var totalTurns = await db.AiChatTurns.AsNoTracking().CountAsync(ct);
        var totalUsd = await db.AiChatTurns.AsNoTracking()
            .Where(t => t.HttpStatus == 200)
            .SumAsync(t => t.EstimatedCostUsd, ct);

        var totalPrompt = await db.AiChatTurns.AsNoTracking()
            .Where(t => t.HttpStatus == 200)
            .SumAsync(t => (long)(t.PromptTokens ?? 0), ct);

        var totalOutput = await db.AiChatTurns.AsNoTracking()
            .Where(t => t.HttpStatus == 200)
            .SumAsync(t => (long)(t.OutputTokens ?? 0), ct);

        var avgPerTurn = successTurns == 0 ? 0 : totalUsd / successTurns;

        var sessionCostList = await db.AiChatTurns.AsNoTracking()
            .Where(t => t.HttpStatus == 200 && t.VisitSessionId != null)
            .GroupBy(t => t.VisitSessionId!.Value)
            .Select(g => g.Sum(t => t.EstimatedCostUsd))
            .ToListAsync(ct);

        var avgPerAiSession = sessionCostList.Count == 0
            ? 0
            : sessionCostList.Average(x => x);

        var dwellSums = await db.PageViews.AsNoTracking()
            .Where(p => p.DurationSeconds != null)
            .GroupBy(p => p.VisitSessionId)
            .Select(g => g.Sum(p => p.DurationSeconds!.Value))
            .ToListAsync(ct);

        double? avgSessionSeconds = dwellSums.Count == 0 ? null : dwellSums.Average(s => (double)s);

        var topPaths = await db.PageViews.AsNoTracking()
            .GroupBy(p => p.Path)
            .OrderByDescending(g => g.Count())
            .Take(12)
            .Select(g => new StatsPathCountDto { Path = g.Key, Views = g.Count() })
            .ToListAsync(ct);

        var topReferrers = await db.VisitSessions.AsNoTracking()
            .Where(s => s.ReferrerHost != null && s.ReferrerHost != "")
            .GroupBy(s => s.ReferrerHost!)
            .OrderByDescending(g => g.Count())
            .Take(12)
            .Select(g => new StatsReferrerDto { ReferrerHost = g.Key, Sessions = g.Count() })
            .ToListAsync(ct);

        var recent = await db.AiChatTurns.AsNoTracking()
            .OrderByDescending(t => t.CreatedAtUtc)
            .Take(40)
            .Select(t => new StatsRecentChatDto
            {
                CreatedAtUtc = t.CreatedAtUtc,
                UserMessage = t.UserMessage,
                EstimatedCostUsd = t.EstimatedCostUsd,
                HttpStatus = t.HttpStatus,
                PromptTokens = t.PromptTokens,
                OutputTokens = t.OutputTokens,
            })
            .ToListAsync(ct);

        var cutoff = DateTimeOffset.UtcNow.UtcDateTime.Date.AddDays(-13);
        var pvDates = await db.PageViews.AsNoTracking()
            .Where(p => p.EnteredAtUtc >= cutoff)
            .Select(p => p.EnteredAtUtc)
            .ToListAsync(ct);

        var sessionDates = await db.VisitSessions.AsNoTracking()
            .Where(s => s.StartedAtUtc >= cutoff)
            .Select(s => s.StartedAtUtc)
            .ToListAsync(ct);

        var costByDay = await db.AiChatTurns.AsNoTracking()
            .Where(t => t.CreatedAtUtc >= cutoff && t.HttpStatus == 200)
            .Select(t => new { t.CreatedAtUtc, t.EstimatedCostUsd })
            .ToListAsync(ct);

        var last14 = new List<StatsDailyDto>(14);
        for (var i = 13; i >= 0; i--)
        {
            var day = DateTimeOffset.UtcNow.UtcDateTime.Date.AddDays(-i);
            var dayStr = day.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture);
            var pv = pvDates.Count(d => d.UtcDateTime.Date == day);
            var ss = sessionDates.Count(d => d.UtcDateTime.Date == day);
            var usd = costByDay.Where(x => x.CreatedAtUtc.UtcDateTime.Date == day).Sum(x => x.EstimatedCostUsd);
            last14.Add(new StatsDailyDto
            {
                Day = dayStr,
                PageViews = pv,
                Sessions = ss,
                GeminiUsd = usd,
            });
        }

        return new StatsDashboardResponse
        {
            Gemini = new StatsGeminiDto
            {
                TotalEstimatedUsd = totalUsd,
                TotalTurns = totalTurns,
                SuccessfulTurns = successTurns,
                AvgCostPerTurnUsd = avgPerTurn,
                AvgCostPerAiSessionUsd = avgPerAiSession,
                TotalPromptTokens = totalPrompt,
                TotalOutputTokens = totalOutput,
            },
            Visits = new StatsVisitsDto
            {
                TotalSessions = await db.VisitSessions.AsNoTracking().CountAsync(ct),
                TotalPageViews = await db.PageViews.AsNoTracking().CountAsync(ct),
                AvgSessionDurationSeconds = avgSessionSeconds,
                TopPaths = topPaths,
                TopReferrers = topReferrers,
            },
            RecentChats = recent,
            Last14Days = last14,
        };
    }
}
