using System.Text.RegularExpressions;

namespace Interview.Api;

/// <summary>
/// Rejects obviously non-professional or non-career prompts before they hit the model.
/// </summary>
public static class CareerQuestionValidator
{
    private static readonly string[] BlockedInjectionSnippets =
    [
        "ignore previous", "ignore all instructions", "disregard the", "jailbreak", "dan mode",
        "developer mode", "you are now", "new instructions:", "system prompt", "reveal your prompt",
        "show your rules", "bypass", "roleplay as", "pretend you are unrestricted",
    ];

    private static readonly string[] BlockedTopics =
    [
        "onlyfans", "erotic", "porn", "nsfw", "nude", "fetish", "escort", "camgirl",
        "how to make a bomb", "meth recipe", "kill yourself",
    ];

    private static readonly string[] CareerHints =
    [
        ".net", "dotnet", "c#", "csharp", "core", "framework", "legacy", "moderniz", "refactor",
        "svn", "git", "migration", "devops", "ci/cd", "pipeline",
        "hipaa", "phi", "healthcare", "clinical", "epic", "oracle", "ehr", "emr", "mcleod",
        "therapy", "therapynotes", "behavioral health", "compliance", "audit", "baa",
        "securegive", "fintech", "payment", "snowflake", "sql",
        "acs", "realm", "multi-tenant", "tenant", "scale", "50", "fifty thousand",
        "velocity", "sprint", "agile", "team", "lead", "mentor", "architect",
        "interview", "resume", "career", "hire", "role", "position", "experience", "background",
        "o'reilly", "oreilly", "iphone game", "book",
        "ai", "cursor", "copilot", "llm", "prompt", "tooling", "developer productivity",
        "security", "authentication", "authorization", "encryption", "logging",
        "microservice", "api", "gateway", "monolith", "c++", "cpp", "angular", "react",
    ];

    private static readonly Regex InterviewShape = new(
        @"\b(how|why|what|when|who|where|tell|describe|walk|explain|discuss|outline|compare)\b",
        RegexOptions.IgnoreCase | RegexOptions.CultureInvariant,
        TimeSpan.FromMilliseconds(250));

    public static bool IsAllowed(string? message, out string error)
    {
        error = string.Empty;

        if (string.IsNullOrWhiteSpace(message))
        {
            error = "Please enter a professional or technical question.";
            return false;
        }

        var trimmed = message.Trim();
        if (trimmed.Length < 16)
        {
            error = "Questions must be at least a short sentence so the interview context stays substantive.";
            return false;
        }

        if (trimmed.Length > 12_000)
        {
            error = "Message is too long for this interview console.";
            return false;
        }

        var lower = trimmed.ToLowerInvariant();

        foreach (var snippet in BlockedInjectionSnippets)
        {
            if (lower.Contains(snippet, StringComparison.Ordinal))
            {
                error = "That kind of instruction is not allowed here. Ask a career or technical interview question instead.";
                return false;
            }
        }

        foreach (var topic in BlockedTopics)
        {
            if (lower.Contains(topic, StringComparison.Ordinal))
            {
                error = "Please keep questions strictly professional and appropriate for a hiring conversation.";
                return false;
            }
        }

        var hasCareerHint = CareerHints.Any(h => lower.Contains(h, StringComparison.Ordinal));
        var shapedLikeInterview = InterviewShape.IsMatch(lower);

        if (!hasCareerHint && !(shapedLikeInterview && trimmed.Length >= 40))
        {
            error =
                "Ask something tied to Jamey's software architecture work, .NET modernization, healthcare/HIPAA experience, " +
                "FinTech/data platforms, or engineering leadership.";
            return false;
        }

        return true;
    }
}
