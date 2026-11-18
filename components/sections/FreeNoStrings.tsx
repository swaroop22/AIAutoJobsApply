import { ShieldOff, CreditCard, Infinity as InfinityIcon } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { stats } from '@/content/stats';

const CARDS = [
  {
    icon: ShieldOff,
    title: 'No account',
    body: 'Your resume and preferences stay in your browser. There\'s no central login to compromise and nothing to deactivate.',
  },
  {
    icon: CreditCard,
    title: 'No card',
    body: 'Nothing to enter, nothing to forget to cancel. Offerlane never asks for billing details at any point in the flow.',
  },
  {
    icon: InfinityIcon,
    title: 'No limits on the basics',
    body: `Finding, tailoring, and tracking are unlimited. Fully automated submissions share a fair-use cap of ${stats.dailyAutoApplyLimit} per day so the system stays reliable for everyone.`,
  },
];

export function FreeNoStrings() {
  return (
    <section className="ol-section bg-wash">
      <div className="ol-container">
        <Reveal>
          <span className="ol-eyebrow">Pricing</span>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="ol-h2 mt-3 max-w-xl text-ink">
            It's free. That's the whole pricing page.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <Reveal key={card.title} delay={i * 80}>
              <div className="ol-card h-full bg-paper">
                <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-wash">
                  <card.icon size={16} strokeWidth={2} />
                </span>
                <h3 className="mt-4 font-display text-lg text-ink">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{card.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={260}>
          <div className="mt-10">
            <a href="/app" className="ol-btn-solid">
              Get started — it's free
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
