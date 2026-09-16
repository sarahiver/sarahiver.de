'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GATE_COPY,
  GATE_SNOOZE_DAYS,
  GATE_STORAGE_KEY,
  PRE_LAUNCH_MODE,
} from '@/lib/launch';
import LaunchSignupForm from './LaunchSignupForm';

/**
 * Launch Gate — Modal über der fertigen Landing.
 *
 * Bewusst kein Blocker: die Seite darunter bleibt sichtbar und erreichbar,
 * und beide Pre-Launch-Ziele (Demoseiten, Dashboard) sind direkt aus dem
 * Modal verlinkt. Wer schließt, hat für {GATE_SNOOZE_DAYS} Tage Ruhe.
 *
 * Ein-/Ausschalten ausschließlich über PRE_LAUNCH_MODE in lib/launch.ts.
 */
export default function LaunchGate() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // Erst nach dem Mount entscheiden — localStorage gibt es serverseitig nicht.
  useEffect(() => {
    if (!PRE_LAUNCH_MODE) return;

    let snoozedUntil = 0;
    try {
      snoozedUntil = Number(window.localStorage.getItem(GATE_STORAGE_KEY) || 0);
    } catch {
      // Privater Modus o. ä. — dann zeigen wir das Gate eben jedes Mal.
    }

    if (Date.now() < snoozedUntil) return;

    lastFocused.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => setOpen(true), 450);
    return () => window.clearTimeout(t);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    try {
      window.localStorage.setItem(
        GATE_STORAGE_KEY,
        String(Date.now() + GATE_SNOOZE_DAYS * 86_400_000),
      );
    } catch {
      // egal — dann erscheint das Gate beim nächsten Besuch wieder
    }
    lastFocused.current?.focus?.();
  }, []);

  // Scroll sperren, Escape schließen, Fokus im Dialog halten.
  useEffect(() => {
    if (!open) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const node = dialogRef.current;
    const focusables = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = focusables();
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, close]);

  if (!PRE_LAUNCH_MODE || !open) return null;

  return (
    <div className="sdlg" role="presentation">
      <div className="sdlg-backdrop" onClick={close} aria-hidden />

      <div
        className="sdlg-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sdlg-title"
        aria-describedby="sdlg-text"
      >
        <button type="button" className="sdlg-x" onClick={close} aria-label={GATE_COPY.close}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <p className="sdlg-eyebrow">{GATE_COPY.eyebrow}</p>
        <h2 className="sdlg-title" id="sdlg-title">
          {GATE_COPY.title} <em>{GATE_COPY.date}</em>
        </h2>
        <p className="sdlg-text" id="sdlg-text">
          {GATE_COPY.text}
        </p>

        <LaunchSignupForm />

        <div className="sdlg-explore">
          <p className="sdlg-explore-lead">{GATE_COPY.exploreLead}</p>
          <div className="sdlg-explore-actions">
            <a className="sdlg-btn sdlg-btn--ghost" href={GATE_COPY.exploreDemos.href} onClick={close}>
              {GATE_COPY.exploreDemos.label}
            </a>
            <a className="sdlg-btn sdlg-btn--ghost" href={GATE_COPY.exploreDashboard.href}>
              {GATE_COPY.exploreDashboard.label}
            </a>
          </div>
        </div>

        <button type="button" className="sdlg-close-link" onClick={close}>
          {GATE_COPY.close}
        </button>
      </div>
    </div>
  );
}
