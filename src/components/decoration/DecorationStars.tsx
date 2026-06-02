/**
 * DecorationStars — Opulent Stil
 *
 * Gold-Sprenkel-Pattern via radial-gradients an pseudo-random Positionen.
 * Twinkelt zwischen opacity 0.4 und 0.9 (Animation in globals.css: op-stars-twinkle).
 *
 * Usage:
 *   <DecorationStars />                       // Standard
 *   <DecorationStars density="dense" />       // 16 statt 10 Stars
 *   <DecorationStars zIndex={1} />            // über Aurora aber unter Content
 */

type Props = {
  density?: 'sparse' | 'normal' | 'dense';
  zIndex?: number;
};

export default function DecorationStars({ density = 'normal', zIndex = 0 }: Props) {
  // Pseudo-random Star-Positionen als Background-Image-Layer
  // (radial-gradients als Pseudo-Pixel)
  const positions = {
    sparse: [
      [13, 22], [67, 41], [84, 73], [52, 8], [91, 25], [8, 64],
    ],
    normal: [
      [13, 22], [67, 41], [84, 73], [33, 87], [52, 8],
      [91, 25], [8, 64], [45, 55], [23, 78], [76, 92],
    ],
    dense: [
      [13, 22], [67, 41], [84, 73], [33, 87], [52, 8], [91, 25],
      [8, 64], [45, 55], [23, 78], [76, 92], [29, 14], [58, 62],
      [4, 38], [88, 51], [37, 35], [62, 19],
    ],
  };

  const stars = positions[density]
    .map(([x, y], i) => {
      const size = i % 3 === 0 ? '1.5px' : i % 3 === 1 ? '1px' : '0.8px';
      return `radial-gradient(${size} ${size} at ${x}% ${y}%, var(--gold-bright, #E0C088) 50%, transparent 100%)`;
    })
    .join(', ');

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex,
        pointerEvents: 'none',
        opacity: 0.5,
        backgroundImage: stars,
        animation: 'op-stars-twinkle 4s ease-in-out infinite',
      }}
    />
  );
}
