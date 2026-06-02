'use client';

import type { EffectiveTokens } from '@/types/supabase';
import { useCountdown } from './use-countdown';
import { formatDateStamp } from '@/lib/countdown';
import { parseWallClock } from '@/lib/date-format';
import { COUNTDOWN_DEFAULTS } from '@/lib/defaults';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

/**
 * Countdown Variante C — Zeitstrahl (Horizontale Progress-Bars)
 *
 * Fünf Bars untereinander, jede zeigt den verbleibenden Anteil ihrer Skala.
 * Pro Stil unterschiedlich gestylt (Brutalist 3px Borders, Mono dünne
 * Hairlines, Opulent Gold, Organic rounded, etc.) via CSS-Variablen.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function CountdownVariantC({ tokens, content }: Props) {
  const target = new Date(tokens.wedding_date);
  const targetDisplay = parseWallClock(tokens.wedding_date) ?? target;
  const cd = useCountdown(target);

  const eyebrow = (content.eyebrow as string) ?? COUNTDOWN_DEFAULTS.eyebrow;
  const footer = (content.footer as string) ?? COUNTDOWN_DEFAULTS.footer;
  const pastText = (content.past_text as string) ?? COUNTDOWN_DEFAULTS.past_text;

  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';

  const bars = [
    { key: 'months',  label: 'Monate',   short: 'M',   value: cd.months,  max: 12 },
    { key: 'days',    label: 'Tage',     short: 'T',   value: cd.days,    max: cd.daysInCurrentMonth },
    { key: 'hours',   label: 'Stunden',  short: 'H',   value: cd.hours,   max: 24 },
    { key: 'minutes', label: 'Minuten',  short: 'Min', value: cd.minutes, max: 60 },
    { key: 'seconds', label: 'Sekunden', short: 'S',   value: cd.seconds, max: 60 },
  ];

  return (
    <div className="cd cdC-wrap" data-style-countdown={style}>
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

      <div className="cd-date-stamp-wrap">
        <span className="cd-date-stamp">{formatDateStamp(targetDisplay)}</span>
      </div>

      {cd.past ? (
        <p className="cd-past">{pastText}</p>
      ) : (
        <div className="cdC-bars">
          {bars.map(({ key, label, short, value, max }) => {
            const fillPercent = Math.min(100, Math.max(0, (value / max) * 100));
            return (
              <div key={key} className="cdC-bar-row" data-unit={key}>
                <span className="cdC-bar-label cd-label">
                  <span className="cdC-bar-label-full">{label}</span>
                  <span className="cdC-bar-label-short">{short}</span>
                </span>
                <span className="cdC-bar-track">
                  <span
                    className={`cdC-bar-fill ${key === 'seconds' ? 'is-seconds' : ''}`}
                    style={{ width: `${fillPercent}%` }}
                  />
                </span>
                <span className="cdC-bar-num">
                  <span className="cdC-bar-num-value">{value}</span>
                  <span className="cdC-bar-num-max"> / {max}</span>
                </span>
              </div>
            );
          })}
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
