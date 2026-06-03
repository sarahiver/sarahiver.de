'use client';

import type { CSSProperties } from 'react';
import DecorationGoo from './DecorationGoo';
import DecorationAurora from './DecorationAurora';
import DecorationStars from './DecorationStars';
import DecorationGrain from './DecorationGrain';

/**
 * GlobalStyledBg — globaler ambient Background, FIXED im Viewport, animiert.
 *
 * Positioning + Filter inline, Animation per Klasse (sonst purgt Lightning
 * CSS / Tailwind v4 die @keyframes weil sie nirgends referenziert werden).
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

type Blob = {
  pos: CSSProperties;
  color: string;
  opacity: number;
  size: number;
  animClass: string; // CSS-Klasse für animation (Tailwind/Lightning CSS purge-safe)
};

const ORGANIC_BLOBS: Blob[] = [
  { pos: { top: '8%', left: '8%' }, color: 'var(--accent)', opacity: 0.55, size: 520, animClass: 'global-blob-anim global-blob-anim--organic' },
  { pos: { bottom: '12%', right: '10%' }, color: 'var(--accent-deep)', opacity: 0.5, size: 460, animClass: 'global-blob-anim global-blob-anim--organic global-blob-anim--d8' },
  { pos: { top: '55%', left: '55%' }, color: 'var(--accent)', opacity: 0.4, size: 360, animClass: 'global-blob-anim global-blob-anim--organic global-blob-anim--d16' },
];

const LIQUEFY_BLOBS: Blob[] = [
  { pos: { top: '5%', left: '3%' }, color: 'var(--accent)', opacity: 0.55, size: 540, animClass: 'global-blob-anim global-blob-anim--liquefy' },
  { pos: { bottom: '5%', right: '3%' }, color: 'var(--accent-deep)', opacity: 0.45, size: 580, animClass: 'global-blob-anim global-blob-anim--liquefy global-blob-anim--d3' },
  { pos: { top: '40%', left: '50%' }, color: 'var(--accent)', opacity: 0.35, size: 420, animClass: 'global-blob-anim global-blob-anim--liquefy global-blob-anim--d5' },
];

function blobStyle(blob: Blob, blurPx: number): CSSProperties {
  return {
    position: 'absolute',
    width: `${blob.size}px`,
    height: `${blob.size}px`,
    background: blob.color,
    borderRadius: '50%',
    opacity: blob.opacity,
    filter: `blur(${blurPx}px)`,
    ...blob.pos,
  };
}

export default function GlobalStyledBg({ style, cssVars }: Props) {
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
            <div key={`org-${i}`} className={blob.animClass} style={blobStyle(blob, 90)} />
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
            <div key={`liq-${i}`} className={blob.animClass} style={blobStyle(blob, 110)} />
          ))}
        </>
      )}
    </div>
  );
}
