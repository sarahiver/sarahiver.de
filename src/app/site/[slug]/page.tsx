import { notFound } from 'next/navigation';
import { loadWeddingSite, tokensToCSSVariables, getBereichBackground } from '@/lib/tokens';
import { DnaProvider } from '@/lib/dna-context';
import { SPACING_MULTIPLIER } from '@/lib/tokens';
import { BereichRenderer } from '@/components/layout/BereichRenderer';
import GlobalStyledBg from '@/components/decoration/GlobalStyledBg';
import type { Metadata } from 'next';

/**
 * Multi-Tenant Wedding Site Page
 *
 * GlobalStyledBg wird als SIBLING des wedding-site-wrappers gerendert,
 * NICHT als Child. So bleibt position:fixed auch wirklich relativ
 * zum Viewport und scrollt nicht mit dem Content raus.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadWeddingSite(slug);

  if (!data) {
    return { title: 'Hochzeitsseite nicht gefunden' };
  }

  const title = `${data.tokens.couple_name_1} & ${data.tokens.couple_name_2}`;
  const date = new Date(data.tokens.wedding_date).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    title: `${title} — Wir heiraten am ${date}`,
    description: `Die Hochzeitsseite von ${title}. ${
      data.tokens.wedding_location ? `Hochzeit in ${data.tokens.wedding_location}.` : ''
    }`,
    robots: { index: false, follow: false },
  };
}

export default async function WeddingSitePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const mode: 'draft' | 'published' = sp?.preview === 'draft' ? 'draft' : 'published';
  const data = await loadWeddingSite(slug, mode);

  if (!data) notFound();

  const { tokens, bereiche } = data;
  const cssVars = tokensToCSSVariables(tokens);

  const dna = {
    align: tokens.dna_align,
    spacing: tokens.dna_spacing,
    decor: tokens.dna_decor,
    contrast: tokens.dna_contrast,
    spacingMultiplier: SPACING_MULTIPLIER[tokens.dna_spacing],
  };

  const style =
    (tokens as typeof tokens & { start_style_id?: string }).start_style_id ?? 'editorial';

  return (
    <>
      {/* Global ambient BG als SIBLING — nicht Child! */}
      <GlobalStyledBg style={style} cssVars={cssVars} />

      <div style={cssVars} className="wedding-site-wrapper min-h-screen" data-style={style}>
        <DnaProvider dna={dna}>
          <main>
            {bereiche.map((bereich, index) => {
              const isLast = index === bereiche.length - 1;
              const bgKind = getBereichBackground(index, bereich.bereich_key, isLast);

              return (
                <section
                  key={bereich.id}
                  className={bgKind === 'bg' ? 'section-bg' : 'section-bg-soft'}
                  data-bereich={bereich.bereich_key}
                  data-variant={bereich.variant}
                >
                  <BereichRenderer bereich={bereich} tokens={tokens} />
                </section>
              );
            })}
          </main>
        </DnaProvider>
      </div>
    </>
  );
}
