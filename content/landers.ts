export type Lander = {
  slug: string;
  title: string;
  eyebrow: string;
  h1: string;
  intro: string;
  bullets: { title: string; body: string }[];
  faq: { question: string; answer: string }[];
};

export const landers: Record<string, Lander> = {
  'auto-apply': {
    slug: 'auto-apply',
    title: 'Auto Apply — RolePilot',
    eyebrow: 'Auto apply',
    h1: 'Let the agent submit applications while you do literally anything else.',
    intro:
      'Auto Apply turns on fully automated submissions: once a listing clears your fit threshold, RolePilot tailors your resume and submits it through the real application flow, no click required from you.',
    bullets: [
      {
        title: 'You set the bar',
        body: 'Pick a minimum fit score, target roles, and locations. Nothing goes out that falls outside what you\'ve approved.',
      },
      {
        title: 'Switch back anytime',
        body: 'Flip back to Review mode whenever you want a human-in-the-loop check before each submission.',
      },
      {
        title: 'Fair-use daily cap',
        body: 'Automated submissions are capped per day so the system stays reliable and your applications stay distinct from spam.',
      },
    ],
    faq: [
      {
        question: 'Can I undo an application Auto Apply already sent?',
        answer:
          'You can\'t un-send it, but you can withdraw by replying to the confirmation email, and your tracker will reflect that status if you mark it.',
      },
      {
        question: 'Does Auto Apply ever submit to the same job twice?',
        answer: 'No — RolePilot deduplicates by company and posting before anything is queued, on or off auto mode.',
      },
    ],
  },
  'new-grads': {
    slug: 'new-grads',
    title: 'For new grads — RolePilot',
    eyebrow: 'New grads',
    h1: 'Graduating into a flooded market? Apply at the speed it moves.',
    intro:
      'Entry-level postings close fast and get hundreds of applicants in the first day. RolePilot watches for new-grad and early-career listings the moment they post and gets your tailored resume in before the queue fills up.',
    bullets: [
      {
        title: 'Entry-level filters built in',
        body: 'Filter to 0–2 years experience, new-grad programs, and rotational roles without hand-screening every listing.',
      },
      {
        title: 'One resume, every format',
        body: 'Tailoring handles the resume-keyword mismatch that trips up a lot of first-time applicants against ATS filters.',
      },
      {
        title: 'Free, because job hunting already costs enough',
        body: 'No subscription on top of moving costs, interview outfits, and application fatigue.',
      },
    ],
    faq: [
      {
        question: 'I have no full-time experience yet — will matches still make sense?',
        answer:
          'Yes. Fit scoring weighs coursework, internships, and projects, not just job titles, so new-grad listings still surface accurately.',
      },
      {
        question: 'Can I target specific companies on top of the open search?',
        answer: 'Yes — add a watchlist of specific employers and RolePilot prioritizes postings from them in your feed.',
      },
    ],
  },
  international: {
    slug: 'international',
    title: 'For international students — RolePilot',
    eyebrow: 'International students',
    h1: 'Built-in filters for OPT, CPT, and visa sponsorship — so you stop guessing.',
    intro:
      'Searching manually means opening dozens of listings just to find the one line about sponsorship. RolePilot surfaces that detail upfront and flags roles where it\'s ambiguous, so your time goes to jobs you can actually take.',
    bullets: [
      {
        title: 'Sponsorship-aware filtering',
        body: 'Exclude listings that explicitly require US citizenship or a clearance, and prioritize ones that mention sponsorship or OPT/CPT eligibility.',
      },
      {
        title: 'Ambiguous cases flagged, not hidden',
        body: 'When a listing doesn\'t say either way, it\'s marked "unclear" instead of silently dropped, so you can decide for yourself.',
      },
      {
        title: 'Works wherever you\'re searching from',
        body: 'Set your target country and the agent adjusts its crawl and matching accordingly.',
      },
    ],
    faq: [
      {
        question: 'Does RolePilot guarantee a role will sponsor me?',
        answer:
          'No — sponsorship language is pulled directly from the posting and flagged for your review, not guaranteed. Always confirm directly with the employer before relying on it.',
      },
      {
        question: 'Can I filter to OPT-only or H-1B-cap-exempt employers?',
        answer: 'Yes, both are available as filters alongside the general sponsorship flag.',
      },
    ],
  },
};
