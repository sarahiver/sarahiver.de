'use client';

import { useDna } from '@/lib/dna-context';

/**
 * Decor-Komponente — rendert das passende Dekorations-Element
 * basierend auf der globalen DNA des Brautpaars.
 *
 * Wird in jeder Bereich-Komponente eingesetzt, statt dass jede
 * Komponente ihre eigene Decor-Logik baut.
 *
 * Beispiel:
 *   <Decor /> → rendert <Rule/> bei dna.decor === 'rule',
 *              <Sprig/> bei dna.decor === 'sprig', etc.
 *
 * Color: nutzt automatisch var(--accent) oder var(--accent-deep).
 */
interface DecorProps {
  variant?: 'subtle' | 'prominent';
  className?: string;
}

export default function Decor({ variant = 'subtle', className = '' }: DecorProps) {
  const dna = useDna();

  if (dna.decor === 'none') return null;

  const alignClass = dna.align === 'center' ? 'mx-auto' : 'ml-0';

  if (dna.decor === 'rule') {
    return (
      <div
        className={`flex items-center gap-3 ${alignClass} ${className}`}
        style={{ justifyContent: dna.align === 'center' ? 'center' : 'flex-start' }}
        aria-hidden="true"
      >
        <span
          className="h-px"
          style={{
            background: 'var(--accent)',
            width: variant === 'prominent' ? '60px' : '40px',
          }}
        />
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: 'var(--accent)' }}
        />
        <span
          className="h-px"
          style={{
            background: 'var(--accent)',
            width: variant === 'prominent' ? '60px' : '40px',
          }}
        />
      </div>
    );
  }

  if (dna.decor === 'hairline') {
    return (
      <div
        className={`flex ${className}`}
        style={{ justifyContent: dna.align === 'center' ? 'center' : 'flex-start' }}
        aria-hidden="true"
      >
        <span
          className="h-px"
          style={{
            background: 'var(--accent)',
            width: variant === 'prominent' ? '120px' : '80px',
            opacity: 0.7,
          }}
        />
      </div>
    );
  }

  if (dna.decor === 'sprig') {
    return (
      <svg
        width={variant === 'prominent' ? 64 : 48}
        height={variant === 'prominent' ? 28 : 22}
        viewBox="0 0 48 22"
        className={`${alignClass} ${className}`}
        style={{ color: 'var(--accent)' }}
        aria-hidden="true"
      >
        <path
          d="M2 11 Q 12 4 24 11 Q 36 18 46 11"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse
          cx="13"
          cy="8"
          rx="3"
          ry="1.5"
          transform="rotate(-30 13 8)"
          fill="currentColor"
          opacity="0.6"
        />
        <ellipse cx="24" cy="13" rx="3" ry="1.5" fill="currentColor" opacity="0.6" />
        <ellipse
          cx="35"
          cy="8"
          rx="3"
          ry="1.5"
          transform="rotate(30 35 8)"
          fill="currentColor"
          opacity="0.6"
        />
      </svg>
    );
  }

  if (dna.decor === 'gold') {
    return (
      <div
        className={`flex items-center gap-2 ${className}`}
        style={{ justifyContent: dna.align === 'center' ? 'center' : 'flex-start' }}
        aria-hidden="true"
      >
        <span
          className="h-px"
          style={{
            background: 'var(--accent)',
            width: variant === 'prominent' ? '60px' : '32px',
          }}
        />
        <span style={{ color: 'var(--accent)', fontSize: '12px' }}>◆</span>
        <span
          className="h-px"
          style={{
            background: 'var(--accent)',
            width: variant === 'prominent' ? '60px' : '32px',
          }}
        />
      </div>
    );
  }

  return null;
}
