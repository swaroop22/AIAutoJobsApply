import type { Metadata } from 'next';

export const SITE_NAME = 'RolePilot';
export const SITE_URL = 'https://rolepilot.com';
export const SITE_DESCRIPTION =
  'RolePilot is a free AI job-application agent that finds matching roles, tailors your resume, submits applications, and tracks replies — no account, no card, no cost.';

export function buildMetadata(opts: {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const path = opts.path ?? '/';
  const url = `${SITE_URL}${path}`;
  const description = opts.description ?? SITE_DESCRIPTION;

  return {
    title: opts.title,
    description,
    alternates: { canonical: url },
    robots: opts.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: opts.title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: [{ url: `${SITE_URL}/og?title=${encodeURIComponent(opts.title)}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description,
      images: [`${SITE_URL}/og?title=${encodeURIComponent(opts.title)}`],
    },
  };
}
