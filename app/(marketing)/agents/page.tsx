import type { Metadata } from 'next';
import { Reveal } from '@/components/Reveal';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'For agents — RolePilot',
  description: 'Machine-readable resources for agents and crawlers: agents.md, llms.txt, and an OpenAPI spec.',
  path: '/agents',
});

const RESOURCES = [
  { href: '/agents.md', label: '/agents.md', body: 'Plain-markdown description of RolePilot for agent frameworks.' },
  { href: '/llms.txt', label: '/llms.txt', body: 'A concise summary formatted for LLM context windows.' },
  { href: '/openapi.json', label: '/openapi.json', body: 'OpenAPI spec for the find/tailor/apply/track endpoints.' },
];

export default function AgentsPage() {
  return (
    <section className="ol-section pt-32">
      <div className="ol-container max-w-2xl">
        <Reveal>
          <span className="ol-eyebrow">For agents</span>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="ol-h1 mt-3 text-ink">Built to be read by agents, not just people.</h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-5 text-body">
            RolePilot is free and open — no account required to use it, and no account required
            to describe it to another agent. These resources are plain text, versioned, and safe
            to crawl.
          </p>
        </Reveal>

        <div className="mt-10 flex flex-col gap-4">
          {RESOURCES.map((r, i) => (
            <Reveal key={r.href} delay={i * 60}>
              <a href={r.href} className="ol-card flex items-center justify-between gap-4 hover:border-ink">
                <div>
                  <code className="font-mono text-sm text-accent">{r.label}</code>
                  <p className="mt-1 text-sm text-body">{r.body}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
