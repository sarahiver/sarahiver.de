'use client';

import type { EffectiveTokens } from '@/types/supabase';
import { useCountdown } from './use-countdown';
import { COUNTDOWN_DEFAULTS } from '@/lib/defaults';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

/**
 * Countdown Variante A — Number-Grid (statisch)
 *
 * Fünf große Zahlen nebeneinander. Magazine-Look.
 * Pro Stil unterschiedliche Number-Treatment via CSS-Variablen
 * (siehe design-system-v2.css → COUNTDOWN STYLES PRO STIL).
 *
 * WICHTIG ZU ORGANIC: Bei Organic-Stil bewegen sich die Zahlen NICHT
 * (sonst wirds zu unruhig). Stattdessen wabbelt nur der Hintergrund-
 * Container subtil.
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

  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';

  const values = {
    months: cd.months,
    days: cd.days,
    hours: cd.hours,
    minutes: cd.minutes,
    seconds: cd.seconds,
  } as const;

  return (
    <div className="cd cdA-wrap" data-style-countdown={style}>
      <StyledBereichBg
        style={style}
        marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`}
      />

      <p
        className="cd-eyebrow"
        data-editable="countdown.eyebrow"
        data-edit-type="text"
      >
        {eyebrow}
      </p>

      {cd.past ? (
        <p className="cd-past">{pastText}</p>
      ) : (
        <div className="cdA-grid">
          {UNITS.map(({ key, label, idx }) => (
            <div key={key} className="cdA-unit">
              <div
                className="cd-num"
                data-editable={`countdown.${key}`}
                data-edit-type="number"
              >
                {pad(values[key as keyof typeof values])}
              </div>
              <div className="cd-label">
                {style === 'mono' && (
                  <span className="cd-label-idx">{idx}</span>
                )}
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {!cd.past && footer && (
        <p
          className="cd-footer"
          data-editable="countdown.footer"
          data-edit-type="text"
        >
          {footer}
        </p>
      )}
    </div>
  );
}
