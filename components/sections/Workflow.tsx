import { Reveal } from '@/components/Reveal';
import { TerminalFeed } from '@/components/TerminalFeed';
import { workflowStages } from '@/content/workflow';
import { cx } from '@/lib/utils';

export function Workflow() {
  return (
    <section id="workflow" className="ol-section">
      <div className="ol-container">
        <Reveal>
          <span className="ol-eyebrow">The pipeline</span>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="ol-h2 mt-3 max-w-2xl text-ink">
            Four stages, one agent, zero manual applications.
          </h2>
        </Reveal>

        <div className="mt-16 flex flex-col gap-20">
          {workflowStages.map((stage, i) => {
            const reversed = i % 2 === 1;
            return (
              <div
                key={stage.index}
                className={cx(
                  'grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16',
                  reversed && 'lg:[&>*:first-child]:order-2'
                )}
              >
                <Reveal>
                  <div>
                    <span className="ol-eyebrow">
                      {stage.index} · {stage.label}
                    </span>
                    <h3 className="mt-3 font-display text-2xl text-ink md:text-3xl">
                      {stage.title}
                    </h3>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-body">
                      {stage.description}
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <TerminalFeed lines={stage.terminalLines} summary={stage.srSummary} />
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
