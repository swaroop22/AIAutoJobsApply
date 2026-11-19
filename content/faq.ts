export type FaqItem = {
  question: string;
  answer: string;
};

export const faq: FaqItem[] = [
  {
    question: 'Is RolePilot actually free, or is there a catch?',
    answer:
      "It's free. There's no trial window, no usage-based billing, and no paid tier waiting behind a paywall. We built RolePilot because job hunting is expensive enough already — you shouldn't have to pay to apply for work.",
  },
  {
    question: 'Do I need to create an account?',
    answer:
      'No. RolePilot runs without sign-up. You open the app, paste or upload your resume, and start working. There is no password to lose and no email required to get value from the tool.',
  },
  {
    question: 'Where is my resume and application data stored?',
    answer:
      'Your resume, preferences, and application history are stored locally in your browser. We do not maintain a central account database for the marketing site or the core app experience. If you clear your browser data, that local history goes with it.',
  },
  {
    question: "How does RolePilot make money if it's free?",
    answer:
      "Right now it doesn't — this is a free tool we built and operate for job seekers, funded out of pocket during the beta. If that ever changes, it will be an optional add-on and the core find-tailor-apply-track flow will stay free.",
  },
  {
    question: 'What does "Auto Apply" actually submit on my behalf?',
    answer:
      'When Auto Apply is on, the agent submits applications that match your stated role, location, and experience filters using your tailored resume and standard answers you approve in advance. You can switch to Review mode at any time to approve each application individually before it goes out.',
  },
  {
    question: "What's the difference between Review mode and Auto Apply?",
    answer:
      'Review mode queues every match for your sign-off before anything is submitted. Auto Apply skips the queue and submits automatically once a match clears your fit threshold. Most people start in Review mode for a day or two, then switch once they trust the matches.',
  },
  {
    question: 'Which job sites and applicant tracking systems are supported?',
    answer:
      'RolePilot applies directly through major ATS platforms including Greenhouse, Lever, Workday, Ashby, and iCIMS, plus a growing list of company career pages crawled directly. Coverage is expanding — if a listing can\'t be auto-submitted, it\'s queued for a one-click manual apply instead.',
  },
  {
    question: 'Is it safe to let an agent submit applications for me?',
    answer:
      "Every submission uses information you've explicitly provided and approved — your resume, your answers to standard screening questions, and your job preferences. The agent never fabricates experience or credentials, and you can review submission history at any time.",
  },
  {
    question: 'Can international students on OPT or visa sponsorship use RolePilot?',
    answer:
      "Yes. You can filter for roles that mention visa sponsorship or OPT/CPT eligibility, and exclude listings that explicitly require US citizenship or a security clearance you don't hold. We also flag roles where sponsorship status is unclear so you can double check before applying.",
  },
  {
    question: 'Will tailoring my resume for every job hurt my chances?',
    answer:
      "No — tailoring just reorders and reweights your existing, truthful experience to match the language of each posting. It doesn't invent skills or jobs you haven't held. You can inspect or edit any tailored version before it's sent.",
  },
  {
    question: 'How do I stop the agent or pause applications?',
    answer:
      'Flip the Auto Apply toggle off from the dashboard at any time — it pauses new submissions immediately. Anything already submitted stays in your tracker so you can keep following up on it.',
  },
  {
    question: 'How do I clear my data?',
    answer:
      "Open Settings inside the app and choose \"Clear local data.\" This removes your resume, preferences, and application history from your browser. Since nothing is stored centrally for your account, there's nothing left behind afterward.",
  },
  {
    question: 'Is there a limit to how many jobs I can apply to?',
    answer:
      "There's a fair-use daily cap on fully automated submissions so the system stays reliable for everyone — see your dashboard for the current number. Manual, one-click applications through the tracker aren't capped.",
  },
  {
    question: 'Does RolePilot work outside the US?',
    answer:
      'Job coverage is strongest in the US today, with growing coverage in Canada, the UK, and the EU. You can set a location filter to any market and the agent will surface what it finds there, though match density varies by region.',
  },
];
