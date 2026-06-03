import { notFound } from 'next/navigation';
import { loadWeddingSite, tokensToCSSVariables, getBereichBackground, SPACING_MULTIPLIER } from '@/lib/tokens';
import { DnaProvider } from '@/lib/dna-context';
import { BereichRenderer } from '@/components/layout/BereichRenderer';
import { SiteNav } from '@/components/layout/SiteNav';
import { buildNavItems } from '@/components/layout/nav-config';
import { isReservedSlug, isValidSlugFormat } from '@/lib/slug-validation';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const slug = resolved?.slug;

  // Defensive: ohne slug → notFound-Metadata (verhindert Render-Crash)
  if (!slug || isReservedSlug(slug) || !isValidSlugFormat(slug)) {
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

export default async function WeddingSitePage({ params, searchParams }: PageProps) {
  const resolved = await params;
  const slug = resolved?.slug;
  const sp = await searchParams;
  const mode: 'draft' | 'published' = sp?.preview === 'draft' ? 'draft' : 'published';

  // Defensive: ohne gültigen slug → notFound (kein Crash)
  if (!slug || isReservedSlug(slug) || !isValidSlugFormat(slug)) notFound();
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

  const styleHint = (tokens as typeof tokens & { start_style_id?: string }).start_style_id ?? 'klassisch';
  const navVariant = (tokens as typeof tokens & { nav_variant?: string }).nav_variant ?? 'a';
  const navItems = buildNavItems(bereiche.map((b) => b.bereich_key));
  const coupleShort =
    tokens.couple_name_1 && tokens.couple_name_2
      ? `${tokens.couple_name_1[0]} & ${tokens.couple_name_2[0]}`
      : 'S & I';

  return (
    <div
      style={cssVars}
      className="wedding-site-wrapper min-h-screen"
      data-style={styleHint}
    >
      <DnaProvider dna={dna}>
        {navVariant !== 'none' && navItems.length > 0 && (
          <SiteNav
            variant={navVariant as 'a' | 'b' | 'c'}
            items={navItems}
            coupleShort={coupleShort}
          />
        )}
        <main>
          {bereiche.map((bereich, index) => {
            const isLast = index === bereiche.length - 1;
            const bgKind = getBereichBackground(index, bereich.bereich_key, isLast);
            return (
              <section
                key={bereich.id}
                id={`bereich-${bereich.bereich_key}`}
                style={{ background: bgKind === 'bg' ? 'var(--bg)' : 'var(--bg-soft)' }}
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
