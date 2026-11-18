import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Mic, Code2, Network, LineChart } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { interviewPrepTools } from '@/content/interview-prep';
import { buildMetadata } from '@/lib/seo';

const ICONS = { mic: Mic, 'code-2': Code2, network: Network, 'line-chart': LineChart };

export function generateStaticParams() {
  return interviewPrepTools.map((tool) => ({ slug: tool.slug }));
}

function getTool(slug: string) {
  return interviewPrepTools.find((t) => t.slug === slug);
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = getTool(params.slug);
  if (!tool) return buildMetadata({ title: 'Interview prep — Offerlane' });
  return buildMetadata({
    title: `${tool.name} — Offerlane interview prep`,
    description: tool.description,
    path: `/interview-prep/${tool.slug}`,
  });
}

export default function InterviewPrepToolPage({ params }: { params: { slug: string } }) {
  const tool = getTool(params.slug);
  if (!tool) notFound();

  const Icon = ICONS[tool.icon];

  return (
    <section className="ol-section pt-32">
      <div className="ol-container max-w-2xl">
        <Reveal>
          <span className="ol-eyebrow">Interview prep · Beta</span>
        </Reveal>
        <Reveal delay={60}>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-wash">
              <Icon size={16} strokeWidth={2} />
            </span>
            <h1 className="ol-h1 text-ink">{tool.name}</h1>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-5 text-body">{tool.longDescription}</p>
        </Reveal>
        <Reveal delay={180}>
          <a href="/app" className="ol-btn-solid mt-8 inline-flex">
            Try it free
          </a>
        </Reveal>
      </div>
    </section>
  );
}
