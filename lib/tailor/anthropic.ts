import Anthropic from '@anthropic-ai/sdk';

const TOOL_NAME = 'return_tailored_resume';

const SYSTEM_PROMPT = `You tailor a candidate's existing résumé for a specific job by rewording and reordering ONLY the facts already present. You must never invent, exaggerate, or add any experience, skill, employer, title, or accomplishment that is not already stated in the candidate's résumé. If the job description calls for something the résumé doesn't support, do not fabricate it — simply don't emphasize it. Your job is emphasis and clarity, not invention. Keep each experience entry's id unchanged, and only reorder (never add to) the given skills list.`;

export type TailorResumeInput = {
  jobTitle: string;
  company: string;
  jobDescription: string;
  resume: {
    summary?: string;
    skills: string[];
    experience: { id: string; title: string; company: string; bullets: string[] }[];
  };
};

export type TailorResumeOutput = {
  summary: string;
  skills: string[];
  experience: { id: string; bullets: string[] }[];
};

export async function tailorResume(input: TailorResumeInput): Promise<TailorResumeOutput> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest';

  const message = await client.messages.create({
    model,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          `Job title: ${input.jobTitle}`,
          `Company: ${input.company}`,
          `Job description:\n${input.jobDescription.slice(0, 6000)}`,
          `Candidate résumé (JSON):\n${JSON.stringify({
            summary: input.resume.summary,
            skills: input.resume.skills,
            experience: input.resume.experience.map((e) => ({
              id: e.id,
              title: e.title,
              company: e.company,
              bullets: e.bullets,
            })),
          })}`,
          `Reword and reorder the summary, skills, and each role's bullets to best fit this job. Do not add experience, skills, or claims that are not already present. Keep each experience entry's id unchanged — only change its bullets' text and order. Only reorder skills from the provided list; do not add new ones. Call the ${TOOL_NAME} tool with your result.`,
        ].join('\n\n'),
      },
    ],
    tools: [
      {
        name: TOOL_NAME,
        description: 'Return the tailored résumé content.',
        input_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } },
            experience: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  bullets: { type: 'array', items: { type: 'string' } },
                },
                required: ['id', 'bullets'],
              },
            },
          },
          required: ['summary', 'skills', 'experience'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: TOOL_NAME },
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
  );
  if (!toolUse) throw new Error('Model did not return structured output');
  return toolUse.input as TailorResumeOutput;
}
