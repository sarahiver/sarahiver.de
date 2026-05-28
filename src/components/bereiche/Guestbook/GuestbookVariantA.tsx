'use client';

import type { EffectiveTokens } from '@/types/supabase';
import { GUESTBOOK_DEFAULTS, readEntries } from './shared';
import { formatShortDateDE } from '@/lib/date-format';
import { useGuestbookForm } from './useGuestbookForm';
import { GbHeader, GbSuccess, GbModHint, GbError, GbEmpty } from './shared-ui';
import { IconSend } from './icons';

/**
 * Gästebuch Variante A — Formular oben, Einträge als Karten-Raster
 *
 * Moderation aktiv → nach Absenden Pending-Zustand, neuer Eintrag erscheint
 * NICHT sofort. Client Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
}

export default function GuestbookVariantA({ content, weddingSlug }: Props) {
  const eyebrow = (content.eyebrow as string) ?? GUESTBOOK_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? GUESTBOOK_DEFAULTS.title;
  const description = (content.description as string) ?? GUESTBOOK_DEFAULTS.description;
  const successMsg = (content.success_message as string) ?? GUESTBOOK_DEFAULTS.success_message;
  const successSub = (content.success_sub as string) ?? GUESTBOOK_DEFAULTS.success_sub;
  const moderation = (content.moderation as string) ?? GUESTBOOK_DEFAULTS.moderation;
  const entries = readEntries(content);

  const f = useGuestbookForm(weddingSlug);
  const sending = f.phase === 'sending';

  return (
    <div className="gb gbA-section">
      <GbHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="gbA-wrap">
        {f.phase === 'success' ? (
          <div className="gbA-form-success">
            <GbSuccess message={successMsg} sub={successSub} onReset={f.reset} />
          </div>
        ) : (
          <div className="gbA-form">
            <div className="gbA-field">
              <label className="gb-field-label" htmlFor="gbA-name">
                Euer Name
              </label>
              <input
                id="gbA-name"
                className="gb-input"
                type="text"
                placeholder="z.B. Lisa & Tom"
                value={f.name}
                onChange={(e) => f.setName(e.target.value)}
                disabled={sending}
              />
            </div>
            <div className="gbA-field">
              <label className="gb-field-label" htmlFor="gbA-msg">
                Eure Nachricht
              </label>
              <textarea
                id="gbA-msg"
                className="gb-textarea"
                placeholder="Schreibt uns ein paar liebe Worte …"
                value={f.message}
                onChange={(e) => f.setMessage(e.target.value)}
                disabled={sending}
              />
            </div>
            <div className="gbA-actions">
              <GbModHint text={moderation} />
              <GbError msg={f.errorMsg} />
              <button
                type="button"
                className="gb-btn"
                onClick={f.submit}
                disabled={!f.canSubmit || sending}
              >
                <IconSend />
                <span>{sending ? 'Wird gesendet …' : 'Eintragen'}</span>
              </button>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <GbEmpty />
        ) : (
          <div className="gbA-grid">
            {entries.map((e) => (
              <article key={e.id} className="gbA-card">
                <p className="gbA-msg">„{e.message}"</p>
                <div className="gbA-meta">
                  <span className="gbA-name">{e.name}</span>
                  {e.created_at && <span className="gbA-date">{formatShortDateDE(e.created_at)}</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
