export type WorkflowStage = {
  index: string;
  label: string;
  title: string;
  description: string;
  terminalLines: string[];
  srSummary: string;
};

export const workflowStages: WorkflowStage[] = [
  {
    index: '01',
    label: 'find',
    title: 'It reads every career page so you don\'t have to.',
    description:
      'Offerlane continuously crawls company career pages and job boards, re-checking each one on a tight interval so you see new postings within minutes of them going live — not days later, after the queue of applicants has already formed.',
    terminalLines: [
      '▸ scanning 312,408 career pages…',
      '✓ 212 new postings found in the last 20 min',
      '✓ match: Backend Engineer, 94% fit',
      '✓ match: Platform Engineer, 88% fit',
      '→ queued for tailoring…',
    ],
    srSummary: 'The agent scans hundreds of thousands of career pages and surfaces new postings that match your profile within minutes.',
  },
  {
    index: '02',
    label: 'tailor',
    title: 'One resume, rewritten for every listing.',
    description:
      'Your base resume stays the source of truth. For each match, Offerlane reorders and reweights your real experience to mirror the language of that specific posting — no invented skills, no fabricated history, just a sharper read on what you already have.',
    terminalLines: [
      '→ tailoring résumé v14 for Backend Engineer…',
      '✓ reordered 6 bullets to match listing keywords',
      '✓ summary rewritten (2 lines)',
      '✓ tailored résumé saved',
      '→ ready to submit',
    ],
    srSummary: 'The agent rewrites your resume for each specific job listing using only your real, existing experience.',
  },
  {
    index: '03',
    label: 'apply',
    title: 'Submitted through the real application flow.',
    description:
      'No autofill hacks. Offerlane submits through each company\'s actual ATS — Greenhouse, Lever, Workday, and more — using the same fields a human applicant would fill in, so your application looks and behaves exactly like one you sent yourself.',
    terminalLines: [
      '→ opening Greenhouse application form…',
      '✓ fields populated from tailored résumé',
      '✓ submitted via Greenhouse',
      '✓ confirmation email detected',
      '→ added to tracker',
    ],
    srSummary: 'Applications are submitted through the company\'s real applicant tracking system, not a browser autofill shortcut.',
  },
  {
    index: '04',
    label: 'track',
    title: 'Every reply, caught and sorted automatically.',
    description:
      'Offerlane watches for recruiter replies, status-page changes, and interview requests, then slots each one into your tracker so you always know exactly where you stand across every application — no inbox spelunking required.',
    terminalLines: [
      '↩ reply detected: interview request',
      '✓ status updated → Interview',
      '↩ reply detected: rejection',
      '✓ status updated → Rejected',
      '✓ tracker synced (41 active applications)',
    ],
    srSummary: 'The agent detects recruiter replies and interview requests and updates your application tracker automatically.',
  },
];
