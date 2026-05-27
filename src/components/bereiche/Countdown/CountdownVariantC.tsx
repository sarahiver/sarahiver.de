'use client';

import type { EffectiveTokens } from '@/types/supabase';
import { useCountdown } from './use-countdown';
import { formatDateStamp } from '@/lib/countdown';
import { COUNTDOWN_DEFAULTS } from '@/lib/defaults';
import Decor from '@/components/ui/Decor';

/**
 * Countdown Variante C — Zeitstrahl (Horizontale Progress-Bars)
 *
 * Fünf Bars untereinander, jede zeigt den verbleibenden Anteil ihrer Skala.
 * Sekunden-Bar tickt jede Sekunde sichtbar.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function CountdownVariantC({ tokens, content }: Props) {
  const target = new Date(tokens.wedding_date);
  const cd = useCountdown(target);

  const eyebrow = (content.eyebrow as string) ?? COUNTDOWN_DEFAULTS.eyebrow;
  const footer = (content.footer as string) ?? COUNTDOWN_DEFAULTS.footer;
  const pastText = (content.past_text as string) ?? COUNTDOWN_DEFAULTS.past_text;

  const styleHint = (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'klassisch';

  const padding =
    tokens.dna_spacing === 'tight' ? 'var(--pad-tight)' :
    tokens.dna_spacing === 'airy' ? 'var(--pad-airy)' :
    tokens.dna_spacing === 'wide' ? 'var(--pad-wide)' :
    'var(--pad-regular)';

  // Skalen pro Unit
  const bars = [
    { key: 'months', label: 'Monate', short: 'M', value: cd.months, max: 12 },
    { key: 'days', label: 'Tage', short: 'T', value: cd.days, max: cd.daysInCurrentMonth },
    { key: 'hours', label: 'Stunden', short: 'H', value: cd.hours, max: 24 },
    { key: 'minutes', label: 'Minuten', short: 'Min', value: cd.minutes, max: 60 },
    { key: 'seconds', label: 'Sekunden', short: 'S', value: cd.seconds, max: 60 },
  ];

  const barHeight = styleHint === 'minimal' ? 1 : styleHint === 'festlich' ? 12 : 8;
  const trackHeight = styleHint === 'minimal' ? 1 : barHeight;
  const barRadius = styleHint === 'modern' ? 0 : styleHint === 'floral' ? 8 : 4;

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
          style={{
            maxWidth: 720,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(14px, 2vw, 22px)',
          }}
        >
          {bars.map(({ key, label, short, value, max }) => {
            const fillPercent = Math.min(100, Math.max(0, (value / max) * 100));
            const fillColor = styleHint === 'festlich' ? 'var(--gold)' : 'var(--accent)';

            return (
              <div
                key={key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 80px',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                {/* Label */}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-soft)',
                    textAlign: styleHint === 'modern' ? 'right' : 'left',
                  }}
                >
                  <span className="bar-label-full">{label}</span>
                  <span className="bar-label-short" style={{ display: 'none' }}>{short}</span>
                </span>

                {/* Track + Fill */}
                <span
                  style={{
                    display: 'block',
                    width: '100%',
                    height: trackHeight,
                    background: 'var(--border-soft)',
                    borderRadius: barRadius,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <span
                    data-fill={key}
                    style={{
                      display: 'block',
                      width: `${fillPercent}%`,
                      height: '100%',
                      background: fillColor,
                      borderRadius: barRadius,
                      transition: key === 'seconds' ? 'none' : 'width 0.4s ease-out',
                    }}
                  />
                </span>

                {/* Zahl */}
                <span
                  style={{
                    fontFamily: styleHint === 'minimal' ? 'var(--font-mono)' : 'var(--font-display)',
                    fontSize: 16,
                    color: 'var(--ink)',
                    textAlign: styleHint === 'modern' ? 'left' : 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <span data-num={key}>{value}</span>
                  <span style={{ color: 'var(--muted)', opacity: 0.6 }}> / {max}</span>
                </span>
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
