# Offerlane — marketing site

Marketing site for Offerlane, a free AI job-application agent. No accounts, no payments, no
database — content lives in typed TS files under `/content` and MDX under `/content/blog`.

## Stack

- Next.js 14 (App Router, React Server Components by default)
- TypeScript
- Tailwind CSS with a small `ol-*` component layer (see `app/globals.css`)
- MDX for blog posts (`@next/mdx`)
- Hand-rolled animation: IntersectionObserver + CSS transitions (`components/Reveal.tsx`,
  `components/TerminalFeed.tsx`) — no animation library
- `lucide-react` for line icons

## Install & run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Build

```bash
npm run build
npm run start
```

## Editing content

- `content/stats.ts` — every numeric claim on the site, clearly marked as placeholders. Replace
  with real, verified numbers before launch.
- `content/faq.ts` — homepage FAQ (also emitted as FAQPage JSON-LD).
- `content/platforms.ts`, `content/comparison.ts`, `content/workflow.ts`,
  `content/interview-prep.ts`, `content/landers.ts` — section data for the rest of the homepage
  and the SEO landing pages (`/auto-apply`, `/new-grads`, `/international`).
- `content/blog/*.mdx` — blog posts. Add a new `.mdx` file with an exported `meta` object, then
  register it in `lib/blog.ts`.

## The `/app` tool

`/app` is the actual free product: an onboarding wizard, a job feed aggregated from public
Greenhouse/Lever/Ashby boards, AI résumé tailoring, an assisted-apply panel, and an application
tracker. No login, no accounts, no server-side database — all user data (résumé, preferences,
saved jobs, tracker) lives in the browser via IndexedDB (Dexie). See `lib/app-db/` for the schema.

### Environment variables

Only needed for the `/api/tailor` route (AI résumé tailoring); the rest of `/app` and the
marketing site need nothing.

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Yes | Powers `/api/tailor`. Without it, the route returns 503 and the UI shows a friendly error. |
| `ANTHROPIC_MODEL` | No (defaults to `claude-3-5-sonnet-latest`) | Override the model used for tailoring. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | No | Enables shared, multi-instance rate limiting for `/api/tailor`. Without these, it falls back to an in-memory per-process limiter — fine for local dev, not for a multi-instance production deploy. |

## Deploying to Vercel

1. Push this repo to GitHub (or any Git provider Vercel supports).
2. In Vercel, "Add New Project" → import the repo.
3. Framework preset: Next.js (auto-detected). Leave build/output settings at defaults.
4. Set the environment variables above if you want AI résumé tailoring enabled.
5. Deploy.

## Things intentionally not built

Per product scope, there is no `/pricing`, `/login`, `/signup`, `/delete-account`, or any
checkout/billing flow. Don't add one without revisiting the product's no-accounts positioning.
