'use client';

import { useEffect, useState } from 'react';
import { getDb } from './schema';
import type { Preferences } from './types';
import { suggestPreferencesFromResume } from '@/lib/resume-parse/structure';

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const db = getDb();

    Promise.all([db.preferences.get('preferences'), db.profile.get('profile')])
      .then(([foundPrefs, foundProfile]) => {
        if (cancelled) return;

        if (foundPrefs && foundPrefs.titles && foundPrefs.titles.length > 0) {
          setPreferences(foundPrefs);
        } else if (foundProfile) {
          // Auto-derive target preferences from uploaded résumé
          const parsed = {
            fullName: foundProfile.fullName,
            email: foundProfile.email,
            phone: foundProfile.phone,
            summary: foundProfile.summary,
            skills: foundProfile.skills || [],
            experience: foundProfile.experience || [],
            education: foundProfile.education || [],
          };
          const suggested = suggestPreferencesFromResume(parsed);

          // Check if resume content is healthcare/coding
          const fullText = (foundProfile.rawText || '') + ' ' + (foundProfile.skills || []).join(' ');
          const isHealthcare = /coder|coding|him|billing|revenue|cdi|icd[- ]?10|cpt|cpc|ccs|rhia|rhit/i.test(
            fullText,
          );

          const autoTitles =
            suggested.titles.length > 0
              ? suggested.titles
              : isHealthcare
              ? ['Medical Coder', 'Coding Specialist', 'HIM Coder']
              : [];

          const autoPrefs: Preferences = {
            id: 'preferences',
            titles: autoTitles,
            locations: foundPrefs?.locations || [],
            remoteOnly: foundPrefs?.remoteOnly ?? false,
            seniority: suggested.seniority.length > 0 ? suggested.seniority : foundPrefs?.seniority || [],
            visaSponsorshipNeeded: foundPrefs?.visaSponsorshipNeeded ?? false,
            workAuthorized: foundPrefs?.workAuthorized ?? true,
            requiresNowOrFuture: foundPrefs?.requiresNowOrFuture ?? 'now',
            updatedAt: new Date().toISOString(),
          };

          if (autoTitles.length > 0) {
            // Persist auto-derived preferences to db
            db.preferences.put(autoPrefs).catch(() => {});
          }

          setPreferences(autoPrefs);
        } else {
          setPreferences(foundPrefs ?? null);
        }
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { preferences, loaded };
}
