const BLOCKED_INJECTION_SNIPPETS = [
  'ignore previous',
  'ignore all instructions',
  'disregard the',
  'jailbreak',
  'dan mode',
  'developer mode',
  'you are now',
  'new instructions:',
  'system prompt',
  'reveal your prompt',
  'show your rules',
  'bypass',
  'roleplay as',
  'pretend you are unrestricted',
];

const BLOCKED_TOPICS = [
  'onlyfans',
  'erotic',
  'porn',
  'nsfw',
  'nude',
  'fetish',
  'escort',
  'camgirl',
  'how to make a bomb',
  'meth recipe',
  'kill yourself',
];

export function validateCareerQuestion(message: string | null | undefined): string | null {
  if (!message?.trim()) return 'Please enter a professional or technical question.';

  const trimmed = message.trim();
  if (trimmed.length > 12_000) return 'Message is too long for this interview console.';

  const lower = trimmed.toLowerCase();

  for (const snippet of BLOCKED_INJECTION_SNIPPETS) {
    if (lower.includes(snippet)) {
      return 'That kind of instruction is not allowed here. Ask a career or technical interview question instead.';
    }
  }

  for (const topic of BLOCKED_TOPICS) {
    if (lower.includes(topic)) {
      return 'Please keep questions strictly professional and appropriate for a hiring conversation.';
    }
  }

  return null;
}
