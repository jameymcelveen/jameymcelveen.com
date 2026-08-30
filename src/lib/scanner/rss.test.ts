import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { findRssItem, parseRssItems, rssUrlKey } from './rss.ts';

const feed = `<?xml version="1.0"?><rss><channel>
  <item>
    <title>Sr. Lead Data Engineer</title>
    <description><![CDATA[<img class='webfeedsFeaturedVisual' src='https://www.christiantechjobs.io/api/opengraph-image?slug=x' />
      <p>Chick-fil-A — Remote</p>
      <p>Tags: Data • Remote</p>
      <h3>Job Description</h3><p>Lead complex Supply Chain data work.</p>
      <h3>Responsibilities</h3><ul><li>Develops ETL pipelines.</li></ul>
      <p>Apply for this job at https://www.christiantechjobs.io/christian-jobs/remote-sr-lead-data-engineer-chick-fil-a-1776</p>]]></description>
    <link>https://www.christiantechjobs.io/christian-jobs/remote-sr-lead-data-engineer-chick-fil-a-1776</link>
    <guid isPermaLink="false">https://www.christiantechjobs.io/christian-jobs/remote-sr-lead-data-engineer-chick-fil-a-1776</guid>
    <pubDate>Tue, 18 Aug 2026 19:16:39 GMT</pubDate>
  </item>
</channel></rss>`;

describe('parseRssItems', () => {
  it('reads CTJ company location and markdown body from CDATA', () => {
    const [item] = parseRssItems(feed, 'Christian Tech Jobs');
    assert.equal(item?.title, 'Sr. Lead Data Engineer');
    assert.equal(item?.company, 'Chick-fil-A');
    assert.equal(item?.location, 'Remote');
    assert.match(item?.url ?? '', /chick-fil-a-1776$/);
    assert.match(item?.body ?? '', /### Job Description/);
    assert.match(item?.body ?? '', /Lead complex Supply Chain data work/);
    assert.match(item?.body ?? '', /^- Develops ETL pipelines\./m);
    assert.ok((item?.body.length ?? 0) > 80);
  });
});

describe('findRssItem', () => {
  it('matches www and non-www posting urls', () => {
    const item = findRssItem(
      feed,
      'https://christiantechjobs.io/christian-jobs/remote-sr-lead-data-engineer-chick-fil-a-1776',
      'Christian Tech Jobs'
    );
    assert.equal(item?.company, 'Chick-fil-A');
  });
});

describe('rssUrlKey', () => {
  it('ignores www and trailing slash', () => {
    assert.equal(
      rssUrlKey('https://www.christiantechjobs.io/christian-jobs/foo/'),
      rssUrlKey('https://christiantechjobs.io/christian-jobs/foo')
    );
  });
});
