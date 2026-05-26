'use client';

import { useEffect, useState } from 'react';
import { NAV_SECTIONS } from '@/lib/content';

/**
 * Sticky Sidebar — nur Desktop ab lg-Breakpoint (1024px).
 * Mobile bekommt eine separate Top-Nav (siehe MobileNav.tsx).
 *
 * Scroll-Spy-Logik: Beobachtet welche Section gerade im Viewport ist
 * und highlightet sie in der Nav.
 */
export default function Sidebar() {
  const [activeId, setActiveId] = useState<string>('hero');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Finde die Section, die am sichtbarsten ist
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-30% 0px -50% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    NAV_SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleJump = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className="hidden lg:flex sticky top-0 h-screen bg-ink text-paper-warm flex-col px-9 pt-10 pb-8 w-[27%] min-w-[280px] z-10">
      {/* Brand: sarahiver.de als Wortmarke */}
      <div className="mb-14">
        <div className="font-sans font-black text-[28px] leading-none tracking-[-0.04em] text-white">
          sarahiver<span className="text-[oklch(0.86_0.025_145)] font-light italic" style={{ fontFamily: 'var(--font-serif)' }}>.de</span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mt-3">
          wedding<br/>websites
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 flex-1" aria-label="Sections">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 mb-4">
          Inhalt
        </p>
        {NAV_SECTIONS.map((section, i) => {
          const isActive = activeId === section.id;
          return (
            <button
              key={section.id}
              onClick={() => handleJump(section.id)}
              className={`grid grid-cols-[32px_1fr] items-center gap-1 py-2.5 text-left text-sm transition-colors relative ${
                isActive ? 'text-white font-medium' : 'text-white/55 hover:text-white/85 font-normal'
              }`}
            >
              {/* Aktiver Bar-Indikator links */}
              {isActive && (
                <span className="absolute -left-9 top-1/2 -translate-y-1/2 w-6 h-px bg-[oklch(0.86_0.025_145)]" />
              )}
              <span
                className={`font-mono text-[10px] tracking-[0.12em] ${
                  isActive ? 'text-[oklch(0.86_0.025_145)]' : 'text-white/30'
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{section.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer der Sidebar: Status-Hinweis */}
      <div className="mt-8 border-t border-white/8 pt-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
          Pre-Launch · Q4 2026
        </div>
      </div>
    </aside>
  );
}
