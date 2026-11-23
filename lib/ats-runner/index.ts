import type { ATSRunnerInput, ATSRunnerResult } from './types';
import { runGreenhouseApply } from './greenhouse';
import { runLeverApply } from './lever';
import { runWorkdayApply } from './workday';

export async function executeAutonomousApply(input: ATSRunnerInput): Promise<ATSRunnerResult> {
  const url = (input.applyUrl || '').toLowerCase();

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
