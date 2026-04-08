namespace Interview.Api.Data;

public sealed class VisitSession
{
    public Guid Id { get; set; }

    /// <summary>Stable per-browser id (client-generated, stored in localStorage).</summary>
    public string VisitorKey { get; set; } = "";

    public DateTimeOffset StartedAtUtc { get; set; }
    public DateTimeOffset? EndedAtUtc { get; set; }

    public string? Referrer { get; set; }
    public string? ReferrerHost { get; set; }
    public string LandingPath { get; set; } = "/";

    public string? UserAgent { get; set; }
    public string? AcceptLanguage { get; set; }
    public int? ScreenWidth { get; set; }
    public int? ScreenHeight { get; set; }
    public int? ViewportWidth { get; set; }
    public int? ViewportHeight { get; set; }
    public string? TimeZone { get; set; }

    /// <summary>Server-observed client address (may be proxy).</summary>
    public string? IpAddress { get; set; }

    public ICollection<PageView> PageViews { get; set; } = new List<PageView>();
    public ICollection<AiChatTurn> AiChatTurns { get; set; } = new List<AiChatTurn>();
}
