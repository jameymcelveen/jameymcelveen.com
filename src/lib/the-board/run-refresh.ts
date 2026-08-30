import 'server-only';

import { persistBoardJobs } from '@/lib/scanner/persist';
import { runJameyScan, type ScanReport } from '@/lib/scanner/run-scan';
import { writeBoardCache } from './cache';
import { viewFromPayload } from './parse';
import type { BoardViewModel } from './types';

export { viewFromPayload };

export async function executeScan(client?: import('pg').PoolClient | null): Promise<{
  board: BoardViewModel;
  report: ScanReport;
}> {
  const report = await runJameyScan();
  await persistBoardJobs(report.payload.hits, client);
  const fetchedAt = await writeBoardCache(report.payload, client ?? undefined);
  return { board: viewFromPayload(report.payload, fetchedAt), report };
}
