import type { Metadata } from 'next';
import { Reveal } from '@/components/Reveal';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Support — RolePilot',
  description: 'Get help with RolePilot.',
  path: '/support',
});

export default function SupportPage() {
  return (
    <section className="ol-section pt-32">
      <div className="ol-container max-w-2xl">
        <Reveal>
          <span className="ol-eyebrow">Support</span>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="ol-h1 mt-3 text-ink">Need a hand?</h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-5 text-body">
            RolePilot doesn't have accounts, so there's no ticketing system tied to a login. For
            bugs, questions, or feedback, reach us directly and we'll get back to you.
          </p>
        </Reveal>
        <Reveal delay={180}>
          <a href="mailto:support@rolepilot.com" className="ol-btn-solid mt-8 inline-flex">
            Email support@rolepilot.com
          </a>
        </Reveal>
        <Reveal delay={220}>
          <p className="mt-10 text-sm text-muted-2">
            Looking for answers first? Check the <a href="/#faq" className="underline">FAQ</a>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
