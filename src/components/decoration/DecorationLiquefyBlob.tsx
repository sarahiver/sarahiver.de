/**
 * DecorationLiquefyBlob — Liquefy Stil
 *
 * Wrapper-Container, der seine Children durch den #brutal-melt SVG-Filter
 * verflüssigt. Dazu sanftes Scale+Rotate-Loop (liq-blob-shift in globals.css).
 *
 * Typische Verwendung: Bild als <img> oder background-image-div als Child
 * reinpacken — dann zerfließt das Bild zu Liquid-Mercury.
 *
 * Achtung Performance: brutal-melt ist ein aggressiver Filter. Pro Hero
 * maximal eine Instanz nutzen.
 *
 * Usage:
 *   <DecorationLiquefyBlob>
 *     <img src="..." alt="..." />
 *   </DecorationLiquefyBlob>
 *
 *   <DecorationLiquefyBlob size="lg" shape="circle">
 *     <div style={{ background: 'var(--img-square)', ... }} />
 *   </DecorationLiquefyBlob>
 */

import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square' | 'free';
  className?: string;
};

const SIZE_MAP = {
  sm: '320px',
  md: '420px',
  lg: '520px',
};

export default function DecorationLiquefyBlob({
  children,
  size = 'md',
  shape = 'circle',
  className,
}: Props) {
  return (
    <div
      className={className}
      style={{
        width: SIZE_MAP[size],
        height: SIZE_MAP[size],
        maxWidth: '100%',
        aspectRatio: '1',
        filter: 'url(#brutal-melt)',
        borderRadius: shape === 'circle' ? '50%' : shape === 'square' ? '0' : '20%',
        overflow: 'hidden',
        animation: 'liq-blob-shift 6s ease-in-out infinite alternate',
        position: 'relative',
      }}
    >
      {/* Children werden auf >100% skaliert, damit der Melt-Filter nicht
          die Kanten transparent zieht und den Container "ausfranst". */}
      <div
        style={{
          width: '130%',
          height: '130%',
          margin: '-15%',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  );
}
