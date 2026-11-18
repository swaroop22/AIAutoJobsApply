'use client';

import { useEffect, useRef, useState } from 'react';

export function TerminalFeed({ lines, summary }: { lines: string[]; summary: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % lines.length);
    }, 1400);

    return () => clearInterval(interval);
  }, [inView, lines.length]);

  return (
    <div>
      <div ref={containerRef} className="ol-terminal" aria-hidden="true">
        {lines.map((line, i) => (
          <div key={i} className="ol-terminal-line" data-active={i === activeIndex ? 'true' : 'false'}>
            <span className="ol-caret">{line.slice(0, 1)}</span>
            {line.slice(1)}
          </div>
        ))}
      </div>
      <span className="sr-only">{summary}</span>
    </div>
  );
}
