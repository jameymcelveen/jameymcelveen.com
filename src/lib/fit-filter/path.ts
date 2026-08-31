/** Unguessable-enough showcase paths. Not listed in public nav or sitemap. */
export const FIT_FILTER_PATH = '/lab/fit-filter';
export const THE_SEARCH_PATH = '/lab/search';
export const THE_BOARD_PATH = '/lab/board';
export const THE_BOARD_SOURCES_PATH = '/lab/sources';
export const THE_TRACKER_PATH = '/lab/tracker';

export function boardJobPath(id: string): string {
  return `/lab/board/jobs/${id}`;
}

export const BOARD_JOB_ID = /^[a-f0-9]{12}$/;
export const MANUAL_JOB_ID = /^m[a-f0-9]{12}$/;

export function isObscuredLabPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === '/lab' || pathname.startsWith('/lab/');
}
