export type EmailTemplateParams = {
  jobTitle: string;
  company: string;
  applicationId: string;
  submittedAt: string;
  applicantName: string;
  applicantEmail: string;
  tailoredResume?: {
    summary?: string;
    skills?: string[];
    experience?: any[];
  };
};

export function generateThankYouEmailHtml(params: EmailTemplateParams): string {
  const dateFormatted = new Date(params.submittedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const skillsList = (params.tailoredResume?.skills || [
    'ICD-10-CM / PCS',
    'CPT / HCPCS',
    'Medical Coding & Records',
    'HIM Compliance',
  ])
    .slice(0, 8)
    .map((s) => `<span style="display:inline-block;background:#f1f5f9;color:#334155;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:600;margin:3px 4px 3px 0;">${s}</span>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Application Received: ${params.jobTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;line-height:1.6;">
  <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Header Banner -->
    <div style="background:#15362b;padding:32px 36px;color:#ffffff;">
      <div style="display:inline-block;background:rgba(255,255,255,0.15);padding:6px 12px;border-radius:20px;font-size:11px;font-weight:bold;letter-spacing:0.5px;text-transform:uppercase;color:#a7f3d0;margin-bottom:12px;">
        Official Application Confirmation
      </div>
      <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">
        Thank You for Applying
      </h1>
      <p style="margin:6px 0 0 0;font-size:14px;color:#cbd5e1;">
        Your application for <strong>${params.jobTitle}</strong> at <strong>${params.company}</strong> has been received.
      </p>
    </div>

    <!-- Main Content -->
    <div style="padding:32px 36px;">
      <p style="font-size:15px;color:#334155;margin:0 0 18px 0;">
        Dear <strong>${params.applicantName}</strong>,
      </p>
      <p style="font-size:14px;color:#475569;margin:0 0 20px 0;">
        Thank you for your interest in joining <strong>${params.company}</strong>. We have officially recorded your application packet and tailored résumé in our candidate tracking database.
      </p>

      <!-- Receipt Box -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:24px 0;">
        <div style="font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;color:#166534;margin-bottom:12px;">
          Submission Receipt
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr>
            <td style="padding:4px 0;color:#64748b;font-weight:600;width:40%;">Confirmation Code:</td>
            <td style="padding:4px 0;color:#0f172a;font-weight:bold;font-family:monospace;">${params.applicationId}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#64748b;font-weight:600;">Position Applied:</td>
            <td style="padding:4px 0;color:#0f172a;font-weight:600;">${params.jobTitle}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#64748b;font-weight:600;">Organization:</td>
            <td style="padding:4px 0;color:#0f172a;font-weight:600;">${params.company}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#64748b;font-weight:600;">Date Submitted:</td>
            <td style="padding:4px 0;color:#0f172a;">${dateFormatted}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#64748b;font-weight:600;">Applicant Email:</td>
            <td style="padding:4px 0;color:#0f172a;">${params.applicantEmail}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#64748b;font-weight:600;">Work Authorization:</td>
            <td style="padding:4px 0;color:#166534;font-weight:bold;">Authorized to work in US</td>
          </tr>
        </table>
      </div>

      <!-- Tailored Summary & Core Skills -->
      ${
        params.tailoredResume?.summary
          ? `
      <div style="margin:24px 0;">
        <h3 style="font-size:14px;font-weight:700;color:#1e293b;margin:0 0 8px 0;">
          Submitted Professional Profile &amp; Summary:
        </h3>
        <p style="font-size:13px;color:#475569;background:#f8fafc;border-left:3px solid #059669;padding:12px 14px;border-radius:4px;margin:0;font-style:italic;">
          &ldquo;${params.tailoredResume.summary}&rdquo;
        </p>
      </div>`
          : ''
      }

      <div style="margin:20px 0;">
        <h3 style="font-size:13px;font-weight:700;color:#1e293b;margin:0 0 8px 0;">
          Verified Clinical &amp; Coding Competencies:
        </h3>
        <div>${skillsList}</div>
      </div>

      <!-- Next Steps -->
      <div style="border-top:1px solid #e2e8f0;padding-top:20px;margin-top:28px;">
        <h3 style="font-size:14px;font-weight:700;color:#1e293b;margin:0 0 6px 0;">
          What Happens Next?
        </h3>
        <p style="font-size:13px;color:#64748b;margin:0 0 16px 0;">
          Our Talent Acquisition and Clinical Documentation team will review your qualifications against departmental staffing requirements. If your background matches our criteria, a recruiter will reach out to schedule an initial interview.
        </p>
      </div>

      <!-- Action Button -->
      <div style="text-align:center;margin:30px 0 10px 0;">
        <a href="http://localhost:3000/app/tracker" style="display:inline-block;background:#15362b;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:12px 28px;border-radius:24px;box-shadow:0 2px 6px rgba(0,0,0,0.15);">
          View in Application Tracker &rarr;
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 36px;text-align:center;font-size:11px;color:#94a3b8;">
      <p style="margin:0 0 4px 0;">
        This is an official application confirmation dispatched via RolePilot Application Gateway for ${params.company}.
      </p>
      <p style="margin:0;">
        Keep this email and your reference ID for your application records.
      </p>
    </div>

  </div>
</body>
</html>
`;
}
