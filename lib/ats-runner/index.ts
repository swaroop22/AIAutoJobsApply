import type { ATSRunnerInput, ATSRunnerResult } from './types';
import { runGreenhouseApply } from './greenhouse';
import { runLeverApply } from './lever';
import { runWorkdayApply } from './workday';

export async function executeAutonomousApply(input: ATSRunnerInput): Promise<ATSRunnerResult> {
  const url = (input.applyUrl || '').toLowerCase();
  const company = (input.company || '').toLowerCase();

  // Alaska Native Tribal Health Consortium (Infor CloudSuite / Lawson Candidate Self-Service)
  if (url.includes('anthc.org') || url.includes('inforcloudsuite.com') || company.includes('alaska native')) {
    const directPortalUrl =
      'https://css-anthc-prd.inforcloudsuite.com:443/hcm/Jobs/navigation/JobBoard(1000,ANTHCEXTERNAL).JobSearchCompositeFormNav?csk.HROrganization=1000&csk.JobBoard=ANTHCEXTERNAL&web10x=true';

    return {
      success: false,
      status: 'account_required',
      atsProvider: 'hospital_portal',
      finishUrl: directPortalUrl,
      actionRequiredReason: 'Alaska Native Tribal Health Consortium requires an active candidate account on their Infor CloudSuite portal.',
      fieldsFilled: [
        { field: 'Candidate Full Name', value: input.applicant.fullName, section: 'Personal Information' },
        { field: 'Email Address', value: input.applicant.email, section: 'Personal Information' },
        { field: 'Phone Number', value: input.applicant.phone, section: 'Personal Information' },
        { field: 'Work Authorization', value: input.applicant.workAuthorized ? 'Authorized' : 'Sponsorship Required', section: 'Compliance' },
        { field: 'Tailored Résumé PDF', value: 'Generated and ready for ATS upload', section: 'Documents' },
      ],
      message: 'Infor CloudSuite candidate account required. Direct job board link prepared.',
    };
  }

  if (url.includes('greenhouse.io')) {
    return runGreenhouseApply(input);
  }

  if (url.includes('jobs.lever.co') || url.includes('lever.co')) {
    return runLeverApply(input);
  }

  if (url.includes('myworkdayjobs.com') || url.includes('workday.com')) {
    return runWorkdayApply(input);
  }

  // Fallback for hospital portals and other ATSs: try standard form fill
  return runGreenhouseApply(input);
}

export * from './types';
