import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyticsApiBase, postInsightEvent } from './site-analytics.ts';
import { campaignFromSearch, cleanCampaign } from './campaign.ts';

test('regression: same-origin base is "" and tracking must still send', async () => {
  assert.equal(analyticsApiBase(), '');
  const calls: { url: string; body: string }[] = [];
  const g = globalThis as Record<string, unknown>;
  const realFetch = g.fetch;
  g.window = {};
  g.fetch = async (url: string, init: { body: string }) => {
    calls.push({ url, body: init.body });
    return new Response('{}');
  };
  try {
    postInsightEvent({ event: 'page_view', page: '/' });
    assert.equal(calls.length, 1, 'postInsightEvent returned early without sending');
    assert.equal(calls[0].url, '/api/analytics/event');
    assert.match(calls[0].body, /page_view/);
  } finally {
    delete g.window;
    g.fetch = realFetch;
  }
});

test('tags come from utm_* or ref', () => {
  assert.equal(campaignFromSearch('?utm_source=linkedin&utm_medium=dm&utm_campaign=Andrew-Curana'), 'linkedin/dm/andrew-curana');
  assert.equal(campaignFromSearch('?utm_source=linkedin&utm_campaign=andrew'), 'linkedin/andrew');
  assert.equal(campaignFromSearch('?ref=pam-apex'), 'pam-apex');
  assert.equal(campaignFromSearch('?ref=pam-apex&utm_source=x'), 'pam-apex');
  assert.equal(campaignFromSearch(''), null);
  assert.equal(campaignFromSearch('?foo=bar'), null);
});

test('tags are plain short labels only', () => {
  assert.equal(cleanCampaign('<script>alert(1)</script>'), null);
  assert.equal(cleanCampaign("x'; drop table analytics_events;--"), null);
  assert.equal(cleanCampaign('a'.repeat(200)), null);
  assert.equal(cleanCampaign('  Pam Apex '), 'pam-apex');
  assert.equal(cleanCampaign(42), null);
});
