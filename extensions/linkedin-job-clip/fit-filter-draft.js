const DRAFT_KEY = 'jamey:fit-filter:draft';

chrome.storage.local.get(['fitFilterDraft'], (result) => {
  const draft = result?.fitFilterDraft;
  if (!draft || typeof draft !== 'string') return;
  try {
    localStorage.setItem(DRAFT_KEY, draft);
  } catch {
    /* ignore */
  }
  chrome.storage.local.remove('fitFilterDraft');
});
