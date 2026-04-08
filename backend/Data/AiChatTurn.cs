namespace Interview.Api.Data;

public sealed class AiChatTurn
{
    public Guid Id { get; set; }
    public Guid? VisitSessionId { get; set; }
    public VisitSession? VisitSession { get; set; }

    public string? VisitorKey { get; set; }
    public string UserMessage { get; set; } = "";
    public string? AssistantExcerpt { get; set; }
    public string ModelName { get; set; } = "";

    public int? PromptTokens { get; set; }
    public int? OutputTokens { get; set; }
    public decimal EstimatedCostUsd { get; set; }

    public int HttpStatus { get; set; }
    public string? ErrorSummary { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }
}
