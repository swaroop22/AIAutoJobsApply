import { LayoutGrid, Search, FileText, Settings, Zap } from 'lucide-react';

const APPLICATIONS = [
  { company: 'Northwind Labs', role: 'Backend Engineer', status: 'Interview' },
  { company: 'Fieldstone Data', role: 'Platform Engineer', status: 'Applied' },
  { company: 'Harbor Systems', role: 'Software Engineer II', status: 'Applied' },
  { company: 'Grayridge', role: 'Infra Engineer', status: 'Rejected' },
  { company: 'Lumenhouse', role: 'Backend Engineer', status: 'Interview' },
] as const;

const STATUS_STYLES: Record<string, string> = {
  Applied: 'bg-[#ECFDF5] text-[#15362B]',
  Interview: 'bg-[#22c55e] text-[#15362B]',
  Rejected: 'bg-[#f1f1ef] text-[#8a8a85]',
};

const NAV_ITEMS = [
  { label: 'Overview', icon: LayoutGrid, active: true },
  { label: 'Job search', icon: Search, active: false },
  { label: 'Applications', icon: FileText, active: false },
  { label: 'Settings', icon: Settings, active: false },
];

export function DashboardMock() {
  return (
    <div
      className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border scale-90 sm:scale-100"
      style={{ borderColor: '#15362B', boxShadow: 'var(--shadow-card)' }}
      role="img"
      aria-label="Mock Offerlane dashboard showing a list of job applications and their statuses"
    >
      <div className="grid grid-cols-[180px_1fr]" style={{ background: '#15362B' }}>
        <div className="flex flex-col gap-1 p-4" style={{ color: '#ECFDF5' }}>
          <span className="mb-4 px-2 font-display text-lg">Offerlane</span>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm"
              style={item.active ? { background: 'rgba(34,197,94,0.18)', color: '#22c55e' } : undefined}
            >
              <item.icon size={14} />
              {item.label}
            </div>
          ))}
        </div>

        <div className="rounded-tl-2xl p-6" style={{ background: '#ECFDF5' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-display text-lg" style={{ color: '#15362B' }}>
              Applications
            </h3>
            <div
              className="flex items-center gap-2 rounded-pill px-3 py-1.5 text-xs font-medium"
              style={{ background: '#15362B', color: '#ECFDF5' }}
            >
              <Zap size={12} />
              Auto Apply: On
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {APPLICATIONS.map((app) => (
              <div
                key={app.company}
                className="flex items-center justify-between rounded-xl bg-white px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: '#15362B' }}>
                    {app.role}
                  </p>
                  <p className="text-xs" style={{ color: '#5c6b63' }}>
                    {app.company}
                  </p>
                </div>
                <span
                  className={`rounded-pill px-3 py-1 text-xs font-medium ${STATUS_STYLES[app.status]}`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
