function toMarkdown(clip) {
  const facts = [
    clip.comp ? `- Comp: ${clip.comp}` : null,
    clip.location ? `- Location: ${clip.location}` : null,
    `- Remote: ${clip.remote ? 'yes' : 'no'}`,
    `- Source: linkedin`,
  ].filter(Boolean);
  return [
    `# ${clip.title}`,
    '',
    `**${clip.company || 'Unknown company'}**`,
    '',
    ...facts,
    '',
    `[Original posting](${clip.url})`,
    '',
    '## Posting',
    '',
    clip.body || '_No description was visible on the LinkedIn page._',
    '',
  ].join('\n');
}

async function clipTab(tab) {
  if (!tab?.id || !/linkedin\.com\/jobs/i.test(tab.url || '')) {
    await setBadge(tab?.id, 'no');
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js'],
  }).catch(() => undefined);
  let clip;
  try {
    clip = await chrome.tabs.sendMessage(tab.id, { type: 'clip-job' });
  } catch {
    await setBadge(tab.id, 'empty');
    return;
  }
  if (!clip?.title || !clip?.url) {
    await setBadge(tab.id, 'empty');
    return;
  }

  const markdown = toMarkdown(clip);
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async (text) => {
      await navigator.clipboard.writeText(text);
    },
    args: [markdown],
  });

  const slug = (clip.url.match(/\/(\d+)\/?$/) || ['', 'job'])[1];
  const url = `data:application/json;base64,${btoa(unescape(encodeURIComponent(JSON.stringify(clip, null, 2))))}`;
  await chrome.downloads.download({
    url,
    filename: `linkedin-clip-${slug}.json`,
    saveAs: false,
  });

  await chrome.storage.local.set({ fitFilterDraft: markdown });

  const settings = await chrome.storage.local.get(['apiBase', 'adminKey', 'openFitFilter']);
  const apiBase = (settings.apiBase || 'https://jameymcelveen.com').replace(/\/$/, '');
  if (settings.adminKey) {
    try {
      await fetch(`${apiBase}/api/the-board/clips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': settings.adminKey,
        },
        body: JSON.stringify(clip),
      });
    } catch {
      /* makefile push is the fallback */
    }
  }

  if (settings.openFitFilter !== false) {
    await chrome.tabs.create({ url: `${apiBase}/lab/fit-filter` });
  }

  await setBadge(tab.id, 'ok');
}

async function setBadge(tabId, text) {
  if (!tabId) return;
  await chrome.action.setBadgeText({ tabId, text: text === 'ok' ? '✓' : '!' });
  await chrome.action.setBadgeBackgroundColor({
    tabId,
    color: text === 'ok' ? '#546223' : '#B94700',
  });
}

chrome.action.onClicked.addListener((tab) => {
  void clipTab(tab);
});
