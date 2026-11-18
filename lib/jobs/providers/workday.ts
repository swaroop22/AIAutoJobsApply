import type { WorkdayBoard } from '@/content/ats-boards';
import type { JobPosting } from '@/lib/app-db/types';
import { decodeHtmlEntities, stripHtmlToText } from '../html';

// Workday's list endpoint 400s above this value — confirmed live.
const MAX_PAGE_SIZE = 20;

type WorkdayListPosting = {
  title: string;
  externalPath: string;
};

type WorkdayListResponse = {
  jobPostings?: WorkdayListPosting[];
};

type WorkdayDetailResponse = {
  jobPostingInfo?: {
    jobDescription?: string;
    location?: string;
    additionalLocations?: string[];
    startDate?: string;
    jobReqId?: string;
    externalUrl?: string;
  };
};

function baseUrl(board: WorkdayBoard): string {
  return `https://${board.tenant}.wd${board.wdNumber}.myworkdayjobs.com`;
}

async function searchPostings(board: WorkdayBoard, searchText: string): Promise<WorkdayListPosting[]> {
  const res = await fetch(`${baseUrl(board)}/wday/cxs/${board.tenant}/${board.site}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appliedFacets: {}, limit: MAX_PAGE_SIZE, offset: 0, searchText }),
    next: { revalidate: 1800 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as WorkdayListResponse;
  return data.jobPostings ?? [];
}

async function fetchDetail(board: WorkdayBoard, externalPath: string, fallbackTitle: string): Promise<JobPosting | null> {
  const res = await fetch(`${baseUrl(board)}/wday/cxs/${board.tenant}/${board.site}${externalPath}`, {
    next: { revalidate: 1800 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as WorkdayDetailResponse;
  const info = data.jobPostingInfo;
  if (!info?.jobReqId) return null;

  const html = decodeHtmlEntities(info.jobDescription ?? '');
  const location = [info.location, ...(info.additionalLocations ?? [])].filter(Boolean).join(' · ');

  return {
    id: `workday:${board.tenant}:${info.jobReqId}`,
    provider: 'workday',
    boardSlug: board.tenant,
    externalId: info.jobReqId,
    title: fallbackTitle,
    company: board.company,
    location: location || 'Location not listed',
    remote: /\bremote\b/i.test(location),
    descriptionHtml: html,
    descriptionText: stripHtmlToText(html),
    applyUrl: info.externalUrl ?? `${baseUrl(board)}/${board.site}${externalPath}`,
    postedAt: info.startDate,
  };
}

export async function fetchWorkdayBoard(board: WorkdayBoard): Promise<JobPosting[]> {
  const listsPerTerm = await Promise.all(board.searchTerms.map((term) => searchPostings(board, term)));

  const byPath = new Map<string, WorkdayListPosting>();
  for (const postings of listsPerTerm) {
    for (const posting of postings) {
      byPath.set(posting.externalPath, posting);
    }
  }

  const details = await Promise.all(
    [...byPath.values()].map((posting) =>
      fetchDetail(board, posting.externalPath, posting.title).catch(() => null),
    ),
  );

  return details.filter((job): job is JobPosting => job !== null);
}
