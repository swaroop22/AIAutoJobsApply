import type { TailorResumeInput, TailorResumeOutput } from './anthropic';

const SYSTEM_PROMPT = `You tailor a candidate's existing résumé for a specific job by rewording and reordering ONLY the facts already present. You must never invent, exaggerate, or add any experience, skill, employer, title, or accomplishment that is not already stated in the candidate's résumé. If the job description calls for something the résumé doesn't support, do not fabricate it — simply don't emphasize it. Your job is emphasis and clarity, not invention. Keep each experience entry's id unchanged, and only reorder (never add to) the given skills list.`;

const CANDIDATE_MODELS = ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];

export async function tailorResumeWithGemini(input: TailorResumeInput): Promise<TailorResumeOutput> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY or GOOGLE_API_KEY');
  }

  const modelsToTry = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : CANDIDATE_MODELS;

  const userContent = [
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
    `Reword and reorder the summary, skills, and each role's bullets to best fit this job. Do not add experience, skills, or claims that are not already present. Keep each experience entry's id unchanged — only change its bullets' text and order. Only reorder skills from the provided list; do not add new ones. Return the output matching the requested JSON schema.`,
  ].join('\n\n');

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userContent }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                summary: { type: 'STRING' },
                skills: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                },
                experience: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      id: { type: 'STRING' },
                      bullets: {
                        type: 'ARRAY',
                        items: { type: 'STRING' },
                      },
                    },
                    required: ['id', 'bullets'],
                  },
                },
              },
              required: ['summary', 'skills', 'experience'],
            },
          },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        // If temporary 503 or 404 on this model, fall back to next model
        if (res.status === 503 || res.status === 404) {
          lastError = new Error(`Model ${model} unavailable (${res.status}): ${errorText}`);
          continue;
        }
        throw new Error(`Gemini API error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        throw new Error('Gemini API did not return response text');
      }

      const parsed = JSON.parse(textResponse) as TailorResumeOutput;
      return parsed;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Try next model if available
      continue;
    }
  }

  throw lastError ?? new Error('All Gemini models failed to respond.');
}
