import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { freshnessFromWhy, isRemoteFromWhy, parseJameyBacklog, splitSourceLabel } from './parse.ts';

const jameyHit = {
  id: 'abc',
  score: 83,
  company: 'Called',
  title: 'Senior Full Stack Engineer',
  url: 'https://example.com/job',
  comp: '$101K-$146K',
  source: 'rss',
  why: ['stack 35/35: architect', 'freshness 4/10: 29d old', 'remote 10/10: remote-first language'],
};

describe('parseJameyBacklog', () => {
  it('accepts a jamey payload and sorts highest score first', () => {
    const parsed = parseJameyBacklog({
      profile: 'jamey',
      generated: '2026-08-30T00:00:00Z',
      hits: [
        { ...jameyHit, id: 'low', score: 40, title: 'Low' },
        { ...jameyHit, id: 'high', score: 90, title: 'High' },
      ],
    });
    assert.equal(parsed.profile, 'jamey');
    assert.equal(parsed.hits[0]?.id, 'high');
    assert.equal(parsed.hits[1]?.id, 'low');
    assert.equal(parsed.hits[0]?.comp, '$101K-$146K');
    assert.equal(parsed.hits[0]?.remote, true);
    assert.equal(parsed.hits[0]?.freshness, '29d old');
    assert.equal(parsed.hits[0]?.nearMiss, false);
  });

  it('keeps source fetch counts and reject buckets', () => {
    const parsed = parseJameyBacklog({
      profile: 'jamey',
      generated: '2026-08-30T00:00:00Z',
      hits: [jameyHit],
      stats: { fetched: 40, displayed: 12, nearMisses: 3, rejected: 25 },
      sources: [
        { source: 'rss:Christian Tech Jobs', fetched: 18, ok: true, cached: true },
        { source: 'greenhouse:Called', count: 4, ok: true },
        { source: 'adzuna:.NET', ok: false, fetched: 0, blocked: 'missing key' },
      ],
      rejectedByReason: [
        { reason: 'level', count: 10 },
        { reason: 'comp', count: 8 },
      ],
    });
    assert.equal(parsed.stats?.fetched, 40);
    assert.equal(parsed.sources?.length, 3);
    assert.equal(parsed.sources?.[0]?.source, 'rss:Christian Tech Jobs');
    assert.equal(parsed.sources?.[1]?.fetched, 4);
    assert.equal(parsed.sources?.[2]?.blocked, 'missing key');
    assert.equal(parsed.rejectedByReason?.[0]?.reason, 'level');
  });

  it('rejects seth slater and connie profiles', () => {
    for (const profile of ['seth', 'slater', 'connie', 'other']) {
      assert.throws(() => parseJameyBacklog({ profile, hits: [] }), /non-jamey/);
    }
  });

  it('drops not-stated comp and hybrid remote', () => {
    const parsed = parseJameyBacklog({
      profile: 'jamey',
      hits: [
        {
          ...jameyHit,
          comp: 'not stated',
          why: ['freshness 0/10: 42d old, likely stale', 'remote 3/10: hybrid'],
        },
      ],
    });
    assert.equal(parsed.hits[0]?.comp, null);
    assert.equal(parsed.hits[0]?.remote, false);
    assert.equal(parsed.hits[0]?.freshness, '42d old, likely stale');
  });
});

describe('why helpers', () => {
  it('reads freshness and remote lines', () => {
    assert.equal(freshnessFromWhy(['freshness 7/10: 8d old']), '8d old');
    assert.equal(isRemoteFromWhy(['remote 8/10: remote']), true);
    assert.equal(isRemoteFromWhy(['remote 2/10: unclear']), false);
  });
});

describe('splitSourceLabel', () => {
  it('splits family and detail on the first colon', () => {
    assert.deepEqual(splitSourceLabel('greenhouse:Called'), { family: 'greenhouse', detail: 'Called' });
    assert.deepEqual(splitSourceLabel('remoteok'), { family: 'remoteok', detail: null });
  });
});
