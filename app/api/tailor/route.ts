import { NextRequest, NextResponse } from 'next/server';
import { checkTailorRateLimit } from '@/lib/tailor/rate-limit';
import { tailorResume } from '@/lib/tailor/anthropic';
import type { ResumeExperience } from '@/lib/app-db/types';

export const runtime = 'nodejs';

type TailorRequestBody = {
  jobTitle: string;
  company: string;
  jobDescription: string;
  resume: {
    summary?: string;
    skills: string[];
    experience: ResumeExperience[];
  };
};

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'not_configured', message: 'Résumé tailoring is not configured on this server.' },
      { status: 503 },
    );
  }

  const ip = getClientIp(req);
  const limit = await checkTailorRateLimit(ip);
  if (!limit.allowed) {
    const message =
      limit.reason === 'daily'
        ? "You've reached today's free tailoring limit — try again tomorrow."
        : "You're tailoring too quickly — wait a few minutes and try again.";
    return NextResponse.json({ error: 'rate_limited', message }, { status: 429 });
  }

  let body: TailorRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_request', message: 'Invalid request body.' }, { status: 400 });
  }

  if (!body?.jobTitle || !body?.resume?.experience?.length) {
    return NextResponse.json(
      { error: 'bad_request', message: 'Missing job or résumé data.' },
      { status: 400 },
    );
  }

  try {
    const result = await tailorResume({
      jobTitle: body.jobTitle,
      company: body.company,
      jobDescription: body.jobDescription ?? '',
      resume: body.resume,
    });

    // Mechanical non-fabrication guardrails — never trust the model alone to
    // only reorder/reword: skills must already exist in the original list,
    // and every experience entry keeps its original id/title/company/dates.
    const originalSkillsLower = new Map(body.resume.skills.map((s) => [s.toLowerCase(), s]));
    const safeSkills = result.skills
      .map((s) => originalSkillsLower.get(s.toLowerCase()))
      .filter((s): s is string => Boolean(s));

    const safeExperience: ResumeExperience[] = body.resume.experience.map((original) => {
      const tailored = result.experience.find((e) => e.id === original.id);
      if (!tailored || !tailored.bullets.length) return original;
      return { ...original, bullets: tailored.bullets };
    });

    return NextResponse.json({
      summary: result.summary || body.resume.summary || '',
      skills: safeSkills.length ? safeSkills : body.resume.skills,
      experience: safeExperience,
    });
  } catch (err) {
    console.error('tailor error', err);
    return NextResponse.json(
      { error: 'upstream_error', message: 'Could not tailor your résumé right now. Try again shortly.' },
      { status: 502 },
    );
  }
}
