'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb, usePreferences } from '@/lib/app-db';
import { useJobs } from '@/lib/jobs/use-jobs';
import { scoreJobs } from '@/lib/matching';
import type { ApplicationStatus } from '@/lib/app-db/types';
import { MatchRing } from '@/components/app/MatchRing';
import { StatusPill } from '@/components/app/StatusPill';

type LoadState = 'loading' | 'needs-onboarding' | 'ready';

const CARD_TINTS = ['bg-amber-50', 'bg-emerald-50', 'bg-violet-50', 'bg-rose-50'];

const FILTERS: { key: 'all' | ApplicationStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'saved', label: 'Saved' },
  { key: 'applied', label: 'Applied' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'rejected', label: 'Rejected' },
];

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function AppOverviewPage() {
  const [state, setState] = useState<LoadState>('loading');
  const [filter, setFilter] = useState<'all' | ApplicationStatus>('all');

  const { preferences } = usePreferences();
  const { jobs } = useJobs();
  const entries = useLiveQuery(() => getDb().applications.toArray(), []);

  useEffect(() => {
    let cancelled = false;
    getDb()
      .profile.get('profile')
      .then((found) => {
        if (cancelled) return;
        setState(found ? 'ready' : 'needs-onboarding');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const topMatches = useMemo(() => {
    if (!preferences || jobs.length === 0) return [];
    return scoreJobs(jobs, preferences).slice(0, 4);
  }, [jobs, preferences]);

  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    const sorted = [...entries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    if (filter === 'all') return sorted;
    return sorted.filter((e) => e.status === filter);
  }, [entries, filter]);

  if (state === 'loading') {
    return <div className="app-card animate-pulse text-sm text-ink/50">Loading your data…</div>;
  }

  if (state === 'needs-onboarding') {
    return (
      <div className="app-card max-w-xl">
        <p className="app-eyebrow">Get started</p>
        <h2 className="mt-2 text-xl font-semibold">Upload your résumé to begin</h2>
        <p className="mt-2 text-sm text-ink/70">
          We parse it in your browser, ask a few questions about what you're looking for, and
          save everything locally — nothing leaves your device except the specific job you
          choose to tailor for.
        </p>
        <Link href="/app/onboarding" className="app-btn-primary mt-5">
          Start onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Top job matches</h2>
          <Link href="/app/jobs" className="text-sm font-medium text-ink/50 hover:text-ink">
            Browse jobs ›
          </Link>
        </div>

        {topMatches.length === 0 ? (
          <div className="app-card mt-4 text-sm text-ink/60">
            {preferences
              ? 'No scored matches yet — check back once the feed refreshes.'
              : 'Set your preferences in onboarding to see fit scores here.'}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topMatches.map((job, i) => (
              <div key={job.id} className={`flex flex-col justify-between rounded-2xl p-4 ${CARD_TINTS[i % CARD_TINTS.length]}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-ink/60">{job.company}</p>
                    <h3 className="mt-1 text-sm font-semibold leading-snug">{job.title}</h3>
                  </div>
                  <MatchRing percent={job.fitScore} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-ink/50">{job.location || 'Location TBD'}</span>
                  <Link
                    href={`/app/jobs/${encodeURIComponent(job.id)}`}
                    className="app-btn-primary shrink-0 !px-4 !py-1.5 !text-xs"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">All applications</h2>
          <Link href="/app/tracker" className="app-btn-ghost !px-4 !py-1.5 !text-xs">
            Open tracker
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className="app-filter-pill"
              data-active={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="app-card mt-4 !p-0 overflow-x-auto">
          {!entries || filteredEntries.length === 0 ? (
            <p className="p-6 text-sm text-ink/60">
              {entries && entries.length > 0
                ? 'Nothing in this filter yet.'
                : 'Save a role from job search to start tracking it here.'}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Saved</th>
                  <th className="px-4 py-3">Applied</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.slice(0, 8).map((entry) => (
                  <tr key={entry.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/app/jobs/${encodeURIComponent(entry.jobId)}`}
                        className="font-medium hover:underline"
                      >
                        {entry.jobTitle}
                      </Link>
                      <p className="text-xs text-ink/50">{entry.company}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={entry.status} />
                    </td>
                    <td className="px-4 py-3 text-ink/50">{formatDate(entry.savedAt)}</td>
                    <td className="px-4 py-3 text-ink/50">{formatDate(entry.appliedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
