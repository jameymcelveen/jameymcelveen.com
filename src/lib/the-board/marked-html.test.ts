import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { markdownToSafeHtml } from './marked-html.ts';

describe('markdownToSafeHtml', () => {
  it('renders headings lists and links', () => {
    const html = markdownToSafeHtml('# Title\n\n**Acme**\n\n- Score: 58\n\n## Posting\n\nHello\n');
    assert.match(html, /<h1>Title<\/h1>/);
    assert.match(html, /<strong>Acme<\/strong>/);
    assert.match(html, /<li>Score: 58<\/li>/);
    assert.match(html, /<h2[^>]*>Posting<\/h2>/);
    assert.match(html, /<p>Hello<\/p>/);
  });

  it('drops raw HTML and javascript urls', () => {
    const html = markdownToSafeHtml('Safe\n\n<script>alert(1)</script>\n\n[x](javascript:alert(1))');
    assert.doesNotMatch(html, /<script/i);
    assert.doesNotMatch(html, /javascript:/i);
    assert.match(html, /Safe/);
  });
});
