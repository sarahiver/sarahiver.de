'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import { GUESTBOOK_DEFAULTS, readEntries, rotationFor } from './shared';
import { formatShortDateDE } from '@/lib/date-format';
import { useGuestbookForm } from './useGuestbookForm';
import { GbHeader, GbSuccess, GbModHint, GbError, GbEmpty } from './shared-ui';
import { IconSend, IconPen, IconX } from './icons';

/**
 * Gästebuch Variante C — Pinnwand (Polaroid-Optik) + Modal
 *
 * Einträge als leicht gedrehte Zettel; Rotation deterministisch aus der
 * Eintrags-ID (kein Math.random → SSR/Hydration-safe). Eingabe per Button
 * öffnet ein Modal (Name + Nachricht). Moderation aktiv → Pending nach
 * Absenden. Client Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
}

export default function GuestbookVariantC({ content, weddingSlug }: Props) {
  const eyebrow = (content.eyebrow as string) ?? GUESTBOOK_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? GUESTBOOK_DEFAULTS.title;
  const description = (content.description as string) ?? GUESTBOOK_DEFAULTS.description;
  const successMsg = (content.success_message as string) ?? GUESTBOOK_DEFAULTS.success_message;
  const successSub = (content.success_sub as string) ?? GUESTBOOK_DEFAULTS.success_sub;
  const moderation = (content.moderation as string) ?? GUESTBOOK_DEFAULTS.moderation;
  const entries = readEntries(content);

  const f = useGuestbookForm(weddingSlug);
  const sending = f.phase === 'sending';
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    if (f.phase === 'success') f.reset();
  }, [f]);

  const openModal = useCallback(() => {
    if (f.phase === 'success') f.reset();
    setOpen(true);
  }, [f]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  return (
    <div className="gb gbC-section">
      <GbHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="gbC-wrap">
        <div className="gbC-bar">
          <span className="gbC-count">
            <strong>{entries.length}</strong>
            {entries.length === 1 ? 'Glückwunsch' : 'Glückwünsche'}
          </span>
          <button type="button" className="gb-btn" onClick={openModal}>
            <IconPen />
            <span>Eintrag schreiben</span>
          </button>
        </div>

        {entries.length === 0 ? (
          <GbEmpty />
        ) : (
          <div className="gbC-board">
            {entries.map((e, i) => (
              <article
                key={e.id}
                className="gbC-card"
                style={{ '--rot': `${rotationFor(e.id, i)}deg` } as CSSProperties}
              >
                <p className="gbC-msg">„{e.message}"</p>
                <div className="gbC-foot">
                  <span className="gbC-name">{e.name}</span>
                  {e.created_at && (
                    <span className="gbC-date">{formatShortDateDE(e.created_at)}</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="gbC-overlay" role="dialog" aria-modal="true" onClick={close}>
          <div className="gbC-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="gbC-dialog-close"
              aria-label="Schließen"
              onClick={close}
            >
              <IconX />
            </button>

            {f.phase === 'success' ? (
              <GbSuccess message={successMsg} sub={successSub} onReset={f.reset} />
            ) : (
              <>
                <h3 className="gbB-form-title">Hinterlasst uns ein paar Worte</h3>
                <div className="gbB-field">
                  <label className="gb-field-label" htmlFor="gbC-name">Name</label>
                  <input
                    id="gbC-name"
                    className="gb-input"
                    type="text"
                    placeholder="z.B. Lisa & Tom"
                    value={f.name}
                    onChange={(e) => f.setName(e.target.value)}
                    disabled={sending}
                  />
                </div>
                <div className="gbB-field">
                  <label className="gb-field-label" htmlFor="gbC-msg">Nachricht</label>
                  <textarea
                    id="gbC-msg"
                    className="gb-textarea"
                    placeholder="Eure Worte für uns …"
                    value={f.message}
                    onChange={(e) => f.setMessage(e.target.value)}
                    disabled={sending}
                  />
                </div>
                <div className="gbB-actions">
                  <button
                    type="button"
                    className="gb-btn"
                    onClick={f.submit}
                    disabled={!f.canSubmit || sending}
                  >
                    <IconSend />
                    <span>{sending ? 'Wird gesendet …' : 'Absenden'}</span>
                  </button>
                  <GbError msg={f.errorMsg} />
                  <GbModHint text={moderation} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
