import { Reveal } from '@/components/Reveal';
import { stats } from '@/content/stats';

const CAPABILITIES = [
  {
    label: 'Find',
    description: `Scans ${stats.careerPagesMonitored} career pages and boards for roles that match your background.`,
  },
  {
    label: 'Tailor',
    description: 'Rewrites your resume per listing using only your real, existing experience.',
  },
  {
    label: 'Apply',
    description: `Submits through ${stats.atsPlatformsSupported}+ real ATS platforms — not a browser autofill hack.`,
  },
  {
    label: 'Track',
    description: 'Detects replies and interview requests and updates your pipeline automatically.',
  },
];

export function Capabilities() {
  return (
    <section className="border-y border-line bg-wash">
      <div className="ol-container grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {CAPABILITIES.map((item, i) => (
          <Reveal key={item.label} delay={i * 80}>
            <div>
              <h3 className="font-display text-2xl text-ink">{item.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{item.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
