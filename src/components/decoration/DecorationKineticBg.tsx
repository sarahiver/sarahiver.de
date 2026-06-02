/**
 * DecorationKineticBg — Kinetic Stil
 *
 * Diagonale -15° Marquee, sitzt als Background-Layer hinter dem Content,
 * läuft kontinuierlich. Erzeugt diesen Magazine-Skew-Vibe.
 *
 * Animation-Keyframe `kin-marquee` in globals.css.
 *
 * Usage:
 *   <DecorationKineticBg text="Sarah & Iver Wedding Hamburg 12.07.2026" />
 *   <DecorationKineticBg text="…" rotation={-15} speed={18} opacity={0.1} />
 */

type Props = {
  text: string;
  rotation?: number; // deg, negativ = links-fallend
  speed?: number; // sek pro Loop
  opacity?: number;
  fontSize?: string;
  topPercent?: number; // vertikale Position (40 = mittig-oberhalb)
};

export default function DecorationKineticBg({
  text,
  rotation = -15,
  speed = 18,
  opacity = 0.1,
  fontSize = '8vw',
  topPercent = 40,
}: Props) {
  const repeated = `${text} — ${text} — ${text} — `;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: `${topPercent}%`,
        left: 0,
        width: '200%',
        transform: `rotate(${rotation}deg) translateY(-50%)`,
        transformOrigin: 'left center',
        opacity,
        whiteSpace: 'nowrap',
        fontSize,
        fontFamily: 'var(--font-display, sans-serif)',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        color: 'var(--ink, white)',
        pointerEvents: 'none',
        // CSS-Variable für das Keyframe-Sync mit rotation
        ['--kin-rotation' as string]: `${rotation}deg`,
        animation: `kin-marquee ${speed}s linear infinite`,
      }}
    >
      <span>{repeated}</span>
      <span>{repeated}</span>
    </div>
  );
}
