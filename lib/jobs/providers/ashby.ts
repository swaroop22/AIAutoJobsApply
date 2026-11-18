import type { JobPosting } from '@/lib/app-db/types';
import { stripHtmlToText } from '../html';

type AshbyJob = {
  id: string;
  title: string;
  location?: string;
  isRemote?: boolean;
  descriptionHtml?: string;
  jobUrl: string;
  applyUrl?: string;
  publishedAt?: string;
};

export async function fetchAshbyBoard(slug: string, company: string): Promise<JobPosting[]> {
  const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${slug}`, {
    next: { revalidate: 1800 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as { jobs?: AshbyJob[] };
  return (data.jobs ?? []).map((job): JobPosting => {
    const html = job.descriptionHtml ?? '';
    return {
      id: `ashby:${slug}:${job.id}`,
      provider: 'ashby',
      boardSlug: slug,
      externalId: job.id,
      title: job.title,
      company,
      location: job.location ?? '',
      remote: Boolean(job.isRemote),
      descriptionHtml: html,
      descriptionText: stripHtmlToText(html),
      applyUrl: job.applyUrl ?? job.jobUrl,
      postedAt: job.publishedAt,
    };
  });
}
