'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/app-db';
import type { Preferences, ResumeProfile } from '@/lib/app-db/types';
import { TagInput } from '@/components/app/TagInput';
import { SENIORITY_OPTIONS } from '@/components/app/onboarding/wizard-state';

export default function SettingsPage() {
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    const db = getDb();
    db.profile.get('profile').then((p) => {
      if (!cancelled) setProfile(p ?? null);
    });
    db.preferences.get('preferences').then((p) => {
      if (!cancelled) setPreferences(p ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveProfile() {
    if (!profile) return;
    await getDb().profile.put({ ...profile, updatedAt: new Date().toISOString() });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 1500);
  }

  async function savePreferences() {
    if (!preferences) return;
    await getDb().preferences.put({ ...preferences, updatedAt: new Date().toISOString() });
    setPreferencesSaved(true);
    setTimeout(() => setPreferencesSaved(false), 1500);
  }

  async function handleExport() {
    const db = getDb();
    const [exportedProfile, exportedPreferences, savedJobs, tailoredResumes, applications] =
      await Promise.all([
        db.profile.get('profile'),
        db.preferences.get('preferences'),
        db.savedJobs.toArray(),
        db.tailoredResumes.toArray(),
        db.applications.toArray(),
      ]);
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: exportedProfile ?? null,
      preferences: exportedPreferences ?? null,
      savedJobs,
      tailoredResumes,
      applications,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rolepilot-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(file: File) {
    setImportMessage(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const db = getDb();
      if (data.profile) await db.profile.put(data.profile);
      if (data.preferences) await db.preferences.put(data.preferences);
      if (Array.isArray(data.savedJobs)) await db.savedJobs.bulkPut(data.savedJobs);
      if (Array.isArray(data.tailoredResumes)) await db.tailoredResumes.bulkPut(data.tailoredResumes);
      if (Array.isArray(data.applications)) await db.applications.bulkPut(data.applications);
      setImportMessage('Data imported.');
      const [p, prefs] = await Promise.all([db.profile.get('profile'), db.preferences.get('preferences')]);
      setProfile(p ?? null);
      setPreferences(prefs ?? null);
    } catch {
      setImportMessage("Couldn't read that file — make sure it's an RolePilot export.");
    }
  }

  async function handleClearAll() {
    if (!window.confirm('This permanently deletes everything stored in this browser — résumé, preferences, saved jobs, and your tracker. This cannot be undone. Continue?')) {
      return;
    }
    const db = getDb();
    await Promise.all([
      db.profile.clear(),
      db.preferences.clear(),
      db.savedJobs.clear(),
      db.tailoredResumes.clear(),
      db.applications.clear(),
    ]);
    setProfile(null);
    setPreferences(null);
  }

  if (!profile) {
    return (
      <div className="app-card max-w-xl">
        <p className="app-eyebrow">Settings</p>
        <h2 className="mt-2 text-xl font-semibold">No data yet</h2>
        <p className="mt-2 text-sm text-ink/70">
          Finish onboarding first, then come back here to edit your profile or manage your data.
        </p>
        <Link href="/app/onboarding" className="app-btn-primary mt-4">
          Start onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="app-card max-w-2xl">
        <p className="app-eyebrow">Profile</p>
        <h2 className="mt-2 text-lg font-semibold">Contact &amp; summary</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            value={profile.fullName ?? ''}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            placeholder="Full name"
            className="rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-ink/30"
          />
          <input
            value={profile.email ?? ''}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            placeholder="Email"
            className="rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-ink/30"
          />
          <input
            value={profile.phone ?? ''}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="Phone"
            className="rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-ink/30 sm:col-span-2"
          />
        </div>
        <textarea
          value={profile.summary ?? ''}
          onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
          placeholder="Summary"
          rows={3}
          className="mt-3 w-full resize-none rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-ink/30"
        />
        <p className="mt-4 text-xs font-medium text-ink/60">Skills</p>
        <div className="mt-1">
          <TagInput
            values={profile.skills}
            onChange={(skills) => setProfile({ ...profile, skills })}
            placeholder="Add a skill and press Enter"
          />
        </div>

        {profile.experience.length > 0 && (
          <div className="mt-5 border-t border-ink/10 pt-4">
            <p className="text-xs font-medium text-ink/60">
              Experience &amp; education are parsed from your résumé. Re-run onboarding with an
              updated file to replace them.
            </p>
            <div className="mt-3 flex flex-col gap-3">
              {profile.experience.map((exp) => (
                <div key={exp.id} className="rounded-xl border border-ink/10 px-4 py-3">
                  <p className="text-sm font-medium">
                    {exp.title} · {exp.company}
                  </p>
                  <p className="mt-1 text-xs text-ink/50">{exp.bullets.length} bullet points</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="button" className="app-btn-primary mt-5 disabled:opacity-60" onClick={saveProfile}>
          {profileSaved ? 'Saved' : 'Save profile'}
        </button>
      </div>

      {preferences && (
        <div className="app-card max-w-2xl">
          <p className="app-eyebrow">Job preferences</p>
          <h2 className="mt-2 text-lg font-semibold">What you&apos;re looking for</h2>

          <p className="mt-4 text-xs font-medium text-ink/60">Titles</p>
          <TagInput
            values={preferences.titles}
            onChange={(titles) => setPreferences({ ...preferences, titles })}
            placeholder="e.g. Software Engineer"
          />

          <p className="mt-4 text-xs font-medium text-ink/60">Locations</p>
          <TagInput
            values={preferences.locations}
            onChange={(locations) => setPreferences({ ...preferences, locations })}
            placeholder="e.g. New York, NY"
          />

          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={preferences.remoteOnly}
              onChange={(e) => setPreferences({ ...preferences, remoteOnly: e.target.checked })}
            />
            Remote only
          </label>

          <p className="mt-4 text-xs font-medium text-ink/60">Seniority</p>
          <div className="mt-1 flex flex-wrap gap-3">
            {SENIORITY_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={preferences.seniority.includes(opt.value)}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      seniority: e.target.checked
                        ? [...preferences.seniority, opt.value]
                        : preferences.seniority.filter((s) => s !== opt.value),
                    })
                  }
                />
                {opt.label}
              </label>
            ))}
          </div>

          <div className="mt-4 border-t border-ink/10 pt-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={preferences.workAuthorized}
                onChange={(e) => setPreferences({ ...preferences, workAuthorized: e.target.checked })}
              />
              I&apos;m authorized to work in my target locations without sponsorship
            </label>
            {!preferences.workAuthorized && (
              <>
                <label className="mt-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={preferences.visaSponsorshipNeeded}
                    onChange={(e) =>
                      setPreferences({ ...preferences, visaSponsorshipNeeded: e.target.checked })
                    }
                  />
                  I&apos;ll need visa sponsorship
                </label>
                <select
                  value={preferences.requiresNowOrFuture}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      requiresNowOrFuture: e.target.value as Preferences['requiresNowOrFuture'],
                    })
                  }
                  className="mt-2 rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm outline-none"
                >
                  <option value="now">Need sponsorship now</option>
                  <option value="future">Will need it in the future</option>
                  <option value="both">Now or in the future</option>
                </select>
              </>
            )}
          </div>

          <button type="button" className="app-btn-primary mt-5" onClick={savePreferences}>
            {preferencesSaved ? 'Saved' : 'Save preferences'}
          </button>
        </div>
      )}

      <div className="app-card max-w-2xl">
        <p className="app-eyebrow">Your data</p>
        <h2 className="mt-2 text-lg font-semibold">Export, import, or clear everything</h2>
        <p className="mt-2 text-sm text-ink/70">
          Everything is stored only in this browser. Export a backup before clearing your browser
          data, switching devices, or just to keep a copy.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="app-btn-primary" onClick={handleExport}>
            Export my data
          </button>
          <button type="button" className="app-btn-ghost" onClick={() => fileInputRef.current?.click()}>
            Import data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className="app-btn-ghost border-red-200 text-red-600 hover:border-red-400"
            onClick={handleClearAll}
          >
            Clear all data
          </button>
        </div>
        {importMessage && <p className="mt-3 text-sm text-ink/70">{importMessage}</p>}
      </div>
    </div>
  );
}
