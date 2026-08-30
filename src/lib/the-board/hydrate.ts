import 'server-only';

import { getCached, getText } from '@/lib/scanner/http';
import { findRssItem, rssCacheKey } from '@/lib/scanner/rss';
import { JAMEY_FEEDS } from '@/lib/scanner/watchlist';
import type { BoardHit } from './types';

export async function hydrateHitFromFeeds(hit: BoardHit): Promise<BoardHit> {
  if (hit.body || hit.source !== 'rss') return hit;

  for (const feed of JAMEY_FEEDS.filter((entry) => entry.active && entry.token)) {
    const cacheKey = rssCacheKey(feed.name);
    const cached = await getCached(cacheKey);
    const xml = usableRss(cached) ?? usableRss((await getText(feed.token as string, { cacheKey })).text);
    if (!xml) continue;

    const item = findRssItem(xml, hit.url, feed.name);
    if (!item?.body) continue;

    const useFeedCompany = !hit.company || hit.company === feed.name || hit.company === 'Unknown company';
    return {
      ...hit,
      body: item.body,
      company: useFeedCompany ? item.company : hit.company,
      location: hit.location || item.location || null,
    };
  }

  return hit;
}

function usableRss(xml: string | null | undefined): string | null {
  if (!xml || !/<item\b/i.test(xml)) return null;
  return xml;
}
