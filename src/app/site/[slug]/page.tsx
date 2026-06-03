import { notFound } from 'next/navigation';
import { loadWeddingSite, tokensToCSSVariables, getBereichBackground } from '@/lib/tokens';
import { DnaProvider } from '@/lib/dna-context';
import { SPACING_MULTIPLIER } from '@/lib/tokens';
import { BereichRenderer } from '@/components/layout/BereichRenderer';
import type { Metadata } from 'next';

/**
 * Multi-Tenant Wedding Site Page (Defensive)
 *
 * Wird über die Middleware angesprungen:
 *   sarah-und-iver.sarahiver.de → /site/sarah-und-iver
 *
 * Defensive: Wenn slug fehlt → notFound() statt Crash.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const slug = resolved?.slug;
  if (!slug) return { title: 'Hochzeitsseite nicht gefunden' };

  const data = await loadWeddingSite(slug);
  if (!data) return { title: 'Hochzeitsseite nicht gefunden' };

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
  const resolved = await params;
  const slug = resolved?.slug;
  const sp = await searchParams;
  const mode: 'draft' | 'published' = sp?.preview === 'draft' ? 'draft' : 'published';

  if (!slug) notFound();
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

  return (
    <div style={cssVars} className="min-h-screen">
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
                <BereichRenderer bereich={bereich} tokens={tokens} weddingSlug={slug} />
              </section>
            );
          })}
        </main>
      </DnaProvider>
    </div>
  );
}
