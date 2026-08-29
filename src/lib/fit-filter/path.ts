/** Unguessable-enough showcase path. Not listed in nav or sitemap. */
export const FIT_FILTER_PATH = '/lab/fit-filter';

export function isObscuredLabPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === '/lab' || pathname.startsWith('/lab/');
}
