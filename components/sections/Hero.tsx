import { MessageCircle } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { stats } from '@/content/stats';

export function Hero() {
  return (
    <section className="ol-section pt-32 md:pt-40">
      <div className="ol-container">
        <Reveal>
          <span className="ol-badge">100% free · No account needed</span>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="ol-h1 mt-6 max-w-3xl text-ink">
            An agent that finds the job, tailors the resume, and hits submit.
            <span className="block text-muted-2">You just show up to the interview.</span>
          </h1>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
          <Reveal delay={140}>
            <p className="max-w-xl text-lg leading-relaxed text-body">
              Offerlane watches {stats.careerPagesMonitored} career pages {stats.monitoringInterval},
              matches new postings against your real background, and submits a tailored
              application through the company's actual applicant system — before most people
              have finished reading the listing.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-wash p-6">
              <a href="/app" className="ol-btn-solid w-full">
                Get started — it's free
              </a>
              <a href="#workflow" className="ol-btn-ghost w-full">
                See how it works
              </a>
              <p className="text-xs text-muted-2">Free forever. No signup. No card.</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={260}>
          <div className="mt-12 flex items-center gap-4 border-t border-line pt-6">
            <span className="text-xs uppercase tracking-[0.08em] text-muted-2">
              Also available on
            </span>
            <a
              href="/messaging"
              aria-label="Offerlane on iMessage"
              className="flex h-9 w-9 items-center justify-center rounded-pill border border-line text-ink/70 hover:text-ink"
            >
              <MessageCircle size={16} />
            </a>
            <a
              href="/messaging"
              aria-label="Offerlane on WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-pill border border-line text-ink/70 hover:text-ink"
            >
              <MessageCircle size={16} />
            </a>
          </div>
        </Reveal>
      </div>

      {/* sentinel used by the sticky header to detect when the hero has scrolled past */}
      <div id="hero-sentinel" aria-hidden="true" />
    </section>
  );
}
