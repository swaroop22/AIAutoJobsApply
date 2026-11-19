import type { ResumeEducation, ResumeExperience, SeniorityLevel } from '@/lib/app-db/types';
import { detectSeniority } from '@/lib/matching';

export type ParsedResume = {
  fullName?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
};

export type SuggestedPreferences = {
  titles: string[];
  seniority: SeniorityLevel[];
};

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;

const SECTION_HEADERS: Record<'experience' | 'education' | 'skills' | 'summary', RegExp> = {
  experience: /^(work\s+)?experience$|^employment(\s+history)?$/i,
  education: /^education$/i,
  skills: /^(technical\s+)?skills$/i,
  summary: /^(summary|profile|objective)$/i,
};

function splitIntoSections(lines: string[]) {
  const sections: Record<string, string[]> = {};
  let current = 'header';
  sections[current] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const matchedKey = (Object.keys(SECTION_HEADERS) as Array<keyof typeof SECTION_HEADERS>).find(
      (key) => SECTION_HEADERS[key].test(line),
    );
    if (matchedKey && line.length < 40) {
      current = matchedKey;
      sections[current] = sections[current] ?? [];
      continue;
    }
    sections[current] = sections[current] ?? [];
    if (line) sections[current].push(line);
  }

  return sections;
}

function parseSkills(lines: string[]): string[] {
  return lines
    .join(', ')
    .split(/[,•|]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 40);
}

function parseExperience(lines: string[]): ResumeExperience[] {
  const entries: ResumeExperience[] = [];
  let current: ResumeExperience | null = null;
  let idCounter = 0;

  const dateRange = /(\b[A-Z][a-z]{2,8}\.?\s+\d{4}|\b\d{4})\s*[-–—to]+\s*(present|current|\b[A-Z][a-z]{2,8}\.?\s+\d{4}|\b\d{4})/i;

  for (const line of lines) {
    const isBullet = /^[•\-*]/.test(line);
    if (!isBullet && (dateRange.test(line) || /\bat\b|,/.test(line)) && line.length < 100) {
      if (current) entries.push(current);
      idCounter += 1;
      const match = dateRange.exec(line);
      const [titleCompany] = match ? [line.replace(match[0], '').trim()] : [line];
      const [title = '', company = ''] = titleCompany.split(/,| at | — | - /).map((s) => s.trim());
      current = {
        id: `exp-${idCounter}`,
        title: title || titleCompany,
        company: company || '',
        startDate: match?.[1],
        endDate: match?.[2],
        bullets: [],
      };
    } else if (current) {
      current.bullets.push(line.replace(/^[•\-*]\s*/, ''));
    }
  }
  if (current) entries.push(current);
  return entries;
}

function parseEducation(lines: string[]): ResumeEducation[] {
  const entries: ResumeEducation[] = [];
  let idCounter = 0;
  for (const line of lines) {
    if (!line) continue;
    idCounter += 1;
    const [school = line, degree] = line.split(/,| — | - /).map((s) => s.trim());
    entries.push({ id: `edu-${idCounter}`, school, degree });
  }
  return entries;
}

export function parseResumeText(rawText: string): ParsedResume {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim());
  const sections = splitIntoSections(lines);

  const headerText = sections.header?.join(' ') ?? '';
  const email = EMAIL_RE.exec(headerText)?.[0];
  const phone = PHONE_RE.exec(headerText)?.[0];
  const fullName = sections.header?.find(
    (l) => l.length > 2 && l.length < 60 && !EMAIL_RE.test(l) && !PHONE_RE.test(l),
  );

  return {
    fullName,
    email,
    phone,
    summary: sections.summary?.join(' '),
    skills: parseSkills(sections.skills ?? []),
    experience: parseExperience(sections.experience ?? []),
    education: parseEducation(sections.education ?? []),
  };
}

export function suggestPreferencesFromResume(parsed: ParsedResume): SuggestedPreferences {
  const titles = new Set<string>();
  const senioritySet = new Set<SeniorityLevel>();

  for (const exp of parsed.experience.slice(0, 3)) {
    if (!exp.title) continue;

    // Clean up title: remove parentheticals like (Contract), (Remote), etc.
    const clean = exp.title
      .replace(/\s*\([^)]*\)/g, '')
      .split(/ - | — | at | @ | \| /)[0]
      .trim();

    if (!clean || clean.length < 3) continue;

    const detected = detectSeniority(exp.title);
    if (detected) {
      senioritySet.add(detected);
    }

    // Strip seniority prefixes (Senior, Staff, etc.) to get the core role for broader matching
    const core = clean
      .replace(/^(senior|sr\.?|junior|jr\.?|staff|lead|principal|associate|intern)\s+/i, '')
      .trim();

    if (core && core.length >= 3) {
      titles.add(core);
    } else {
      titles.add(clean);
    }
  }

  // Check for healthcare / medical coding roles and credentials across all parsed sections
  const fullContent = [
    parsed.summary ?? '',
    ...parsed.skills,
    ...parsed.experience.map((e) => `${e.title} ${e.bullets.join(' ')}`),
  ].join(' ');

  const hasHealthcareCoding =
    /coder|coding|him|billing|revenue\s*cycle|cdi|clinical\s*documentation|icd[- ]?10|cpt|hcpcs|ahima|aapc|cpc|ccs|rhia|rhit/i.test(
      fullContent,
    );

  if (hasHealthcareCoding) {
    if (/outpatient/i.test(fullContent)) titles.add('Outpatient Coding Specialist');
    if (/inpatient/i.test(fullContent)) titles.add('Inpatient Medical Coder');
    if (/him/i.test(fullContent)) titles.add('HIM Coder');
    titles.add('Medical Coder');
    titles.add('Coding Specialist');
  }

  // Fallback: check summary for common tech/design/product roles if none found in experience or healthcare
  if (titles.size === 0 && parsed.summary) {
    const commonRoles = [
      'Software Engineer',
      'Frontend Engineer',
      'Backend Engineer',
      'Full Stack Engineer',
      'Data Engineer',
      'Data Scientist',
      'Product Manager',
      'Product Designer',
      'DevOps Engineer',
      'Machine Learning Engineer',
      'Security Engineer',
    ];
    for (const role of commonRoles) {
      if (new RegExp(`\\b${role}\\b`, 'i').test(parsed.summary)) {
        titles.add(role);
        break;
      }
    }
  }

  return {
    titles: Array.from(titles).slice(0, 4),
    seniority: Array.from(senioritySet),
  };
}
