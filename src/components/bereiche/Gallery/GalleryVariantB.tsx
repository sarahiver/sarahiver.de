import type { EffectiveTokens } from '@/types/supabase';
import Decor from '@/components/ui/Decor';
import GalleryClient from './GalleryClient';
import {
  GALLERY_DEFAULTS,
  readImages,
  buildStoryboardGroups,
  renderTitleWithEm,
} from './shared';

/**
 * Gallery Variante B — Storyboard
 *
 * Server Component. Bilder in Gruppen (full/pair/triple) angeordnet.
 * Keine Lightbox — Storyboard erzählt linear, Bilder stehen für sich.
 * GalleryClient wickelt nur für ShowMore-Logik.
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

  // Globalen Index pro Image vorberechnen (für data-idx auf jedem item)
  let runningIndex = 0;
  const groupsWithIdx = groups.map((g) => ({
    layout: g.layout,
    items: g.items.map((img) => ({ img, idx: runningIndex++ })),
  }));

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

      <GalleryClient images={images} withLightbox={false} totalCount={images.length}>
        <div className="galB">
          {groupsWithIdx.map((g, gi) => (
            <div key={gi} className="galB-group" data-layout={g.layout}>
              <div className="galB-grid">
                {g.items.map(({ img, idx }) => (
                  <figure key={img.id} className="galB-item" data-idx={idx}>
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
          ))}
        </div>
      </GalleryClient>
    </div>
  );
}
