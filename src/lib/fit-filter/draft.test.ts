import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FIT_FILTER_DRAFT_KEY, stashFitFilterDraft, takeFitFilterDraft } from './draft.ts';

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

describe('fit filter draft', () => {
  it('stashes then take consumes the value', () => {
    store.clear();
    stashFitFilterDraft('  # Job\n\nPaste me.  ');
    assert.equal(store.get(FIT_FILTER_DRAFT_KEY), '# Job\n\nPaste me.');
    assert.equal(takeFitFilterDraft(), '# Job\n\nPaste me.');
    assert.equal(store.get(FIT_FILTER_DRAFT_KEY), undefined);
    assert.equal(takeFitFilterDraft(), null);
  });

  it('ignores blank markdown', () => {
    store.clear();
    stashFitFilterDraft('   ');
    assert.equal(store.has(FIT_FILTER_DRAFT_KEY), false);
  });
});
