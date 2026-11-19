import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SYSTEM_PROMPT } from './system-prompt.ts';

test('prompt includes persona, background and interview answers', () => {
  assert.match(SYSTEM_PROMPT, /Ask Jamey/);
  assert.match(SYSTEM_PROMPT, /<background>[\s\S]*Source of truth for Ask Jamey[\s\S]*<\/background>/);
  assert.match(SYSTEM_PROMPT, /<interview_answers>[\s\S]*Tell me about yourself[\s\S]*<\/interview_answers>/);
});

test('prompt stays long enough for the Haiku 4.5 prompt cache (4,096 token minimum)', () => {
  // ~3.5 chars per token is a conservative estimate; 20k chars leaves a wide margin.
  assert.ok(SYSTEM_PROMPT.length > 20_000, `prompt is only ${SYSTEM_PROMPT.length} chars`);
});

test('prompt no longer carries claims Homer\'s background contradicts', () => {
  assert.doesNotMatch(SYSTEM_PROMPT, /Not relocating/);
  assert.doesNotMatch(SYSTEM_PROMPT, /SVN/);
  assert.doesNotMatch(SYSTEM_PROMPT, /Time Travel/);
});
