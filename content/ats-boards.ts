import type { JobProvider } from '@/lib/app-db/types';

export type AtsBoard = {
  provider: JobProvider;
  /** The slug that appears in the company's public job-board URL. */
  slug: string;
  company: string;
};

/**
 * Verified against each provider's live public API on 2026-11-17 — every
 * entry below returned a non-empty job list at that time. Re-check
 * periodically: a slug can go stale if a company migrates ATS providers or
 * takes its board private, and a stale slug just returns an empty/404
 * response rather than an error you'd notice without checking.
 *
 *   Greenhouse — boards-api.greenhouse.io/v1/boards/<slug>/jobs
 *   Lever      — api.lever.co/v0/postings/<slug>?mode=json
 *   Ashby      — api.ashbyhq.com/posting-api/job-board/<slug>
 */
/**
 * Healthcare, health systems, clinical operations, and health-tech ATS boards.
 * Generic tech companies (e.g. software engineer / intern postings at Stripe,
 * Pinterest, Ramp, etc.) are excluded so candidate feeds remain focused on
 * healthcare, hospital networks, clinical operations, medical coding, and billing.
 */
export const ATS_BOARDS: AtsBoard[] = [
  // Healthcare, health-tech, and clinical operations boards
  { provider: 'greenhouse', slug: 'garnerhealth', company: 'Garner Health' },
  { provider: 'greenhouse', slug: 'omadahealth', company: 'Omada Health' },
  { provider: 'greenhouse', slug: 'rightwayhealthcare', company: 'Rightway' },
  { provider: 'greenhouse', slug: 'parsleyhealth', company: 'Parsley Health' },
  { provider: 'greenhouse', slug: 'galileo', company: 'Galileo Health' },
  { provider: 'greenhouse', slug: 'collectivehealth', company: 'Collective Health' },
  { provider: 'lever', slug: 'includedhealth', company: 'Included Health' },
  { provider: 'ashby', slug: 'candidhealth', company: 'Candid Health' },
  { provider: 'ashby', slug: 'maven', company: 'Maven Clinic' },
  { provider: 'ashby', slug: 'wheel', company: 'Wheel' },
  { provider: 'ashby', slug: 'cohere', company: 'Cohere Health' },
  { provider: 'ashby', slug: 'akasa', company: 'Akasa' },
];

/**
 * Workday public "CXS" (Candidate Experience) API, verified live 2026-11-17.
 * Unlike the three providers above, a Workday tenant can list thousands of
 * jobs and its list endpoint hard-caps at 20 results per page (larger
 * `limit` values 400) — paging through an entire large tenant to mirror it
 * is not practical within a 30-minute aggregation window. Instead each board
 * pairs a tenant with a short list of `searchTerms`; the Workday API itself
 * filters server-side, so this pulls a small, relevant slice (e.g. actual
 * coding/billing roles) instead of the tenant's full, mostly-unrelated
 * posting volume (e.g. hundreds of call-center openings at the same company).
 *
 * List: POST https://<tenant>.wd<N>.myworkdayjobs.com/wday/cxs/<tenant>/<site>/jobs
 * Detail: GET https://<tenant>.wd<N>.myworkdayjobs.com/wday/cxs/<tenant>/<site><externalPath>
 */
export type WorkdayBoard = {
  provider: 'workday';
  tenant: string;
  wdNumber: number;
  site: string;
  company: string;
  searchTerms: string[];
};

export const WORKDAY_BOARDS: WorkdayBoard[] = [
  {
    provider: 'workday',
    tenant: 'stormontvail',
    wdNumber: 1,
    site: 'SVH',
    company: 'Stormont Vail Health',
    searchTerms: ['coder', 'coding', 'HIM', 'billing'],
  },
  {
    provider: 'workday',
    tenant: 'adventhealth',
    wdNumber: 12,
    site: 'AH_External_Career_Site',
    company: 'AdventHealth',
    searchTerms: ['coder', 'coding', 'HIM', 'billing'],
  },
  {
    provider: 'workday',
    tenant: 'corrohealth',
    wdNumber: 1,
    site: 'Corro',
    company: 'CorroHealth',
    searchTerms: ['coder', 'coding', 'specialist'],
  },
  {
    provider: 'workday',
    tenant: 'memorialhealthcare',
    wdNumber: 1,
    site: 'MHS_Careers',
    company: 'Memorial Healthcare System',
    searchTerms: ['coder', 'coding', 'HIM', 'billing'],
  },
  {
    provider: 'workday',
    tenant: 'ummc',
    wdNumber: 5,
    site: 'umccareers',
    company: 'UMMC Health',
    searchTerms: ['coder', 'coding', 'HIM'],
  },
  {
    provider: 'workday',
    tenant: 'vumc',
    wdNumber: 1,
    site: 'VUMCCareers',
    company: 'Vanderbilt Health (VUMC)',
    searchTerms: ['coder', 'coding', 'HIM'],
  },
  {
    provider: 'workday',
    tenant: 'wellstar',
    wdNumber: 1,
    site: 'WellstarCareers',
    company: 'Wellstar Health System',
    searchTerms: ['coder', 'coding', 'auditor'],
  },
  {
    provider: 'workday',
    tenant: 'cookchildrens',
    wdNumber: 1,
    site: 'Cook_Childrens_Careers',
    company: "Cook Children's Health",
    searchTerms: ['coder', 'coding', 'HIM'],
  },
  {
    provider: 'workday',
    tenant: 'promedica',
    wdNumber: 12,
    site: 'External_Careers',
    company: 'ProMedica Health',
    searchTerms: ['coder', 'coding'],
  },
  {
    provider: 'workday',
    tenant: 'osu',
    wdNumber: 1,
    site: 'OSUCareers',
    company: 'Ohio State Wexner Medical',
    searchTerms: ['coder', 'coding', 'revenue integrity'],
  },
  {
    provider: 'workday',
    tenant: 'r1rcm',
    wdNumber: 1,
    site: 'r1rcm',
    company: 'R1 RCM',
    searchTerms: ['coder', 'coding', 'biller', 'billing', 'clinical documentation'],
  },
];
