import type { JobPosting } from '@/lib/app-db/types';
import { decodeHtmlEntities, stripHtmlToText } from '../html';

type GreenhouseJob = {
  id: number;
  title: string;
  absolute_url: string;
  location?: { name?: string };
  content?: string;
  updated_at?: string;
};

export async function fetchGreenhouseBoard(slug: string, company: string): Promise<JobPosting[]> {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`, {
    next: { revalidate: 1800 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as { jobs?: GreenhouseJob[] };
  return (data.jobs ?? []).map((job): JobPosting => {
    const html = decodeHtmlEntities(job.content ?? '');
    const location = job.location?.name ?? '';
    return {
      id: `greenhouse:${slug}:${job.id}`,
      provider: 'greenhouse',
      boardSlug: slug,
      externalId: String(job.id),
      title: job.title,
      company,
      location,
      remote: /remote/i.test(location),
      descriptionHtml: html,
      descriptionText: stripHtmlToText(html),
      applyUrl: job.absolute_url,
      postedAt: job.updated_at,
    };
  });
}
