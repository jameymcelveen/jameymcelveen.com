import { redirect } from 'next/navigation';
import { THE_BOARD_PATH } from '@/lib/fit-filter/path';

export default function LabIndexPage() {
  redirect(THE_BOARD_PATH);
}
