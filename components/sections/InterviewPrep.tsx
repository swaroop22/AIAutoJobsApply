import { Mic, Code2, Network, LineChart } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { interviewPrepTools } from '@/content/interview-prep';

const ICONS = { mic: Mic, 'code-2': Code2, network: Network, 'line-chart': LineChart };

export function InterviewPrep() {
  return (
    <section className="ol-section">
      <div className="ol-container">
        <Reveal>
          <span className="ol-eyebrow">Interview prep · Beta</span>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="ol-h2 mt-3 max-w-xl text-ink">
            Getting the interview was step one. Here's step two.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {interviewPrepTools.map((tool, i) => {
            const Icon = ICONS[tool.icon];
            return (
              <Reveal key={tool.slug} delay={i * 80}>
                <a
                  href={`/interview-prep/${tool.slug}`}
                  className="ol-card flex h-full flex-col gap-4 transition-colors hover:border-ink"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-wash">
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg text-ink">{tool.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-body">{tool.description}</p>
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
