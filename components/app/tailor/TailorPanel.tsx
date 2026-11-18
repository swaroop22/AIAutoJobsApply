'use client';

import { useEffect, useState } from 'react';
import { diffWords } from 'diff';
import { getDb } from '@/lib/app-db';
import type { JobPosting, ResumeExperience, ResumeProfile } from '@/lib/app-db/types';

type TailorResult = {
  summary: string;
  skills: string[];
  experience: ResumeExperience[];
};

export function TailorPanel({ job }: { job: JobPosting }) {
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TailorResult | null>(null);
  const [savedTailored, setSavedTailored] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const db = getDb();
    db.profile.get('profile').then((p) => {
      if (!cancelled) setProfile(p ?? null);
    });
    db.tailoredResumes.get(job.id).then((existing) => {
      if (!cancelled && existing) {
        setResult({ summary: existing.summary, skills: existing.skills, experience: existing.experience });
        setStatus('done');
        setSavedTailored(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [job.id]);

  async function handleTailor() {
    if (!profile) return;
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          jobDescription: job.descriptionText,
          resume: {
            summary: profile.summary,
            skills: profile.skills,
            experience: profile.experience,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Something went wrong.');
        setStatus('error');
        return;
      }
      setResult({ summary: data.summary, skills: data.skills, experience: data.experience });
      setStatus('done');
      setSavedTailored(false);
    } catch {
      setError('Network error — try again.');
      setStatus('error');
    }
  }

  async function handleSaveTailored() {
    if (!result) return;
    await getDb().tailoredResumes.put({
      id: job.id,
      jobId: job.id,
      summary: result.summary,
      experience: result.experience,
      skills: result.skills,
      createdAt: new Date().toISOString(),
    });
    setSavedTailored(true);
  }

  async function handleDownload() {
    if (!profile || !result) return;
    setDownloading(true);
    try {
      const { pdf, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');
      const styles = StyleSheet.create({
        page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica' },
        name: { fontSize: 18, marginBottom: 2 },
        contact: { fontSize: 9, color: '#555', marginBottom: 12 },
        sectionTitle: { fontSize: 12, marginTop: 12, marginBottom: 4 },
        role: { fontSize: 10 },
        meta: { fontSize: 9, color: '#555', marginBottom: 2 },
        bullet: { marginBottom: 2 },
      });

      const doc = (
        <Document>
          <Page size="A4" style={styles.page}>
            <Text style={styles.name}>{profile.fullName || 'Résumé'}</Text>
            <Text style={styles.contact}>
              {[profile.email, profile.phone].filter(Boolean).join('  ·  ')}
            </Text>
            {result.summary && (
              <>
                <Text style={styles.sectionTitle}>Summary</Text>
                <Text>{result.summary}</Text>
              </>
            )}
            <Text style={styles.sectionTitle}>Experience</Text>
            {result.experience.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 8 }}>
                <Text style={styles.role}>
                  {exp.title} — {exp.company}
                </Text>
                <Text style={styles.meta}>{[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}</Text>
                {exp.bullets.map((b, i) => (
                  <Text key={i} style={styles.bullet}>
                    • {b}
                  </Text>
                ))}
              </View>
            ))}
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text>{result.skills.join(', ')}</Text>
            {profile.education.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Education</Text>
                {profile.education.map((ed) => (
                  <Text key={ed.id}>
                    {ed.school}
                    {ed.degree ? ` — ${ed.degree}` : ''}
                  </Text>
                ))}
              </>
            )}
          </Page>
        </Document>
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(profile.fullName || 'resume').replace(/\s+/g, '-').toLowerCase()}-${job.company
        .replace(/\s+/g, '-')
        .toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  if (!profile) {
    return (
      <div className="mt-6 rounded-xl px-4 py-3 text-sm" style={{ background: '#ecfdf5', color: '#15362b' }}>
        Finish onboarding to tailor your résumé for this job.
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-ink/10 pt-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Tailor my résumé</h3>
        <button
          type="button"
          className="app-btn-primary disabled:opacity-50"
          onClick={handleTailor}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Tailoring…' : result ? 'Re-tailor' : 'Tailor for this job'}
        </button>
      </div>
      <p className="mt-1 text-xs text-ink/50">
        Only rewords and reorders what&apos;s already in your résumé — nothing is invented.
      </p>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-5 flex flex-col gap-5">
          <DiffBlock label="Summary" before={profile.summary ?? ''} after={result.summary} />

          <div>
            <p className="text-sm font-medium">Skills (reordered to match this role)</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {result.skills.map((skill) => (
                <span key={skill} className="app-badge">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {result.experience.map((exp) => {
            const original = profile.experience.find((e) => e.id === exp.id);
            return (
              <div key={exp.id}>
                <p className="text-sm font-medium">
                  {exp.title} · {exp.company}
                </p>
                <DiffBlock before={(original?.bullets ?? []).join('\n')} after={exp.bullets.join('\n')} />
              </div>
            );
          })}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="app-btn-primary disabled:opacity-50"
              onClick={handleSaveTailored}
              disabled={savedTailored}
            >
              {savedTailored ? 'Saved' : 'Save tailored résumé'}
            </button>
            <button
              type="button"
              className="app-btn-ghost disabled:opacity-50"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? 'Preparing PDF…' : 'Download tailored résumé (PDF)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DiffBlock({ label, before, after }: { label?: string; before: string; after: string }) {
  const parts = diffWords(before, after);
  return (
    <div>
      {label && <p className="text-sm font-medium">{label}</p>}
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
        {parts.map((part, i) => (
          <span
            key={i}
            style={
              part.added
                ? { background: '#dcfce7', color: '#15362b' }
                : part.removed
                  ? { background: '#fee2e2', color: '#7f1d1d', textDecoration: 'line-through' }
                  : undefined
            }
          >
            {part.value}
          </span>
        ))}
      </p>
    </div>
  );
}
