import { NextResponse } from 'next/server';
import { ATS_BOARDS, WORKDAY_BOARDS, type AtsBoard } from '@/content/ats-boards';
import { fetchGreenhouseBoard } from '@/lib/jobs/providers/greenhouse';
import { fetchLeverBoard } from '@/lib/jobs/providers/lever';
import { fetchAshbyBoard } from '@/lib/jobs/providers/ashby';
import { fetchWorkdayBoard } from '@/lib/jobs/providers/workday';
import { isUSLocation } from '@/lib/jobs/us-filter';
import type { JobPosting } from '@/lib/app-db/types';

export const revalidate = 1800;

async function fetchBoard(board: AtsBoard): Promise<JobPosting[]> {
  try {
    if (board.provider === 'greenhouse') return await fetchGreenhouseBoard(board.slug, board.company);
    if (board.provider === 'lever') return await fetchLeverBoard(board.slug, board.company);
    return await fetchAshbyBoard(board.slug, board.company);
  } catch {
    // One flaky upstream board shouldn't take down the whole feed.
    return [];
  }
}

export async function GET() {
  const results = await Promise.all([
    ...ATS_BOARDS.map(fetchBoard),
    ...WORKDAY_BOARDS.map((board) => fetchWorkdayBoard(board).catch(() => [])),
  ]);
  const jobs = results
    .flat()
    .filter((job) => isUSLocation(job.location))
    .sort((a, b) => (b.postedAt ?? '').localeCompare(a.postedAt ?? ''));
  return NextResponse.json({ jobs, fetchedAt: new Date().toISOString() });
}
