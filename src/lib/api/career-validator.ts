const BLOCKED_INJECTION_SNIPPETS = [
  'ignore previous', 'ignore all instructions', 'disregard the', 'jailbreak', 'dan mode',
  'developer mode', 'you are now', 'new instructions:', 'system prompt', 'reveal your prompt',
  'show your rules', 'bypass', 'roleplay as', 'pretend you are unrestricted',
];

const BLOCKED_TOPICS = [
  'onlyfans', 'erotic', 'porn', 'nsfw', 'nude', 'fetish', 'escort', 'camgirl',
  'how to make a bomb', 'meth recipe', 'kill yourself',
];

const CAREER_HINTS = [
  '.net', 'dotnet', 'c#', 'csharp', 'core', 'framework', 'legacy', 'moderniz', 'refactor',
  'svn', 'git', 'migration', 'devops', 'ci/cd', 'pipeline',
  'hipaa', 'phi', 'healthcare', 'clinical', 'epic', 'oracle', 'ehr', 'emr', 'mcleod',
  'therapy', 'therapynotes', 'behavioral health', 'compliance', 'audit', 'baa',
  'securegive', 'fintech', 'payment', 'snowflake', 'sql',
  'acs', 'realm', 'multi-tenant', 'tenant', 'scale', '50', 'fifty thousand',
  'velocity', 'sprint', 'agile', 'team', 'lead', 'mentor', 'architect',
  'interview', 'resume', 'career', 'hire', 'role', 'position', 'experience', 'background',
  "o'reilly", 'oreilly', 'iphone game', 'book',
  'ai', 'cursor', 'copilot', 'llm', 'prompt', 'tooling', 'developer productivity',
  'security', 'authentication', 'authorization', 'encryption', 'logging',
  'microservice', 'api', 'gateway', 'monolith', 'c++', 'cpp', 'angular', 'react',
];

const INTERVIEW_SHAPE = /\b(how|why|what|when|who|where|tell|describe|walk|explain|discuss|outline|compare)\b/i;

export function validateCareerQuestion(message: string | null | undefined): string | null {
  if (!message?.trim()) return 'Please enter a professional or technical question.';

  const trimmed = message.trim();
  if (trimmed.length < 16)
    return 'Questions must be at least a short sentence so the interview context stays substantive.';
  if (trimmed.length > 12_000) return 'Message is too long for this interview console.';

  const lower = trimmed.toLowerCase();

  for (const snippet of BLOCKED_INJECTION_SNIPPETS) {
    if (lower.includes(snippet))
      return 'That kind of instruction is not allowed here. Ask a career or technical interview question instead.';
  }

  for (const topic of BLOCKED_TOPICS) {
    if (lower.includes(topic))
      return 'Please keep questions strictly professional and appropriate for a hiring conversation.';
  }

  const hasCareerHint = CAREER_HINTS.some((h) => lower.includes(h));
  const shapedLikeInterview = INTERVIEW_SHAPE.test(lower);

  if (!hasCareerHint && !(shapedLikeInterview && trimmed.length >= 40)) {
    return (
      "Ask something tied to Jamey's software architecture work, .NET modernization, healthcare/HIPAA experience, " +
      'FinTech/data platforms, or engineering leadership.'
    );
  }

  return null;
}
