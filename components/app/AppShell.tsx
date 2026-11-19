'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search as SearchIcon, LayoutGrid, Search, ListChecks, Settings } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '@/lib/app-db';
import { AppSearchProvider, useAppSearch } from './search-context';

const NAV_ITEMS = [
  { href: '/app', label: 'Dashboard', icon: LayoutGrid },
  { href: '/app/jobs', label: 'Browse jobs', icon: Search },
  { href: '/app/tracker', label: 'Applications', icon: ListChecks, countKey: 'applications' as const },
  { href: '/app/settings', label: 'Settings', icon: Settings },
];

function isActive(pathname: string, href: string) {
  return href === '/app' ? pathname === '/app' : pathname.startsWith(href);
}

function TopBar({ pathname }: { pathname: string }) {
  const activeLabel = NAV_ITEMS.find((item) => isActive(pathname, item.href))?.label ?? 'Dashboard';
  const { query, setQuery } = useAppSearch();

  return (
    <header className="app-topbar">
      <h1 className="text-lg font-semibold">{activeLabel}</h1>
      {!pathname.startsWith('/app/jobs') && (
        <div className="relative w-full max-w-md">
          <SearchIcon
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, company…"
            className="w-full rounded-xl border border-ink/10 bg-black/[0.02] py-2 pl-9 pr-3 text-sm outline-none focus:border-ink/30 focus:bg-white"
          />
        </div>
      )}
      <div className="ml-auto flex items-center gap-2">
        <span className="app-badge shrink-0">Stored only in this browser</span>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const applicationsCount = useLiveQuery(() => getDb().applications.count(), []);

  return (
    <AppSearchProvider>
      <div className="app-shell">
        <div className="app-shell-grid">
          <aside className="app-sidebar">
            <Link href="/app" className="app-sidebar-logo">
              RolePilot
            </Link>
            <p className="app-sidebar-section">Dashboard</p>
            <nav className="flex flex-col gap-1" aria-label="App navigation">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                const count = item.countKey === 'applications' ? applicationsCount : undefined;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="app-nav-link"
                    data-active={active}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span className="flex-1">{item.label}</span>
                    {Boolean(count) && <span className="app-nav-count">{count}</span>}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto pt-6">
              <Link href="/" className="app-sidebar-footer-link">
                ← Back to rolepilot.com
              </Link>
            </div>
          </aside>

          <div className="flex min-w-0 flex-col">
            <TopBar pathname={pathname} />
            <main id="main-content" className="app-main flex-1">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AppSearchProvider>
  );
}
