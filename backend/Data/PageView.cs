namespace Interview.Api.Data;

public sealed class PageView
{
    public Guid Id { get; set; }
    public Guid VisitSessionId { get; set; }
    public VisitSession VisitSession { get; set; } = null!;

    public string Path { get; set; } = "";
    public string? Title { get; set; }

    public DateTimeOffset EnteredAtUtc { get; set; }
    public DateTimeOffset? LeftAtUtc { get; set; }
    public int? DurationSeconds { get; set; }
}
