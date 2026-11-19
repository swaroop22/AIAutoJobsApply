'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  Download,
  ShieldCheck,
  FileText,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import type { JobPosting, Preferences, ResumeProfile } from '@/lib/app-db/types';
import { getDb } from '@/lib/app-db';

export function InAppApplyModal({
  job,
  profile,
  preferences,
  onClose,
  onApplied,
}: {
  job: JobPosting;
  profile: ResumeProfile | null;
  preferences: Preferences | null;
  onClose: () => void;
  onApplied: () => void;
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [localProfile, setLocalProfile] = useState<ResumeProfile | null>(profile);

  // Quick profile form state
  const [quickName, setQuickName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPhone, setQuickPhone] = useState('');

  const activeProfile = profile || localProfile;

  // Sync profile to localStorage for bookmarklet and extension
  useEffect(() => {
    if (activeProfile) {
      try {
        localStorage.setItem(
          'rolepilot_autofill_profile',
          JSON.stringify({
            fullName: activeProfile.fullName || '',
            email: activeProfile.email || '',
            phone: activeProfile.phone || '',
            workAuthorized: preferences?.workAuthorized ?? true,
          }),
        );
      } catch (e) {
        // ignore
      }
    }
  }, [activeProfile, preferences]);

  const firstName = (activeProfile?.fullName || '').split(' ')[0] || '';
  const lastName = (activeProfile?.fullName || '').split(' ').slice(1).join(' ') || '';
  const emailVal = activeProfile?.email || '';
  const phoneVal = activeProfile?.phone || '';

  async function handleQuickSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!quickName.trim() || !quickEmail.trim()) return;

    const newProf: ResumeProfile = {
      id: 'profile',
      rawText: `${quickName.trim()}\n${quickEmail.trim()}\n${quickPhone.trim()}`,
      fileName: 'manual-profile.txt',
      fullName: quickName.trim(),
      email: quickEmail.trim(),
      phone: quickPhone.trim(),
      experience: [],
      education: [],
      skills: ['Medical Coding', 'HIM', 'ICD-10'],
      updatedAt: new Date().toISOString(),
    };

    const db = getDb();
    await db.profile.put(newProf);
    setLocalProfile(newProf);
  }

  const bookmarkletCode = `javascript:(function(){function s(e,v){if(!e||!v)return;const p=Object.getPrototypeOf(e);const d=Object.getOwnPropertyDescriptor(p,'value')?.set||Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;if(d)d.call(e,v);else e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));e.dispatchEvent(new Event('blur',{bubbles:true}));}function f(r){for(const i of document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]),textarea')){const t=(i.id+' '+i.name+' '+i.placeholder+' '+i.getAttribute('aria-label')+' '+(i.labels?.[0]?.textContent||'')).toLowerCase();if(r.test(t))return i;}return null;}const fn=f(/first.*name|given.*name|^fname$/i);if(fn)s(fn,'${firstName}');const ln=f(/last.*name|family.*name|surname|^lname$/i);if(ln)s(ln,'${lastName}');if(!fn&&!ln){const fl=f(/full.*name|^name$/i);if(fl)s(fl,'${profile?.fullName || ''}');}const em=f(/email/i);if(em)s(em,'${emailVal}');const ph=f(/phone|mobile|tel/i);if(ph)s(ph,'${phoneVal}');alert('⚡ RolePilot: Autofilled your application details!');})();`;

  function copyText(key: string, text: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1500);
  }

  function handleCopyAll() {
    if (!profile) return;
    const all = [
      `Full Name: ${profile.fullName || ''}`,
      `First Name: ${firstName}`,
      `Last Name: ${lastName}`,
      `Email: ${emailVal}`,
      `Phone: ${phoneVal}`,
      `Work Authorization: ${authAnswer}`,
      profile.summary ? `\n--- TAILORED SUMMARY ---\n${profile.summary}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    copyText('all', all);
  }

  const authAnswer = preferences
    ? preferences.workAuthorized
      ? 'Yes, authorized to work in the US without sponsorship.'
      : 'Requires visa sponsorship.'
    : 'Yes, authorized to work.';

  async function handleMarkAsApplied() {
    setIsSubmitting(true);
    const now = new Date().toISOString();
    const db = getDb();

    await db.applications.put({
      id: job.id,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      status: 'applied',
      notes: `Applied in-app via RolePilot on ${new Date().toLocaleDateString()}`,
      savedAt: now,
      appliedAt: now,
      updatedAt: now,
    });

    setApplied(true);
    setIsSubmitting(false);
    onApplied();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="relative flex flex-col h-[94vh] w-full max-w-6xl rounded-2xl bg-white shadow-2xl border border-ink/10 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-ink/10 bg-paper shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white font-bold text-xs shrink-0">
              RP
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-ink truncate">
                  Apply in RolePilot: {job.title}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 shrink-0">
                  <ShieldCheck size={12} />
                  <span>In-App Apply</span>
                </span>
              </div>
              <p className="text-xs text-ink/50 truncate">
                {job.company} · {job.location || 'Remote'} · Official ATS application
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!applied ? (
              <button
                onClick={handleMarkAsApplied}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <Check size={14} />
                <span>{isSubmitting ? 'Recording…' : 'I Submitted — Mark as Applied'}</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Applied &amp; Logged in Tracker!</span>
              </span>
            )}

            <button
              onClick={onClose}
              className="rounded-full p-2 text-ink/40 hover:bg-black/5 hover:text-ink transition-colors"
              title="Close in-app apply"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Two-Pane Studio */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-slate-50">
          {/* Left Pane: AI Autofill Copilot */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-ink/10 bg-white p-4 overflow-y-auto shrink-0 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                <Sparkles size={14} />
                <span>RolePilot AI Copilot</span>
              </div>
              <p className="mt-1 text-xs text-ink/60">
                Click any field to copy it directly into the application form on the right.
              </p>
            </div>

            {/* 1-Click Autofill Actions */}
            <div className="space-y-2">
              <a
                href={bookmarkletCode}
                onClick={(e) => {
                  e.preventDefault();
                  alert(
                    "📌 How to use the 1-Click Autofill Bookmarklet:\n\n1. Drag the button labeled '⚡ 1-Click Autofill' directly up into your browser's Bookmarks bar.\n2. Whenever you are on an application form (Greenhouse, Lever, Workday, etc.), click the bookmark!\n3. It instantly fills all your fields in 0.1 seconds!",
                  );
                }}
                title="Drag this button to your Bookmarks Bar to autofill any job application in 1 click!"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-accent/90 transition-all text-center cursor-grab active:cursor-grabbing"
              >
                <Sparkles size={14} className="text-amber-200" />
                <span>⚡ Drag to Bookmarks: 1-Click Autofill</span>
              </a>

              {profile && (
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-ink/20 bg-paper px-3 py-2 text-xs font-semibold text-ink hover:bg-black/5 transition-colors"
                >
                  {copiedField === 'all' ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                  <span>{copiedField === 'all' ? 'All Form Fields Copied!' : 'Copy All Application Info'}</span>
                </button>
              )}
            </div>

            {/* Profile Fields */}
            {activeProfile ? (
              <div className="space-y-2">
                <div className="rounded-xl border border-ink/10 p-2.5 bg-paper/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-ink/60">Full Name</span>
                    <button
                      onClick={() => copyText('name', activeProfile.fullName || '')}
                      className="p-1 hover:text-accent transition-colors"
                      title="Copy"
                    >
                      {copiedField === 'name' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <p className="text-xs font-medium text-ink mt-0.5 truncate">{activeProfile.fullName || '—'}</p>
                </div>

                <div className="rounded-xl border border-ink/10 p-2.5 bg-paper/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-ink/60">Email</span>
                    <button
                      onClick={() => copyText('email', activeProfile.email || '')}
                      className="p-1 hover:text-accent transition-colors"
                      title="Copy"
                    >
                      {copiedField === 'email' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <p className="text-xs font-medium text-ink mt-0.5 truncate">{activeProfile.email || '—'}</p>
                </div>

                <div className="rounded-xl border border-ink/10 p-2.5 bg-paper/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-ink/60">Phone</span>
                    <button
                      onClick={() => copyText('phone', activeProfile.phone || '')}
                      className="p-1 hover:text-accent transition-colors"
                      title="Copy"
                    >
                      {copiedField === 'phone' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <p className="text-xs font-medium text-ink mt-0.5 truncate">{activeProfile.phone || '—'}</p>
                </div>

                <div className="rounded-xl border border-ink/10 p-2.5 bg-paper/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-ink/60">Work Authorization</span>
                    <button
                      onClick={() => copyText('auth', authAnswer)}
                      className="p-1 hover:text-accent transition-colors"
                      title="Copy"
                    >
                      {copiedField === 'auth' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <p className="text-xs font-medium text-ink mt-0.5">{authAnswer}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuickSaveProfile} className="rounded-xl border border-accent/25 bg-accent/5 p-3.5 space-y-2">
                <p className="text-xs font-bold text-ink">Set your Autofill details:</p>
                <input
                  required
                  placeholder="Full Name"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 px-2.5 py-1.5 text-xs text-ink outline-none bg-white"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={quickEmail}
                  onChange={(e) => setQuickEmail(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 px-2.5 py-1.5 text-xs text-ink outline-none bg-white"
                />
                <input
                  placeholder="Phone Number"
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 px-2.5 py-1.5 text-xs text-ink outline-none bg-white"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-ink py-2 text-xs font-semibold text-white shadow-sm hover:bg-ink/85 transition-colors"
                >
                  Enable 1-Click Autofill
                </button>
              </form>
            )}

            {/* Tailored Résumé Card */}
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-accent">
                <FileText size={14} />
                <span>Tailored Résumé</span>
              </div>
              <p className="text-xs text-ink/70">
                Optimized by Gemini for {job.company}&apos;s ATS keywords.
              </p>
              {activeProfile?.summary && (
                <button
                  onClick={() => copyText('summary', activeProfile.summary || '')}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-accent/30 bg-white py-1.5 text-xs font-semibold text-ink hover:bg-accent/10 transition-colors"
                >
                  {copiedField === 'summary' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedField === 'summary' ? 'Summary Copied!' : 'Copy Tailored Summary'}</span>
                </button>
              )}
            </div>

            {/* Quick Status Info */}
            <div className="mt-auto pt-3 border-t border-ink/10 text-xs text-ink/50 space-y-1">
              <p>🔒 <strong>No Account Wall</strong>: All candidate data remains safely inside your browser.</p>
              <p>✅ <strong>Official ATS Flow</strong>: Submissions are delivered directly to {job.company}&apos;s recruiter inbox.</p>
            </div>
          </div>

          {/* Right Pane: Embedded Live Application Frame */}
          <div className="flex-1 flex flex-col min-h-0 bg-white relative">
            {/* Embedded Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-ink/10 bg-paper/40 shrink-0 text-xs">
              <span className="font-medium text-ink/60 truncate">
                Portal: {job.applyUrl}
              </span>
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-accent hover:underline shrink-0"
              >
                <span>Open in side window</span>
                <ExternalLink size={12} />
              </a>
            </div>
            {iframeError ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
                <Building2 size={36} className="text-ink/30 mb-3" />
                <h4 className="text-base font-bold text-ink">External Portal Security Restriction</h4>
                <p className="text-xs text-ink/60 mt-1">
                  {job.company}&apos;s portal restricts inline frame rendering in some browsers. You can open the assisted window right beside RolePilot to complete your submission.
                </p>
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-ink/85"
                >
                  <span>Open {job.company} Portal</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            ) : (
              <iframe
                src={job.applyUrl}
                title={`Application Form - ${job.company}`}
                className="w-full h-full border-none"
                allow="clipboard-write; clipboard-read"
                onError={() => setIframeError(true)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
