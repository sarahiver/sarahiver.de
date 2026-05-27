'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { GalleryImage } from './shared';

/**
 * GalleryClient — wickelt die statisch server-gerenderten Items in
 * Interaktivität ein:
 *   - Optional Lightbox bei Klick auf items mit [data-lightbox-trigger]
 *   - ShowMore-Button auf Mobile (CSS-based hide ab data-idx >= mobileLimit)
 *
 * Strategie: nicht selbst items rendern (kein renderItems-callback),
 * sondern via `children`. Items haben `data-idx` Attribute, CSS hidet auf
 * Mobile ab Schwellwert. Klick auf Button → Klasse `is-expanded` zum Wrapper.
 *
 * Wenn `withLightbox=true`, hängen wir delegated click-handler an: jedes
 * Item mit [data-lightbox-trigger] reagiert auf Klick + Enter/Space.
 */

interface Props {
  children: ReactNode;
  images: GalleryImage[];
  withLightbox: boolean;
  mobileLimit?: number;
  totalCount: number;
}

export default function GalleryClient({
  children,
  images,
  withLightbox,
  mobileLimit = 5,
  totalCount,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const hiddenCount = Math.max(0, totalCount - mobileLimit);
  const showButton = !expanded && hiddenCount > 0;

  // Delegated click-handler für Lightbox-Trigger
  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!withLightbox) return;
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        '[data-lightbox-trigger]',
      );
      if (!target) return;
      const idx = Number(target.dataset.idx);
      if (!Number.isNaN(idx)) setActiveIndex(idx);
    },
    [withLightbox],
  );

  const handleContainerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!withLightbox) return;
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        '[data-lightbox-trigger]',
      );
      if (!target) return;
      const idx = Number(target.dataset.idx);
      if (!Number.isNaN(idx)) {
        e.preventDefault();
        setActiveIndex(idx);
      }
    },
    [withLightbox],
  );

  return (
    <>
      <div
        className={`gal-client-wrap ${expanded ? 'is-expanded' : ''}`}
        data-mobile-limit={mobileLimit}
        onClick={handleContainerClick}
        onKeyDown={handleContainerKeyDown}
      >
        {children}
      </div>

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

      {withLightbox && (
        <Lightbox
          images={images}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Lightbox — inline weil nur hier benutzt                            */
/* ------------------------------------------------------------------ */

function Lightbox({
  images,
  activeIndex,
  onClose,
  onNavigate,
}: {
  images: GalleryImage[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}) {
  const isOpen = activeIndex !== null;
  const current = isOpen ? images[activeIndex] : null;

  const goPrev = useCallback(() => {
    if (activeIndex === null) return;
    onNavigate(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
  }, [activeIndex, images.length, onNavigate]);

  const goNext = useCallback(() => {
    if (activeIndex === null) return;
    onNavigate(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
  }, [activeIndex, images.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose, goPrev, goNext]);

  if (!isOpen || !current) return null;

  return (
    <div
      className="gal-lightbox is-open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Bilder-Galerie"
    >
      <div className="gal-lb-stage">
        <button type="button" className="gal-lb-close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>
        <button
          type="button"
          className="gal-lb-nav gal-lb-prev"
          onClick={goPrev}
          aria-label="Vorheriges Bild"
        >
          ‹
        </button>
        <img className="gal-lb-img" src={current.src} alt={current.alt} />
        <button
          type="button"
          className="gal-lb-nav gal-lb-next"
          onClick={goNext}
          aria-label="Nächstes Bild"
        >
          ›
        </button>
        <div className="gal-lb-cap">
          {current.caption && <span>{current.caption}</span>}
          <span className="gal-lb-count">
            {activeIndex + 1} / {images.length}
          </span>
        </div>
      </div>
    </div>
  );
}
