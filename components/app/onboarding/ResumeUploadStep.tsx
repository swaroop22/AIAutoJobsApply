'use client';

import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { extractResumeText } from '@/lib/resume-parse/extract-text';
import { parseResumeText, suggestPreferencesFromResume } from '@/lib/resume-parse/structure';
import type { WizardState } from './wizard-state';

export function ResumeUploadStep({
  state,
  update,
  onNext,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
}) {
  const [status, setStatus] = useState<'idle' | 'parsing' | 'done' | 'error'>(
    state.rawText ? 'done' : 'idle',
  );
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus('parsing');
    setError(null);
    try {
      const rawText = await extractResumeText(file);
      const parsed = parseResumeText(rawText);
      const suggestions = suggestPreferencesFromResume(parsed);

      update({
        fileName: file.name,
        rawText,
        fullName: parsed.fullName ?? '',
        email: parsed.email ?? '',
        phone: parsed.phone ?? '',
        summary: parsed.summary ?? '',
        skills: parsed.skills,
        experience: parsed.experience,
        education: parsed.education,
        ...(state.titles.length === 0 && suggestions.titles.length > 0
          ? { titles: suggestions.titles }
          : {}),
        ...(state.seniority.length === 0 && suggestions.seniority.length > 0
          ? { seniority: suggestions.seniority }
          : {}),
      });
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that file.');
      setStatus('error');
    }
  }

  return (
    <div className="app-card max-w-xl">
      <p className="app-eyebrow">Step 1 of 3</p>
      <h2 className="mt-2 text-xl font-semibold">Upload your résumé</h2>
      <p className="mt-2 text-sm text-ink/70">
        PDF, DOCX, or TXT. It's parsed entirely in your browser — the file itself is never
        uploaded anywhere.
      </p>

      <div
        className="mt-5 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-ink/15 px-6 py-10 text-center transition-colors hover:border-ink/30"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
      >
        <UploadCloud size={28} className="text-ink/40" aria-hidden="true" />
        <p className="text-sm text-ink/70">
          {status === 'parsing'
            ? 'Reading your résumé…'
            : state.fileName || 'Drop a file here, or click to choose one'}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {status === 'done' && (
        <div className="mt-5 rounded-xl bg-paper px-4 py-3 text-sm text-ink/70">
          <p>
            Parsed {state.experience.length} role{state.experience.length === 1 ? '' : 's'} and{' '}
            {state.skills.length} skills. You can review and adjust anything on the next screens.
          </p>
          {state.titles.length > 0 && (
            <p className="mt-1.5 text-xs text-ink/60">
              Suggested target role{state.titles.length === 1 ? '' : 's'}:{' '}
              <span className="font-medium text-ink">{state.titles.join(', ')}</span>
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        className="app-btn-primary mt-6 disabled:opacity-40"
        disabled={status !== 'done'}
        onClick={onNext}
      >
        Continue
      </button>
    </div>
  );
}
