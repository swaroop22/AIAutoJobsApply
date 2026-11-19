import { Check, Minus } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { comparisonColumns, comparisonRows } from '@/content/comparison';

function Cell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1 text-ink">
        <Check size={14} className="text-accent" /> Yes
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1 text-muted-2">
        <Minus size={14} /> No
      </span>
    );
  }
  return <span>{value}</span>;
}

export function Comparison() {
  return (
    <section className="ol-section">
      <div className="ol-container">
        <Reveal>
          <span className="ol-eyebrow">Comparison</span>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="ol-h2 mt-3 max-w-xl text-ink">
            Autofill saves you typing. RolePilot does the whole job.
          </h2>
        </Reveal>

        <Reveal delay={140}>
          <div className="ol-table-wrap mt-10">
            <table className="ol-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  {comparisonColumns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature}>
                    <td className="font-medium text-ink">{row.feature}</td>
                    <td>
                      <Cell value={row.rolepilot} />
                    </td>
                    <td>
                      <Cell value={row.autofill} />
                    </td>
                    <td>
                      <Cell value={row.cloudAppliers} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
