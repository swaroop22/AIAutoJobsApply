import type { JobPosting } from '@/lib/app-db/types';
import { stripHtmlToText } from '../html';

type LeverJob = {
  id: string;
  text: string;
  categories?: { location?: string; commitment?: string };
  description?: string;
  descriptionPlain?: string;
  hostedUrl: string;
  createdAt?: number;
  workplaceType?: string;
};

export async function fetchLeverBoard(slug: string, company: string): Promise<JobPosting[]> {
  const res = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`, {
    next: { revalidate: 1800 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as LeverJob[] | { ok: false };
  if (!Array.isArray(data)) return [];

  return data.map((job): JobPosting => {
    const location = job.categories?.location ?? '';
    const html = job.description ?? '';
    return {
      id: `lever:${slug}:${job.id}`,
      provider: 'lever',
      boardSlug: slug,
      externalId: job.id,
      title: job.text,
      company,
      location,
      remote: job.workplaceType === 'remote' || /remote/i.test(location),
      descriptionHtml: html,
      descriptionText: job.descriptionPlain ?? stripHtmlToText(html),
      applyUrl: job.hostedUrl,
      postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : undefined,
    };
  });
}
