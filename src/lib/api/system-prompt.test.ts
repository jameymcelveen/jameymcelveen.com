import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SYSTEM_PROMPT, getSystemPromptPreview } from './system-prompt.ts';

describe('system prompt assembly', () => {
  it('starts with the Ask Jamey role header', () => {
    assert.ok(SYSTEM_PROMPT.startsWith('# Role: Ask Jamey'));
  });

  it('joins persona, background, and interview Q&A', () => {
    assert.match(SYSTEM_PROMPT, /# Background: Jamey McElveen/);
    assert.match(SYSTEM_PROMPT, /# Interview Questions: Jamey's Answers/);
  });

  it('includes Homer-confirmed facts recruiters ask about', () => {
    assert.match(SYSTEM_PROMPT, /No HL7 experience/);
    assert.match(SYSTEM_PROMPT, /I did not administer Snowflake/);
    assert.match(SYSTEM_PROMPT, /The company downsized and cut remote roles/);
    assert.match(SYSTEM_PROMPT, /plan to move to the SC Upstate/);
    assert.match(SYSTEM_PROMPT, /I'd rather understand the whole role and package first/);
    assert.match(SYSTEM_PROMPT, /jamey@mcelveen\.us/);
    assert.match(SYSTEM_PROMPT, /Kubernetes\/EKS/);
  });

  it('does not use the old "Not relocating" identity line', () => {
    assert.doesNotMatch(SYSTEM_PROMPT, /Not relocating\./);
  });

  it('preview is the head of the joined prompt', () => {
    assert.equal(getSystemPromptPreview(24), SYSTEM_PROMPT.slice(0, 24));
    assert.equal(getSystemPromptPreview(24), '# Role: Ask Jamey\n\nYou a');
  });
});
