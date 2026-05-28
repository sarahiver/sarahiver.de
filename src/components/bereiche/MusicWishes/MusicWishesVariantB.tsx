'use client';

import type { CSSProperties } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import { MUSICWISHES_DEFAULTS, readItems, formatDayMonthDE, coverGradient, initialOf } from './shared';
import { useMusicWishesForm } from './useMusicWishesForm';
import { MwHeader, MwSuccessStrip, MwError, MwDuplicateHint, MwEmpty } from './shared-ui';
import { IconPlus, IconDisc } from './icons';

/**
 * Musikwünsche Variante B — Cover-Karten mit Platzhalter-Cover
 *
 * Jeder Wunsch als Karte mit quadratischem Platzhalter-Cover (Initiale +
 * deterministischer oklch-Gradient aus der ID, SSR-safe). Freie Eingabe,
 * keine Moderation. Client Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
}

export default function MusicWishesVariantB({ content, weddingSlug }: Props) {
  const eyebrow = (content.eyebrow as string) ?? MUSICWISHES_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? MUSICWISHES_DEFAULTS.title;
  const description = (content.description as string) ?? MUSICWISHES_DEFAULTS.description;
  const successMsg = (content.success_message as string) ?? MUSICWISHES_DEFAULTS.success_message;
  const successSub = (content.success_sub as string) ?? MUSICWISHES_DEFAULTS.success_sub;

  const f = useMusicWishesForm(readItems(content), weddingSlug);
  const sending = f.phase === 'sending';

  return (
    <div className="mw mwB-section">
      <MwHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="mwB-wrap">
        <div className="mwB-form">
          <div className="mw-field">
            <label className="mw-field-label" htmlFor="mwB-title">Songtitel *</label>
            <input
              id="mwB-title"
              className="mw-input"
              type="text"
              placeholder="z.B. Dancing Queen"
              value={f.title}
              onChange={(e) => f.setTitle(e.target.value)}
              disabled={sending}
            />
          </div>
          <div className="mw-field">
            <label className="mw-field-label" htmlFor="mwB-artist">Interpret *</label>
            <input
              id="mwB-artist"
              className="mw-input"
              type="text"
              placeholder="z.B. ABBA"
              value={f.artist}
              onChange={(e) => f.setArtist(e.target.value)}
              disabled={sending}
            />
          </div>
          <div className="mw-field">
            <label className="mw-field-label" htmlFor="mwB-guest">
              Von wem? <span style={{ opacity: 0.6 }}>(optional)</span>
            </label>
            <input
              id="mwB-guest"
              className="mw-input"
              type="text"
              placeholder="Euer Name"
              value={f.guestName}
              onChange={(e) => f.setGuestName(e.target.value)}
              disabled={sending}
            />
          </div>
          <div className="mwB-form-foot">
            <span className="mw-hint">
              <IconDisc />
              <span>Freie Eingabe — kein Spotify, keine Suche.</span>
            </span>
            <button
              type="button"
              className="mw-btn"
              onClick={f.submit}
              disabled={!f.canSubmit || sending}
            >
              <IconPlus />
              <span>{sending ? 'Moment …' : 'Wunsch hinzufügen'}</span>
            </button>
          </div>
        </div>

        {f.duplicateHint && <MwDuplicateHint />}
        <MwError msg={f.errorMsg} />
        {f.phase === 'success' && (
          <>
            <MwSuccessStrip message={successMsg} sub={successSub} />
            <div style={{ height: 18 }} />
          </>
        )}

        {f.items.length === 0 ? (
          <MwEmpty />
        ) : (
          <div className="mwB-grid">
            {f.items.map((w, i) => {
              const grad = coverGradient(w.id, i);
              const coverStyle = {
                '--cover-a': grad.a,
                '--cover-b': grad.b,
              } as CSSProperties;
              return (
                <article key={w.id} className={`mwB-card ${w.isFresh ? 'is-fresh' : ''}`}>
                  <div className="mwB-cover" style={coverStyle}>{initialOf(w.title)}</div>
                  <div className="mwB-info">
                    <span className="mwB-title">{w.title}</span>
                    <span className="mwB-artist">{w.artist}</span>
                    {w.guest_name ? (
                      <span className="mwB-guest">
                        von {w.guest_name}{w.created_at ? ` · ${formatDayMonthDE(w.created_at)}` : ''}
                      </span>
                    ) : (
                      w.created_at && (
                        <span className="mwB-guest" style={{ color: 'var(--muted)' }}>
                          {formatDayMonthDE(w.created_at)}
                        </span>
                      )
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
