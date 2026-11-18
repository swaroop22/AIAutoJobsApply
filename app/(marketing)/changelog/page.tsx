import type { Metadata } from 'next';
import { Reveal } from '@/components/Reveal';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Changelog — Offerlane',
  description: 'What shipped recently in Offerlane.',
  path: '/changelog',
});

const ENTRIES = [
  {
    date: '2026-11-03',
    title: 'Interview prep tools launched in beta',
    body: 'Mock interview, coding practice, system design, and feedback scoring are now available to everyone, free.',
  },
  {
    date: '2026-10-11',
    title: 'Visa & sponsorship filters',
    body: 'Added filtering for OPT/CPT eligibility and sponsorship language, with ambiguous listings flagged instead of hidden.',
  },
  {
    date: '2026-09-02',
    title: 'MCP server released',
    body: 'Offerlane\'s find/tailor/apply/track tools are now available over MCP for use in Claude, Cursor, and custom agents.',
  },
];

export default function ChangelogPage() {
  return (
    <section className="ol-section pt-32">
      <div className="ol-container max-w-2xl">
        <Reveal>
          <span className="ol-eyebrow">Changelog</span>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="ol-h1 mt-3 text-ink">What's new.</h1>
        </Reveal>

        <div className="mt-12 flex flex-col divide-y divide-line">
          {ENTRIES.map((entry, i) => (
            <Reveal key={entry.date} delay={i * 60}>
              <div className="py-6">
                <time className="font-mono text-xs uppercase tracking-[0.08em] text-muted-2">
                  {entry.date}
                </time>
                <h2 className="mt-2 font-display text-xl text-ink">{entry.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-body">{entry.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
