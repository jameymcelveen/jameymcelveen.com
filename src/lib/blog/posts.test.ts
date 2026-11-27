import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatPostDate, getAllPosts, parsePost, sortPosts } from './posts.ts';

const sample = `---
title: Hello there
date: 2026-11-26
summary: A short summary.
---

First paragraph.

## A heading

- one
- two

[a link](https://example.com)
`;

describe('parsePost', () => {
  it('reads the header and renders the body', () => {
    const post = parsePost('2026-11-26-hello-there.md', sample);
    assert.ok(post);
    assert.equal(post.slug, 'hello-there');
    assert.equal(post.title, 'Hello there');
    assert.equal(post.date, '2026-11-26');
    assert.equal(post.summary, 'A short summary.');
    assert.equal(post.draft, false);
    assert.match(post.html, /<p>First paragraph\.<\/p>/);
    assert.match(post.html, /<h2[^>]*>A heading<\/h2>/);
    assert.match(post.html, /<li>one<\/li>/);
    assert.match(post.html, /href="https:\/\/example\.com"/);
    assert.equal(post.minutes, 1);
  });

  it('uses the date in the file name when the header has none', () => {
    const post = parsePost('2026-01-02-no-date.md', '---\ntitle: No date\n---\n\nBody.\n');
    assert.equal(post?.date, '2026-01-02');
  });

  it('rejects bad file names, missing headers and missing titles', () => {
    assert.equal(parsePost('hello.md', sample), null);
    assert.equal(parsePost('2026-11-26-Hello.md', sample), null);
    assert.equal(parsePost('2026-11-26-hello.md', 'No header here.'), null);
    assert.equal(parsePost('2026-11-26-hello.md', '---\nsummary: x\n---\n\nBody.\n'), null);
  });

  it('reads an optional header image and ignores outside links', () => {
    const withImage = parsePost(
      '2026-11-27-img.md',
      '---\ntitle: Img\nimage: /blog/a.png\n---\n\nx\n'
    );
    assert.equal(withImage?.image, '/blog/a.png');
    const outside = parsePost(
      '2026-11-27-out.md',
      '---\ntitle: Out\nimage: https://evil.test/a.png\n---\n\nx\n'
    );
    assert.equal(outside?.image, undefined);
    assert.equal(parsePost('2026-11-26-hello-there.md', sample)?.image, undefined);
    const both = parsePost(
      '2026-11-27-both.md',
      '---\ntitle: Both\nimage: /blog/a.png\nimage_dark: /blog/a-dark.png\n---\n\nx\n'
    );
    assert.equal(both?.imageDark, '/blog/a-dark.png');
    assert.equal(withImage?.imageDark, undefined);
  });

  it('drops raw HTML', () => {
    const post = parsePost(
      '2026-11-26-html.md',
      '---\ntitle: Html\n---\n\nSafe\n\n<script>alert(1)</script>\n'
    );
    assert.ok(post);
    assert.doesNotMatch(post.html, /<script/i);
    assert.match(post.html, /Safe/);
  });
});

describe('sortPosts', () => {
  it('puts the newest first and leaves drafts out', () => {
    const a = parsePost('2026-01-01-older.md', '---\ntitle: Older\n---\n\nx\n');
    const b = parsePost('2026-02-01-newer.md', '---\ntitle: Newer\n---\n\nx\n');
    const c = parsePost('2026-03-01-hidden.md', '---\ntitle: Hidden\ndraft: true\n---\n\nx\n');
    assert.ok(a && b && c);
    assert.deepEqual(
      sortPosts([a, c, b]).map((p) => p.slug),
      ['newer', 'older']
    );
  });
});

describe('formatPostDate', () => {
  it('prints the day as written', () => {
    assert.equal(formatPostDate('2026-11-26'), 'November 26, 2026');
    assert.equal(formatPostDate('2026-01-01'), 'January 1, 2026');
  });
});

describe('the posts in this repo', () => {
  it('all parse, with a title, a summary and a unique address', () => {
    const posts = getAllPosts();
    assert.ok(posts.length >= 1);
    for (const p of posts) {
      assert.ok(p.title, p.slug);
      assert.ok(p.summary, `${p.slug} needs a summary`);
      assert.ok(p.html.length > 0, p.slug);
    }
    assert.equal(new Set(posts.map((p) => p.slug)).size, posts.length);
  });
});
