import PostOne, { meta as metaOne } from '@/content/blog/getting-your-first-reply-faster.mdx';
import PostTwo, { meta as metaTwo } from '@/content/blog/visa-sponsorship-red-flags.mdx';

export type BlogMeta = {
  title: string;
  description: string;
  date: string;
  author: string;
  slug: string;
};

export type BlogPost = {
  meta: BlogMeta;
  Component: React.ComponentType;
};

export const blogPosts: BlogPost[] = [
  { meta: metaOne, Component: PostOne },
  { meta: metaTwo, Component: PostTwo },
].sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1));

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.meta.slug === slug);
}
