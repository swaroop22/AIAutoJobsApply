import { Globe, Apple, Smartphone, MessageCircle, Puzzle, TerminalSquare } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { platforms } from '@/content/platforms';

const ICONS = {
  globe: Globe,
  apple: Apple,
  smartphone: Smartphone,
  'message-circle': MessageCircle,
  puzzle: Puzzle,
  'terminal-square': TerminalSquare,
};

export function Platforms() {
  return (
    <section id="platforms" className="ol-section bg-wash">
      <div className="ol-container">
        <Reveal>
          <span className="ol-eyebrow">Platforms</span>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="ol-h2 mt-3 max-w-xl text-ink">Same agent, wherever you work.</h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform, i) => {
            const Icon = ICONS[platform.icon];
            return (
              <Reveal key={platform.id} delay={i * 60}>
                <a
                  href={platform.href}
                  className="ol-card relative flex h-full flex-col gap-4 bg-paper transition-colors hover:border-ink"
                >
                  {platform.comingSoon && (
                    <span className="absolute right-4 top-4 rounded-pill border border-line bg-wash px-2.5 py-1 text-[11px] font-medium text-muted-2">
                      Coming soon
                    </span>
                  )}
                  <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-wash">
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg text-ink">{platform.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-body">{platform.description}</p>
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
