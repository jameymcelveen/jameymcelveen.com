import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { clipHitBody, hitToMarkdown, HIT_BODY_MAX } from './markdown.ts';
import type { BoardHit } from './types.ts';

const hit: BoardHit = {
  id: 'abc123def456',
  score: 58,
  title: 'Sr. Lead Data Engineer',
  company: 'Christian Tech Jobs',
  url: 'https://example.com/job',
  comp: '$120K-$160K',
  remote: true,
  freshness: '11d old',
  source: 'rss',
  nearMiss: false,
  deduction: null,
  location: 'Remote US',
  body: 'Build pipelines in C# and PostgreSQL.',
  why: ['stack 30/35: .net', 'remote 10/10: remote-first language'],
};

describe('hitToMarkdown', () => {
  it('emits a markdown posting with rubric and body', () => {
    const md = hitToMarkdown(hit);
    assert.match(md, /^# Sr\. Lead Data Engineer/m);
    assert.match(md, /\*\*Christian Tech Jobs\*\*/);
    assert.match(md, /- Score: 58/);
    assert.match(md, /- Remote: yes/);
    assert.match(md, /\[Original posting\]\(https:\/\/example.com\/job\)/);
    assert.match(md, /## Rubric/);
    assert.match(md, /## Posting/);
    assert.match(md, /Build pipelines in C# and PostgreSQL\./);
  });

  it('notes when the body was not stored', () => {
    const md = hitToMarkdown({ ...hit, body: null, why: [] });
    assert.match(md, /Full posting text was not stored/);
    assert.doesNotMatch(md, /## Rubric/);
  });
});

describe('clipHitBody', () => {
  it('returns null for blank and truncates long bodies', () => {
    assert.equal(clipHitBody('  '), null);
    const clipped = clipHitBody('x'.repeat(HIT_BODY_MAX + 10));
    assert.ok(clipped?.endsWith('[truncated]'));
    assert.ok((clipped?.length ?? 0) > HIT_BODY_MAX);
  });
});
