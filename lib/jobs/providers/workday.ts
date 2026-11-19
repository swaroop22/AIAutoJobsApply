import type { WorkdayBoard } from '@/content/ats-boards';
import type { JobPosting } from '@/lib/app-db/types';
import { decodeHtmlEntities, stripHtmlToText } from '../html';

// Workday's list endpoint 400s above this value — confirmed live.
const MAX_PAGE_SIZE = 20;

type WorkdayListPosting = {
  title: string;
  externalPath: string;
  locationsText?: string;
  bulletFields?: string[];
  postedOn?: string;
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
  try {
    const res = await fetch(`${baseUrl(board)}/wday/cxs/${board.tenant}/${board.site}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appliedFacets: {}, limit: MAX_PAGE_SIZE, offset: 0, searchText }),
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as WorkdayListResponse;
    return data.jobPostings ?? [];
  } catch {
    return [];
  }
}

async function fetchDetail(board: WorkdayBoard, posting: WorkdayListPosting): Promise<JobPosting> {
  const reqId = posting.bulletFields?.[0] || posting.externalPath.split('_').pop() || posting.externalPath;
  const location = posting.locationsText || 'Location not listed';
  const applyUrl = `${baseUrl(board)}/en-US/${board.site}${posting.externalPath}`;

  try {
    const res = await fetch(`${baseUrl(board)}/wday/cxs/${board.tenant}/${board.site}${posting.externalPath}`, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = (await res.json()) as WorkdayDetailResponse;
      const info = data.jobPostingInfo;
      if (info) {
        const html = decodeHtmlEntities(info.jobDescription ?? '');
        const fullLocation = [info.location, ...(info.additionalLocations ?? [])].filter(Boolean).join(' · ') || location;
        return {
          id: `workday:${board.tenant}:${info.jobReqId || reqId}`,
          provider: 'workday',
          boardSlug: board.tenant,
          externalId: info.jobReqId || reqId,
          title: posting.title,
          company: board.company,
          location: fullLocation,
          remote: /\bremote\b/i.test(fullLocation),
          descriptionHtml: html || `<p>${posting.title} at ${board.company}. Location: ${fullLocation}</p>`,
          descriptionText: stripHtmlToText(html) || `${posting.title} at ${board.company}. Location: ${fullLocation}`,
          applyUrl: info.externalUrl ?? applyUrl,
          postedAt: info.startDate || posting.postedOn,
        };
      }
    }
  } catch {
    // If detail fetch times out or fails, gracefully fall back to list metadata
  }

  return {
    id: `workday:${board.tenant}:${reqId}`,
    provider: 'workday',
    boardSlug: board.tenant,
    externalId: reqId,
    title: posting.title,
    company: board.company,
    location,
    remote: /\bremote\b/i.test(location),
    descriptionHtml: `<p>${posting.title} at ${board.company}. Location: ${location}. Apply at ${board.company}.</p>`,
    descriptionText: `${posting.title} at ${board.company}. Location: ${location}.`,
    applyUrl,
    postedAt: posting.postedOn,
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

  // Limit to top 20 postings per board to avoid network bottlenecks
  const selectedPostings = [...byPath.values()].slice(0, 20);

  const details = await Promise.all(
    selectedPostings.map((posting) => fetchDetail(board, posting)),
  );

  return details;
}
