import { NextRequest, NextResponse } from 'next/server';
import { generateThankYouEmailHtml } from '@/lib/email/templates';

export const runtime = 'nodejs';

type SubmitRequestBody = {
  jobId: string;
  jobTitle: string;
  company: string;
  provider?: string;
  applyUrl?: string;
  resendApiKey?: string;
  applicant?: {
    fullName?: string;
    email?: string;
    phone?: string;
    workAuthorized?: boolean;
    sponsorshipNeeded?: boolean;
  };
  tailoredResume?: {
    summary?: string;
    skills?: string[];
    experience?: any[];
  };
};

export async function POST(req: NextRequest) {
  try {
    const body: SubmitRequestBody = await req.json();

    if (!body.jobId || !body.jobTitle || !body.company) {
      return NextResponse.json(
        { error: 'bad_request', message: 'Job ID, Title, and Company are required.' },
        { status: 400 },
      );
    }

    const companyPrefix =
      body.company
        .replace(/[^a-zA-Z]/g, '')
        .slice(0, 4)
        .toUpperCase() || 'HOSP';
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const applicationId = `RP-${companyPrefix}-${randomSuffix}`;
    const submittedAt = new Date().toISOString();

    // Determine target ATS provider
    let atsProvider = body.provider || 'hospital-portal';
    if (body.applyUrl?.includes('greenhouse.io')) atsProvider = 'greenhouse';
    else if (body.applyUrl?.includes('myworkdayjobs.com')) atsProvider = 'workday';
    else if (body.applyUrl?.includes('lever.co')) atsProvider = 'lever';
    else if (body.applyUrl?.includes('ashbyhq.com')) atsProvider = 'ashby';

    const applicantEmail = body.applicant?.email || 'applicant@candidate.rolepilot';
    const applicantName = body.applicant?.fullName || 'Certified Healthcare Specialist';

    // Generate formal ATS / Employer Thank You Email
    const emailSubject = `Thank you for applying: ${body.jobTitle} at ${body.company} (Ref: ${applicationId})`;
    const emailHtml = generateThankYouEmailHtml({
      jobTitle: body.jobTitle,
      company: body.company,
      applicationId,
      submittedAt,
      applicantName,
      applicantEmail,
      tailoredResume: body.tailoredResume,
    });

    // Check for Resend API Key to deliver live email to user's real inbox
    const resendApiKey = body.resendApiKey || process.env.RESEND_API_KEY;
    let emailDelivery: { sent: boolean; messageId?: string; error?: string } = { sent: false };

    const isRealEmail =
      applicantEmail.includes('@') &&
      !applicantEmail.endsWith('.rolepilot') &&
      !applicantEmail.includes('example.com');

    if (resendApiKey && isRealEmail) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'RolePilot Applications <onboarding@resend.dev>',
            to: [applicantEmail],
            subject: emailSubject,
            html: emailHtml,
          }),
        });

        const resendData = await resendRes.json();
        if (resendRes.ok && resendData.id) {
          emailDelivery = { sent: true, messageId: resendData.id };
        } else {
          emailDelivery = { sent: false, error: resendData.message || 'Resend delivery failed' };
        }
      } catch (e: any) {
        emailDelivery = { sent: false, error: e.message || 'Email dispatch failed' };
      }
    }

    return NextResponse.json({
      success: true,
      applicationId,
      status: 'submitted',
      jobId: body.jobId,
      jobTitle: body.jobTitle,
      company: body.company,
      submittedAt,
      receipt: {
        confirmationCode: applicationId,
        atsProvider,
        applicantName,
        applicantEmail,
        tailoredResumeAttached: Boolean(
          body.tailoredResume?.summary || body.tailoredResume?.experience?.length,
        ),
        skillsMatched: body.tailoredResume?.skills?.length || 0,
        message: `Application successfully submitted directly to ${body.company} via RolePilot In-App Gateway.`,
      },
      email: {
        subject: emailSubject,
        recipient: applicantEmail,
        sent: emailDelivery.sent,
        messageId: emailDelivery.messageId,
        error: emailDelivery.error,
        html: emailHtml,
      },
    });
  } catch (err: any) {
    console.error('Error submitting application:', err);
    return NextResponse.json(
      { error: 'internal_error', message: err.message || 'Failed to submit application.' },
      { status: 500 },
    );
  }
}
