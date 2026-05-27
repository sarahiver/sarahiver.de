'use client';

import { useState } from 'react';
import { NAV_SECTIONS, SIDEBAR } from '@/lib/content';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const handleJump = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsOpen(false);
  };

  return (
    <>
      <header
        className="lg:hidden sticky top-0 z-20 text-sb-ink px-6 h-16 flex items-center justify-between"
        style={{ background: '#2D211C' }}
      >
        <div
          className="font-medium text-xl leading-none tracking-[-0.018em] text-white"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          sarahiver<span style={{ color: 'var(--color-terra)' }}>.</span>de
        </div>

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

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 top-16 z-20 text-sb-ink overflow-y-auto"
          style={{ background: '#2D211C' }}
        >
          <nav className="px-6 py-8 flex flex-col gap-1">
            <div
              className="inline-flex items-center gap-2 mb-6 px-2.5 py-1.5 rounded-full border w-fit"
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
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 mb-3">
              Inhalt
            </p>
            {NAV_SECTIONS.map((section, i) => (
              <button
                key={section.id}
                onClick={() => handleJump(section.id)}
                className="grid grid-cols-[40px_1fr] items-center gap-2 py-3.5 text-left text-base text-white/75 hover:text-white border-b border-white/10"
              >
                <span className="font-mono text-[11px] tracking-[0.12em] text-white/30">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
