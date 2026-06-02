/**
 * SVG-Filter-Library — globale, unsichtbare SVG-Filter-Defs.
 *
 * Wird einmal pro Wedding-Site in das wrapper-DOM eingehängt und liefert
 * die Filter-IDs, die Bereich-Komponenten via `filter: url(#xxx)` referenzieren.
 *
 * Filter-IDs:
 *   #br-distort     — Brutalist Turbulence (subtle wobble auf Headlines)
 *   #brutal-melt    — Liquefy Acid-Melt (Bild verflüssigt sich)
 *   #org-goo        — Organic Goo-Merge (Blobs verschmelzen zu Quecksilber)
 *   #org-goo-soft   — Organic subtle Goo (für Background-Layer)
 *   #noise-grain    — Universeller Film-Grain (Editorial, Organic)
 *
 * Hinweise:
 *   - `width="0" height="0"` + `position: absolute` macht das SVG unsichtbar,
 *     ohne Layout zu beeinflussen.
 *   - Filter werden NICHT pro Komponente neu instanziiert, sondern global einmal —
 *     Browser cached die Filter-Output.
 *   - In React Server Components OK, weil keine Interaktivität.
 */
export default function DecorationFilters() {
  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        {/* Brutalist · Turbulence-Distortion (Headlines) */}
        <filter id="br-distort" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.005 0.018"
            numOctaves={1}
            seed={3}
          />
          <feDisplacementMap in="SourceGraphic" scale={6} />
        </filter>

        {/* Liquefy · Acid Melt — aggressiver Displacement-Filter */}
        <filter id="brutal-melt" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves={3}
            seed={7}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={100}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Organic · Goo-Merge — Lucas-Bebber-Pattern */}
        <filter id="org-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation={18} result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>

        {/* Organic · subtle Goo für Backgrounds */}
        <filter id="org-goo-soft">
          <feGaussianBlur in="SourceGraphic" stdDeviation={30} result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 14 -7"
          />
        </filter>

        {/* Universeller Film-Grain (Editorial, Organic) */}
        <filter id="noise-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            stitchTiles="stitch"
          />
        </filter>
      </defs>
    </svg>
  );
}
