export type InterviewPrepTool = {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  icon: 'mic' | 'code-2' | 'network' | 'line-chart';
};

export const interviewPrepTools: InterviewPrepTool[] = [
  {
    slug: 'mock-interview',
    name: 'Mock interview',
    description: 'Practice behavioral and role-specific questions with instant spoken feedback.',
    longDescription:
      'Run a timed mock interview against questions pulled from the same company and role you\'re applying to. Offerlane listens to your answer, flags filler words and rambling, and suggests a tighter version using the STAR structure.',
    icon: 'mic',
  },
  {
    slug: 'coding-practice',
    name: 'Coding practice',
    description: 'Drill the patterns that actually show up in your target companies\' loops.',
    longDescription:
      'Get a queue of problems weighted toward the patterns that show up most often at the companies you\'re tracking in your pipeline, with hints that nudge instead of spoiling the solution.',
    icon: 'code-2',
  },
  {
    slug: 'system-design',
    name: 'System design',
    description: 'Walk through design prompts with a whiteboard-style back-and-forth.',
    longDescription:
      'Talk through a system design prompt the way you would in a real loop — requirements, tradeoffs, bottlenecks — with follow-up questions that mirror what an interviewer would actually push on.',
    icon: 'network',
  },
  {
    slug: 'feedback-scoring',
    name: 'Feedback scoring',
    description: 'See a structured scorecard after every practice session, not just a vibe.',
    longDescription:
      'Every practice session ends with a scorecard broken down by clarity, structure, and technical depth, plus one specific thing to fix before your next attempt.',
    icon: 'line-chart',
  },
];
