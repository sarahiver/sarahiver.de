import { notFound } from 'next/navigation';
import { loadWeddingSite, tokensToCSSVariables, getBereichBackground, SPACING_MULTIPLIER } from '@/lib/tokens';
import { DnaProvider } from '@/lib/dna-context';
import { BereichRenderer } from '@/components/layout/BereichRenderer';
import { isReservedSlug, isValidSlugFormat } from '@/lib/slug-validation';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isReservedSlug(slug) || !isValidSlugFormat(slug)) {
    return { title: 'Nicht gefunden' };
  }
  const data = await loadWeddingSite(slug);
  if (!data) return { title: 'Hochzeitsseite nicht gefunden' };

  const title = `${data.tokens.couple_name_1} & ${data.tokens.couple_name_2}`;
  const date = new Date(data.tokens.wedding_date).toLocaleDateString('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  return {
    title: `${title} — Wir heiraten am ${date}`,
    description: `Die Hochzeitsseite von ${title}.`,
    robots: { index: false, follow: false },
  };
}

export default async function WeddingSitePage({ params }: PageProps) {
  const { slug } = await params;
  if (isReservedSlug(slug) || !isValidSlugFormat(slug)) notFound();
  const data = await loadWeddingSite(slug);
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
    <div style={cssVars} className="wedding-site-wrapper min-h-screen">
      <DnaProvider dna={dna}>
        <main>
          {bereiche.map((bereich, index) => {
            const isLast = index === bereiche.length - 1;
            const bgKind = getBereichBackground(index, bereich.bereich_key, isLast);
            return (
              <section
                key={bereich.id}
                style={{ background: bgKind === 'bg' ? 'var(--bg)' : 'var(--bg-soft)' }}
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
  );
}
