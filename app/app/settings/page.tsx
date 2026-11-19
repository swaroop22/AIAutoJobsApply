'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Mail, Check, AlertCircle, Sparkles, Send, ExternalLink, ShieldCheck } from 'lucide-react';
import { getDb } from '@/lib/app-db';
import type { Preferences, ResumeProfile } from '@/lib/app-db/types';
import { TagInput } from '@/components/app/TagInput';
import { SENIORITY_OPTIONS } from '@/components/app/onboarding/wizard-state';

export default function SettingsPage() {
  const [profile, setProfile] = useState<ResumeProfile>({
    id: 'profile',
    rawText: '',
    fileName: 'manual-profile.txt',
    fullName: '',
    email: '',
    phone: '',
    summary: '',
    experience: [],
    education: [],
    skills: ['Medical Coding', 'ICD-10', 'HIM'],
    updatedAt: new Date().toISOString(),
  });

  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email delivery state
  const [resendApiKey, setResendApiKey] = useState('');
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testEmailMsg, setTestEmailMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    const db = getDb();
    db.profile.get('profile').then((p) => {
      if (!cancelled && p) setProfile(p);
    });
    db.preferences.get('preferences').then((p) => {
      if (!cancelled && p) setPreferences(p);
    });

    try {
      const storedKey = localStorage.getItem('rolepilot_resend_api_key');
      if (storedKey) setResendApiKey(storedKey);
    } catch {
      // ignore
    }

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveProfile() {
    const db = getDb();
    const updated = { ...profile, updatedAt: new Date().toISOString() };
    await db.profile.put(updated);
    try {
      localStorage.setItem('rolepilot_autofill_profile', JSON.stringify({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        workAuthorized: preferences?.workAuthorized ?? true,
      }));
    } catch {
      // ignore
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  async function savePreferences() {
    if (!preferences) return;
    await getDb().preferences.put({ ...preferences, updatedAt: new Date().toISOString() });
    setPreferencesSaved(true);
    setTimeout(() => setPreferencesSaved(false), 2000);
  }

  function handleSaveResendKey(key: string) {
    setResendApiKey(key);
    try {
      localStorage.setItem('rolepilot_resend_api_key', key.trim());
    } catch {
      // ignore
    }
  }

  async function handleSendTestEmail() {
    if (!profile.email || !profile.email.includes('@')) {
      setTestEmailStatus('error');
      setTestEmailMsg('Please enter a valid email address in your profile first.');
      return;
    }

    setTestEmailStatus('sending');
    setTestEmailMsg('');

    try {
      const res = await fetch('/api/apply/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: 'test-cleveland-clinic-coder',
          jobTitle: 'HIM Coder II - Hospital Inpatient & Surgical Coding',
          company: 'Cleveland Clinic',
          provider: 'custom',
          resendApiKey: resendApiKey.trim() || undefined,
          applicant: {
            fullName: profile.fullName || 'Candidate',
            email: profile.email,
            phone: profile.phone || '(555) 234-5678',
            workAuthorized: true,
          },
          tailoredResume: {
            summary: profile.summary || 'Certified medical coding specialist with acute care documentation expertise.',
            skills: profile.skills,
            experience: profile.experience,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.email?.sent) {
          setTestEmailStatus('success');
          setTestEmailMsg(`✓ Live confirmation email delivered to ${profile.email}! Check your inbox.`);
        } else if (data.email?.error) {
          setTestEmailStatus('error');
          setTestEmailMsg(`Delivery note: ${data.email.error}. To send live emails, enter a Resend API key below.`);
        } else {
          setTestEmailStatus('success');
          setTestEmailMsg(`✓ Confirmation email generated for ${profile.email}. Add a Resend API key below for live inbox dispatch.`);
        }
      } else {
        setTestEmailStatus('error');
        setTestEmailMsg(data.message || 'Could not dispatch test email.');
      }
    } catch (err: any) {
      setTestEmailStatus('error');
      setTestEmailMsg(err.message || 'Error sending email.');
    }
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
      if (p) setProfile(p);
      setPreferences(prefs ?? null);
    } catch {
      setImportMessage("Couldn't read that file — make sure it's a RolePilot export.");
    }
  }

  async function handleClearAll() {
    if (
      !window.confirm(
        'This permanently deletes everything stored in this browser — résumé, preferences, saved jobs, and your tracker. Continue?'
      )
    ) {
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
    setProfile({
      id: 'profile',
      rawText: '',
      fileName: 'manual-profile.txt',
      fullName: '',
      email: '',
      phone: '',
      summary: '',
      experience: [],
      education: [],
      skills: [],
      updatedAt: new Date().toISOString(),
    });
    setPreferences(null);
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl pb-16">
      {/* 1. Candidate Contact & Identity */}
      <div className="app-card">
        <p className="app-eyebrow">Applicant Profile</p>
        <h2 className="mt-1 text-xl font-bold text-ink">Personal Information &amp; Contact</h2>
        <p className="mt-0.5 text-xs text-ink/60">
          Used to auto-fill applications and deliver &quot;Thank you for applying&quot; confirmation emails.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-ink/70 mb-1">Full Name *</label>
            <input
              value={profile.fullName ?? ''}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              placeholder="e.g. Sarah Jenkins"
              className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-ink/40"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink/70 mb-1">Personal Email (for Confirmation Receipts) *</label>
            <input
              type="email"
              value={profile.email ?? ''}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="yourname@gmail.com"
              className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-ink/40"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink/70 mb-1">Phone Number</label>
            <input
              type="tel"
              value={profile.phone ?? ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="(555) 234-5678"
              className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-ink/40"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-bold text-ink/70 mb-1">Professional Summary</label>
          <textarea
            value={profile.summary ?? ''}
            onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
            placeholder="Certified Medical Coder specializing in inpatient/outpatient hospital documentation, ICD-10-CM/PCS, and CPT guidelines."
            rows={3}
            className="w-full resize-none rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-ink/40"
          />
        </div>

        <div className="mt-4">
          <label className="block text-xs font-bold text-ink/70 mb-1">Skills &amp; Certifications</label>
          <TagInput
            values={profile.skills}
            onChange={(skills) => setProfile({ ...profile, skills })}
            placeholder="Add skill (e.g. CCS, CPC, ICD-10, Epic) and press Enter"
          />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-ink/85 transition"
            onClick={saveProfile}
          >
            {profileSaved ? (
              <>
                <Check size={14} />
                <span>Profile Saved!</span>
              </>
            ) : (
              <span>Save Contact Profile</span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Outbound Confirmation Emails Section */}
      <div className="app-card border-2 border-emerald-500/20 bg-emerald-50/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm">
              <Mail size={18} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Application Confirmation Emails</h2>
              <p className="text-xs text-ink/65">
                Automatically delivers &quot;Thank you for applying&quot; emails to your inbox upon submission.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-white p-4 border border-emerald-200/60 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-ink">Recipient Email Address:</p>
              <p className="font-mono text-emerald-800 font-semibold mt-0.5">
                {profile.email || '(No email set yet — please enter your email above)'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={testEmailStatus === 'sending'}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition disabled:opacity-60 cursor-pointer shrink-0"
            >
              <Send size={13} />
              <span>{testEmailStatus === 'sending' ? 'Sending…' : 'Send Test Confirmation Email'}</span>
            </button>
          </div>

          {testEmailMsg && (
            <div
              className={`mt-3 rounded-lg p-3 text-xs font-medium ${
                testEmailStatus === 'success'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}
            >
              {testEmailMsg}
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-xs font-bold text-ink/75 mb-1">
            Resend API Key (Optional for Direct Cloud Dispatch):
          </label>
          <input
            type="password"
            value={resendApiKey}
            onChange={(e) => handleSaveResendKey(e.target.value)}
            placeholder="re_123456789..."
            className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-xs font-mono text-ink outline-none focus:border-ink/40"
          />
          <p className="mt-1 text-[11px] text-ink/50">
            Leave blank to use RolePilot&apos;s built-in gateway, or provide your Resend key from{' '}
            <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-accent underline">
              resend.com
            </a>{' '}
            for high-priority direct delivery.
          </p>
        </div>
      </div>

      {/* 3. RolePilot Chrome Extension & Workday Auto-Fill */}
      <div className="app-card">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white font-bold text-sm">
            <Sparkles size={18} className="text-amber-300" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">RolePilot Chrome Extension (Live Workday Auto-Fill)</h2>
            <p className="text-xs text-ink/65">
              Fills real hospital application forms on Workday, Taleo, iCIMS, and Greenhouse in 1-click.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-ink/10 text-xs text-ink/80 flex flex-col gap-2">
          <p className="font-bold text-ink">How to install in Chrome in 15 seconds:</p>
          <ol className="list-decimal pl-5 space-y-1.5 text-ink/70">
            <li>
              Open Chrome and go to <code className="bg-white px-2 py-0.5 rounded border border-ink/15 font-mono">chrome://extensions/</code>
            </li>
            <li>Turn on <strong>Developer mode</strong> (switch in top right corner).</li>
            <li>Click <strong>Load unpacked</strong>.</li>
            <li>
              Select the extension folder:{' '}
              <span className="font-mono bg-white px-1.5 py-0.5 rounded border text-[11px] select-all">
                AIAutoJobsApply/extension
              </span>
            </li>
            <li>
              Done! Whenever you visit any Workday or hospital career portal, the floating{' '}
              <strong>⚡ RolePilot Autofill</strong> button appears automatically to fill your entire application!
            </li>
          </ol>
        </div>
      </div>

      {/* 4. Job Preferences */}
      {preferences && (
        <div className="app-card">
          <p className="app-eyebrow">Job preferences</p>
          <h2 className="mt-1 text-lg font-bold text-ink">Target Roles &amp; Work Authorization</h2>

          <div className="mt-4">
            <label className="block text-xs font-bold text-ink/70 mb-1">Target Titles</label>
            <TagInput
              values={preferences.titles}
              onChange={(titles) => setPreferences({ ...preferences, titles })}
              placeholder="e.g. Medical Coder, HIM Specialist"
            />
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-ink/70 mb-1">Target Locations</label>
            <TagInput
              values={preferences.locations}
              onChange={(locations) => setPreferences({ ...preferences, locations })}
              placeholder="e.g. Remote, Topeka, KS"
            />
          </div>

          <label className="mt-4 flex items-center gap-2 text-xs font-bold text-ink/80 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.remoteOnly}
              onChange={(e) => setPreferences({ ...preferences, remoteOnly: e.target.checked })}
              className="rounded border-ink/30 text-ink focus:ring-ink"
            />
            <span>Remote positions only</span>
          </label>

          <div className="mt-4 border-t border-ink/10 pt-4">
            <label className="flex items-center gap-2 text-xs font-bold text-ink/80 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.workAuthorized}
                onChange={(e) => setPreferences({ ...preferences, workAuthorized: e.target.checked })}
                className="rounded border-ink/30 text-ink focus:ring-ink"
              />
              <span>I am legally authorized to work in the United States without sponsorship</span>
            </label>
          </div>

          <div className="mt-5">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-ink/85 transition"
              onClick={savePreferences}
            >
              {preferencesSaved ? 'Preferences Saved!' : 'Save Job Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* 5. Data Management / Export */}
      <div className="app-card">
        <p className="app-eyebrow">Data &amp; Privacy</p>
        <h2 className="mt-1 text-lg font-bold text-ink">Export or Reset</h2>
        <p className="mt-0.5 text-xs text-ink/60">
          RolePilot runs locally in your browser. All your data stays private on your machine.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl border border-ink/20 bg-white px-4 py-2.5 text-xs font-semibold text-ink hover:bg-black/5 transition"
            onClick={handleExport}
          >
            Export all data (JSON)
          </button>
          <button
            type="button"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
            onClick={handleClearAll}
          >
            Clear all local data
          </button>
        </div>
      </div>
    </div>
  );
}
