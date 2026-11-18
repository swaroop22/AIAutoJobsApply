import type { ResumeEducation, ResumeExperience, SeniorityLevel } from '@/lib/app-db/types';

export type WizardState = {
  fileName: string;
  rawText: string;
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  titles: string[];
  locations: string[];
  remoteOnly: boolean;
  seniority: SeniorityLevel[];
  workAuthorized: boolean;
  visaSponsorshipNeeded: boolean;
  requiresNowOrFuture: 'now' | 'future' | 'both';
};

export const INITIAL_WIZARD_STATE: WizardState = {
  fileName: '',
  rawText: '',
  fullName: '',
  email: '',
  phone: '',
  summary: '',
  skills: [],
  experience: [],
  education: [],
  titles: [],
  locations: [],
  remoteOnly: false,
  seniority: [],
  workAuthorized: true,
  visaSponsorshipNeeded: false,
  requiresNowOrFuture: 'now',
};

export const SENIORITY_OPTIONS: { value: SeniorityLevel; label: string }[] = [
  { value: 'intern', label: 'Intern' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
  { value: 'staff', label: 'Staff' },
  { value: 'lead', label: 'Lead / Manager' },
];
