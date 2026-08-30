export const FIT_FILTER_DRAFT_KEY = 'jamey:fit-filter:draft';

export function stashFitFilterDraft(markdown: string): void {
  const text = markdown.trim();
  if (!text) return;
  localStorage.setItem(FIT_FILTER_DRAFT_KEY, text);
}

export function takeFitFilterDraft(): string | null {
  const value = localStorage.getItem(FIT_FILTER_DRAFT_KEY);
  localStorage.removeItem(FIT_FILTER_DRAFT_KEY);
  if (!value?.trim()) return null;
  return value;
}
