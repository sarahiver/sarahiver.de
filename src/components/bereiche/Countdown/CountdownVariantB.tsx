'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import { useCountdown } from './use-countdown';
import { formatDateStamp } from '@/lib/countdown';
import { parseWallClock } from '@/lib/date-format';
import { COUNTDOWN_DEFAULTS } from '@/lib/defaults';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';

/**
 * Countdown Variante B — Split-Flap-Counter
 *
 * Bahnhofs-Lamellen mit echtem 3D-Flip beim Zahlenwechsel.
 * Flip-Animation BLEIBT bei allen Stilen (das ist die DNA dieses Variants),
 * aber Look der Karten verändert sich pro Stil (Brutalist hart, Mono dünn,
 * Opulent gold-rim etc.) via CSS-Variablen.
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

function FlipCard({ digit, isSeconds }: { digit: string; isSeconds: boolean }) {
  const [current, setCurrent] = useState(digit);
  const [previous, setPrevious] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const cleanupTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (digit === current) return;
    setPrevious(current);
    setCurrent(digit);
    setAnimKey((k) => k + 1);

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
      <div className="flip-half flip-top">
        <div className="flip-digit">{current}</div>
      </div>
      <div className="flip-half flip-bottom">
        <div className="flip-digit">{previous ?? current}</div>
      </div>
      <div className="flip-mid" />
      {previous !== null && (
        <Fragment key={animKey}>
          <div className={`flip-half flip-top flip-anim flip-anim-top ${isSeconds ? 'is-seconds' : ''}`}>
            <div className="flip-digit">{previous}</div>
          </div>
          <div className={`flip-half flip-bottom flip-anim flip-anim-bot ${isSeconds ? 'is-seconds' : ''}`}>
            <div className="flip-digit">{current}</div>
          </div>
        </Fragment>
      )}
    </div>
  );
}

export default function CountdownVariantB({ tokens, content }: Props) {
  const target = new Date(tokens.wedding_date);
  const targetDisplay = parseWallClock(tokens.wedding_date) ?? target;
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
    <div className="cd cdB-wrap" data-style-countdown={style}>
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
        <div className="cdB-row">
          {UNITS.map(({ key, label }) => {
            const digits = pad2(values[key as keyof typeof values]);
            const isSeconds = key === 'seconds';
            return (
              <div key={key} className="cdB-unit">
                <div className="cdB-cards">
                  <FlipCard digit={digits[0]} isSeconds={isSeconds} />
                  <FlipCard digit={digits[1]} isSeconds={isSeconds} />
                </div>
                <div className="cd-label">{label}</div>
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
