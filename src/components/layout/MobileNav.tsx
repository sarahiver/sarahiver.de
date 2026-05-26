'use client';

import { useState } from 'react';
import { NAV_SECTIONS } from '@/lib/content';

/**
 * Mobile-Top-Nav — sichtbar unter lg-Breakpoint.
 * Klassische sticky Top-Bar mit Hamburger-Menu.
 */
export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const handleJump = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Top-Bar */}
      <header className="lg:hidden sticky top-0 z-20 bg-ink text-paper-warm px-6 h-16 flex items-center justify-between">
        <div className="font-sans font-black text-xl leading-none tracking-[-0.04em] text-white">
          sarahiver<span className="text-[oklch(0.86_0.025_145)] font-light italic" style={{ fontFamily: 'var(--font-serif)' }}>.de</span>
        </div>

        {/* Hamburger / Close */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Menü schließen' : 'Menü öffnen'}
          className="w-10 h-10 flex flex-col items-center justify-center gap-1.5"
        >
          <span
            className={`block w-5 h-px bg-white transition-transform ${
              isOpen ? 'rotate-45 translate-y-1' : ''
            }`}
          />
          <span
            className={`block w-5 h-px bg-white transition-opacity ${
              isOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-5 h-px bg-white transition-transform ${
              isOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </header>

      {/* Overlay-Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-20 bg-ink text-paper-warm overflow-y-auto">
          <nav className="px-6 py-8 flex flex-col gap-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 mb-4">
              Inhalt
            </p>
            {NAV_SECTIONS.map((section, i) => (
              <button
                key={section.id}
                onClick={() => handleJump(section.id)}
                className="grid grid-cols-[40px_1fr] items-center gap-2 py-4 text-left text-base text-white/75 hover:text-white border-b border-white/10"
              >
                <span className="font-mono text-[11px] tracking-[0.12em] text-white/30">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{section.label}</span>
              </button>
            ))}
            <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
              Pre-Launch · Q4 2026
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
