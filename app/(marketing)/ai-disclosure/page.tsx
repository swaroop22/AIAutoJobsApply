import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'AI disclosure — Offerlane',
  description: 'How Offerlane uses AI in the application process.',
  path: '/ai-disclosure',
});

export default function AiDisclosurePage() {
  return (
    <section className="ol-section pt-32">
      <div className="ol-container ol-prose max-w-2xl">
        <h1 className="ol-h1 text-ink">AI disclosure</h1>
        <p className="mt-4 text-sm text-muted-2">Last updated November 17, 2026</p>

        <h2>Where AI is used</h2>
        <p>
          Offerlane uses AI to match job postings against your stated background, to tailor the
          wording and ordering of your resume for a specific listing, and to draft summaries of
          recruiter replies for your tracker.
        </p>

        <h2>What AI does not do</h2>
        <p>
          The agent does not fabricate work experience, education, or credentials you haven't
          provided. Tailoring reshapes how your real experience is presented — it doesn't invent
          new experience.
        </p>

        <h2>Your control</h2>
        <p>
          In Review mode, you approve each application before it's sent. In Auto Apply mode,
          submissions happen automatically within the filters and thresholds you set, and you can
          switch back to Review mode or pause the agent at any time.
        </p>

        <h2>Questions</h2>
        <p>
          If you're an employer or recruiter with questions about how a specific application was
          generated, reach us at{' '}
          <a href="mailto:ai-disclosure@offerlane.com">ai-disclosure@offerlane.com</a>.
        </p>
      </div>
    </section>
  );
}
