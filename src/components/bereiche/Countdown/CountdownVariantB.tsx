'use client';

import { useState, useEffect, useRef } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import { useCountdown } from './use-countdown';
import { formatDateStamp } from '@/lib/countdown';
import { COUNTDOWN_DEFAULTS } from '@/lib/defaults';
import Decor from '@/components/ui/Decor';

/**
 * Countdown Variante B — Split-Flap-Counter
 *
 * Bahnhofs-Lamellen mit echtem 3D-Flip beim Zahlenwechsel.
 * Jede zweistellige Zahl besteht aus 2 Karten (je 1 Ziffer).
 * Bei Wechsel: obere Hälfte klappt nach unten weg (rotateX -90°),
 * untere Hälfte klappt von oben hervor (rotateX 0°).
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

const UNITS = [
  { key: 'months', label: 'Monate' },
  { key: 'days', label: 'Tage' },
  { key: 'hours', label: 'Stunden' },
  { key: 'minutes', label: 'Minuten' },
  { key: 'seconds', label: 'Sekunden' },
] as const;

function pad2(n: number): string {
  return String(Math.max(0, Math.min(99, n))).padStart(2, '0');
}

/**
 * Single flip-card — eine Ziffer mit 3D-Flip-Animation.
 *
 * Zeigt aktuelle Ziffer. Bei Wechsel: erzeugt zwei animierte Flap-Hälften
 * (alte Ziffer klappt weg, neue klappt hervor), die nach Animation entfernt werden.
 */
function FlipCard({ digit, isSeconds }: { digit: string; isSeconds: boolean }) {
  const [current, setCurrent] = useState(digit);
  const [previous, setPrevious] = useState<string | null>(null);
  const cleanupTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (digit === current) return;
    setPrevious(current);
    setCurrent(digit);

    // Cleanup nach Animation (Dauer muss zu CSS-Animationen passen)
    // Normal: top 280ms + bot delay 140ms + bot 280ms = 420ms → +20ms buffer
    // Seconds: top 180ms + bot delay 90ms + bot 180ms = 270ms → +20ms buffer
    if (cleanupTimer.current) clearTimeout(cleanupTimer.current);
    const totalDuration = isSeconds ? 290 : 440;
    cleanupTimer.current = setTimeout(() => {
      setPrevious(null);
    }, totalDuration);

    return () => {
      if (cleanupTimer.current) clearTimeout(cleanupTimer.current);
    };
  }, [digit, current, isSeconds]);

  return (
    <div className="flip-card">
      {/* Statische obere Hälfte zeigt NEUE Ziffer (wird beim Flip enthüllt) */}
      <div className="flip-half flip-top">
        <div className="flip-digit">{current}</div>
      </div>

      {/* Statische untere Hälfte zeigt ALTE Ziffer (oder neue wenn keine Animation) */}
      <div className="flip-half flip-bottom">
        <div className="flip-digit">{previous ?? current}</div>
      </div>

      {/* Trennlinie */}
      <div className="flip-mid" />

      {/* Animierte Flaps (nur während Wechsel) */}
      {previous !== null && (
        <>
          <div className={`flip-half flip-top flip-anim flip-anim-top ${isSeconds ? 'is-seconds' : ''}`}>
            <div className="flip-digit">{previous}</div>
          </div>
          <div className={`flip-half flip-bottom flip-anim flip-anim-bot ${isSeconds ? 'is-seconds' : ''}`}>
            <div className="flip-digit">{current}</div>
          </div>
        </>
      )}
    </div>
  );
}

export default function CountdownVariantB({ tokens, content }: Props) {
  const target = new Date(tokens.wedding_date);
  const cd = useCountdown(target);

  const eyebrow = (content.eyebrow as string) ?? COUNTDOWN_DEFAULTS.eyebrow;
  const footer = (content.footer as string) ?? COUNTDOWN_DEFAULTS.footer;
  const pastText = (content.past_text as string) ?? COUNTDOWN_DEFAULTS.past_text;

  const padding =
    tokens.dna_spacing === 'tight' ? 'var(--pad-tight)' :
    tokens.dna_spacing === 'airy' ? 'var(--pad-airy)' :
    tokens.dna_spacing === 'wide' ? 'var(--pad-wide)' :
    'var(--pad-regular)';

  const values = {
    months: cd.months,
    days: cd.days,
    hours: cd.hours,
    minutes: cd.minutes,
    seconds: cd.seconds,
  } as const;

  return (
    <div
      style={{
        padding: `clamp(64px, 8vw, 96px) ${padding}`,
        textAlign: tokens.dna_align,
        color: 'var(--ink)',
        perspective: '480px',
      }}
    >
      {/* Eyebrow */}
      <p
        data-editable="countdown.eyebrow"
        data-edit-type="text"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          margin: '0 0 16px',
        }}
      >
        {eyebrow}
      </p>

      <div style={{ marginBottom: 24 }}>
        <Decor />
      </div>

      {/* Datums-Stempel */}
      <div
        style={{
          marginBottom: 28,
          display: 'flex',
          justifyContent: tokens.dna_align === 'center' ? 'center' : 'flex-start',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.22em',
            color: 'var(--accent-deep)',
            border: '1px solid var(--accent)',
            borderRadius: 2,
          }}
        >
          {formatDateStamp(target)}
        </span>
      </div>

      {cd.past ? (
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: 'var(--accent)',
            margin: 0,
          }}
        >
          {pastText}
        </p>
      ) : (
        <div
          className="cd-flap-row"
          style={{
            display: 'flex',
            justifyContent: tokens.dna_align === 'center' ? 'center' : 'flex-start',
            gap: 'clamp(0.8rem, 2vw, 1.6rem)',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          {UNITS.map(({ key, label }) => {
            const digits = pad2(values[key as keyof typeof values]);
            const isSeconds = key === 'seconds';
            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', gap: 4 }}>
                  <FlipCard digit={digits[0]} isSeconds={isSeconds} />
                  <FlipCard digit={digits[1]} isSeconds={isSeconds} />
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    marginTop: 4,
                  }}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!cd.past && footer && (
        <p
          data-editable="countdown.footer"
          data-edit-type="text"
          style={{
            fontFamily: 'var(--font-script)',
            fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
            color: 'var(--accent)',
            marginTop: 40,
            marginBottom: 0,
            fontWeight: 500,
          }}
        >
          {footer}
        </p>
      )}
    </div>
  );
}
