'use client';

import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { MobileNav } from './MobileNav';

const NAV_LINKS = [
  { href: '/#workflow', label: 'How it works' },
  { href: '/#platforms', label: 'Platforms' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/blog', label: 'Blog' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sentinel = document.getElementById('hero-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header
        className="ol-header"
        data-scrolled={scrolled || pastHero ? 'true' : 'false'}
      >
        <div className="ol-container flex h-16 items-center justify-between">
          <a href="/" className="font-display text-lg tracking-tight text-ink">
            RolePilot
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="ol-nav-link">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="/app" className="ol-btn-solid hidden md:inline-flex">
              Get started — it's free
            </a>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-pill border border-line md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
