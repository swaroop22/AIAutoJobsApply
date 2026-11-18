import type { Metadata } from 'next';
import { Reveal } from '@/components/Reveal';
import { blogPosts } from '@/lib/blog';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Blog — Offerlane',
  description: 'Notes on job search speed, ATS behavior, and getting replies faster.',
  path: '/blog',
});

export default function BlogIndexPage() {
  return (
    <section className="ol-section pt-32">
      <div className="ol-container max-w-3xl">
        <Reveal>
          <span className="ol-eyebrow">Blog</span>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="ol-h1 mt-3 text-ink">Notes from the job search front line.</h1>
        </Reveal>

        <div className="mt-12 flex flex-col divide-y divide-line">
          {blogPosts.map((post, i) => (
            <Reveal key={post.meta.slug} delay={i * 60}>
              <a href={`/blog/${post.meta.slug}`} className="block py-6 hover:opacity-70">
                <time className="font-mono text-xs uppercase tracking-[0.08em] text-muted-2">
                  {post.meta.date}
                </time>
                <h2 className="mt-2 font-display text-2xl text-ink">{post.meta.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-body">{post.meta.description}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
