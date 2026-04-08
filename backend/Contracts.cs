namespace Interview.Api;

public sealed record ChatRequest(string? Message);

public sealed record ChatResponse(string? Reply, string? Error, string? Detail = null);
