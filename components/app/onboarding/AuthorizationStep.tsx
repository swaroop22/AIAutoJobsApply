'use client';

import type { WizardState } from './wizard-state';

export function AuthorizationStep({
  state,
  update,
  onFinish,
  onBack,
  saving,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onFinish: () => void;
  onBack: () => void;
  saving: boolean;
}) {
  return (
    <div className="app-card max-w-xl">
      <p className="app-eyebrow">Step 3 of 3</p>
      <h2 className="mt-2 text-xl font-semibold">Work authorization</h2>
      <p className="mt-2 text-sm text-ink/70">
        Used only to filter out roles that won't work for your situation.
      </p>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Are you authorized to work in your target country?</legend>
        <div className="mt-2 flex gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="workAuthorized"
              checked={state.workAuthorized}
              onChange={() => update({ workAuthorized: true })}
            />
            Yes
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="workAuthorized"
              checked={!state.workAuthorized}
              onChange={() => update({ workAuthorized: false })}
            />
            No
          </label>
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Will you need visa sponsorship?</legend>
        <div className="mt-2 flex gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="visaSponsorshipNeeded"
              checked={state.visaSponsorshipNeeded}
              onChange={() => update({ visaSponsorshipNeeded: true })}
            />
            Yes
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="visaSponsorshipNeeded"
              checked={!state.visaSponsorshipNeeded}
              onChange={() => update({ visaSponsorshipNeeded: false })}
            />
            No
          </label>
        </div>
      </fieldset>

      {state.visaSponsorshipNeeded && (
        <fieldset className="mt-5">
          <legend className="text-sm font-medium">When do you need sponsorship?</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {(
              [
                { value: 'now', label: 'Immediately' },
                { value: 'future', label: 'In the future (e.g. after OPT)' },
                { value: 'both', label: 'Either' },
              ] as const
            ).map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="requiresNowOrFuture"
                  checked={state.requiresNowOrFuture === option.value}
                  onChange={() => update({ requiresNowOrFuture: option.value })}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6 flex gap-3">
        <button type="button" className="app-btn-ghost" onClick={onBack} disabled={saving}>
          Back
        </button>
        <button
          type="button"
          className="app-btn-primary disabled:opacity-40"
          onClick={onFinish}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Finish setup'}
        </button>
      </div>
    </div>
  );
}
