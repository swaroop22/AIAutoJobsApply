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
export const ATS_BOARDS: AtsBoard[] = [
  { provider: 'greenhouse', slug: 'stripe', company: 'Stripe' },
  { provider: 'greenhouse', slug: 'airbnb', company: 'Airbnb' },
  { provider: 'greenhouse', slug: 'coinbase', company: 'Coinbase' },
  { provider: 'greenhouse', slug: 'asana', company: 'Asana' },
  { provider: 'greenhouse', slug: 'dropbox', company: 'Dropbox' },
  { provider: 'greenhouse', slug: 'pinterest', company: 'Pinterest' },
  { provider: 'greenhouse', slug: 'cloudflare', company: 'Cloudflare' },
  { provider: 'greenhouse', slug: 'gitlab', company: 'GitLab' },
  { provider: 'greenhouse', slug: 'robinhood', company: 'Robinhood' },
  { provider: 'lever', slug: 'palantir', company: 'Palantir' },
  { provider: 'lever', slug: 'spotify', company: 'Spotify' },
  { provider: 'ashby', slug: 'notion', company: 'Notion' },
  { provider: 'ashby', slug: 'linear', company: 'Linear' },
  { provider: 'ashby', slug: 'ramp', company: 'Ramp' },
  { provider: 'ashby', slug: 'substack', company: 'Substack' },

  // Healthcare / health-tech, added 2026-11-17. Note: none of these (or any
  // other company checked on Greenhouse/Lever/Ashby's public boards) had a
  // literal "Medical Coder" opening at verification time — medical coding is
  // mostly hired through RCM outsourcing firms and hospital systems that use
  // Workday/iCIMS/Taleo, not these three providers. These boards do carry
  // adjacent billing/RCM/clinical-ops roles (e.g. "Medical Biller" at Candid
  // Health).
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
    tenant: 'r1rcm',
    wdNumber: 1,
    site: 'r1rcm',
    company: 'R1 RCM',
    searchTerms: ['coder', 'coding', 'biller', 'billing', 'clinical documentation'],
  },
];
