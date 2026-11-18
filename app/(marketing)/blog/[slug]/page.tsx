import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogPosts, getBlogPost } from '@/lib/blog';
import { buildMetadata } from '@/lib/seo';
import { blogPostingJsonLd } from '@/lib/jsonld';

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.meta.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return buildMetadata({ title: 'Blog — Offerlane' });
  return buildMetadata({
    title: `${post.meta.title} — Offerlane`,
    description: post.meta.description,
    path: `/blog/${post.meta.slug}`,
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const { Component, meta } = post;

  return (
    <article className="ol-section pt-32">
      <div className="ol-container max-w-2xl">
        <time className="font-mono text-xs uppercase tracking-[0.08em] text-muted-2">
          {meta.date}
        </time>
        <h1 className="ol-h1 mt-3 text-ink">{meta.title}</h1>
        <p className="mt-2 text-sm text-muted-2">By {meta.author}</p>

        <div className="ol-prose mt-10">
          <Component />
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd(meta)) }}
      />
    </article>
  );
}
