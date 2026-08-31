import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { extractJobUrl, isManualJobId, newManualJobId, parseManualBoard } from './manual.ts';

const store = new Map<string, string>();

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
  },
});

describe('manual board overlay', () => {
  it('accepts m-prefixed ids and rejects scanner ids', () => {
    assert.equal(isManualJobId('m' + 'ab'.repeat(6)), true);
    assert.equal(isManualJobId('abcdefabcdef'), false);
  });

  it('new ids are unique and parseable', () => {
    const id = newManualJobId();
    assert.equal(isManualJobId(id), true);
    const rows = parseManualBoard([
      { id, title: 'Dev', company: 'Co', url: 'https://example.com', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'nope', title: 'X', company: 'Y', url: 'https://x.com', createdAt: '2026-01-01T00:00:00.000Z' },
    ]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.title, 'Dev');
  });

  it('extracts the first http url from a posting', () => {
    assert.equal(extractJobUrl('See https://jobs.example.com/role). More.'), 'https://jobs.example.com/role');
    assert.equal(extractJobUrl('no link here'), null);
  });
});
