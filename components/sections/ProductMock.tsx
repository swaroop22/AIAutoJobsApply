import { Reveal } from '@/components/Reveal';
import { DashboardMock } from '@/components/DashboardMock';

export function ProductMock() {
  return (
    <section className="ol-section bg-wash">
      <div className="ol-container">
        <Reveal>
          <span className="ol-eyebrow">The dashboard</span>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="ol-h2 mt-3 max-w-xl text-ink">
            Everything your job search needs, in one screen.
          </h2>
        </Reveal>
        <Reveal delay={140} className="mt-12">
          <DashboardMock />
        </Reveal>
      </div>
    </section>
  );
}
