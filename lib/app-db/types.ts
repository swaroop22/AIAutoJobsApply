export type ResumeExperience = {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
};

export type ResumeEducation = {
  id: string;
  school: string;
  degree?: string;
  startDate?: string;
  endDate?: string;
};

export type ResumeProfile = {
  id: 'profile';
  rawText: string;
  fileName: string;
  fullName?: string;
  email?: string;
  phone?: string;
  summary?: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  updatedAt: string;
};

export type SeniorityLevel = 'intern' | 'junior' | 'mid' | 'senior' | 'staff' | 'lead';

export type TailoringMode = 'off' | 'honest' | 'enhanced';

export type Preferences = {
  id: 'preferences';
  titles: string[];
  locations: string[];
  remoteOnly: boolean;
  seniority: SeniorityLevel[];
  visaSponsorshipNeeded: boolean;
  workAuthorized: boolean;
  requiresNowOrFuture: 'now' | 'future' | 'both';
  tailoringMode?: TailoringMode;
  autoApproveResume?: boolean;
  reviewBeforeSubmit?: boolean;
  updatedAt: string;
};

export type JobProvider = 'greenhouse' | 'lever' | 'ashby' | 'workday' | 'custom';

export type JobPosting = {
  id: string;
  provider: JobProvider;
  boardSlug: string;
  externalId: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  descriptionHtml: string;
  descriptionText: string;
  applyUrl: string;
  postedAt?: string;
};

export type SavedJob = JobPosting & {
  savedAt: string;
  fitScore?: number;
  sponsorshipSignal?: 'positive' | 'negative' | 'unclear';
};

export type TailoredResume = {
  id: string;
  jobId: string;
  summary: string;
  experience: ResumeExperience[];
  skills: string[];
  createdAt: string;
};

export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

export type FormFieldAudit = {
  section: string; // 'Work Experience' | 'Education' | 'Application Questions' | 'Acknowledgements'
  question: string;
  answer: string | boolean | number;
  fieldType: 'radio' | 'text' | 'select' | 'checkbox';
  submittedAt: string;
};

export type UserMemoryItem = {
  id: string;
  category: 'general' | 'compensation' | 'work_auth' | 'education' | 'experience' | 'custom';
  prompt: string;
  assertion: string;
  scope: 'all' | 'resumes_only' | 'applications_only';
  createdAt: string;
  updatedAt: string;
};

export type ApplicationEntry = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  notes: string;
  savedAt: string;
  appliedAt?: string;
  updatedAt: string;
  receiptNumber?: string;
  submittedAnswers?: FormFieldAudit[];
  tailoringMode?: TailoringMode;
  proxyEmail?: string;
  confirmationSent?: boolean;
  actionRequiredReason?: string;
  finishUrl?: string;
  externalConfirmationUrl?: string;
  atsProvider?: string;
};
