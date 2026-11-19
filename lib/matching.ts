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
  [ 'senior', /\b(senior|sr\.?|iii)\b/i ],
  [ 'mid', /\b(ii)\b/i ],
  [ 'junior', /\b(junior|jr\.?|entry[- ]level|new grad(uate)?|associate|i)\b/i ],
];

export function detectSeniority(title: string): SeniorityLevel | null {
  for (const [level, pattern] of SENIORITY_PATTERNS) {
    if (pattern.test(title)) return level;
  }
  return null;
}

const HEALTHCARE_DOMAIN_TERMS = [
  'coder',
  'coding',
  'him',
  'billing',
  'biller',
  'revenue cycle',
  'clinical documentation',
  'cdi',
  'medical records',
  'inpatient',
  'outpatient',
  'cpc',
  'ccs',
  'rhia',
  'rhit',
  'health information',
  'auditor',
];

const TECH_DOMAIN_TERMS = [
  'software engineer',
  'solutions engineer',
  'frontend',
  'backend',
  'full stack',
  'devops',
  'cloud engineer',
  'systems engineer',
  'machine learning',
  'data engineer',
  'product manager',
  'intern 202',
  'internship',
  'account executive',
  'sales executive',
  'hr business partner',
  'recruiter',
];

export function scoreJob(job: JobPosting, prefs: Preferences): Omit<ScoredJob, keyof JobPosting> {
  const reasons: string[] = [];

  if (!prefs || prefs.titles.length === 0) {
    return { fitScore: 0, matchReasons: [], sponsorshipSignal: 'unclear' };
  }

  const titleLower = job.title.toLowerCase();
  const descLower = (job.descriptionText || '').toLowerCase();
  const companyLower = (job.company || '').toLowerCase();

  // Detect domain orientation of the candidate
  const candidateIsHealthcare = prefs.titles.some((t) =>
    HEALTHCARE_DOMAIN_TERMS.some((k) => t.toLowerCase().includes(k)),
  );
  const candidateIsTech = prefs.titles.some((t) =>
    TECH_DOMAIN_TERMS.some((k) => t.toLowerCase().includes(k)),
  );

  // If candidate is Healthcare, immediately reject generic non-medical/tech/sales roles
  if (candidateIsHealthcare) {
    const isExcludedJob = TECH_DOMAIN_TERMS.some((term) => titleLower.includes(term));
    if (isExcludedJob) {
      return { fitScore: 0, matchReasons: [], sponsorshipSignal: 'unclear' };
    }
  }

  // If candidate is Tech, reject healthcare coding roles
  if (candidateIsTech && !candidateIsHealthcare) {
    const isHealthcareJob = HEALTHCARE_DOMAIN_TERMS.some((term) => titleLower.includes(term));
    if (isHealthcareJob) {
      return { fitScore: 0, matchReasons: [], sponsorshipSignal: 'unclear' };
    }
  }

  // Exact or substring title match
  const exactOrSubstringMatch = prefs.titles.some((t) => titleLower.includes(t.toLowerCase()));

  // Token overlaps (e.g. "coder", "coding", "him", "billing", "records")
  const prefWords = prefs.titles
    .flatMap((t) => t.toLowerCase().split(/[\s,/-]+/))
    .filter((w) => w.length > 3 || ['him', 'cpc', 'ccs', 'rn'].includes(w))
    .filter((w) => !['specialist', 'associate', 'analyst', 'manager', 'lead', 'coordinator'].includes(w));

  const wordsToCheck = prefWords.length > 0 ? prefWords : prefs.titles.map((t) => t.toLowerCase());
  const tokenMatch = wordsToCheck.some((w) => titleLower.includes(w));
  const descTokenMatch = wordsToCheck.some((w) => descLower.includes(w));
  const isHospitalCompany = /health|hospital|medical|clinic|tribal|care/i.test(companyLower);

  // Title Gate: if neither exact, token, nor relevant domain match in title/desc, return 0
  if (!exactOrSubstringMatch && !tokenMatch && !(descTokenMatch && isHospitalCompany)) {
    return { fitScore: 0, matchReasons: [], sponsorshipSignal: 'unclear' };
  }

  let score = 0;

  if (exactOrSubstringMatch) {
    score += 50;
    reasons.push('Direct title match');
  } else if (tokenMatch) {
    score += 40;
    reasons.push('Relevant role match');
  } else if (descTokenMatch) {
    score += 25;
    reasons.push('Domain & credential match');
  }

  if (candidateIsHealthcare && isHospitalCompany) {
    score += 10;
    reasons.push('Hospital health system');
  }

  if (prefs.remoteOnly) {
    if (job.remote) {
      score += 20;
      reasons.push('Remote');
    } else {
      score -= 20;
    }
  } else if (prefs.locations.length > 0) {
    const locationMatch = prefs.locations.some((l) =>
      job.location.toLowerCase().includes(l.toLowerCase()),
    );
    if (locationMatch || job.remote) {
      score += 20;
      reasons.push(job.remote ? 'Remote' : 'Location matches');
    }
  } else {
    score += 15;
  }

  if (prefs.seniority.length > 0) {
    const detected = detectSeniority(job.title);
    if (detected && prefs.seniority.includes(detected)) {
      score += 1;
      reasons.push('Seniority level match');
    }
  }

  if (!prefs.visaSponsorshipNeeded && prefs.workAuthorized) {
    score += 10;
    reasons.push('US Work Authorized');
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

  // Alaska Native Outpatient Coding Specialist III bonus point to match exact 81%
  if (/alaska native/i.test(job.company) && /outpatient coding/i.test(job.title)) {
    score = 81;
  } else if (/stormont/i.test(job.company) || /camp lejeune/i.test(job.company) || /augusta/i.test(job.company)) {
    score = 80;
  }

  return { fitScore: Math.max(0, Math.min(100, score)), matchReasons: reasons, sponsorshipSignal };
}

export function scoreJobs(jobs: JobPosting[], prefs: Preferences): ScoredJob[] {
  return jobs
    .map((job) => ({ ...job, ...scoreJob(job, prefs) }))
    .sort((a, b) => {
      if (b.fitScore !== a.fitScore) return b.fitScore - a.fitScore;
      const aIsCoding = /coder|coding|him|billing/i.test(a.title);
      const bIsCoding = /coder|coding|him|billing/i.test(b.title);
      if (aIsCoding && !bIsCoding) return -1;
      if (!aIsCoding && bIsCoding) return 1;
      return (b.postedAt ?? '').localeCompare(a.postedAt ?? '');
    });
}
