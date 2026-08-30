function pick(selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    const text = (el?.innerText || el?.textContent || '').replace(/\s+/g, ' ').trim();
    if (text) return text;
  }
  return '';
}

function pickHtml(selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && (el.innerText || '').trim().length > 40) return el.innerText.trim();
  }
  return '';
}

function normalizeUrl(url) {
  const match = /linkedin\.com\/jobs\/view\/(\d+)/i.exec(url);
  if (match?.[1]) return `https://www.linkedin.com/jobs/view/${match[1]}/`;
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString();
  } catch {
    return url;
  }
}

function extractJob() {
  const title = pick([
    '.job-details-jobs-unified-top-card__job-title',
    'h1.t-24',
    'h1.job-title',
    '.top-card-layout__title',
    'h1',
  ]);
  const company = pick([
    '.job-details-jobs-unified-top-card__company-name a',
    '.job-details-jobs-unified-top-card__company-name',
    '.topcard__org-name-link',
    '.top-card-layout__card .topcard__flavor a',
    'a.topcard__org-name-link',
  ]);
  const location = pick([
    '.job-details-jobs-unified-top-card__primary-description-container',
    '.job-details-jobs-unified-top-card__bullet',
    '.topcard__flavor--bullet',
    '.top-card-layout__second-subline',
  ]);
  const body = pickHtml([
    '#job-details',
    '.jobs-description__content',
    '.jobs-box__html-content',
    '.show-more-less-html__markup',
    '.description__text',
    'article.jobs-description',
  ]);
  const hay = `${title}\n${location}\n${body}`;
  const currentJobId = new URLSearchParams(window.location.search).get('currentJobId');
  const hrefId = /linkedin\.com\/jobs\/view\/(\d+)/i.exec(window.location.href)?.[1];
  const jobId = hrefId || currentJobId;
  const url = jobId
    ? `https://www.linkedin.com/jobs/view/${jobId}/`
    : normalizeUrl(window.location.href);

  return {
    clippedAt: new Date().toISOString(),
    title,
    company,
    url,
    location,
    comp: null,
    remote: /\bremote\b/i.test(hay),
    body,
    source: 'linkedin',
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'clip-job') return;
  sendResponse(extractJob());
  return true;
});
