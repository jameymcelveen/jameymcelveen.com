namespace Interview.Api;

public sealed record StartSessionRequest(
    Guid SessionId,
    string VisitorKey,
    string? Referrer,
    string LandingPath,
    string? UserAgent,
    string? AcceptLanguage,
    int? ScreenWidth,
    int? ScreenHeight,
    int? ViewportWidth,
    int? ViewportHeight,
    string? TimeZone);

public sealed record PageViewRequest(Guid SessionId, string Path, string? Title);

public sealed record PageViewResponse(Guid PageViewId);

public sealed record EndSessionRequest(Guid SessionId);

public sealed class StatsGeminiDto
{
    public decimal TotalEstimatedUsd { get; init; }
    public int TotalTurns { get; init; }
    public int SuccessfulTurns { get; init; }
    public decimal AvgCostPerTurnUsd { get; init; }
    public decimal AvgCostPerAiSessionUsd { get; init; }
    public long TotalPromptTokens { get; init; }
    public long TotalOutputTokens { get; init; }
}

public sealed class StatsVisitsDto
{
    public int TotalSessions { get; init; }
    public int TotalPageViews { get; init; }
    public double? AvgSessionDurationSeconds { get; init; }
    public required IReadOnlyList<StatsPathCountDto> TopPaths { get; init; }
    public required IReadOnlyList<StatsReferrerDto> TopReferrers { get; init; }
}

public sealed class StatsPathCountDto
{
    public required string Path { get; init; }
    public int Views { get; init; }
}

public sealed class StatsReferrerDto
{
    public required string ReferrerHost { get; init; }
    public int Sessions { get; init; }
}

public sealed class StatsRecentChatDto
{
    public DateTimeOffset CreatedAtUtc { get; init; }
    public required string UserMessage { get; init; }
    public decimal EstimatedCostUsd { get; init; }
    public int HttpStatus { get; init; }
    public int? PromptTokens { get; init; }
    public int? OutputTokens { get; init; }
}

public sealed class StatsDailyDto
{
    public required string Day { get; init; }
    public int PageViews { get; init; }
    public int Sessions { get; init; }
    public decimal GeminiUsd { get; init; }
}

public sealed class StatsDashboardResponse
{
    public required StatsGeminiDto Gemini { get; init; }
    public required StatsVisitsDto Visits { get; init; }
    public required IReadOnlyList<StatsRecentChatDto> RecentChats { get; init; }
    public required IReadOnlyList<StatsDailyDto> Last14Days { get; init; }
}
