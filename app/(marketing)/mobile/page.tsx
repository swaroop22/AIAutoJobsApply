import type { Metadata } from 'next';
import { Apple, Smartphone, Bell } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'RolePilot on mobile',
  description: 'Review matches and approve applications from iOS and Android — coming soon.',
  path: '/mobile',
});

const FEATURES = [
  {
    icon: Bell,
    title: 'Push alerts on strong matches',
    body: 'Get notified the moment a high-fit role is found, with the tailored resume ready to review.',
  },
  {
    icon: Apple,
    title: 'iOS app',
    body: 'A native app for approving applications and checking replies without opening a laptop.',
  },
  {
    icon: Smartphone,
    title: 'Android app',
    body: 'The same agent, with widgets and notifications tuned for Android.',
  },
];

export default function MobilePage() {
  return (
    <section className="ol-section pt-32">
      <div className="ol-container">
        <Reveal>
          <span className="ol-badge">Coming soon</span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="ol-h1 mt-6 max-w-2xl text-ink">Your job search, in your pocket.</h1>
        </Reveal>
        <Reveal delay={140}>
          <p className="mt-5 max-w-xl text-body">
            The web app is the full experience today. Native iOS and Android apps are on the way
            for reviewing matches and approving applications on the go.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="ol-card h-full">
                <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-wash">
                  <f.icon size={16} strokeWidth={2} />
                </span>
                <h3 className="mt-4 font-display text-lg text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={260}>
          <a href="/app" className="ol-btn-solid mt-10 inline-flex">
            Use the web app now
          </a>
        </Reveal>
      </div>
    </section>
  );
}
