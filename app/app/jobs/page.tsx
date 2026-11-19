'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search as SearchIcon,
  Plus,
  Bookmark,
  FileText,
  Check,
  X,
  Sparkles,
  ExternalLink,
  RotateCcw,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronDown,
  Building2,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useJobs } from '@/lib/jobs/use-jobs';
import { getDb, usePreferences } from '@/lib/app-db';
import { scoreJobs, type ScoredJob } from '@/lib/matching';
import type { JobPosting, SavedJob, ResumeProfile, ApplicationEntry, Preferences } from '@/lib/app-db/types';
import { useAppSearch } from '@/components/app/search-context';
import { MatchRing } from '@/components/app/MatchRing';
import { AutoApplyModal } from '@/components/app/tailor/AutoApplyModal';

// Tsenta pastel card colors
const CARD_PALETTE = [
  {
    bg: 'bg-[#dff3e6]',
    border: 'border-[#c5ecd0]',
    badgeBg: 'bg-[#bdf0d0]',
    badgeText: 'text-[#0d6e3c]',
    accentColor: '#0d6e3c',
  },
  {
    bg: 'bg-[#fae6e4]',
    border: 'border-[#f6d0cd]',
    badgeBg: 'bg-[#f8d0cc]',
    badgeText: 'text-[#9c2b23]',
    accentColor: '#9c2b23',
  },
  {
    bg: 'bg-[#fef4d2]',
    border: 'border-[#fde69e]',
    badgeBg: 'bg-[#fde79e]',
    badgeText: 'text-[#855306]',
    accentColor: '#855306',
  },
  {
    bg: 'bg-[#eee8fc]',
    border: 'border-[#dfd3f8]',
    badgeBg: 'bg-[#ded1f7]',
    badgeText: 'text-[#582fa6]',
    accentColor: '#582fa6',
  },
  {
    bg: 'bg-[#e0f2fe]',
    border: 'border-[#b9e6fe]',
    badgeBg: 'bg-[#bae6fd]',
    badgeText: 'text-[#0369a1]',
    accentColor: '#0369a1',
  },
];

const HEALTHCARE_REGEX =
  /coder|coding|him|billing|revenue|documentation|health|hospital|clinical|cdi|cpc|ccs|rhia|rhit|inpatient|outpatient|medical records/i;

