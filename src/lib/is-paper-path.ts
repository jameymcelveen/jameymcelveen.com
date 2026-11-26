/** Pages drawn in the paper style, with their own top bar and footer (home and the blog). */
export function isPaperPath(pathname: string | null | undefined): boolean {
  return pathname === '/' || pathname === '/blog' || Boolean(pathname?.startsWith('/blog/'));
}
