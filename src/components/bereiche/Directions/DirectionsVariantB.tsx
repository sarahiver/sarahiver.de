'use client';

import { useState, useRef, useCallback } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import { DIR_DEFAULTS, readLocations, renderDesc } from './shared';
import { DirHeader, DirLabelChip, DirTransit, RouteBtn, DirEmpty } from './shared-ui';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

/**
 * Anfahrt Variante B — Liste links, Karte rechts (sticky, src-swap)
 *
 * Klick auf eine Location markiert sie aktiv, klappt ihre Details auf
 * (Akkordeon) und tauscht die rechte Karte via iframe-src — key-frei,
 * kein Maps-SDK. Karte ist sticky.
 *
 * Client Component wegen State + iframe-Wechsel. Initial erste Location
 * aktiv (deterministisch — SSR-safe).
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function DirectionsVariantB({ tokens, content }: Props) {

  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const eyebrow = (content.eyebrow as string) ?? DIR_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? DIR_DEFAULTS.title;
  const description = (content.description as string) ?? DIR_DEFAULTS.description;
  const items = readLocations(content);

  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const fadeTimer = useRef<number | null>(null);

  const select = useCallback(
    (idx: number) => {
      if (idx === activeIdx) return;
      setFading(true);
      setActiveIdx(idx);
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
      fadeTimer.current = window.setTimeout(() => setFading(false), 240);
    },
    [activeIdx],
  );

  if (items.length === 0) {
    return (
      <div className="dir dirB-section" data-style-dir={style}>
      <StyledBereichBg
        style={style}
        marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`}
      />
        <DirHeader eyebrow={eyebrow} title={title} description={description} />
        <DirEmpty />
      </div>
    );
  }

  const active = items[Math.min(activeIdx, items.length - 1)];

  return (
    <div className="dir dirB-section" data-style-dir={style}>
      <DirHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="dirB-wrap">
        <div className="dirB-grid">
          <div className="dirB-list">
            {items.map((loc, i) => {
              const isActive = i === activeIdx;
              const shortAddr = (loc.address || '').split('\n').join(' · ');
              return (
                <button
                  key={loc.id}
                  type="button"
                  className={`dirB-row ${isActive ? 'is-active' : ''}`}
                  aria-pressed={isActive}
                  onClick={() => select(i)}
                >
                  <span className="dirB-num">{i + 1}</span>
                  <span className="dirB-content">
                    <DirLabelChip loc={loc} />
                    <span
                      className="dirB-name"
                      data-editable={`directions.items.${loc.id}.name`}
                      data-edit-type="text"
                    >
                      {loc.name}
                    </span>
                    <span className="dirB-short-addr">{shortAddr}</span>
                    <span className="dirB-details">
                      <span className="dirB-details-inner">
                        {loc.description && (
                          <div
                            className="dir-description"
                            dangerouslySetInnerHTML={{ __html: renderDesc(loc.description) }}
                          />
                        )}
                        <DirTransit loc={loc} />
                        {/* Route-Button: span statt verschachteltem <a> im <button> */}
                        {loc.maps_url && (
                          <span
                            className="dir-btn"
                            role="link"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(loc.maps_url, '_blank', 'noopener,noreferrer');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(loc.maps_url, '_blank', 'noopener,noreferrer');
                              }
                            }}
                          >
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 14, height: 14 }}>
                              <path d="M8 14s-5-4-5-8a5 5 0 1 1 10 0c0 4-5 8-5 8z" />
                              <circle cx="8" cy="6" r="1.6" />
                            </svg>
                            <span>Route planen</span>
                          </span>
                        )}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="dir-mapframe dirB-mapwrap" aria-label={`Karte ${active.name}`}>
            {active.maps_embed ? (
              <iframe
                key="dirB-map"
                src={active.maps_embed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                title={`Karte ${active.name}`}
                style={{ opacity: fading ? 0.4 : 1 }}
              />
            ) : (
              <div className="dir-map-missing">Karte fehlt</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
