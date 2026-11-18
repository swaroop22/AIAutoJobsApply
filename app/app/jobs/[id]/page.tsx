'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useJobs } from '@/lib/jobs/use-jobs';
import { getDb, usePreferences } from '@/lib/app-db';
import type { ResumeProfile } from '@/lib/app-db/types';
import { TailorPanel } from '@/components/app/tailor/TailorPanel';
import { AssistedApply } from '@/components/app/tailor/AssistedApply';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { jobs, loading, error } = useJobs();
  const { preferences } = usePreferences();
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const jobId = decodeURIComponent(params.id);
  const job = useMemo(() => jobs.find((j) => j.id === jobId), [jobs, jobId]);

  useEffect(() => {
    if (!job) return;
    let cancelled = false;
    getDb()
      .savedJobs.get(job.id)
      .then((existing) => {
        if (!cancelled) setSaved(Boolean(existing));
      });
    return () => {
      cancelled = true;
    };
  }, [job]);

  useEffect(() => {
    let cancelled = false;
    getDb()
      .profile.get('profile')
      .then((p) => {
        if (!cancelled) setProfile(p ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    if (!job) return;
    const now = new Date().toISOString();
    const db = getDb();
    await db.savedJobs.put({ ...job, savedAt: now });
    await db.applications.put({
      id: job.id,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      status: 'saved',
      notes: '',
      savedAt: now,
      updatedAt: now,
    });
    setSaved(true);
  }

  if (loading) {
    return <div className="app-card text-sm text-ink/50">Loading…</div>;
  }
  if (error) {
    return <div className="app-card text-sm text-red-600">Couldn&apos;t load jobs: {error}</div>;
  }
  if (!job) {
    return (
      <div className="app-card max-w-xl">
        <p className="text-sm text-ink/70">
          That job isn&apos;t in the current feed anymore — it may have been filled, or the feed
          has refreshed since you saved it.
        </p>
        <Link href="/app/jobs" className="app-btn-ghost mt-4">
          Back to job search
        </Link>
      </div>
    );
  }

  return (
    <div className="app-card max-w-2xl">
      <Link href="/app/jobs" className="text-sm text-ink/50 hover:text-ink">
        ← Back to job search
      </Link>
      <h2 className="mt-3 text-xl font-semibold">{job.title}</h2>
      <p className="mt-1 text-sm text-ink/60">
        {job.company} · {job.location || 'Location TBD'}
        {job.remote && ' · Remote'}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          className="app-btn-primary disabled:opacity-50"
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? 'Saved to tracker' : 'Save to tracker'}
        </button>
        <a href={job.applyUrl} target="_blank" rel="noreferrer" className="app-btn-ghost">
          Open application page
        </a>
      </div>

      <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
        {job.descriptionText || 'No description provided.'}
      </div>

      <TailorPanel job={job} />
      {profile && <AssistedApply profile={profile} preferences={preferences} />}
    </div>
  );
}
