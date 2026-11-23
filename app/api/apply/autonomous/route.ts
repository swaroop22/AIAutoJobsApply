import { NextRequest, NextResponse } from 'next/server';
import { executeAutonomousApply } from '@/lib/ats-runner';
import { generateResumePdfBuffer } from '@/lib/ats-runner/pdf-generator';
import { generateThankYouEmailHtml } from '@/lib/email/templates';
import type { TailoringMode } from '@/lib/app-db/types';
import type { ATSRunnerApplicant } from '@/lib/ats-runner/types';

export const runtime = 'nodejs';

type AutonomousApplyBody = {
  jobId: string;
  jobTitle: string;
  company: string;
  applyUrl: string;
  resendApiKey?: string;
  tailoringMode?: TailoringMode;
  dryRun?: boolean;
  applicant: {
    fullName: string;
    email: string;
    phone: string;
    workAuthorized: boolean;
    sponsorshipNeeded: boolean;
    desiredSalary?: string;
    summary?: string;
    skills?: string[];
    experience?: any[];
    education?: any[];
  };
  tailoredResume?: {
    summary?: string;
    skills?: string[];
    experience?: any[];
  };
};

export async function POST(req: NextRequest) {
  try {
    const body: AutonomousApplyBody = await req.json();

    if (!body.jobId || !body.applyUrl || !body.company) {
      return NextResponse.json(
        { error: 'bad_request', message: 'Job ID, Company, and Apply URL are required.' },
        { status: 400 },
      );
    }

    const applicant: ATSRunnerApplicant = {
      fullName: body.applicant?.fullName || 'Applicant',
      email: body.applicant?.email || 'applicant@candidate.rolepilot',
      phone: body.applicant?.phone || '(555) 234-5678',
      workAuthorized: body.applicant?.workAuthorized ?? true,
      sponsorshipNeeded: body.applicant?.sponsorshipNeeded ?? false,
      desiredSalary: body.applicant?.desiredSalary || 'Competitive / Market Rate',
      summary: body.tailoredResume?.summary || body.applicant?.summary,
      skills: body.tailoredResume?.skills || body.applicant?.skills,
      experience: body.tailoredResume?.experience || body.applicant?.experience,
      education: body.applicant?.education,
    };

    // 1. Generate tailored PDF buffer in memory for ATS document attachment
    let tailoredPdfBuffer: Buffer | undefined;
    try {
      tailoredPdfBuffer = await generateResumePdfBuffer(
        applicant,
        body.tailoredResume?.summary,
        body.tailoredResume?.skills,
      );
    } catch (pdfErr) {
      console.warn('PDF generation note:', pdfErr);
    }

    // 2. Launch Autonomous ATS Headless Runner
    const atsResult = await executeAutonomousApply({
      jobId: body.jobId,
      jobTitle: body.jobTitle,
      company: body.company,
      applyUrl: body.applyUrl,
      applicant,
      tailoredPdfBuffer,
      tailoringMode: body.tailoringMode || 'honest',
      dryRun: Boolean(body.dryRun),
    });

    const submittedAt = new Date().toISOString();
    const confirmationCode =
      atsResult.confirmationCode ||
      `RP-${body.company.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'H')}-${Math.floor(100000 + Math.random() * 900000)}`;

    // 3. Deliver Formal Confirmation Email if submitted
    const emailSubject = `Application Submitted: ${body.jobTitle} at ${body.company} (Ref: ${confirmationCode})`;
    const emailHtml = generateThankYouEmailHtml({
      jobTitle: body.jobTitle,
      company: body.company,
      applicationId: confirmationCode,
      submittedAt,
      applicantName: applicant.fullName,
      applicantEmail: applicant.email,
      tailoredResume: body.tailoredResume,
    });

    const resendApiKey = body.resendApiKey || process.env.RESEND_API_KEY;
    let emailDelivery: { sent: boolean; messageId?: string; error?: string } = { sent: false };

    const isRealEmail =
      applicant.email.includes('@') &&
      !applicant.email.endsWith('.rolepilot') &&
      !applicant.email.includes('example.com');

    if (resendApiKey && isRealEmail && atsResult.status === 'submitted') {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'RolePilot Applications <onboarding@resend.dev>',
            to: [applicant.email],
            subject: emailSubject,
            html: emailHtml,
          }),
        });
        const resendData = await resendRes.json();
        if (resendRes.ok && resendData.id) {
          emailDelivery = { sent: true, messageId: resendData.id };
        }
      } catch (e: any) {
        emailDelivery = { sent: false, error: e.message };
      }
    }

    const submittedAnswers = (atsResult.fieldsFilled || []).map((f) => ({
      section: f.section || 'General Information',
      question: f.field,
      answer: f.value,
      fieldType: f.value === 'Yes' || f.value === 'No' ? 'radio' : 'text',
      submittedAt,
    }));

    return NextResponse.json({
      success: atsResult.success,
      status: atsResult.status,
      atsProvider: atsResult.atsProvider,
      applicationId: confirmationCode,
      externalConfirmationUrl: atsResult.externalConfirmationUrl,
      fieldsFilled: atsResult.fieldsFilled,
      submittedAnswers,
      finishUrl: atsResult.finishUrl || body.applyUrl,
      actionRequiredReason: atsResult.actionRequiredReason,
      message: atsResult.message,
      submittedAt,
      email: {
        subject: emailSubject,
        recipient: applicant.email,
        sent: emailDelivery.sent,
        messageId: emailDelivery.messageId,
      },
    });
  } catch (err: any) {
    console.error('Autonomous runner API error:', err);
    return NextResponse.json(
      { error: 'internal_error', message: err.message || 'Failed to execute autonomous application.' },
      { status: 500 },
    );
  }
}
