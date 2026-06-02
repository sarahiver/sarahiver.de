/**
 * DecorationGrain — Editorial + Organic Stile
 *
 * Film-Grain-Overlay via inline-SVG mit feTurbulence-Filter.
 * Wird mit mix-blend-mode: multiply oder overlay drauf-geblendet.
 *
 * Performant: ein einziges 200×200-SVG-Pattern wird vom Browser gecached
 * und wiederholt sich automatisch (background-repeat default).
 *
 * Usage:
 *   <DecorationGrain />                        // multiply, opacity 0.06
 *   <DecorationGrain intensity="soft" />       // opacity 0.03
 *   <DecorationGrain blendMode="overlay" />    // für dunkle Hintergründe
 */

type Props = {
  intensity?: 'soft' | 'normal' | 'strong';
  blendMode?: 'multiply' | 'overlay' | 'screen';
  zIndex?: number;
};

const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>`;

export default function DecorationGrain({
  intensity = 'normal',
  blendMode = 'multiply',
  zIndex = 1,
}: Props) {
  const opacity = intensity === 'soft' ? 0.03 : intensity === 'strong' ? 0.12 : 0.06;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex,
        pointerEvents: 'none',
        opacity,
        mixBlendMode: blendMode,
        backgroundImage: `url("data:image/svg+xml;utf8,${GRAIN_SVG.replace(/#/g, '%23')}")`,
      }}
    />
  );
}
