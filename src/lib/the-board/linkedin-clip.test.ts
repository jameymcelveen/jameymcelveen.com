import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  clipToMarkdown,
  normalizeLinkedInJobUrl,
  parseLinkedInClip,
  parseLinkedInClipList,
} from './linkedin-clip.ts';

const raw = {
  clippedAt: '2026-08-30T18:00:00.000Z',
  title: 'Principal Architect',
  company: 'Example Health',
  url: 'https://www.linkedin.com/jobs/view/4416248954/?eBP=foo',
  location: 'Remote, United States',
  comp: null,
  remote: true,
  body: 'Build .NET APIs on PostgreSQL. Fully remote.',
  source: 'linkedin',
};

describe('normalizeLinkedInJobUrl', () => {
  it('strips tracking query and keeps the job id', () => {
    assert.equal(
      normalizeLinkedInJobUrl(raw.url),
      'https://www.linkedin.com/jobs/view/4416248954/'
    );
  });
});

describe('parseLinkedInClip', () => {
  it('keeps posting fields and infers remote', () => {
    const clip = parseLinkedInClip(raw);
    assert.equal(clip?.title, 'Principal Architect');
    assert.equal(clip?.url, 'https://www.linkedin.com/jobs/view/4416248954/');
    assert.equal(clip?.remote, true);
    assert.match(clipToMarkdown(clip), /## Posting/);
    assert.match(clipToMarkdown(clip), /Build \.NET APIs/);
  });

  it('rejects a clip without title or url', () => {
    assert.equal(parseLinkedInClip({ title: '', url: '' }), null);
  });
});

describe('parseLinkedInClipList', () => {
  it('dedupes by job url', () => {
    const clips = parseLinkedInClipList({
      clips: [raw, { ...raw, body: 'newer' }],
    });
    assert.equal(clips.length, 1);
    assert.equal(clips[0]?.body, 'newer');
  });
});
