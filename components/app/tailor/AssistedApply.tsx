'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { Preferences, ResumeProfile } from '@/lib/app-db/types';

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white px-4 py-2.5">
      <div>
        <p className="text-xs text-ink/50">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
      <button
        type="button"
        className="app-btn-ghost !px-3 !py-1.5"
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}

export function AssistedApply({
  profile,
  preferences,
}: {
  profile: ResumeProfile;
  preferences: Preferences | null;
}) {
  const authAnswer = preferences
    ? preferences.workAuthorized
      ? 'Yes, I am authorized to work without sponsorship.'
      : preferences.visaSponsorshipNeeded
        ? `No, I will require visa sponsorship (${
            preferences.requiresNowOrFuture === 'now'
              ? 'immediately'
              : preferences.requiresNowOrFuture === 'future'
                ? 'in the future'
                : 'now or in the future'
          }).`
        : 'No, I am not currently authorized to work in this location.'
    : '';

  return (
    <div className="mt-6 border-t border-ink/10 pt-6">
      <h3 className="text-lg font-semibold">Assisted apply</h3>
      <p className="mt-1 text-xs text-ink/50">
        Copy these into the employer&apos;s application form — we never submit anything on your behalf.
      </p>
      <div className="mt-4 flex max-w-md flex-col gap-2">
        <CopyField label="Full name" value={profile.fullName ?? ''} />
        <CopyField label="Email" value={profile.email ?? ''} />
        <CopyField label="Phone" value={profile.phone ?? ''} />
        <CopyField label="Work authorization" value={authAnswer} />
      </div>
    </div>
  );
}
