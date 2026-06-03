'use client';

import type { CSSProperties } from 'react';
import DecorationGoo from './DecorationGoo';
import DecorationAurora from './DecorationAurora';
import DecorationStars from './DecorationStars';
import DecorationGrain from './DecorationGrain';

/**
 * GlobalStyledBg — globaler ambient Background-Layer.
 *
 * WICHTIG: Wird als SIBLING (nicht Child) des wedding-site-wrappers
 * gerendert. Sonst können transform/filter/will-change auf irgendeinem
 * Vorfahre den position:fixed brechen, sodass die Blobs mit dem
 * ersten Bereich rausscrollen.
 *
 * Pattern in der Page:
 *   <>
 *     <GlobalStyledBg style={style} cssVars={cssVars} />
 *     <div className="wedding-site-wrapper" style={cssVars} ...>
 *       ...content...
 *     </div>
 *   </>
 *
 * cssVars werden inline auf den Background-Wrapper gesetzt, damit
 * var(--accent), var(--bg), etc. korrekt aufgelöst werden — sonst
 * vererbt das Element die Variables nicht (kein gemeinsamer Parent).
 */

type Props = {
  style: string;
  cssVars?: CSSProperties;
};

export default function GlobalStyledBg({ style, cssVars }: Props) {
  return (
    <div
      className="global-styled-bg"
      data-style={style}
      style={cssVars}
      aria-hidden="true"
    >
      {style === 'editorial' && <DecorationGrain intensity="soft" />}

      {style === 'organic' && (
        <>
          <DecorationGoo intensity="normal" />
          <DecorationGrain intensity="soft" />
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
    </div>
  );
}
