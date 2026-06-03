'use client';

import type { CSSProperties } from 'react';
import DecorationGoo from './DecorationGoo';
import DecorationAurora from './DecorationAurora';
import DecorationStars from './DecorationStars';
import DecorationGrain from './DecorationGrain';

/**
 * GlobalStyledBg — globaler ambient Background, FIXED im Viewport.
 *
 * Kritische Properties (position, filter, top/left, animation) werden INLINE
 * gesetzt damit kein anderes CSS sie überschreibt. Klassen werden zusätzlich
 * gesetzt für ggf. zukünftige Stil-Anpassungen, aber sind nicht funktional
 * notwendig.
 *
 * Wird als SIBLING (NICHT als child) des wedding-site-wrappers gerendert.
 */

type Props = {
  style: string;
  cssVars?: CSSProperties;
};

const CONTAINER_STYLE: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  pointerEvents: 'none',
  zIndex: 0,
  overflow: 'hidden',
};

// Organic blobs — drei Stück, langsam driftend
const ORGANIC_BLOBS: Array<{ pos: CSSProperties; color: string; opacity: number; delay: string; size: number }> = [
  {
    pos: { top: '8%', left: '8%' },
    color: 'var(--accent)',
    opacity: 0.4,
    delay: '0s',
    size: 480,
  },
  {
    pos: { bottom: '12%', right: '10%' },
    color: 'var(--accent-deep)',
    opacity: 0.35,
    delay: '-8s',
    size: 420,
  },
  {
    pos: { top: '55%', left: '55%' },
    color: 'var(--accent)',
    opacity: 0.25,
    delay: '-16s',
    size: 320,
  },
];

const LIQUEFY_BLOBS: Array<{ pos: CSSProperties; color: string; opacity: number; delay: string; size: number }> = [
  {
    pos: { top: '5%', left: '3%' },
    color: 'var(--accent)',
    opacity: 0.45,
    delay: '0s',
    size: 500,
  },
  {
    pos: { bottom: '5%', right: '3%' },
    color: 'var(--accent-deep)',
    opacity: 0.35,
    delay: '-3s',
    size: 540,
  },
  {
    pos: { top: '40%', left: '50%' },
    color: 'var(--accent)',
    opacity: 0.25,
    delay: '-5s',
    size: 380,
  },
];

function organicBlobStyle(blob: typeof ORGANIC_BLOBS[number]): CSSProperties {
  return {
    position: 'absolute',
    width: `${blob.size}px`,
    height: `${blob.size}px`,
    background: blob.color,
    borderRadius: '50%',
    opacity: blob.opacity,
    filter: 'blur(80px)',
    animation: `org-global-drift 24s ease-in-out infinite`,
    animationDelay: blob.delay,
    ...blob.pos,
  };
}

function liquefyBlobStyle(blob: typeof LIQUEFY_BLOBS[number]): CSSProperties {
  return {
    position: 'absolute',
    width: `${blob.size}px`,
    height: `${blob.size}px`,
    background: blob.color,
    borderRadius: '50%',
    opacity: blob.opacity,
    filter: 'blur(100px)',
    animation: `liq-global-pulse 7s ease-in-out infinite`,
    animationDelay: blob.delay,
    ...blob.pos,
  };
}

export default function GlobalStyledBg({ style, cssVars }: Props) {
  // CSS-Variables für Decoration-Children: dem Container mitgeben damit
  // var(--accent) etc. innerhalb auflöst.
  const combinedStyle: CSSProperties = { ...CONTAINER_STYLE, ...cssVars };

  return (
    <div
      className="global-styled-bg"
      data-style={style}
      style={combinedStyle}
      aria-hidden="true"
    >
      {style === 'editorial' && <DecorationGrain intensity="soft" />}

      {style === 'organic' && (
        <>
          <DecorationGoo intensity="normal" />
          <DecorationGrain intensity="soft" />
          {ORGANIC_BLOBS.map((blob, i) => (
            <div key={`org-${i}`} style={organicBlobStyle(blob)} />
          ))}
        </>
      )}

      {style === 'mono' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.035) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      )}

      {style === 'opulent' && (
        <>
          <DecorationAurora intensity="normal" />
          <DecorationStars density="normal" />
        </>
      )}

      {style === 'liquefy' && (
        <>
          {LIQUEFY_BLOBS.map((blob, i) => (
            <div key={`liq-${i}`} style={liquefyBlobStyle(blob)} />
          ))}
        </>
      )}
    </div>
  );
}
