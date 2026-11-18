import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { blogPosts } from '@/lib/blog';
import { interviewPrepTools } from '@/content/interview-prep';

const STATIC_PATHS = [
  '/',
  '/mobile',
  '/messaging',
  '/mcp',
  '/agents',
  '/auto-apply',
  '/new-grads',
  '/international',
  '/interview-prep',
  '/blog',
  '/changelog',
  '/support',
  '/privacy',
  '/terms',
  '/ai-disclosure',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: '2026-11-17',
  }));

  const interviewEntries = interviewPrepTools.map((tool) => ({
    url: `${SITE_URL}/interview-prep/${tool.slug}`,
    lastModified: '2026-11-17',
  }));

  const blogEntries = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.meta.slug}`,
    lastModified: post.meta.date,
  }));

  return [...staticEntries, ...interviewEntries, ...blogEntries];
}
