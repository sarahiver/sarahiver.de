'use client';

import type { EffectiveTokens } from '@/types/supabase';
import { MUSICWISHES_DEFAULTS, readItems, formatDayMonthDE } from './shared';
import { useMusicWishesForm } from './useMusicWishesForm';
import { MwHeader, MwSuccessStrip, MwError, MwDuplicateHint, MwEmpty } from './shared-ui';
import { IconNote, IconPlus, IconDisc } from './icons';

/**
 * Musikwünsche Variante A — Formular oben, Wunschliste als Songzeilen
 *
 * Freie Eingabe (Titel + Interpret + optional "von wem"). KEINE Moderation:
 * neuer Wunsch erscheint sofort oben (hervorgehoben). Client Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
}

export default function MusicWishesVariantA({ content, weddingSlug }: Props) {
  const eyebrow = (content.eyebrow as string) ?? MUSICWISHES_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? MUSICWISHES_DEFAULTS.title;
  const description = (content.description as string) ?? MUSICWISHES_DEFAULTS.description;
  const successMsg = (content.success_message as string) ?? MUSICWISHES_DEFAULTS.success_message;
  const successSub = (content.success_sub as string) ?? MUSICWISHES_DEFAULTS.success_sub;

  const f = useMusicWishesForm(readItems(content), weddingSlug);
  const sending = f.phase === 'sending';

  return (
    <div className="mw mwA-section">
      <MwHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="mwA-wrap">
        <div className="mwA-form">
          <div className="mw-field">
            <label className="mw-field-label" htmlFor="mwA-title">Songtitel *</label>
            <input
              id="mwA-title"
              className="mw-input"
              type="text"
              placeholder="z.B. Dancing Queen"
              value={f.title}
              onChange={(e) => f.setTitle(e.target.value)}
              disabled={sending}
            />
          </div>
          <div className="mw-field">
            <label className="mw-field-label" htmlFor="mwA-artist">Interpret *</label>
            <input
              id="mwA-artist"
              className="mw-input"
              type="text"
              placeholder="z.B. ABBA"
              value={f.artist}
              onChange={(e) => f.setArtist(e.target.value)}
              disabled={sending}
            />
          </div>
          <div className="mw-field">
            <label className="mw-field-label" htmlFor="mwA-guest">
              Von wem? <span style={{ opacity: 0.6 }}>(optional)</span>
            </label>
            <input
              id="mwA-guest"
              className="mw-input"
              type="text"
              placeholder="Euer Name"
              value={f.guestName}
              onChange={(e) => f.setGuestName(e.target.value)}
              disabled={sending}
            />
          </div>
          <button
            type="button"
            className="mw-btn"
            onClick={f.submit}
            disabled={!f.canSubmit || sending}
          >
            <IconPlus />
            <span>{sending ? 'Moment …' : 'Wünschen'}</span>
          </button>
          <div className="mwA-hint-row">
            <span className="mw-hint">
              <IconDisc />
              <span>Wünsche erscheinen sofort — der DJ schaut rein.</span>
            </span>
            <span className="mw-count">{f.items.length} Wünsche</span>
          </div>
        </div>

        {f.duplicateHint && <MwDuplicateHint />}
        <MwError msg={f.errorMsg} />
        {f.phase === 'success' && (
          <>
            <MwSuccessStrip message={successMsg} sub={successSub} />
            <div style={{ height: 16 }} />
          </>
        )}

        {f.items.length === 0 ? (
          <MwEmpty />
        ) : (
          <div className="mwA-list">
            {f.items.map((w) => (
              <article
                key={w.id}
                className={`mwA-row ${w.isFresh ? 'is-fresh' : ''}`}
              >
                <span className="mwA-note"><IconNote /></span>
                <div className="mwA-text">
                  <span className="mwA-title">{w.title}</span>
                  <span className="mwA-artist">{w.artist}</span>
                </div>
                <div className="mwA-meta">
                  {w.created_at && <span>{formatDayMonthDE(w.created_at)}</span>}
                  {w.guest_name && <span className="mwA-guest">von {w.guest_name}</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
