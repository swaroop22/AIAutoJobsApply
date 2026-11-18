'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '@/lib/app-db';
import type { ApplicationEntry, ApplicationStatus } from '@/lib/app-db/types';
import { STATUS_STYLE } from '@/components/app/StatusPill';

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink/50">
          {entries.length} tracked application{entries.length === 1 ? '' : 's'}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="app-filter-pill"
            data-active={view === 'board'}
            onClick={() => setView('board')}
          >
            Board
          </button>
          <button
            type="button"
            className="app-filter-pill"
            data-active={view === 'table'}
            onClick={() => setView('table')}
          >
            Table
          </button>
        </div>
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
                      <textarea
                        defaultValue={entry.notes}
                        placeholder="Notes…"
                        onBlur={(e) => updateNotes(entry.id, e.target.value)}
                        rows={2}
                        className="mt-2 w-full resize-none rounded-lg border border-ink/10 px-2 py-1 text-xs outline-none focus:border-ink/30"
                      />
                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        className="mt-2 text-xs text-ink/40 hover:text-red-600"
                      >
                        Remove
                      </button>
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
                      className="text-xs text-ink/40 hover:text-red-600"
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
    </div>
  );
}
