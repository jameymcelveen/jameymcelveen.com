import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { htmlToMarkdown, stripHtml, unwrapXmlCdata } from './html.ts';

const cdata = `<![CDATA[<img class='webfeedsFeaturedVisual' src='https://www.christiantechjobs.io/api/opengraph-image?slug=remote-sr-lead-data-engineer-chick-fil-a-1776' width='480px' />
              <p>Chick-fil-A — Remote</p>
              <p>Tags: Data • Remote</p>
              <h3>Job Description</h3><p>Chick-fil-A Staff members play a vital role.</p>
              <h3>Responsibilities</h3>
              <ul><li>Develops ETL pipelines for Supply Chain consumption.</li><li>Designs specific tool implementations.</li></ul>
              <p>Apply for this job at https://www.christiantechjobs.io/christian-jobs/remote-sr-lead-data-engineer-chick-fil-a-1776</p>]]>`;

describe('unwrapXmlCdata', () => {
  it('unwraps a CDATA description', () => {
    assert.match(unwrapXmlCdata(cdata), /^<img /);
    assert.doesNotMatch(unwrapXmlCdata(cdata), /<!\[CDATA\[/);
  });
});

describe('htmlToMarkdown', () => {
  it('keeps CTJ headings lists and drops the featured image', () => {
    const md = htmlToMarkdown(cdata);
    assert.match(md, /^Chick-fil-A — Remote/m);
    assert.match(md, /^### Job Description$/m);
    assert.match(md, /^### Responsibilities$/m);
    assert.match(md, /^- Develops ETL pipelines for Supply Chain consumption\./m);
    assert.match(md, /Chick-fil-A Staff members play a vital role/);
    assert.doesNotMatch(md, /opengraph-image/);
    assert.doesNotMatch(md, /webfeedsFeaturedVisual/);
  });

  it('returns empty for blank input', () => {
    assert.equal(htmlToMarkdown('  '), '');
    assert.equal(htmlToMarkdown(null), '');
  });
});

describe('stripHtml', () => {
  it('unwraps CDATA then flattens tags', () => {
    const text = stripHtml(cdata);
    assert.match(text, /Chick-fil-A/);
    assert.match(text, /Develops ETL pipelines/);
    assert.doesNotMatch(text, /<p>/);
  });
});
