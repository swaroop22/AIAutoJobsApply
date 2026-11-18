'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useJobs } from '@/lib/jobs/use-jobs';
import { usePreferences } from '@/lib/app-db';
import { scoreJobs, type ScoredJob } from '@/lib/matching';
import type { JobPosting } from '@/lib/app-db/types';
import { useAppSearch } from '@/components/app/search-context';
import { MatchRing } from '@/components/app/MatchRing';

const CARD_TINTS = ['bg-amber-50', 'bg-emerald-50', 'bg-violet-50', 'bg-rose-50', 'bg-sky-50'];

export default function JobsPage() {
  const { jobs, loading, error } = useJobs();
  const { preferences, loaded } = usePreferences();
  const { query } = useAppSearch();

  const scored: ScoredJob[] = useMemo(() => {
    if (!preferences) {
      return jobs.map((job: JobPosting) => ({
        ...job,
        fitScore: 0,
        matchReasons: [],
        sponsorshipSignal: 'unclear' as const,
      }));
    }
    return scoreJobs(jobs, preferences);
  }, [jobs, preferences]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return scored;
    return scored.filter(
      (job) => job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q),
    );
  }, [scored, query]);

  if (loading || !loaded) {
    return <div className="app-card animate-pulse text-sm text-ink/50">Loading open roles…</div>;
  }

  if (error) {
    return <div className="app-card text-sm text-red-600">Couldn&apos;t load jobs: {error}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink/50">
        {filtered.length} open role{filtered.length === 1 ? '' : 's'}
        {!preferences && ' — set preferences in onboarding to see fit scores'}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((job, i) => (
          <div key={job.id} className={`flex flex-col justify-between rounded-2xl p-4 ${CARD_TINTS[i % CARD_TINTS.length]}`}>
            <Link href={`/app/jobs/${encodeURIComponent(job.id)}`} className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-ink/60">{job.company}</p>
                <h3 className="mt-1 font-semibold leading-snug">{job.title}</h3>
                <p className="mt-1 text-sm text-ink/60">
                  {job.location || 'Location TBD'}
                  {job.remote && ' · Remote'}
                </p>
              </div>
              {preferences && <MatchRing percent={job.fitScore} />}
            </Link>
            {job.matchReasons.length > 0 && (
              <p className="mt-3 text-xs text-ink/50">{job.matchReasons.join(' · ')}</p>
            )}
            <div className="mt-4 flex justify-end">
              <Link
                href={`/app/jobs/${encodeURIComponent(job.id)}`}
                className="app-btn-primary !px-4 !py-1.5 !text-xs"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="app-card text-sm text-ink/60">No roles match that filter right now.</div>
      )}
    </div>
  );
}
