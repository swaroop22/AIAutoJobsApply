import { Reveal } from '@/components/Reveal';
import type { Lander } from '@/content/landers';

export function LanderTemplate({ lander }: { lander: Lander }) {
  return (
    <>
      <section className="ol-section pt-32">
        <div className="ol-container max-w-2xl">
          <Reveal>
            <span className="ol-eyebrow">{lander.eyebrow}</span>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="ol-h1 mt-3 text-ink">{lander.h1}</h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-5 text-body">{lander.intro}</p>
          </Reveal>
          <Reveal delay={180}>
            <a href="/app" className="ol-btn-solid mt-8 inline-flex">
              Get started — it's free
            </a>
          </Reveal>
        </div>
      </section>

      <section className="ol-section bg-wash pt-0">
        <div className="ol-container">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {lander.bullets.map((b, i) => (
              <Reveal key={b.title} delay={i * 80}>
                <div className="ol-card h-full bg-paper">
                  <h3 className="font-display text-lg text-ink">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-body">{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ol-section">
        <div className="ol-container max-w-2xl">
          <Reveal>
            <h2 className="ol-h2 text-ink">Questions about this one.</h2>
          </Reveal>
          <div className="mt-8">
            {lander.faq.map((item, i) => (
              <Reveal key={item.question} delay={i * 60}>
                <details className="ol-fold">
                  <summary>
                    {item.question}
                    <span className="ol-fold-icon" aria-hidden="true" />
                  </summary>
                  <p className="ol-fold-body">{item.answer}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
