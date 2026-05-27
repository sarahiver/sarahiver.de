'use client';

import { useState } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import Decor from '@/components/ui/Decor';
import Lightbox from './Lightbox';
import GalleryWithShowMore from './GalleryWithShowMore';
import {
  GALLERY_DEFAULTS,
  readImages,
  renderTitleWithEm,
} from './shared';

/**
 * Gallery Variante C — Lightbox-Grid
 *
 * Striktes 4/3/2-Spalten-Raster (responsive) mit gleichmäßig beschnittenen
 * Tiles (aspect-ratio 3:4). Klick öffnet Lightbox in voller Größe mit
 * Navigation per Pfeile/Tasten/Klick. Demokratisches Layout — jedes Bild
 * bekommt denselben Platz.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function GalleryVariantC({ tokens, content }: Props) {
  const eyebrow = (content.eyebrow as string) ?? GALLERY_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? GALLERY_DEFAULTS.title;
  const intro = (content.intro as string) ?? GALLERY_DEFAULTS.intro;
  const images = readImages(content);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="gal galC-wrap">
      <p
        className="gal-eyebrow"
        data-editable="gallery.eyebrow"
        data-edit-type="text"
      >
        {eyebrow}
      </p>
      <h2
        className="gal-title"
        data-editable="gallery.title"
        data-edit-type="text"
        dangerouslySetInnerHTML={{ __html: renderTitleWithEm(title) }}
      />
      <div className="gal-head-decor-wrap">
        <Decor />
      </div>
      {intro && (
        <p
          className="gal-intro"
          data-editable="gallery.intro"
          data-edit-type="text"
        >
          {intro}
        </p>
      )}

      <GalleryWithShowMore
        totalCount={images.length}
        renderItems={(isHiddenOnMobile) => (
          <div className="galC">
            {images.map((img, i) => (
              <figure
                key={img.id}
                className={`galC-tile ${isHiddenOnMobile(i) ? 'gal-hidden-mobile' : ''}`}
                onClick={() => setActiveIndex(i)}
                role="button"
                tabIndex={0}
                aria-label={`${img.alt} — Vergrößern`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveIndex(i);
                  }
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  data-editable={`gallery.${img.id}.image`}
                  data-edit-type="image"
                />
              </figure>
            ))}
          </div>
        )}
      />

      <Lightbox
        images={images}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </div>
  );
}
