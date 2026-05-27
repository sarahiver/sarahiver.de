'use client';

import { useState, type ReactNode } from 'react';

/**
 * GalleryWithShowMore — Mobile-Truncation für lange Galerien.
 *
 * Render-Strategie:
 *   - Desktop: alle items werden gerendert, kein Button (CSS .gal-showmore-row hat display:none ab 720px)
 *   - Mobile (<= 720px via CSS): nur die ersten `mobileLimit` items sichtbar,
 *     Button erscheint und zeigt beim Klick alle.
 *
 * Wir rendern serverseitig die "full"-Variante mit allen items, aber wickeln
 * die überschüssigen items in einen Container mit der Klasse `.gal-hidden-mobile`.
 * Beim Klick auf "Mehr zeigen" wird `expanded=true` und die Klasse entfernt.
 *
 * Vorteil: SSR-freundlich, kein Layout-Shift, voller Inhalt für SEO/Crawler.
 */

interface Props {
  /** Index ab dem auf Mobile ausgeblendet werden soll (Standard: 5). */
  mobileLimit?: number;
  /** Gesamtzahl der items — wird im Button angezeigt. */
  totalCount: number;
  /** Items als Funktion: bekommt eine Funktion, die pro index entscheidet, ob das item auf mobile versteckt wird. */
  renderItems: (isHiddenOnMobile: (idx: number) => boolean) => ReactNode;
}

export default function GalleryWithShowMore({
  mobileLimit = 5,
  totalCount,
  renderItems,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = Math.max(0, totalCount - mobileLimit);

  const isHiddenOnMobile = (idx: number) =>
    !expanded && idx >= mobileLimit;

  // Wenn alle items reinpassen, brauchen wir keinen Button (auch nicht auf Mobile)
  const showButton = !expanded && hiddenCount > 0;

  return (
    <>
      {renderItems(isHiddenOnMobile)}
      {showButton && (
        <div className="gal-showmore-row">
          <button
            type="button"
            className="gal-showmore"
            onClick={() => setExpanded(true)}
          >
            Mehr Bilder zeigen <span className="gal-more-count">{hiddenCount}</span>
          </button>
        </div>
      )}
    </>
  );
}
