import { BoardClient } from '@/components/the-board/BoardClient';
import { loadBoard } from '@/lib/the-board/load';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TheBoardPage() {
  const board = await loadBoard();
  return <BoardClient initial={board} />;
}
