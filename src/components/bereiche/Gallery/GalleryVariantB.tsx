'use client';

import type { EffectiveTokens } from '@/types/supabase';
import Decor from '@/components/ui/Decor';
import GalleryWithShowMore from './GalleryWithShowMore';
import {
  GALLERY_DEFAULTS,
  readImages,
  buildStoryboardGroups,
  renderTitleWithEm,
} from './shared';

/**
 * Gallery Variante B — Storyboard
 *
 * Bilder werden in Gruppen rhythmisch arrangiert (full → pair → triple → pair → ...).
 * Jedes Bild kann eine Caption haben (stamp + text). Keine Lightbox — Bilder
 * stehen für sich, der Erzählfluss ist der Punkt. Server Component (kein State).
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function GalleryVariantB({ tokens, content }: Props) {
  const eyebrow = (content.eyebrow as string) ?? GALLERY_DEFAULTS.eyebrow;
  const title = (content.title as string) ?? GALLERY_DEFAULTS.title;
  const intro = (content.intro as string) ?? GALLERY_DEFAULTS.intro;
  const images = readImages(content);
  const groups = buildStoryboardGroups(images);

  return (
    <div className="gal galB-wrap">
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
        renderItems={(isHiddenOnMobile) => {
          // Wir tracken den globalen Image-Index quer durch alle Gruppen
          let runningIndex = 0;
          return (
            <div className="galB">
              {groups.map((g, gi) => {
                // Items in dieser Gruppe mit ihrem globalen Index ausstatten
                const itemsWithIdx = g.items.map((img) => ({
                  img,
                  idx: runningIndex++,
                }));
                // Wenn ALLE items dieser Gruppe auf Mobile versteckt wären → gesamte Gruppe verstecken
                const allHiddenOnMobile = itemsWithIdx.every(({ idx }) =>
                  isHiddenOnMobile(idx),
                );
                return (
                  <div
                    key={gi}
                    className={`galB-group ${allHiddenOnMobile ? 'gal-hidden-mobile' : ''}`}
                    data-layout={g.layout}
                  >
                    <div className="galB-grid">
                      {itemsWithIdx.map(({ img, idx }) => (
                        <figure
                          key={img.id}
                          className={`galB-item ${
                            !allHiddenOnMobile && isHiddenOnMobile(idx)
                              ? 'gal-hidden-mobile'
                              : ''
                          }`}
                        >
                          <div className="galB-imgwrap">
                            <img
                              src={img.src}
                              alt={img.alt}
                              loading="lazy"
                              data-editable={`gallery.${img.id}.image`}
                              data-edit-type="image"
                            />
                          </div>
                          {img.caption && (
                            <figcaption className="galB-cap">
                              <span className="stamp">{img.caption}</span>
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }}
      />
    </div>
  );
}
