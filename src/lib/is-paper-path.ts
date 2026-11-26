/** Pages drawn in the paper style, with their own top bar and footer (home, blog, contact, admin). */
export function isPaperPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname === '/' ||
    pathname === '/blog' ||
    pathname.startsWith('/blog/') ||
    pathname === '/contact' ||
    pathname === '/admin'
  );
}
