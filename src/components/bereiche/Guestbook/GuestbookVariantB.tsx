'use client';

import type { EffectiveTokens } from '@/types/supabase';
import { GUESTBOOK_DEFAULTS, readEntries } from './shared';
import { formatShortDateDE } from '@/lib/date-format';
import { useGuestbookForm } from './useGuestbookForm';
import { GbHeader, GbSuccess, GbModHint, GbError, GbEmpty } from './shared-ui';
import { IconSend } from './icons';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

/**
 * Gästebuch Variante B — Sticky-Formular links, Feed rechts
 *
 * Formular bleibt beim Scrollen sichtbar; rechts chronologischer Feed der
 * freigegebenen Einträge. Moderation aktiv → Pending nach Absenden.
 * Client Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
}

export default function GuestbookVariantB({ tokens, content, weddingSlug }: Props) {

  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
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
    <div className="gb gbB-section" data-style-guest={style}>
      <StyledBereichBg
        style={style}
        marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`}
      />
      <GbHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="gbB-wrap">
        <div className="gbB-grid">
          {f.phase === 'success' ? (
            <div className="gbB-left">
              <GbSuccess message={successMsg} sub={successSub} onReset={f.reset} />
            </div>
          ) : (
            <div className="gbB-left">
              <h3 className="gbB-form-title">Hinterlasst uns ein paar Worte</h3>
              <p className="gbB-form-sub">
                Name und Nachricht — mehr nicht. Wir freuen uns über jede Zeile.
              </p>
              <div className="gbB-field">
                <label className="gb-field-label" htmlFor="gbB-name">
                  Name
                </label>
                <input
                  id="gbB-name"
                  className="gb-input"
                  type="text"
                  placeholder="z.B. Lisa & Tom"
                  value={f.name}
                  onChange={(e) => f.setName(e.target.value)}
                  disabled={sending}
                />
              </div>
              <div className="gbB-field">
                <label className="gb-field-label" htmlFor="gbB-msg">
                  Nachricht
                </label>
                <textarea
                  id="gbB-msg"
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
            </div>
          )}

          <div className="gbB-feed">
            {entries.length === 0 ? (
              <GbEmpty />
            ) : (
              entries.map((e) => (
                <article key={e.id} className="gbB-entry">
                  <p className="gbB-msg">„{e.message}"</p>
                  <div className="gbB-meta">
                    <span className="gbB-name">{e.name}</span>
                    {e.created_at && <span className="gbB-date">{formatShortDateDE(e.created_at)}</span>}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
