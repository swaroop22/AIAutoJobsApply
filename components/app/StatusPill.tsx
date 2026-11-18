import type { ApplicationStatus } from '@/lib/app-db/types';

export const STATUS_STYLE: Record<ApplicationStatus, { label: string; dot: string; text: string }> = {
  saved: { label: 'Saved', dot: 'bg-ink/40', text: 'text-ink/60' },
  applied: { label: 'Applied', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  interview: { label: 'Interview', dot: 'bg-sky-500', text: 'text-sky-700' },
  offer: { label: 'Offer', dot: 'bg-amber-500', text: 'text-amber-700' },
  rejected: { label: 'Rejected', dot: 'bg-rose-500', text: 'text-rose-700' },
};

export function StatusPill({ status }: { status: ApplicationStatus }) {
  const style = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {style.label}
    </span>
  );
}
