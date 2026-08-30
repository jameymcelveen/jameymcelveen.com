const apiBase = document.getElementById('apiBase');
const adminKey = document.getElementById('adminKey');
const openFitFilter = document.getElementById('openFitFilter');
const status = document.getElementById('status');

chrome.storage.local.get(['apiBase', 'adminKey', 'openFitFilter'], (stored) => {
  apiBase.value = stored.apiBase || 'https://jameymcelveen.com';
  adminKey.value = stored.adminKey || '';
  openFitFilter.checked = stored.openFitFilter !== false;
});

document.getElementById('save').addEventListener('click', () => {
  chrome.storage.local.set(
    {
      apiBase: apiBase.value.trim() || 'https://jameymcelveen.com',
      adminKey: adminKey.value.trim(),
      openFitFilter: openFitFilter.checked,
    },
    () => {
      status.textContent = 'Saved.';
    }
  );
});
