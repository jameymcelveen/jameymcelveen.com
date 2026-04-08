using GenerativeAI.Types;
using Interview.Api.Data;
using Interview.Api.Services;
using Microsoft.AspNetCore.Http;

namespace Interview.Api;

internal static class ChatTurnLog
{
    public static async Task SaveAsync(
        AnalyticsDbContext db,
        GeminiCostEstimator cost,
        ChatRequest request,
        string modelName,
        int httpStatus,
        string? assistantText,
        string? errorSummary,
        GenerateContentResponse? geminiResponse,
        CancellationToken ct)
    {
        int? pt = geminiResponse?.UsageMetadata?.PromptTokenCount;
        int? ot = geminiResponse?.UsageMetadata?.ResponseTokenCount
                  ?? geminiResponse?.UsageMetadata?.CandidatesTokenCount;
        var est = httpStatus == StatusCodes.Status200OK
            ? cost.EstimateUsd(pt ?? 0, ot ?? 0)
            : 0;

        db.AiChatTurns.Add(new AiChatTurn
        {
            Id = Guid.NewGuid(),
            VisitSessionId = request.SessionId,
            VisitorKey = TruncVis(request.VisitorKey),
            UserMessage = Trunc(request.Message, 8000),
            AssistantExcerpt = assistantText == null ? null : Trunc(assistantText, 2000),
            ModelName = string.IsNullOrEmpty(modelName) ? "" : Trunc(modelName, 256)!,
            PromptTokens = pt,
            OutputTokens = ot,
            EstimatedCostUsd = est,
            HttpStatus = httpStatus,
            ErrorSummary = errorSummary == null ? null : Trunc(errorSummary, 2000),
            CreatedAtUtc = DateTimeOffset.UtcNow,
        });

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch
        {
            // Analytics must not break chat responses.
        }
    }

    private static string Trunc(string? s, int max) =>
        string.IsNullOrEmpty(s) ? "" : (s.Length <= max ? s : s[..max]);

    private static string? TruncVis(string? s) =>
        string.IsNullOrEmpty(s) ? null : (s.Length <= 64 ? s : s[..64]);
}
