'use client';

import { useEffect, useState } from 'react';
import { NAV_SECTIONS, SIDEBAR } from '@/lib/content';

/**
 * Sticky Sidebar — Desktop only (≥ lg).
 * Warmes Dunkel #2D211C (NICHT reines Schwarz) mit subtilen radial gradients.
 * Inkl. Pre-Launch-Pulse-Badge in Honey-Farbe.
 */
export default function Sidebar() {
  const [activeId, setActiveId] = useState<string>('hero');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    NAV_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleJump = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside
      className="hidden lg:flex sticky top-0 h-screen text-sb-ink flex-col px-8 pt-9 pb-7 w-[26%] min-w-[280px] z-10 relative overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 18% 8%, rgba(212,165,116,0.10), transparent 36%), radial-gradient(circle at 92% 86%, rgba(181,116,106,0.12), transparent 42%), #2D211C',
      }}
    >
      {/* Brand: sarahiver.de mit Terra-Punkt */}
      <div className="mb-7">
        <div className="flex items-baseline gap-3">
          <div
            className="font-medium text-[22px] leading-none tracking-[-0.018em] text-white"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            sarahiver<span style={{ color: 'var(--color-terra)' }}>.</span>de
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            wedding<br />websites
          </div>
        </div>
      </div>

      {/* Pre-Launch Pulse-Badge */}
      <div className="inline-flex items-center gap-2 mb-7 px-2.5 py-1.5 rounded-full border w-fit"
        style={{
          background: 'rgba(212,165,116,0.12)',
          borderColor: 'rgba(212,165,116,0.32)',
          color: 'var(--color-honey-soft)',
        }}
      >
        <span className="pre-launch-pulse" />
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase">
          {SIDEBAR.tag}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 flex-1" aria-label="Sections">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 mb-3">
          Inhalt
        </p>
        {NAV_SECTIONS.map((section, i) => {
          const isActive = activeId === section.id;
          return (
            <button
              key={section.id}
              onClick={() => handleJump(section.id)}
              className={`grid grid-cols-[32px_1fr] items-center gap-1 py-2.5 text-left text-sm transition-colors relative ${
                isActive
                  ? 'text-white font-medium'
                  : 'text-white/55 hover:text-white/92 font-normal'
              }`}
            >
              {isActive && (
                <span
                  className="absolute -left-8 top-1/2 -translate-y-1/2 w-5 h-px"
                  style={{ background: 'var(--color-honey)' }}
                />
              )}
              <span
                className={`font-mono text-[10px] tracking-[0.12em] ${
                  isActive ? '' : 'text-white/30'
                }`}
                style={isActive ? { color: 'var(--color-honey)' } : undefined}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{section.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer-Quote */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <p
          className="text-sm leading-relaxed text-white/75 italic mb-2"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          „{SIDEBAR.quote}"
        </p>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: 'var(--color-terra-soft)' }}
        >
          {SIDEBAR.by}
        </p>
      </div>
    </aside>
  );
}
