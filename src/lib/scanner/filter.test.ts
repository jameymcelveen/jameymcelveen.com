import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { evaluate } from './filter.ts';
import type { Posting } from './posting.ts';

function post(over: Partial<Posting>): Posting {
  return {
    source: 'test',
    company: 'Acme',
    title: 'Senior Software Engineer',
    url: 'https://example.com/job',
    location: 'Remote US',
    body: 'Requirements: C# .NET PostgreSQL. Design and build APIs.',
    postedAt: new Date(),
    domain: 'saas',
    compRaw: '$160,000-$180,000',
    ...over,
  };
}

describe('evaluate', () => {
  it('passes a remote senior .NET posting', () => {
    const v = evaluate(post({}));
    assert.equal(v.passed, true);
    assert.equal(v.hardReject, false);
  });

  it('hard-rejects junior titles', () => {
    const v = evaluate(post({ title: 'Junior Software Engineer' }));
    assert.equal(v.passed, false);
    assert.equal(v.hardReject, true);
    assert.match(v.reason, /level:/);
  });

  it('hard-rejects onsite outside range', () => {
    const v = evaluate(post({ location: 'Austin, TX', body: 'Onsite only. C# .NET.' }));
    assert.equal(v.passed, false);
    assert.equal(v.hardReject, true);
    assert.match(v.reason, /location:/);
  });

  it('hard-rejects below salary floor', () => {
    const v = evaluate(post({ compRaw: '$80,000-$90,000', body: 'Requirements: C# .NET. Salary $80,000.' }));
    assert.equal(v.passed, false);
    assert.equal(v.hardReject, true);
    assert.match(v.reason, /comp:/);
  });

  it('hard-rejects an explicit DevOps title without needing 3 body run-signals', () => {
    const v = evaluate(
      post({
        company: 'Compassion International',
        title: 'Sr. DevOps Engineer',
        body: 'Requirements: C# .NET PostgreSQL AWS Kubernetes. Design and build APIs. Fully remote.',
      })
    );
    assert.equal(v.passed, false);
    assert.equal(v.hardReject, true);
    assert.match(v.reason, /day shape: title is a run-the-system role/);
    assert.match(v.reason, /devops engineer/);
  });

  it('still rejects an ambiguous title when the body has 3+ run-signals', () => {
    const v = evaluate(
      post({
        title: 'Senior Software Engineer',
        body: 'Requirements: C# .NET. On-call rotation, PagerDuty, SRE runbooks, incident response.',
      })
    );
    assert.equal(v.passed, false);
    assert.equal(v.hardReject, false);
    assert.match(v.reason, /day shape: run-the-system role/);
  });
});
