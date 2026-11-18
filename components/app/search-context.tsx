'use client';

import { createContext, useContext, useMemo, useState } from 'react';

type AppSearchContextValue = {
  query: string;
  setQuery: (value: string) => void;
};

const AppSearchContext = createContext<AppSearchContextValue | null>(null);

export function AppSearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('');
  const value = useMemo(() => ({ query, setQuery }), [query]);
  return <AppSearchContext.Provider value={value}>{children}</AppSearchContext.Provider>;
}

export function useAppSearch() {
  const ctx = useContext(AppSearchContext);
  if (!ctx) throw new Error('useAppSearch must be used within AppSearchProvider');
  return ctx;
}
