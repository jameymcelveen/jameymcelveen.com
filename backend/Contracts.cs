namespace Interview.Api;

public sealed record ChatRequest(string? Message, string? VisitorKey = null, Guid? SessionId = null);

public sealed record ChatResponse(string? Reply, string? Error, string? Detail = null);