export default function JobsPage() {
  const router = useRouter();
  const { jobs, loading, error } = useJobs();
  const { preferences, loaded } = usePreferences();
  const { query, setQuery } = useAppSearch();

  // Active top nav tab: 'jobs' | 'people' | 'for_you'
  const [navTab, setNavTab] = useState<'jobs' | 'people' | 'for_you'>('jobs');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter states
  const [workplaceFilter, setWorkplaceFilter] = useState<'all' | 'remote' | 'onsite'>('all');
  const [minMatch, setMinMatch] = useState<number>(0);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [visaFilter, setVisaFilter] = useState<boolean>(false);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Auto-Apply modal state
  const [activeApplyJob, setActiveApplyJob] = useState<JobPosting | null>(null);
  const [isBatchApplyOpen, setIsBatchApplyOpen] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState<ResumeProfile | null>(null);

  // Add custom job form state
  const [customTitle, setCustomTitle] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [customLocation, setCustomLocation] = useState('Remote');
  const [customRemote, setCustomRemote] = useState(true);
  const [customUrl, setCustomUrl] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [isSavingCustom, setIsSavingCustom] = useState(false);

  // Live queries from Dexie
  const savedJobsMap = useLiveQuery(async () => {
    try {
      const allSaved = await getDb().savedJobs.toArray();
      const map = new Map<string, SavedJob>();
      allSaved.forEach((s) => map.set(s.id, s));
      return map;
    } catch {
      return new Map<string, SavedJob>();
    }
  }, []);

  const appliedJobsMap = useLiveQuery(async () => {
    try {
      const all = await getDb().applications.toArray();
      const map = new Map<string, ApplicationEntry>();
      all
        .filter((a) => a.status === 'applied')
        .forEach((a) => map.set(a.jobId || a.id, a));
      return map;
    } catch {
      return new Map<string, ApplicationEntry>();
    }
  }, []);

  // Load candidate profile from Dexie on mount
  useEffect(() => {
    let cancelled = false;
    getDb()
      .profile.get('profile')
      .then((p) => {
        if (!cancelled && p) setCandidateProfile(p);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load hidden IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rolepilot_hidden_jobs');
      if (stored) setHiddenIds(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  function handlePassJob(jobId: string) {
    const updated = [...hiddenIds, jobId];
    setHiddenIds(updated);
    try {
      localStorage.setItem('rolepilot_hidden_jobs', JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  async function handleToggleSave(job: ScoredJob) {
    const db = getDb();
    const isCurrentlySaved = savedJobsMap?.has(job.id);
    const now = new Date().toISOString();

    if (isCurrentlySaved) {
      await db.savedJobs.delete(job.id);
      await db.applications.delete(job.id);
    } else {
      await db.savedJobs.put({
        ...job,
        savedAt: now,
        fitScore: job.fitScore,
        sponsorshipSignal: job.sponsorshipSignal,
      });
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
    }
  }

  async function handleCreateCustomJob(e: React.FormEvent) {
    e.preventDefault();
    if (!customTitle.trim() || !customCompany.trim()) return;
    setIsSavingCustom(true);

    try {
      const newId = `custom-${Date.now()}`;
      const now = new Date().toISOString();
      const newJob: SavedJob = {
        id: newId,
        provider: 'custom',
        boardSlug: 'custom',
        externalId: newId,
        title: customTitle.trim(),
        company: customCompany.trim(),
        location: customLocation.trim() || (customRemote ? 'Remote' : 'Location TBD'),
        remote: customRemote,
        descriptionHtml: `<p>${customDescription.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`,
        descriptionText: customDescription.trim() || `${customTitle} at ${customCompany}`,
        applyUrl: customUrl.trim() || '#',
        postedAt: now,
        savedAt: now,
      };

      const db = getDb();
      await db.savedJobs.put(newJob);
      await db.applications.put({
        id: newId,
        jobId: newId,
        jobTitle: newJob.title,
        company: newJob.company,
        status: 'saved',
        notes: 'Custom added job from hospital portal',
        savedAt: now,
        updatedAt: now,
      });

      setIsAddModalOpen(false);
      setCustomTitle('');
      setCustomCompany('');
      setCustomUrl('');
      setCustomDescription('');

      router.push(`/app/jobs/${encodeURIComponent(newId)}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingCustom(false);
    }
  }

  // Score jobs against preferences (or default healthcare coding profile)
  const scored: ScoredJob[] = useMemo(() => {
    const activePrefs: Preferences =
      preferences && preferences.titles.length > 0
        ? preferences
        : {
            id: 'preferences',
            titles: ['Medical Coder', 'Coding Specialist', 'HIM Coder', 'Inpatient Coder', 'Outpatient Coder'],
            locations: ['Remote'],
            remoteOnly: false,
            seniority: ['mid', 'senior'],
            visaSponsorshipNeeded: false,
            workAuthorized: true,
            requiresNowOrFuture: 'now',
            updatedAt: new Date().toISOString(),
          };
    return scoreJobs(jobs, activePrefs);
  }, [jobs, preferences]);

  // Combined filtering
  const filtered = useMemo(() => {
    const hiddenSet = new Set(hiddenIds);
    const q = query.trim().toLowerCase();

    return scored.filter((job) => {
      // Exclude passed jobs
      if (hiddenSet.has(job.id)) return false;

      // Tab filter
      if (navTab === 'for_you' && job.fitScore < 70) return false;

      // Query filter
      if (q) {
        const matchesQuery =
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q) ||
          job.descriptionText.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Workplace filter
      if (workplaceFilter === 'remote' && !job.remote) return false;
      if (workplaceFilter === 'onsite' && job.remote) return false;

      // Min match filter
      if (minMatch > 0 && job.fitScore < minMatch) return false;

      // Visa filter
      if (visaFilter && job.sponsorshipSignal === 'negative') return false;

      return true;
    });
  }, [scored, query, workplaceFilter, minMatch, visaFilter, hiddenIds, navTab]);

  // Format relative time (e.g. "17 hours ago", "18 hours ago")
  function formatRelativeTime(postedAt?: string) {
    if (!postedAt) return '17 hours ago';
    const diffHours = Math.round((Date.now() - new Date(postedAt).getTime()) / (1000 * 60 * 60));
    if (diffHours <= 0 || isNaN(diffHours)) return 'Today';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const days = Math.round(diffHours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  // Generate stylized avatar icon for company
  function getCompanyInitial(company: string) {
    if (/alaska/i.test(company)) return '❄️';
    if (/stormont/i.test(company)) return '🔷';
    if (/lejeune/i.test(company)) return '⚓';
    if (/augusta/i.test(company)) return '🏥';
    if (/cleveland/i.test(company)) return '⚕️';
    if (/mayo/i.test(company)) return '🛡️';
    if (/baylor/i.test(company)) return '⭐';
    return company.charAt(0);
  }

  if (loading || !loaded) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-14 animate-pulse rounded-2xl bg-black/[0.04]" />
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-56 animate-pulse rounded-2xl bg-black/[0.03]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="app-card text-sm text-red-600">Couldn&apos;t load jobs: {error}</div>;
  }

  return (
    <div className="flex flex-col gap-4 pb-12">
      {/* 1. Tsenta Header: Navigation Tabs Bar */}
      <div className="flex items-center justify-between border-b border-black/[0.06] pb-3 pt-1">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setNavTab('jobs')}
            className={`text-2xl font-extrabold tracking-tight transition-colors ${
              navTab === 'jobs' ? 'text-black' : 'text-black/40 hover:text-black/70'
            }`}
          >
            Jobs
          </button>
          <button
            onClick={() => setNavTab('people')}
            className={`text-2xl font-extrabold tracking-tight transition-colors ${
              navTab === 'people' ? 'text-black' : 'text-black/30 hover:text-black/60'
            }`}
          >
            People
          </button>
          <button
            onClick={() => setNavTab('for_you')}
            className={`flex items-center gap-2 text-2xl font-extrabold tracking-tight transition-colors ${
              navTab === 'for_you' ? 'text-black' : 'text-black/30 hover:text-black/60'
            }`}
          >
            <span>For you</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
              1
            </span>
          </button>
        </div>

        {/* User initials / settings */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1b3d32] text-xs font-bold text-white">
            {candidateProfile?.fullName
              ? candidateProfile.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : 'SK'}
          </div>
        </div>
      </div>

      {/* 2. Big Search Bar + Add Your Own Job */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or keyword, or paste a job link"
            className="w-full rounded-2xl border border-black/15 bg-white py-3.5 pl-5 pr-10 text-sm text-black placeholder:text-black/40 shadow-xs outline-none transition focus:border-black/40 focus:ring-1 focus:ring-black/10"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-black/40 hover:text-black"
              title="Clear search"
            >
              <X size={16} />
            </button>
          ) : (
            <SearchIcon
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/30"
              aria-hidden="true"
            />
          )}
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/15 bg-white px-5 py-3.5 text-sm font-semibold text-black shadow-xs transition hover:bg-black/5 shrink-0"
        >
          <Plus size={16} />
          <span>Add your own job</span>
        </button>
      </div>

      {/* 3. Filter Pills Row (Exact replica of Tsenta filters) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
        {/* Date Filter */}
        <button
          onClick={() => setDateFilter(dateFilter === '24h' ? 'all' : '24h')}
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 border transition ${
            dateFilter === '24h'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black/85 border-black/15 hover:bg-black/5'
          }`}
        >
          <span>Date · 24h</span>
          <ChevronDown size={13} className="opacity-60" />
        </button>

        {/* Show jobs without Auto Apply */}
        <button
          onClick={() => {}}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 border border-black/15 bg-white text-black/80 hover:bg-black/5 transition"
        >
          <span>Show jobs without Auto Apply</span>
        </button>

        {/* Location */}
        <button
          onClick={() => {}}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 border border-black/15 bg-white text-black/80 hover:bg-black/5 transition"
        >
          <span>Location</span>
          <ChevronDown size={13} className="opacity-60" />
        </button>

        {/* Workplace */}
        <button
          onClick={() => setWorkplaceFilter(workplaceFilter === 'remote' ? 'all' : 'remote')}
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 border transition ${
            workplaceFilter === 'remote'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black/85 border-black/15 hover:bg-black/5'
          }`}
        >
          <span>Workplace {workplaceFilter === 'remote' ? '(Remote)' : ''}</span>
          <ChevronDown size={13} className="opacity-60" />
        </button>

        {/* Companies */}
        <button
          onClick={() => {}}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 border border-black/15 bg-white text-black/80 hover:bg-black/5 transition"
        >
          <span>Companies</span>
          <ChevronDown size={13} className="opacity-60" />
        </button>

        {/* Degree level */}
        <button
          onClick={() => {}}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 border border-black/15 bg-white text-black/80 hover:bg-black/5 transition"
        >
          <span>Degree level</span>
          <ChevronDown size={13} className="opacity-60" />
        </button>

        {/* Max experience */}
        <button
          onClick={() => {}}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 border border-black/15 bg-white text-black/80 hover:bg-black/5 transition"
        >
          <span>Max experience</span>
          <ChevronDown size={13} className="opacity-60" />
        </button>

        {/* Needs visa sponsorship */}
        <button
          onClick={() => setVisaFilter(!visaFilter)}
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 border transition ${
            visaFilter
              ? 'bg-black text-white border-black'
              : 'bg-white text-black/80 border-black/15 hover:bg-black/5'
          }`}
        >
          <span>Needs visa sponsorship</span>
        </button>

        {/* No clearance jobs */}
        <button
          onClick={() => {}}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 border border-black/15 bg-white text-black/80 hover:bg-black/5 transition"
        >
          <span>No clearance jobs</span>
        </button>

        {/* Role */}
        <button
          onClick={() => {}}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 border border-black/15 bg-white text-black/80 hover:bg-black/5 transition"
        >
          <span>Role</span>
          <ChevronDown size={13} className="opacity-60" />
        </button>

        {/* Pay */}
        <button
          onClick={() => {}}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 border border-black/15 bg-white text-black/80 hover:bg-black/5 transition"
        >
          <span>Pay</span>
          <ChevronDown size={13} className="opacity-60" />
        </button>
      </div>

      {/* 4. Action Row: Clear filters / Use my search / Ask to tune / Apply to top 5 */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-4 text-xs font-bold text-black">
          <button
            onClick={() => {
              setQuery('');
              setWorkplaceFilter('all');
              setDateFilter('all');
              setVisaFilter(false);
              setMinMatch(0);
            }}
            className="hover:underline text-black/80"
          >
            Clear filters
          </button>
          <button
            onClick={() => setQuery('Coding')}
            className="text-black/55 hover:text-black font-semibold"
          >
            Use my search
          </button>
          <button
            onClick={() => router.push('/app/settings')}
            className="inline-flex items-center gap-1 text-black font-bold hover:underline"
          >
            <span>Ask RolePilot to tune this</span>
            <span>&rarr;</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid / List View Toggle */}
          <div className="hidden sm:flex items-center rounded-xl border border-black/10 bg-white p-1 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-black/10 text-black' : 'text-black/40 hover:text-black'}`}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-black/10 text-black' : 'text-black/40 hover:text-black'}`}
              title="List view"
            >
              <List size={15} />
            </button>
          </div>

          {/* Tsenta's signature Apply to the top 5 button */}
          <button
            onClick={() => setIsBatchApplyOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-black/85 transition cursor-pointer"
          >
            <Sparkles size={13} className="text-amber-300" />
            <span>Apply to the top 5</span>
          </button>
        </div>
      </div>

      {/* 5. Tsenta Pastel Job Cards Grid */}
      <div className={`grid gap-4 mt-2 ${viewMode === 'grid' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {filtered.map((job, idx) => {
          const isSaved = savedJobsMap?.has(job.id);
          const isApplied = appliedJobsMap?.has(job.id);
          const palette = CARD_PALETTE[idx % CARD_PALETTE.length];

          return (
            <div
              key={job.id}
              className="flex flex-col justify-between rounded-3xl bg-white border border-black/[0.08] p-3 shadow-xs hover:shadow-md transition-all duration-200"
            >
              {/* Upper Colored Container */}
              <div
                className={`relative flex flex-col justify-between rounded-2xl p-5 ${palette.bg} border ${palette.border}`}
              >
                <div>
                  {/* Top Row: Location/Remote badge + Time ago + Circular Match Ring */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {job.remote ? (
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-extrabold ${palette.badgeBg} ${palette.badgeText}`}
                        >
                          Remote
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-black/80">
                          {job.location || 'Topeka, KS'}
                        </span>
                      )}
                      <span className="text-xs text-black/45 font-medium">
                        {formatRelativeTime(job.postedAt)}
                      </span>
                    </div>

                    {/* Circular Match Ring */}
                    <MatchRing percent={job.fitScore} />
                  </div>

                  {/* Job Title */}
                  <Link
                    href={`/app/jobs/${encodeURIComponent(job.id)}`}
                    className="mt-3 block group"
                  >
                    <h3 className="text-lg sm:text-xl font-extrabold leading-snug text-black group-hover:text-black/70 transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                  </Link>
                </div>

                {/* Bottom Row inside colored box: Save | Details */}
                <div className="mt-6 pt-3 border-t border-black/[0.06] flex items-center justify-start gap-6 text-xs font-semibold text-black/70">
                  <button
                    onClick={() => handleToggleSave(job)}
                    className="inline-flex items-center gap-1.5 hover:text-black transition"
                  >
                    <Bookmark
                      size={15}
                      className={isSaved ? 'fill-black text-black' : 'text-black/60'}
                    />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  <Link
                    href={`/app/jobs/${encodeURIComponent(job.id)}`}
                    className="inline-flex items-center gap-1.5 hover:text-black transition"
                  >
                    <FileText size={15} className="text-black/60" />
                    <span>Details</span>
                  </Link>

                  {job.applyUrl && job.applyUrl !== '#' && (
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-[11px] text-black/40 hover:text-black transition"
                    >
                      <span>Portal</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>

              {/* Lower Section: Company info on Left, Pass + Apply now button on Right */}
              <div className="mt-3 px-3 py-2 flex items-center justify-between gap-3">
                {/* Company Logo + Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-black/10 font-bold text-sm shadow-2xs">
                    {getCompanyInitial(job.company)}
                  </div>
                  <span className="text-sm font-bold text-black truncate leading-tight">
                    {job.company}
                  </span>
                </div>

                {/* Actions: Pass + Apply now */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handlePassJob(job.id)}
                    className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-bold text-black/75 hover:bg-black/5 hover:text-black transition cursor-pointer"
                  >
                    Pass
                  </button>

                  {isApplied ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs cursor-default">
                      <Check size={14} className="stroke-[3]" />
                      <span>Applied</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveApplyJob(job)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-black px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-black/85 transition cursor-pointer"
                    >
                      <span>Apply now</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="app-card text-center py-12">
          <p className="text-base font-semibold text-black">No roles match the selected filters</p>
          <p className="mt-1 text-sm text-black/60">
            Try clearing filters or search terms.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => {
                setQuery('');
                setWorkplaceFilter('all');
                setDateFilter('all');
              }}
              className="app-btn-ghost text-xs"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="app-btn-primary text-xs"
            >
              + Add your own job
            </button>
          </div>
        </div>
      )}

      {/* Single Auto-Apply Modal */}
      {activeApplyJob && (
        <AutoApplyModal
          job={activeApplyJob}
          profile={candidateProfile}
          preferences={preferences}
          onClose={() => setActiveApplyJob(null)}
          onComplete={() => {
            // modal handles Dexie record, reactive query will update button to Applied
          }}
        />
      )}

      {/* Batch Auto-Apply Modal for Top 5 */}
      {isBatchApplyOpen && (
        <AutoApplyModal
          batchJobs={filtered.slice(0, 5)}
          profile={candidateProfile}
          preferences={preferences}
          onClose={() => setIsBatchApplyOpen(false)}
          onComplete={() => {
            // completed batch
          }}
        />
      )}

      {/* Add Custom Job Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-black/10">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full text-black/40 hover:text-black hover:bg-black/5"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white font-bold text-xs">
                +
              </span>
              <div>
                <h3 className="text-lg font-bold text-black">Add Your Own Job</h3>
                <p className="text-xs text-black/60">
                  Paste a link or role from any hospital portal (Taleo, iCIMS, Infor)
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateCustomJob} className="mt-5 flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-bold text-black/80 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Inpatient Coding Specialist II"
                  className="w-full rounded-xl border border-black/15 px-3.5 py-2.5 text-sm text-black outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black/80 mb-1">Company / Hospital Network *</label>
                <input
                  type="text"
                  required
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  placeholder="e.g. Memorial Sloan Kettering Cancer Center"
                  className="w-full rounded-xl border border-black/15 px-3.5 py-2.5 text-sm text-black outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">Location</label>
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="e.g. Remote or City, ST"
                    className="w-full rounded-xl border border-black/15 px-3.5 py-2.5 text-sm text-black outline-none focus:border-black"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-black/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customRemote}
                      onChange={(e) => setCustomRemote(e.target.checked)}
                      className="rounded border-black/30 text-black focus:ring-black"
                    />
                    <span>100% Remote Role</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black/80 mb-1">Job Link (Optional)</label>
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-black/15 px-3.5 py-2.5 text-sm text-black outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black/80 mb-1">Description / Requirements</label>
                <textarea
                  rows={3}
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Paste job description or requirements here..."
                  className="w-full rounded-xl border border-black/15 px-3.5 py-2 text-sm text-black outline-none focus:border-black"
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-bold text-black/60 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCustom}
                  className="rounded-full bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-black/85 disabled:opacity-50"
                >
                  {isSavingCustom ? 'Adding…' : 'Add & Tailor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
