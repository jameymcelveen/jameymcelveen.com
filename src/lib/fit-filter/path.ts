/** Unguessable-enough showcase paths. Not listed in nav or sitemap. */
export const FIT_FILTER_PATH = '/lab/fit-filter';
export const THE_SEARCH_PATH = '/lab/the-search';

export function isObscuredLabPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === '/lab' || pathname.startsWith('/lab/');
}
