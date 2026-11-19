import type { Metadata } from 'next';
import { Reveal } from '@/components/Reveal';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'RolePilot MCP server',
  description: 'Plug RolePilot into Claude, Cursor, or your own agent stack over MCP.',
  path: '/mcp',
});

const TOOLS = [
  { name: 'search_jobs', body: 'Query matching postings by role, location, and fit threshold.' },
  { name: 'tailor_resume', body: 'Generate a tailored resume for a specific job listing.' },
  { name: 'submit_application', body: 'Submit a tailored application through the real ATS flow.' },
  { name: 'get_application_status', body: 'Fetch the latest status and any detected replies.' },
];

export default function McpPage() {
  return (
    <section className="ol-section pt-32">
      <div className="ol-container">
        <Reveal>
          <span className="ol-eyebrow">MCP server</span>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="ol-h1 mt-3 max-w-2xl text-ink">
            Give your own agent a job-search toolbelt.
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-5 max-w-xl text-body">
            The RolePilot MCP server exposes the same find-tailor-apply-track primitives that
            power the dashboard, so you can call them from Claude, Cursor, or a custom agent.
          </p>
        </Reveal>

        <Reveal delay={180}>
          <div className="ol-card-dark mt-10 font-mono text-sm">
            {'{'}
            <br />
            &nbsp;&nbsp;"mcpServers": {'{'}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;"rolepilot": {'{'}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"command": "npx",
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"args": ["-y", "@rolepilot/mcp-server"]
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;{'}'}
            <br />
            &nbsp;&nbsp;{'}'}
            <br />
            {'}'}
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TOOLS.map((tool, i) => (
            <Reveal key={tool.name} delay={i * 60}>
              <div className="ol-card h-full">
                <code className="font-mono text-sm text-accent">{tool.name}</code>
                <p className="mt-2 text-sm leading-relaxed text-body">{tool.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={260}>
          <a href="/openapi.json" className="ol-btn-ghost mt-10 inline-flex">
            View the OpenAPI spec
          </a>
        </Reveal>
      </div>
    </section>
  );
}
