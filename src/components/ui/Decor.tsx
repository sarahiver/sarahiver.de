'use client';

import { useDna } from '@/lib/dna-context';

/**
 * Decor — rendert das passende Trenner-Element basierend auf der DNA.
 *
 * Fünf Varianten, alle in --accent-Farbe (außer 'gold' in --gold):
 *   - none      → nichts
 *   - rule      → linie · dot · linie
 *   - hairline  → einzelne dünne Linie
 *   - sprig     → SVG-Blumenranke
 *   - gold      → linie · diamond · linie (in Gold)
 *
 * Justify folgt --align (center vs left).
 */
interface DecorProps {
  className?: string;
}

export default function Decor({ className = '' }: DecorProps) {
  const dna = useDna();

  if (dna.decor === 'none') return null;

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: dna.decor === 'hairline' ? '0' : dna.decor === 'sprig' ? '6px' : '10px',
    color: dna.decor === 'gold' ? 'var(--gold)' : 'var(--accent)',
    lineHeight: 0,
  };

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: dna.align === 'center' ? 'center' : 'flex-start',
    width: '100%',
  };

  if (dna.decor === 'rule') {
    return (
      <div style={wrapperStyle} className={className} aria-hidden="true">
        <span style={baseStyle}>
          <span style={{ display: 'block', width: 28, height: 1, background: 'currentColor' }} />
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
          <span style={{ display: 'block', width: 28, height: 1, background: 'currentColor' }} />
        </span>
      </div>
    );
  }

  if (dna.decor === 'hairline') {
    return (
      <div style={wrapperStyle} className={className} aria-hidden="true">
        <span style={baseStyle}>
          <span
            style={{
              display: 'block',
              width: 'clamp(80px, 18vw, 180px)',
              height: 1,
              background: 'currentColor',
              opacity: 0.7,
            }}
          />
        </span>
      </div>
    );
  }

  if (dna.decor === 'gold') {
    return (
      <div style={wrapperStyle} className={className} aria-hidden="true">
        <span style={baseStyle}>
          <span style={{ display: 'block', width: 28, height: 1, background: 'var(--gold)' }} />
          <span
            style={{
              width: 8,
              height: 8,
              background: 'var(--gold)',
              transform: 'rotate(45deg)',
            }}
          />
          <span style={{ display: 'block', width: 28, height: 1, background: 'var(--gold)' }} />
        </span>
      </div>
    );
  }

  if (dna.decor === 'sprig') {
    return (
      <div style={wrapperStyle} className={className} aria-hidden="true">
        <span style={baseStyle}>
          <svg
            width="92"
            height="22"
            viewBox="0 0 92 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          >
            <path d="M2 16 Q 14 4, 26 12 T 46 11" />
            <path d="M46 11 Q 58 18, 70 10 T 90 12" />
            <path d="M16 12 q -2 -4, -6 -4 M22 13 q -1 -5, -5 -5" />
            <path d="M62 12 q 2 -4, 6 -4 M70 11 q 1 -5, 5 -5" />
            <circle cx="46" cy="11" r="2" fill="currentColor" />
          </svg>
        </span>
      </div>
    );
  }

  return null;
}
