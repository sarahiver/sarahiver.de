/**
 * DecorationMarquee — Brutalist Stil
 *
 * Endless horizontal Marquee mit beliebigem Text. Optional gekippt auf
 * 3D-Z-Achse für Brutalist-Headlines.
 *
 * Animation-Keyframe `br-marquee` und `br-marquee-rev` in globals.css.
 *
 * Usage:
 *   <DecorationMarquee text="Sarah & Iver" />
 *   <DecorationMarquee text="…" tilt="3d" speed={22} />
 *   <DecorationMarquee text="…" direction="reverse" />
 *
 * Hinweis:
 *   Text wird intern 4× wiederholt, damit der Loop nahtlos wirkt.
 *   `&amp; gilt als ein Wort, nicht als Trennzeichen.
 */

type Props = {
  text: string;
  speed?: number; // sekunden für einen Loop
  direction?: 'normal' | 'reverse';
  tilt?: 'none' | '3d';
  fontSize?: string; // CSS-Wert, z.B. "clamp(100px, 16vw, 240px)"
  separator?: string; // zwischen Wiederholungen
  className?: string;
};

export default function DecorationMarquee({
  text,
  speed = 22,
  direction = 'normal',
  tilt = 'none',
  fontSize = 'clamp(100px, 16vw, 240px)',
  separator = ' — ',
  className,
}: Props) {
  const animationName = direction === 'reverse' ? 'br-marquee-rev' : 'br-marquee';
  const repeated = `${text}${separator}${text}${separator}${text}${separator}${text}${separator}`;

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        ...(tilt === '3d' && {
          transform: 'rotateX(20deg) rotateZ(-2deg)',
          transformOrigin: 'center 70%',
        }),
      }}
    >
      <div
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          fontSize,
          fontFamily: 'var(--font-display, sans-serif)',
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-0.045em',
          textTransform: 'uppercase',
          animation: `${animationName} ${speed}s linear infinite`,
        }}
      >
        <span>{repeated}</span>
        <span>{repeated}</span>
      </div>
    </div>
  );
}
