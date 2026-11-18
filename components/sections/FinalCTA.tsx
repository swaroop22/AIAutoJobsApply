import { Reveal } from '@/components/Reveal';

export function FinalCTA() {
  return (
    <section className="ol-section">
      <div className="ol-container">
        <div className="rounded-3xl bg-ink px-8 py-16 text-center text-paper md:px-16">
          <Reveal>
            <h2 className="ol-h2 mx-auto max-w-xl">
              Stop refreshing job boards. Start getting replies.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-8 flex flex-col items-center gap-3">
              <a href="/app" className="ol-btn-solid bg-paper text-ink hover:bg-accent hover:text-paper">
                Get started — it's free
              </a>
              <p className="text-sm text-paper/60">Free forever. No signup.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
