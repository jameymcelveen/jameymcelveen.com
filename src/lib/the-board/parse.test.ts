import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { freshnessFromWhy, isRemoteFromWhy, parseJameyBacklog } from './parse.ts';

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
