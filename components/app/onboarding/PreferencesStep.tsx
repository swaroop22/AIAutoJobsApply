'use client';

import { TagInput } from '@/components/app/TagInput';
import { SENIORITY_OPTIONS, type WizardState } from './wizard-state';

export function PreferencesStep({
  state,
  update,
  onNext,
  onBack,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  function toggleSeniority(value: WizardState['seniority'][number]) {
    update({
      seniority: state.seniority.includes(value)
        ? state.seniority.filter((v) => v !== value)
        : [...state.seniority, value],
    });
  }

  return (
    <div className="app-card max-w-xl">
      <p className="app-eyebrow">Step 2 of 3</p>
      <h2 className="mt-2 text-xl font-semibold">What are you looking for?</h2>
      <p className="mt-2 text-sm text-ink/70">
        This drives the match score on every job in your feed — nothing here leaves your device.
      </p>

      <label className="mt-5 block text-sm font-medium">Job titles</label>
      <div className="mt-1.5">
        <TagInput
          values={state.titles}
          onChange={(titles) => update({ titles })}
          placeholder="e.g. Product Designer, press Enter"
        />
      </div>

      <label className="mt-4 block text-sm font-medium">Locations</label>
      <div className="mt-1.5">
        <TagInput
          values={state.locations}
          onChange={(locations) => update({ locations })}
          placeholder="e.g. New York, press Enter"
        />
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={state.remoteOnly}
          onChange={(e) => update({ remoteOnly: e.target.checked })}
        />
        Remote only
      </label>

      <p className="mt-5 text-sm font-medium">Seniority</p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {SENIORITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleSeniority(option.value)}
            className="app-badge"
            style={
              state.seniority.includes(option.value)
                ? { background: '#15362b', color: '#ecfdf5' }
                : undefined
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button type="button" className="app-btn-ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" className="app-btn-primary" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  );
}
