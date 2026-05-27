import type { EffectiveTokens } from '@/types/supabase';
import Decor from '@/components/ui/Decor';
import GalleryClient from './GalleryClient';
import {
  GALLERY_DEFAULTS,
  readImages,
  renderTitleWithEm,
} from './shared';

/**
 * Gallery Variante C — Lightbox-Grid
 *
 * Server Component. Striktes 4/3/2-Spalten-Raster.
 * GalleryClient kümmert sich um Lightbox + ShowMore.
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

      <GalleryClient images={images} withLightbox totalCount={images.length}>
        <div className="galC">
          {images.map((img, i) => (
            <figure
              key={img.id}
              className="galC-tile"
              data-idx={i}
              data-lightbox-trigger
              role="button"
              tabIndex={0}
              aria-label={`${img.alt} — Vergrößern`}
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
      </GalleryClient>
    </div>
  );
}
