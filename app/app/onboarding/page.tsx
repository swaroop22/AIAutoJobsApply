'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDb } from '@/lib/app-db';
import { ResumeUploadStep } from '@/components/app/onboarding/ResumeUploadStep';
import { PreferencesStep } from '@/components/app/onboarding/PreferencesStep';
import { AuthorizationStep } from '@/components/app/onboarding/AuthorizationStep';
import { INITIAL_WIZARD_STATE, type WizardState } from '@/components/app/onboarding/wizard-state';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL_WIZARD_STATE);
  const [saving, setSaving] = useState(false);

  function update(patch: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  async function handleFinish() {
    setSaving(true);
    const now = new Date().toISOString();
    const db = getDb();
    await db.profile.put({
      id: 'profile',
      rawText: state.rawText,
      fileName: state.fileName,
      fullName: state.fullName || undefined,
      email: state.email || undefined,
      phone: state.phone || undefined,
      summary: state.summary || undefined,
      experience: state.experience,
      education: state.education,
      skills: state.skills,
      updatedAt: now,
    });
    await db.preferences.put({
      id: 'preferences',
      titles: state.titles,
      locations: state.locations,
      remoteOnly: state.remoteOnly,
      seniority: state.seniority,
      visaSponsorshipNeeded: state.visaSponsorshipNeeded,
      workAuthorized: state.workAuthorized,
      requiresNowOrFuture: state.requiresNowOrFuture,
      updatedAt: now,
    });
    router.push('/app');
  }

  if (step === 0) {
    return (
      <ResumeUploadStep state={state} update={update} onNext={() => setStep(1)} />
    );
  }
  if (step === 1) {
    return (
      <PreferencesStep
        state={state}
        update={update}
        onNext={() => setStep(2)}
        onBack={() => setStep(0)}
      />
    );
  }
  return (
    <AuthorizationStep
      state={state}
      update={update}
      onFinish={handleFinish}
      onBack={() => setStep(1)}
      saving={saving}
    />
  );
}
