/**
 * None of the four providers expose a structured country field — location is
 * free text ("Remote, USA", "Toronto, ON, CA", "Bengaluru", "Chicago, IL").
 * This is a best-effort text heuristic, not a guarantee: it excludes a
 * location only when it contains a recognizable non-US signal, and defaults
 * to including anything ambiguous (bare "Remote", "Hybrid", "N/A", a single
 * unrecognized city) since false-exclusion of a real US posting is worse
 * than the rare miss slipping through.
 */

const NON_US_COUNTRIES = [
  'canada', 'mexico', 'brazil', 'argentina', 'colombia', 'chile', 'peru',
  'india', 'pakistan', 'bangladesh', 'philippines', 'singapore', 'malaysia',
  'indonesia', 'vietnam', 'thailand', 'china', 'hong kong', 'taiwan', 'japan',
  'south korea', 'korea',
  'united kingdom', 'ireland', 'germany', 'france', 'spain', 'portugal',
  'italy', 'netherlands', 'belgium', 'switzerland', 'austria', 'poland',
  'slovenia', 'slovakia', 'czech republic', 'czechia', 'hungary', 'romania',
  'bulgaria', 'greece', 'sweden', 'norway', 'denmark', 'finland', 'iceland',
  'ukraine', 'russia', 'estonia', 'latvia', 'lithuania', 'croatia', 'serbia',
  'israel', 'uae', 'united arab emirates', 'saudi arabia', 'egypt', 'turkey',
  'south africa', 'nigeria', 'kenya',
  'australia', 'new zealand',
];

const NON_US_CITIES = [
  'toronto', 'vancouver', 'montreal', 'ottawa', 'calgary',
  'london', 'dublin', 'berlin', 'munich', 'frankfurt', 'hamburg',
  'amsterdam', 'paris', 'madrid', 'barcelona', 'lisbon', 'zurich', 'geneva',
  'stockholm', 'copenhagen', 'oslo', 'helsinki', 'warsaw', 'krakow',
  'ljubljana', 'bratislava', 'prague', 'budapest', 'bucharest',
  'tel aviv', 'tokyo', 'osaka', 'seoul', 'shanghai', 'beijing', 'shenzhen',
  'singapore', 'kuala lumpur', 'jakarta', 'hanoi', 'ho chi minh',
  'bangalore', 'bengaluru', 'hyderabad', 'mumbai', 'delhi', 'gurugram',
  'gurgaon', 'noida', 'chennai', 'pune', 'kolkata', 'indore',
  'taguig', 'quezon city', 'manila', 'metro manila', 'cebu',
  'sydney', 'melbourne', 'auckland',
  'sao paulo', 'são paulo', 'mexico city', 'buenos aires', 'bogota', 'bogotá',
];

const CANADIAN_PROVINCE_SUFFIX = /,\s*(on|bc|qc|ab|mb|sk|ns|nb|pe|nl|yt|nt|nu)\b/i;

function containsWord(haystack: string, needle: string): boolean {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(haystack);
}

export function isUSLocation(location: string): boolean {
  const text = location.toLowerCase();
  if (!text.trim()) return true;

  if (CANADIAN_PROVINCE_SUFFIX.test(text)) return false;
  if (NON_US_COUNTRIES.some((c) => containsWord(text, c))) return false;
  if (NON_US_CITIES.some((c) => containsWord(text, c))) return false;

  return true;
}
