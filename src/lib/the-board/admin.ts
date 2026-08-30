import 'server-only';

import { createHash, timingSafeEqual } from 'crypto';

export function adminKeyMatches(provided: string | null): boolean {
  const expected = process.env.BOARD_ADMIN_KEY ?? '';
  if (!expected || provided == null) return false;
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}
