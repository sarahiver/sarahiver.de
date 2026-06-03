'use client';

import type { CSSProperties } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import {
  MUSICWISHES_DEFAULTS,
  readItems,
  vinylLabel,
  vinylLabelText,
} from './shared';
import { useMusicWishesForm } from './useMusicWishesForm';
import { MwHeader, MwSuccessStrip, MwError, MwDuplicateHint, MwEmpty } from './shared-ui';
import { IconNote, IconDisc } from './icons';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

/**
 * Musikwünsche Variante C — Jukebox / Vinyl-Optik
 *
 * Jeder Wunsch als kleine Schallplatte (Rillen-CSS + Mittel-Label; Label-
 * Farbe deterministisch aus der ID → SSR-safe). Eingabe-Zeile unter dem
 * Raster. Freie Eingabe, keine Moderation. Client Component.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
}

export default function MusicWishesVariantC({ tokens, content, weddingSlug }: Props) {

  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const eyebrow = (content.eyebrow as string) ?? MUSICWISHES_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? MUSICWISHES_DEFAULTS.title;
  const description = (content.description as string) ?? MUSICWISHES_DEFAULTS.description;
  const successMsg = (content.success_message as string) ?? MUSICWISHES_DEFAULTS.success_message;
  const successSub = (content.success_sub as string) ?? MUSICWISHES_DEFAULTS.success_sub;

  const f = useMusicWishesForm(readItems(content), weddingSlug);
  const sending = f.phase === 'sending';

  return (
    <div className="mw mwC-section" data-style-music={style}>
      <StyledBereichBg
        style={style}
        marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`}
      />
      <MwHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="mwC-wrap">
        <div className="mwC-bar">
          <span className="mwC-bar-label">
            <IconNote />
            <span>Eure Plattensammlung für den Abend</span>
          </span>
          <span className="mw-count">{f.items.length} Wünsche</span>
        </div>

        {f.items.length === 0 ? (
          <MwEmpty />
        ) : (
          <div className="mwC-grid">
            {f.items.map((w, i) => {
              const vinylStyle = { '--label-color': vinylLabel(w.id, i) } as CSSProperties;
              return (
                <div key={w.id} className={`mwC-item ${w.isFresh ? 'is-fresh' : ''}`}>
                  <div className="mwC-vinyl" style={vinylStyle}>
                    <span className="mwC-label-text">{vinylLabelText(w)}</span>
                  </div>
                  <div className="mwC-info">
                    <span className="mwC-title">{w.title}</span>
                    <span className="mwC-artist">{w.artist}</span>
                    {w.guest_name && <span className="mwC-guest">— von {w.guest_name}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {f.phase === 'success' && (
          <>
            <div style={{ height: 24 }} />
            <MwSuccessStrip message={successMsg} sub={successSub} />
          </>
        )}

        <div className="mwC-form">
          <div className="mw-field">
            <label className="mw-field-label" htmlFor="mwC-title">Songtitel *</label>
            <input
              id="mwC-title"
              className="mw-input"
              type="text"
              placeholder="z.B. Dancing Queen"
              value={f.title}
              onChange={(e) => f.setTitle(e.target.value)}
              disabled={sending}
            />
          </div>
          <div className="mw-field">
            <label className="mw-field-label" htmlFor="mwC-artist">Interpret *</label>
            <input
              id="mwC-artist"
              className="mw-input"
              type="text"
              placeholder="z.B. ABBA"
              value={f.artist}
              onChange={(e) => f.setArtist(e.target.value)}
              disabled={sending}
            />
          </div>
          <div className="mw-field">
            <label className="mw-field-label" htmlFor="mwC-guest">
              Von wem? <span style={{ opacity: 0.6 }}>(optional)</span>
            </label>
            <input
              id="mwC-guest"
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
            <IconNote />
            <span>{sending ? 'Moment …' : '♪ Wunsch einwerfen'}</span>
          </button>
          <div className="mwC-form-foot">
            <span className="mw-hint">
              <IconDisc />
              <span>Wünsche landen direkt auf der Tanzfläche — ohne Umwege.</span>
            </span>
            {f.duplicateHint && <MwDuplicateHint />}
            <MwError msg={f.errorMsg} />
          </div>
        </div>
      </div>
    </div>
  );
}
