'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Bookmark, Sparkles, Building2, MapPin, Check, CheckCircle2 } from 'lucide-react';
import { useJobs } from '@/lib/jobs/use-jobs';
import { getDb, usePreferences } from '@/lib/app-db';
import type { ResumeProfile, JobPosting } from '@/lib/app-db/types';
import { TailorPanel } from '@/components/app/tailor/TailorPanel';
import { AssistedApply } from '@/components/app/tailor/AssistedApply';
import { AutoApplyModal } from '@/components/app/tailor/AutoApplyModal';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { jobs, loading, error } = useJobs();
  const { preferences } = usePreferences();
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isInAppApplyOpen, setIsInAppApplyOpen] = useState(false);
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [customJob, setCustomJob] = useState<JobPosting | null>(null);
  const jobId = decodeURIComponent(params.id);
  const foundJob = useMemo(() => jobs.find((j) => j.id === jobId), [jobs, jobId]);
  const job = foundJob ?? customJob;

  useEffect(() => {
    let cancelled = false;
    if (!foundJob && jobId) {
      getDb()
        .savedJobs.get(jobId)
        .then((item) => {
          if (!cancelled && item) setCustomJob(item);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [foundJob, jobId]);

  useEffect(() => {
    if (!job) return;
    let cancelled = false;
    getDb()
      .savedJobs.get(job.id)
      .then((existing) => {
        if (!cancelled) setSaved(Boolean(existing));
      });
    getDb()
      .applications.get(job.id)
      .then((app) => {
        if (!cancelled && app?.status === 'applied') setApplied(true);
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('apply') === 'true' || window.location.hash === '#apply') {
        setIsInAppApplyOpen(true);
      }
    }
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
      <div className="app-card max-w-2xl">
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
    <div className="app-card max-w-3xl">
      <Link href="/app/jobs" className="text-sm text-ink/50 hover:text-ink font-semibold">
        ← Back to job search
      </Link>
      <h2 className="mt-3 text-2xl font-extrabold text-ink">{job.title}</h2>
      <p className="mt-1 text-sm text-ink/65 font-medium">
        {job.company} · {job.location || 'Location TBD'}
        {job.remote && ' · Remote'}
      </p>

      {/* Top Action Bar */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {applied ? (
          <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm cursor-default">
            <CheckCircle2 size={17} />
            <span>Applied with RolePilot</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setIsInAppApplyOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-ink/85 transition-colors cursor-pointer"
          >
            <Sparkles size={16} className="text-amber-300" />
            <span>Apply now</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm font-semibold text-ink/75 hover:bg-black/5 transition-colors cursor-pointer"
        >
          <Bookmark size={15} className={saved ? 'fill-accent text-accent' : ''} />
          <span>{saved ? 'Saved in Tracker' : 'Save to Tracker'}</span>
        </button>

        <a
          href="#tailor-section"
          className="inline-flex items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm font-semibold text-ink/75 hover:bg-black/5 transition-colors"
        >
          <Sparkles size={15} className="text-amber-500" />
          <span>Tailor Résumé</span>
        </a>

        {job.applyUrl && (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-ink/40 hover:text-ink transition-colors ml-auto underline"
          >
            <span>External ATS Link</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Auto-Apply Modal */}
      {isInAppApplyOpen && (
        <AutoApplyModal
          job={job}
          profile={profile}
          preferences={preferences}
          onClose={() => setIsInAppApplyOpen(false)}
          onComplete={() => {
            setApplied(true);
            setSaved(true);
          }}
        />
      )}

      {/* Autonomous Apply Banner */}
      <div className="mt-5 rounded-2xl bg-black/[0.03] border border-black/10 p-4 text-xs text-ink/80 flex items-start gap-3">
        <Sparkles size={17} className="text-accent shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-ink">Autonomous In-App Application Active</p>
          <p className="mt-1 text-ink/70 leading-relaxed">
            RolePilot tailors your résumé using Gemini AI, packages your verified credentials and work authorization, and submits your application directly without requiring you to manually fill third-party forms.
          </p>
        </div>
      </div>

      {/* Tailoring Section */}
      <div id="tailor-section" className="mt-8 border-t border-ink/10 pt-6">
        <TailorPanel job={job} />
      </div>

      {profile && <AssistedApply profile={profile} preferences={preferences} />}

      {/* Job Description */}
      <div className="mt-8 border-t border-ink/10 pt-6">
        <h3 className="text-base font-bold text-ink mb-3">Job Description &amp; Details</h3>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
          {job.descriptionText || 'No description provided.'}
        </div>
      </div>
    </div>
  );
}
