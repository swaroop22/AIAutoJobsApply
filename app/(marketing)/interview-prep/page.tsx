import type { Metadata } from 'next';
import { Mic, Code2, Network, LineChart } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { interviewPrepTools } from '@/content/interview-prep';
import { buildMetadata } from '@/lib/seo';

const ICONS = { mic: Mic, 'code-2': Code2, network: Network, 'line-chart': LineChart };

export const metadata: Metadata = buildMetadata({
  title: 'Interview prep — RolePilot',
  description: 'Mock interviews, coding practice, system design, and feedback scoring — free, in beta.',
  path: '/interview-prep',
});

export default function InterviewPrepIndexPage() {
  return (
    <section className="ol-section pt-32">
      <div className="ol-container">
        <Reveal>
          <span className="ol-eyebrow">Interview prep · Beta</span>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="ol-h1 mt-3 max-w-2xl text-ink">
            Four tools to get ready for the interviews RolePilot lands you.
          </h1>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {interviewPrepTools.map((tool, i) => {
            const Icon = ICONS[tool.icon];
            return (
              <Reveal key={tool.slug} delay={i * 80}>
                <a
                  href={`/interview-prep/${tool.slug}`}
                  className="ol-card flex h-full flex-col gap-4 hover:border-ink"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-wash">
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <div>
                    <h2 className="font-display text-lg text-ink">{tool.name}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-body">{tool.longDescription}</p>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
