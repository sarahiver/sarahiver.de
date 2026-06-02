/**
 * DecorationGoo — Organic Stil
 *
 * 5 driftende Color-Blobs (Peach, Sage, Coral, Plum, Gold), die per
 * SVG-Goo-Filter (#org-goo) bei Überlappung zu Quecksilber-Tropfen
 * verschmelzen. Klassisches Lucas-Bebber-Pattern.
 *
 * Animation-Keyframes (org-drift-a/b/c/d) sind in globals.css definiert.
 * Der Filter (#org-goo) kommt aus <DecorationFilters /> auf [slug]/page.tsx.
 *
 * Usage:
 *   <DecorationGoo />                       // Standard
 *   <DecorationGoo intensity="soft" />      // weniger Blobs, weicheres Goo
 *   <DecorationGoo zIndex={0} />            // unter Content (Default)
 */

type Props = {
  intensity?: 'soft' | 'normal';
  zIndex?: number;
};

export default function DecorationGoo({ intensity = 'normal', zIndex = 0 }: Props) {
  const filterId = intensity === 'soft' ? 'org-goo-soft' : 'org-goo';

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
      <div
        style={{
          position: 'absolute',
          inset: 0,
          filter: `url(#${filterId})`,
        }}
      >
        <div className="org-goo-blob org-goo-blob-1" />
        <div className="org-goo-blob org-goo-blob-2" />
        <div className="org-goo-blob org-goo-blob-3" />
        {intensity === 'normal' && (
          <>
            <div className="org-goo-blob org-goo-blob-4" />
            <div className="org-goo-blob org-goo-blob-5" />
          </>
        )}
      </div>
    </div>
  );
}
