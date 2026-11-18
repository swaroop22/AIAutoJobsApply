'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/#workflow', label: 'How it works' },
  { href: '/#platforms', label: 'Platforms' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/blog', label: 'Blog' },
];

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const sheet = sheetRef.current;
      if (!sheet) return;
      const focusable = sheet.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      className="fixed inset-0 z-[60] flex flex-col bg-paper"
    >
      <div className="ol-container flex items-center justify-between py-5">
        <span className="font-display text-lg">Offerlane</span>
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-10 w-10 items-center justify-center rounded-pill border border-line"
        >
          <X size={18} />
        </button>
      </div>
      <nav className="ol-container flex flex-1 flex-col justify-center gap-6">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="font-display text-3xl text-ink"
          >
            {link.label}
          </a>
        ))}
        <a href="/app" onClick={onClose} className="ol-btn-solid mt-4 w-fit">
          Get started — it's free
        </a>
      </nav>
    </div>
  );
}
