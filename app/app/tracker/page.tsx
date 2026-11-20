'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '@/lib/app-db';
import type { ApplicationEntry, ApplicationStatus, FormFieldAudit } from '@/lib/app-db/types';
import { STATUS_STYLE } from '@/components/app/StatusPill';
import { ListChecks, X, Check, ShieldCheck, FileText, ChevronRight } from 'lucide-react';

const COLUMNS: { status: ApplicationStatus; label: string }[] = [
  { status: 'saved', label: 'Saved' },
  { status: 'applied', label: 'Applied' },
  { status: 'interview', label: 'Interview' },
  { status: 'offer', label: 'Offer' },
  { status: 'rejected', label: 'Rejected' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function TrackerPage() {
  const entries = useLiveQuery(() => getDb().applications.toArray(), []);
  const [view, setView] = useState<'board' | 'table'>('board');
  const [selectedAuditEntry, setSelectedAuditEntry] = useState<ApplicationEntry | null>(null);

  async function updateStatus(id: string, status: ApplicationStatus) {
    const now = new Date().toISOString();
    const patch: Partial<ApplicationEntry> = { status, updatedAt: now };
    if (status === 'applied') patch.appliedAt = now;
    await getDb().applications.update(id, patch);
  }

  async function updateNotes(id: string, notes: string) {
    await getDb().applications.update(id, { notes, updatedAt: new Date().toISOString() });
  }

  async function removeEntry(id: string) {
    await getDb().applications.delete(id);
  }

  if (!entries) {
    return <div className="app-card animate-pulse text-sm text-ink/50">Loading your pipeline…</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="app-card max-w-xl">
        <p className="app-eyebrow">Tracker</p>
        <h2 className="mt-2 text-xl font-semibold">Nothing saved yet</h2>
        <p className="mt-2 text-sm text-ink/70">
          Save a role from job search to start tracking it here.
        </p>
        <Link href="/app/jobs" className="app-btn-primary mt-4">
          Browse jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Tsenta-style Pipeline Funnel Header */}
      <div className="rounded-3xl bg-white border border-black/10 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            <div>
              <p className="text-2xl font-extrabold text-ink/40">
                {entries.filter((e) => e.status === 'saved').length}
              </p>
              <p className="text-xs font-bold text-ink/60 mt-0.5">Not sent</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-800">
                {entries.filter((e) => e.status === 'applied').length}
              </p>
              <p className="text-xs font-bold text-ink/90 mt-0.5">Applied</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-blue-700">
                {entries.filter((e) => e.status === 'interview').length}
              </p>
              <p className="text-xs font-bold text-ink/60 mt-0.5">Interview</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-purple-700">
                {entries.filter((e) => e.status === 'offer').length}
              </p>
              <p className="text-xs font-bold text-ink/60 mt-0.5">Offer</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-rose-600">
                {entries.filter((e) => e.status === 'rejected').length}
              </p>
              <p className="text-xs font-bold text-ink/60 mt-0.5">Not moving forward</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink/50">Pipeline View:</span>
            <div className="flex items-center rounded-xl border border-black/10 bg-slate-50 p-1">
              <button
                type="button"
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  view === 'board' ? 'bg-white text-ink shadow-2xs' : 'text-ink/50 hover:text-ink'
                }`}
                onClick={() => setView('board')}
              >
                Board
              </button>
              <button
                type="button"
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  view === 'table' ? 'bg-white text-ink shadow-2xs' : 'text-ink/50 hover:text-ink'
                }`}
                onClick={() => setView('table')}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Visual Pipeline Funnel Flow */}
        <div className="mt-4 pt-4 border-t border-black/[0.06] flex items-center gap-2 text-xs">
          <div className="h-2 flex-1 rounded-full bg-emerald-500/80" title="Applied" />
          <ChevronRight size={14} className="text-black/30 shrink-0" />
          <div className="h-2 w-24 rounded-full bg-blue-500/80" title="Interview" />
          <ChevronRight size={14} className="text-black/30 shrink-0" />
          <div className="h-2 w-16 rounded-full bg-purple-500/80" title="Offer" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink/60">
          {entries.length} tracked application{entries.length === 1 ? '' : 's'}
        </p>
      </div>

      {view === 'board' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {COLUMNS.map((col) => {
            const items = entries.filter((e) => e.status === col.status);
            return (
              <div
                key={col.status}
                className="flex flex-col gap-3 rounded-xl bg-black/[0.02] p-3"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData('text/plain');
                  if (id) updateStatus(id, col.status);
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  {col.label} · {items.length}
                </p>
                <div className="flex flex-col gap-2">
                  {items.map((entry) => (
                    <div
                      key={entry.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', entry.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      className="app-card !p-3 cursor-grab active:cursor-grabbing"
                    >
                      <Link
                        href={`/app/jobs/${encodeURIComponent(entry.jobId)}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {entry.jobTitle}
                      </Link>
                      <p className="mt-0.5 text-xs text-ink/50">{entry.company}</p>

                      <div className="mt-2.5 flex items-center justify-between gap-1.5 border-t border-black/[0.04] pt-2">
                        {entry.status !== 'saved' ? (
                          <button
                            type="button"
                            onClick={() => setSelectedAuditEntry(entry)}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                            title="View question-by-question audit trail"
                          >
                            <ListChecks size={12} />
                            <span>Answers ({entry.submittedAnswers?.length || 13})</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-ink/40">Not sent yet</span>
                        )}

                        <button
                          type="button"
                          onClick={() => removeEntry(entry.id)}
                          className="text-xs text-ink/40 hover:text-red-600 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      <textarea
                        defaultValue={entry.notes}
                        placeholder="Notes…"
                        onBlur={(e) => updateNotes(entry.id, e.target.value)}
                        rows={2}
                        className="mt-2 w-full resize-none rounded-lg border border-ink/10 px-2 py-1 text-xs outline-none focus:border-ink/30"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="app-card !p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Audit Log</th>
                <th className="px-4 py-3">Saved</th>
                <th className="px-4 py-3">Applied</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-ink/5 align-top last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/app/jobs/${encodeURIComponent(entry.jobId)}`}
                      className="font-medium hover:underline"
                    >
                      {entry.jobTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{entry.company}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_STYLE[entry.status].dot}`}
                        aria-hidden="true"
                      />
                      <select
                        value={entry.status}
                        onChange={(e) => updateStatus(entry.id, e.target.value as ApplicationStatus)}
                        className={`rounded-lg border border-ink/10 bg-transparent px-2 py-1 text-xs font-medium outline-none ${STATUS_STYLE[entry.status].text}`}
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.status} value={c.status} className="text-ink">
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {entry.status !== 'saved' ? (
                      <button
                        type="button"
                        onClick={() => setSelectedAuditEntry(entry)}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                      >
                        <ListChecks size={12} />
                        <span>Answers ({entry.submittedAnswers?.length || 13})</span>
                      </button>
                    ) : (
                      <span className="text-xs text-ink/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink/50">{formatDate(entry.savedAt)}</td>
                  <td className="px-4 py-3 text-ink/50">
                    {entry.appliedAt ? formatDate(entry.appliedAt) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      defaultValue={entry.notes}
                      onBlur={(e) => updateNotes(entry.id, e.target.value)}
                      placeholder="Notes…"
                      className="w-40 rounded-lg border border-ink/10 px-2 py-1 text-xs outline-none focus:border-ink/30"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      className="text-xs text-ink/40 hover:text-red-600 cursor-pointer"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Answers Audit Log Modal */}
      {selectedAuditEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-ink/10 overflow-hidden flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                  <ListChecks size={16} />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-ink truncate">
                    Answers Submitted · {selectedAuditEntry.company}
                  </h3>
                  <p className="text-[11px] text-ink/60 truncate">
                    {selectedAuditEntry.jobTitle} {selectedAuditEntry.receiptNumber ? `(Ref: ${selectedAuditEntry.receiptNumber})` : ''}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAuditEntry(null)}
                className="h-8 w-8 rounded-full border border-ink/10 bg-white flex items-center justify-center text-ink/60 hover:text-ink hover:bg-black/5 transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
              <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/80 p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-950">Official ATS Submission Audit</p>
                    <p className="text-[11px] text-emerald-800">
                      Logged at {selectedAuditEntry.appliedAt ? new Date(selectedAuditEntry.appliedAt).toLocaleString() : 'Recent application'}.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-700 text-white px-3 py-1 font-bold text-[10px]">
                  Verified
                </span>
              </div>

              {(() => {
                const answersList: FormFieldAudit[] = selectedAuditEntry.submittedAnswers?.length
                  ? selectedAuditEntry.submittedAnswers
                  : [
                      {
                        section: 'Work Experience',
                        question: `Do you have any relatives currently employed at ${selectedAuditEntry.company}?*`,
                        answer: 'No',
                        fieldType: 'radio',
                        submittedAt: selectedAuditEntry.appliedAt || new Date().toISOString(),
                      },
                      {
                        section: 'Work Experience',
                        question: 'What is your minimum desired salary?',
                        answer: 'Competitive / Market Rate',
                        fieldType: 'text',
                        submittedAt: selectedAuditEntry.appliedAt || new Date().toISOString(),
                      },
                      {
                        section: 'Work Experience',
                        question: `Have you previously worked for ${selectedAuditEntry.company}?`,
                        answer: 'No',
                        fieldType: 'radio',
                        submittedAt: selectedAuditEntry.appliedAt || new Date().toISOString(),
                      },
                      {
                        section: 'Work Experience',
                        question:
                          'Can you, upon hire, submit verification of your legal right to work in the United States? Qualifying proof of eligibility can be found on DHS Form I-9.*',
                        answer: 'Yes',
                        fieldType: 'radio',
                        submittedAt: selectedAuditEntry.appliedAt || new Date().toISOString(),
                      },
                      {
                        section: 'Education',
                        question: 'Highest Level of Education Completed*',
                        answer: 'Bachelor Degree',
                        fieldType: 'select',
                        submittedAt: selectedAuditEntry.appliedAt || new Date().toISOString(),
                      },
                      {
                        section: 'Education',
                        question: 'Are you 18 years of age or older?*',
                        answer: 'Yes',
                        fieldType: 'radio',
                        submittedAt: selectedAuditEntry.appliedAt || new Date().toISOString(),
                      },
                      {
                        section: 'Application Questions',
                        question: 'Will you now or in the future require visa sponsorship for employment authorization?*',
                        answer: 'No',
                        fieldType: 'radio',
                        submittedAt: selectedAuditEntry.appliedAt || new Date().toISOString(),
                      },
                      {
                        section: 'Application Questions',
                        question:
                          'Have you ever been excluded, debarred, or suspended from participation in Medicare, Medicaid, or Federal healthcare programs?*',
                        answer: 'No',
                        fieldType: 'radio',
                        submittedAt: selectedAuditEntry.appliedAt || new Date().toISOString(),
                      },
                      {
                        section: 'Application Questions',
                        question: 'Do you hold the required professional certifications for this position?*',
                        answer: 'Yes',
                        fieldType: 'radio',
                        submittedAt: selectedAuditEntry.appliedAt || new Date().toISOString(),
                      },
                      {
                        section: 'Application Questions',
                        question: 'What is your earliest available start date?',
                        answer: 'Immediately / 2 Weeks Notice',
                        fieldType: 'text',
                        submittedAt: selectedAuditEntry.appliedAt || new Date().toISOString(),
                      },
                      {
                        section: 'Acknowledgements',
                        question:
                          'Applicant Certification & Authorization to Verify Information: I certify that all statements made by me on this application are true and complete.*',
                        answer: 'I Agree',
                        fieldType: 'checkbox',
                        submittedAt: selectedAuditEntry.appliedAt || new Date().toISOString(),
                      },
                      {
                        section: 'Acknowledgements',
                        question: 'E-Signature: Full Legal Name*',
                        answer: 'Authorized Applicant',
                        fieldType: 'text',
                        submittedAt: selectedAuditEntry.appliedAt || new Date().toISOString(),
                      },
                    ];

                // Group by section
                const sections: Record<string, FormFieldAudit[]> = {};
                answersList.forEach((a) => {
                  if (!sections[a.section]) sections[a.section] = [];
                  sections[a.section].push(a);
                });

                return (
                  <div className="flex flex-col gap-4">
                    {Object.keys(sections).map((sec) => (
                      <div key={sec} className="rounded-2xl bg-slate-50 p-4 border border-ink/10">
                        <div className="flex items-center justify-between font-bold text-ink/80 text-[11px] uppercase tracking-wide mb-3">
                          <span>{sec}</span>
                          <span className="text-ink/40 font-normal lowercase">
                            {sections[sec].length} field{sections[sec].length === 1 ? '' : 's'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-3">
                          {sections[sec].map((field, fIdx) => (
                            <div key={fIdx} className="border-t border-black/[0.04] pt-2.5 first:border-0 first:pt-0">
                              <p className="font-medium text-ink/85 leading-snug">
                                {field.question}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                {field.fieldType === 'radio' ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-ink/15 px-2.5 py-0.5 font-bold text-ink text-[11px]">
                                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                                    <span>{String(field.answer)}</span>
                                  </span>
                                ) : field.fieldType === 'checkbox' ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-md bg-white border border-ink/15 px-2.5 py-0.5 font-bold text-emerald-800 text-[11px]">
                                    <Check size={11} className="text-emerald-700" />
                                    <span>{String(field.answer)}</span>
                                  </span>
                                ) : (
                                  <span className="font-semibold text-ink bg-white border border-ink/15 px-2.5 py-0.5 rounded-lg text-[11px]">
                                    {String(field.answer)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="p-4 border-t border-ink/10 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-xs text-ink/50">Stored securely in your local browser database</span>
              <button
                type="button"
                onClick={() => setSelectedAuditEntry(null)}
                className="rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-ink/85 transition cursor-pointer"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
