'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GalleryImage } from './shared';

/**
 * Lightbox — Overlay-Modal für Galerien.
 *
 * Wird gerendert mit dem Bilder-Array und dem aktiven Index als Props.
 * Schließt via Klick auf Overlay/X-Button/Escape, navigiert via Pfeile/Tasten.
 *
 * Eltern-Komponente steuert offen/zu via `activeIndex` (null = geschlossen).
 */

interface Props {
  images: GalleryImage[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export default function Lightbox({ images, activeIndex, onClose, onNavigate }: Props) {
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

  // Body-Scroll-Lock + Keyboard-Handling
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
        <button
          type="button"
          className="gal-lb-close"
          onClick={onClose}
          aria-label="Schließen"
        >
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
        <img
          className="gal-lb-img"
          src={current.src}
          alt={current.alt}
        />
        <button
          type="button"
          className="gal-lb-nav gal-lb-next"
          onClick={goNext}
          aria-label="Nächstes Bild"
        >
          ›
        </button>
        <div className="gal-lb-cap">
          {current.caption ? (
            <>
              <span>{current.caption}</span>
              <span className="gal-lb-count">
                {activeIndex + 1} / {images.length}
              </span>
            </>
          ) : (
            <span className="gal-lb-count">
              {activeIndex + 1} / {images.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
