/** Unguessable-enough showcase paths. Not listed in public nav or sitemap. */
export const FIT_FILTER_PATH = '/lab/fit-filter';
export const THE_SEARCH_PATH = '/lab/the-search';
export const THE_BOARD_PATH = '/lab/the-board';
export const THE_BOARD_SOURCES_PATH = '/lab/the-board/sources';

export function isObscuredLabPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === '/lab' || pathname.startsWith('/lab/');
}
