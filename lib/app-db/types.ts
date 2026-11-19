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

export type Preferences = {
  id: 'preferences';
  titles: string[];
  locations: string[];
  remoteOnly: boolean;
  seniority: SeniorityLevel[];
  visaSponsorshipNeeded: boolean;
  workAuthorized: boolean;
  requiresNowOrFuture: 'now' | 'future' | 'both';
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
};
