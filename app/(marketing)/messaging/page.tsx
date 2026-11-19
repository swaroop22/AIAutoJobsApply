import type { Metadata } from 'next';
import { MessageCircle, CheckCircle2, Clock } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'RolePilot on iMessage & WhatsApp',
  description: 'Get match alerts and approve applications over iMessage or WhatsApp — no app required.',
  path: '/messaging',
});

const STEPS = [
  {
    icon: MessageCircle,
    title: 'Connect your number',
    body: 'Link your phone number from the dashboard in under a minute — no separate app install.',
  },
  {
    icon: Clock,
    title: 'Get matches as texts',
    body: 'When the agent finds a strong match, you get a message with the role, company, and fit score.',
  },
  {
    icon: CheckCircle2,
    title: 'Approve with one reply',
    body: 'Reply "yes" to approve, "skip" to pass. Everything syncs back to your dashboard automatically.',
  },
];

export default function MessagingPage() {
  return (
    <section className="ol-section pt-32">
      <div className="ol-container">
        <Reveal>
          <span className="ol-eyebrow">Messaging</span>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="ol-h1 mt-3 max-w-2xl text-ink">
            Approve applications without opening an app.
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-5 max-w-xl text-body">
            For people who'd rather handle this from a text thread, RolePilot can send match
            alerts and take approvals over iMessage or WhatsApp.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 80}>
              <div className="ol-card h-full">
                <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-wash">
                  <step.icon size={16} strokeWidth={2} />
                </span>
                <h3 className="mt-4 font-display text-lg text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={260}>
          <a href="/app" className="ol-btn-solid mt-10 inline-flex">
            Set up messaging in the app
          </a>
        </Reveal>
      </div>
    </section>
  );
}
