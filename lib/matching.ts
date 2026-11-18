import type { JobPosting, Preferences, SeniorityLevel } from './app-db/types';

export type ScoredJob = JobPosting & {
  fitScore: number;
  matchReasons: string[];
  sponsorshipSignal: 'positive' | 'negative' | 'unclear';
};

const SPONSORSHIP_NEGATIVE =
  /(no\s+(visa\s+)?sponsorship|not\s+able\s+to\s+sponsor|unable\s+to\s+sponsor|will\s+not\s+sponsor|does\s+not\s+sponsor)/i;
const SPONSORSHIP_POSITIVE =
  /(visa\s+sponsorship\s+(is\s+)?available|will\s+sponsor|able\s+to\s+sponsor|sponsorship\s+available)/i;

const SENIORITY_PATTERNS: [SeniorityLevel, RegExp][] = [
  [ 'intern', /\bintern(ship)?\b/i ],
  [ 'lead', /\b(lead|principal|director|head of)\b/i ],
  [ 'staff', /\bstaff\b/i ],
  [ 'senior', /\b(senior|sr\.?)\b/i ],
  [ 'junior', /\b(junior|jr\.?|entry[- ]level|new grad(uate)?|associate)\b/i ],
];

// Returns null when the title gives no level signal at all (common for plain
// "Software Engineer"-style titles) — those are left unscored by seniority
// rather than guessed at, since a false penalty is worse than no signal.
export function detectSeniority(title: string): SeniorityLevel | null {
  for (const [level, pattern] of SENIORITY_PATTERNS) {
    if (pattern.test(title)) return level;
  }
  return null;
}

export function scoreJob(job: JobPosting, prefs: Preferences): Omit<ScoredJob, keyof JobPosting> {
  let score = 0;
  const reasons: string[] = [];

  if (prefs.titles.length > 0) {
    const titleMatch = prefs.titles.some((t) => job.title.toLowerCase().includes(t.toLowerCase()));
    if (titleMatch) {
      score += 40;
      reasons.push('Title matches your search');
    }
  } else {
    score += 10;
  }

  if (prefs.remoteOnly) {
    if (job.remote) {
      score += 25;
      reasons.push('Remote');
    } else {
      score -= 20;
    }
  } else if (prefs.locations.length > 0) {
    const locationMatch = prefs.locations.some((l) =>
      job.location.toLowerCase().includes(l.toLowerCase()),
    );
    if (locationMatch || job.remote) {
      score += 25;
      reasons.push(job.remote ? 'Remote' : 'Location matches');
    }
  } else {
    score += 10;
  }

  if (prefs.seniority.length > 0) {
    const detected = detectSeniority(job.title);
    if (detected && prefs.seniority.includes(detected)) {
      score += 20;
      reasons.push('Matches your seniority level');
    } else if (detected) {
      score -= 15;
    }
  }

  let sponsorshipSignal: ScoredJob['sponsorshipSignal'] = 'unclear';
  if (SPONSORSHIP_NEGATIVE.test(job.descriptionText)) {
    sponsorshipSignal = 'negative';
  } else if (SPONSORSHIP_POSITIVE.test(job.descriptionText)) {
    sponsorshipSignal = 'positive';
  }

  if (prefs.visaSponsorshipNeeded) {
    if (sponsorshipSignal === 'negative') {
      score -= 30;
      reasons.push("Posting suggests they won't sponsor");
    } else if (sponsorshipSignal === 'positive') {
      score += 15;
      reasons.push('Posting mentions sponsorship');
    }
  }

  return { fitScore: Math.max(0, Math.min(100, score)), matchReasons: reasons, sponsorshipSignal };
}

export function scoreJobs(jobs: JobPosting[], prefs: Preferences): ScoredJob[] {
  return jobs
    .map((job) => ({ ...job, ...scoreJob(job, prefs) }))
    .sort((a, b) => b.fitScore - a.fitScore);
}
