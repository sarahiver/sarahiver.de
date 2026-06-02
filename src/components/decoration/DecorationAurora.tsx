/**
 * DecorationAurora — Opulent Stil
 *
 * Zwei animierte radial-gradient Ellipsen, deren Positionen via
 * @property-Custom-Properties (--aurora-1, --aurora-2) atmen.
 * Erzeugt diesen typischen "Galerie-Eröffnung-um-Mitternacht"-Glow.
 *
 * Animation (op-aurora 16-20s loop) in globals.css.
 * @property-Defs in globals.css.
 *
 * Usage:
 *   <DecorationAurora />                       // Standard, 16s
 *   <DecorationAurora intensity="strong" />    // Stärker, mehr Opacity
 *   <DecorationAurora blendMode="screen" />    // für Bleed-Layouts auf Bild
 */

type Props = {
  intensity?: 'soft' | 'normal' | 'strong';
  blendMode?: 'normal' | 'screen' | 'overlay';
  zIndex?: number;
};

export default function DecorationAurora({
  intensity = 'normal',
  blendMode = 'normal',
  zIndex = 0,
}: Props) {
  const opacity = intensity === 'soft' ? 0.6 : intensity === 'strong' ? 1.0 : 0.8;

  return (
    <div
      aria-hidden="true"
      className="op-aurora-layer"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex,
        pointerEvents: 'none',
        opacity,
        mixBlendMode: blendMode,
        background: `
          radial-gradient(ellipse 600px 400px at var(--aurora-1, 50%) 30%, rgba(197,165,114,0.25) 0%, transparent 50%),
          radial-gradient(ellipse 500px 350px at var(--aurora-2, 50%) 70%, rgba(224,192,136,0.2) 0%, transparent 50%)
        `,
        filter: 'blur(40px)',
        animation: 'op-aurora 16s ease-in-out infinite',
      }}
    />
  );
}
