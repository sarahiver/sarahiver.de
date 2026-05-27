'use client';

import type { EffectiveTokens } from '@/types/supabase';
import { useCountdown } from './use-countdown';
import { COUNTDOWN_DEFAULTS } from '@/lib/defaults';
import Decor from '@/components/ui/Decor';

/**
 * Countdown Variante A — Number-Grid (statisch)
 *
 * Fünf große Zahlen nebeneinander. Wedding-Magazine-Look.
 * Keine Animation beim Wechsel — die Zahl wechselt einfach hart.
 */
interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

const UNITS = [
  { key: 'months',  label: 'Monate',   idx: '01' },
  { key: 'days',    label: 'Tage',     idx: '02' },
  { key: 'hours',   label: 'Stunden',  idx: '03' },
  { key: 'minutes', label: 'Minuten',  idx: '04' },
  { key: 'seconds', label: 'Sekunden', idx: '05' },
] as const;

function pad(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0');
}

export default function CountdownVariantA({ tokens, content }: Props) {
  const target = new Date(tokens.wedding_date);
  const cd = useCountdown(target);

  const eyebrow = (content.eyebrow as string) ?? COUNTDOWN_DEFAULTS.eyebrow;
  const footer = (content.footer as string) ?? COUNTDOWN_DEFAULTS.footer;
  const pastText = (content.past_text as string) ?? COUNTDOWN_DEFAULTS.past_text;

  const styleHint = (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'klassisch';

  // Stil-spezifisches Padding via spacing-token
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

      <div style={{ marginBottom: 32 }}>
        <Decor />
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
          style={{
            display: 'flex',
            justifyContent: tokens.dna_align === 'center' ? 'center' : 'flex-start',
            gap: 'clamp(2rem, 5vw, 5rem)',
            flexWrap: 'wrap',
          }}
        >
          {UNITS.map(({ key, label, idx }) => (
            <div
              key={key}
              style={{ textAlign: 'center', minWidth: 80 }}
            >
              <div
                data-editable={`countdown.${key}`}
                data-edit-type="number"
                style={{
                  fontFamily: styleHint === 'minimal' ? 'var(--font-mono)' : 'var(--font-display)',
                  fontWeight: styleHint === 'festlich' ? 700 : 'var(--display-weight)' as unknown as number,
                  fontStyle: 'var(--display-style)' as unknown as 'normal' | 'italic',
                  fontSize: 'clamp(3.5rem, 9vw, 6rem)',
                  lineHeight: 1,
                  color: 'var(--ink)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {pad(values[key as keyof typeof values])}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginTop: 8,
                }}
              >
                {styleHint === 'modern' ? (
                  <>
                    <span style={{ marginRight: 6, opacity: 0.55 }}>{idx}</span>
                    {label}
                  </>
                ) : (
                  label
                )}
              </div>
            </div>
          ))}
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
