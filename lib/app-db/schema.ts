import Dexie, { type Table } from 'dexie';
import type {
  ResumeProfile,
  Preferences,
  SavedJob,
  TailoredResume,
  ApplicationEntry,
} from './types';

export class RolePilotDB extends Dexie {
  profile!: Table<ResumeProfile, string>;
  preferences!: Table<Preferences, string>;
  savedJobs!: Table<SavedJob, string>;
  tailoredResumes!: Table<TailoredResume, string>;
  applications!: Table<ApplicationEntry, string>;

  constructor() {
    super('rolepilot');
    this.version(1).stores({
      profile: 'id',
      preferences: 'id',
      savedJobs: 'id, savedAt',
      tailoredResumes: 'id, jobId',
      applications: 'id, status, updatedAt',
    });
  }
}

let instance: RolePilotDB | undefined;

/**
 * Dexie opens IndexedDB at construction time, which doesn't exist during
 * Next.js server rendering. Only ever call this from inside an effect or
 * an event handler, never from render-body or module scope.
 */
export function getDb(): RolePilotDB {
  if (typeof window === 'undefined') {
    throw new Error('getDb() can only be called in the browser');
  }
  if (!instance) {
    instance = new RolePilotDB();
  }
  return instance;
}
