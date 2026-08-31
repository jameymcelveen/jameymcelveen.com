import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  TRACKER_KEY,
  daysInStage,
  loadTracker,
  moveTrackerEntry,
  parseTracker,
  removeTrackerEntry,
  updateTrackerNotes,
  upsertFavorite,
} from './store.ts';

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

describe('tracker store', () => {
  it('roundtrips a favorite and is idempotent on boardJobId', () => {
    store.clear();
    const first = upsertFavorite({
      title: 'Staff Engineer',
      company: 'Acme',
      score: 58,
      boardJobId: 'abc123abc123',
      sourceUrl: 'https://example.com/job',
    });
    const again = upsertFavorite({
      title: 'Staff Engineer',
      company: 'Acme',
      boardJobId: 'abc123abc123',
    });
    assert.equal(again.id, first.id);
    assert.equal(loadTracker().length, 1);
    assert.equal(JSON.parse(store.get(TRACKER_KEY) ?? '[]')[0].title, 'Staff Engineer');
  });

  it('updates stageChangedAt when moving stages', () => {
    store.clear();
    const entry = upsertFavorite({ title: 'Lead', company: 'Co', isManual: true });
    const moved = moveTrackerEntry(entry.id, 'applied');
    assert.ok(moved);
    assert.equal(moved.stage, 'applied');
    assert.notEqual(moved.stageChangedAt, entry.stageChangedAt);
  });

  it('edits notes and removes an entry', () => {
    store.clear();
    const entry = upsertFavorite({ title: 'PM', company: 'Org' });
    updateTrackerNotes(entry.id, '  called recruiter  ');
    assert.equal(loadTracker()[0]?.notes, 'called recruiter');
    assert.equal(removeTrackerEntry(entry.id), true);
    assert.equal(loadTracker().length, 0);
  });

  it('drops malformed rows', () => {
    assert.equal(parseTracker([{ id: 1 }, { id: 'x', title: 't', company: 'c' }]).length, 0);
  });

  it('formats days in stage', () => {
    const now = Date.parse('2026-08-31T16:00:00.000Z');
    assert.equal(daysInStage('2026-08-31T10:00:00.000Z', now), 'Moved today');
    assert.equal(daysInStage('2026-08-30T10:00:00.000Z', now), 'Moved 1d ago');
    assert.equal(daysInStage('2026-08-28T10:00:00.000Z', now), 'Moved 3d ago');
  });
});
