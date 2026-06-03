'use client';

import DecorationGoo from './DecorationGoo';
import DecorationAurora from './DecorationAurora';
import DecorationStars from './DecorationStars';
import DecorationGrain from './DecorationGrain';

/**
 * GlobalStyledBg — globaler ambient Background-Layer für die Wedding-Site.
 *
 * Wird einmal im Site-Wrapper gerendert (NICHT pro Bereich). Position: fixed,
 * bleibt im Viewport beim Scrollen. Inhalte aller Bereiche scrollen darüber.
 *
 * Was hier passiert vs. StyledBereichBg:
 *   - GlobalStyledBg = AMBIENT (Goo-Blobs, Aurora, Stars, Grain, Acid-Blobs).
 *     Pro Stil EIN globales Setting. Bleibt im VP.
 *   - StyledBereichBg = CONTEXT (Brutalist-Marquee überm Form, Mono-Cursor,
 *     Kinetic-Stripes). Pro Bereich, scrollt mit.
 *
 * So vermeiden wir den "Blubber-Salat" — User sieht beim Scrollen nicht
 * ständig neue Decorations sondern eine konsistente Atmosphäre.
 */

type Props = {
  style: string;
};

export default function GlobalStyledBg({ style }: Props) {
  return (
    <div className="global-styled-bg" data-style={style} aria-hidden="true">
      {style === 'editorial' && <DecorationGrain intensity="soft" />}

      {style === 'organic' && (
        <>
          <DecorationGoo intensity="normal" />
          <DecorationGrain intensity="soft" />
          {/* Zusätzliche große, langsam driftende Blobs für Tiefe */}
          <div className="global-organic-blob global-organic-blob--1" />
          <div className="global-organic-blob global-organic-blob--2" />
          <div className="global-organic-blob global-organic-blob--3" />
        </>
      )}

      {style === 'mono' && <div className="global-mono-grid" />}

      {style === 'opulent' && (
        <>
          <DecorationAurora intensity="normal" />
          <DecorationStars density="normal" />
        </>
      )}

      {style === 'liquefy' && (
        <>
          <div className="global-liquefy-blob global-liquefy-blob--1" />
          <div className="global-liquefy-blob global-liquefy-blob--2" />
          <div className="global-liquefy-blob global-liquefy-blob--3" />
        </>
      )}

      {/* Brutalist, Kinetic, Bauhaus: kein globaler BG — zu busy, der
          Charakter kommt aus dem Layout selbst und pro-Bereich-Decorations */}
    </div>
  );
}
