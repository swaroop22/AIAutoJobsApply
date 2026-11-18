'use client';

import { useEffect, useState } from 'react';
import { getDb } from './schema';
import type { Preferences } from './types';

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getDb()
      .preferences.get('preferences')
      .then((found) => {
        if (cancelled) return;
        setPreferences(found ?? null);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { preferences, loaded };
}
