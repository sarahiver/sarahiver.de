/**
 * DecorationBauhausShapes — Bauhaus Stil
 *
 * Drei geometrische Primitive — Circle, Rectangle, Triangle — als BG-Layer.
 * Alle mit mix-blend-mode: multiply, sanfte Bewegung via CSS-Animations
 * (bau-circle-float, bau-rect-rotate in globals.css).
 *
 * Konstruktivistische Komposition, inspiriert vom Originellen Gemini-Hero.
 *
 * Usage:
 *   <DecorationBauhausShapes />                       // alle 3 Shapes
 *   <DecorationBauhausShapes shapes={['circle','rect']} />  // ohne Triangle
 *   <DecorationBauhausShapes variant="mirror" />      // gespiegelte Komposition
 */

type Shape = 'circle' | 'rect' | 'triangle';

type Props = {
  shapes?: Shape[];
  variant?: 'standard' | 'mirror';
  zIndex?: number;
};

export default function DecorationBauhausShapes({
  shapes = ['circle', 'rect', 'triangle'],
  variant = 'standard',
  zIndex = 0,
}: Props) {
  const isMirror = variant === 'mirror';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {shapes.includes('circle') && (
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            [isMirror ? 'right' : 'left']: '28%',
            width: '460px',
            height: '460px',
            background: isMirror ? 'var(--c-yellow, #F5B92B)' : 'var(--c-red, #E03A3E)',
            borderRadius: '50%',
            opacity: 0.85,
            mixBlendMode: 'multiply',
            animation: 'bau-circle-float 12s ease-in-out infinite',
          }}
        />
      )}

      {shapes.includes('rect') && (
        <div
          style={{
            position: 'absolute',
            bottom: '12%',
            [isMirror ? 'right' : 'left']: '4%',
            width: '38%',
            height: '110px',
            background: isMirror ? 'var(--c-red, #E03A3E)' : 'var(--c-yellow, #F5B92B)',
            transform: `rotate(${isMirror ? 8 : -8}deg)`,
            mixBlendMode: 'multiply',
            animation: 'bau-rect-rotate 16s ease-in-out infinite',
          }}
        />
      )}

      {shapes.includes('triangle') && (
        <div
          style={{
            position: 'absolute',
            top: '25%',
            [isMirror ? 'left' : 'right']: '4%',
            width: 0,
            height: 0,
            borderLeft: '60px solid transparent',
            borderRight: '60px solid transparent',
            borderBottom: '100px solid var(--c-navy, #1D2B49)',
            opacity: 0.4,
            transform: `rotate(${isMirror ? -15 : 15}deg)`,
          }}
        />
      )}
    </div>
  );
}
