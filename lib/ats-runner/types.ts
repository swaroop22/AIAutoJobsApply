export type ATSRunnerApplicant = {
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  workAuthorized: boolean;
  sponsorshipNeeded: boolean;
  desiredSalary?: string;
  summary?: string;
  skills?: string[];
  experience?: any[];
  education?: any[];
  memories?: Array<{ prompt: string; assertion: string }>;
};

export type ATSRunnerInput = {
  jobId: string;
  jobTitle: string;
  company: string;
  applyUrl: string;
  applicant: ATSRunnerApplicant;
  tailoredResumeText?: string;
  tailoredPdfBuffer?: Buffer;
  tailoringMode?: 'honest' | 'enhanced' | 'off';
  dryRun?: boolean; // if true, fills fields but does not click final submit
};

export type ATSRunnerStatus = 'submitted' | 'needs_you' | 'account_required' | 'failed';

export type ATSRunnerResult = {
  success: boolean;
  status: ATSRunnerStatus;
  atsProvider: 'greenhouse' | 'lever' | 'ashby' | 'workday' | 'hospital_portal' | 'custom';
  confirmationCode?: string;
  externalConfirmationUrl?: string;
  screenshotUri?: string;
  fieldsFilled: Array<{ field: string; value: string; section?: string }>;
  message: string;
  actionRequiredReason?: string;
  finishUrl?: string;
};
