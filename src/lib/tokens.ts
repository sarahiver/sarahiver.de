import { createSupabaseServerClient } from './supabase-server';
import type {
  EffectiveTokens,
  WeddingBereich,
  Spacing,
} from '@/types/supabase';

/**
 * Token-Loader — lädt für einen Slug alle benötigten Daten.
 *
 * @param mode 'published' (Default, Gäste-Seite) oder 'draft' (Preview im Dashboard)
 */
export async function loadWeddingSite(
  slug: string,
  mode: 'published' | 'draft' = 'published',
): Promise<{
  tokens: EffectiveTokens;
  bereiche: WeddingBereich[];
} | null> {
  const supabase = await createSupabaseServerClient();

  const [tokensResult, bereicheResult] = await Promise.all([
    supabase
      .from('v_effective_tokens')
      .select('*')
      .eq('slug', slug)
      .maybeSingle(),
    mode === 'draft'
      ? supabase
          .from('wedding_bereiche')
          .select('*')
          .order('display_order', { ascending: true })
      : supabase
          .from('wedding_bereiche')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
  ]);

  if (tokensResult.error || !tokensResult.data) {
    console.error('Failed to load tokens for slug:', slug, tokensResult.error);
    return null;
  }

  const tokens = tokensResult.data as EffectiveTokens;

  if (mode === 'draft') {
    try {
      const siteRes = await supabase
        .from('wedding_sites')
        .select('site_draft, nav_variant, hero_image_url, couple_name_1, couple_name_2, wedding_date, wedding_location')
        .eq('id', tokens.wedding_site_id)
        .maybeSingle();
      const draft = (siteRes.data as { site_draft?: Record<string, unknown> } | null)?.site_draft || {};
      const t = tokens as unknown as Record<string, unknown>;
      if ('hero_image_url' in draft) t.hero_image_url = draft.hero_image_url;
      if ('couple_name_1' in draft) t.couple_name_1 = draft.couple_name_1;
      if ('couple_name_2' in draft) t.couple_name_2 = draft.couple_name_2;
      if ('wedding_date' in draft) t.wedding_date = draft.wedding_date;
      if ('wedding_location' in draft) t.wedding_location = draft.wedding_location;

      // === DESIGN-SYSTEM-Felder aus draft mergen ===
      // Die View v_effective_tokens kennt nur published-Spalten + Joins mit
      // start_styles/palette_presets/font_presets nach den PUBLISHED-IDs.
      // Wenn im draft eine andere ID gesetzt ist, müssen wir die Joins
      // hier nachholen — sonst zeigt die Vorschau weiterhin den
      // veröffentlichten Stil/Palette/Font.

      // Parallel: 3 Preset-Lookups je nach Draft-Inhalt
      const draftStyleId = (draft as Record<string, unknown>).start_style_id as string | undefined;
      const draftPaletteId = (draft as Record<string, unknown>).palette_preset_id as string | null | undefined;
      const draftFontId = (draft as Record<string, unknown>).font_preset_id as string | null | undefined;

      const [styleRow, paletteRow, fontRow] = await Promise.all([
        draftStyleId
          ? supabase
              .from('start_styles')
              .select('dna_align, dna_spacing, dna_decor, dna_contrast')
              .eq('id', draftStyleId)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        draftPaletteId
          ? supabase
              .from('palette_presets')
              .select('color_bg, color_bg_soft, color_accent, color_accent_deep, color_ink')
              .eq('id', draftPaletteId)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        draftFontId
          ? supabase
              .from('font_presets')
              .select('font_display, font_body, font_script, display_weight, display_style')
              .eq('id', draftFontId)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      // Stil (cascadiert auf DNA-Felder)
      if (draftStyleId) {
        t.start_style_id = draftStyleId;
        const sr = styleRow.data as Record<string, unknown> | null;
        if (sr) {
          t.dna_align = sr.dna_align;
          t.dna_spacing = sr.dna_spacing;
          t.dna_decor = sr.dna_decor;
          t.dna_contrast = sr.dna_contrast;
        }
      }

      // Palette-Preset (überschreibt die View-Werte mit der gewählten Preset-Palette)
      if (draftPaletteId) {
        const pr = paletteRow.data as Record<string, unknown> | null;
        if (pr) {
          t.color_bg = pr.color_bg;
          t.color_bg_soft = pr.color_bg_soft;
          t.color_accent = pr.color_accent;
          t.color_accent_deep = pr.color_accent_deep;
          t.color_ink = pr.color_ink;
        }
      }

      // Font-Preset
      if (draftFontId) {
        const fr = fontRow.data as Record<string, unknown> | null;
        if (fr) {
          t.font_display = fr.font_display;
          t.font_body = fr.font_body;
          t.font_script = fr.font_script;
          t.display_weight = fr.display_weight;
          t.display_style = fr.display_style;
        }
      }

      // Custom-Farben (überschreiben die Preset-Werte, falls gesetzt)
      // Wichtig: NACH dem Palette-Preset-Merge, damit Custom > Preset gilt.
      if ('palette_custom_bg' in draft) t.color_bg = draft.palette_custom_bg ?? t.color_bg;
      if ('palette_custom_bg_soft' in draft) t.color_bg_soft = draft.palette_custom_bg_soft ?? t.color_bg_soft;
      if ('palette_custom_accent' in draft) t.color_accent = draft.palette_custom_accent ?? t.color_accent;
      if ('palette_custom_accent_deep' in draft) t.color_accent_deep = draft.palette_custom_accent_deep ?? t.color_accent_deep;
      if ('palette_custom_ink' in draft) t.color_ink = draft.palette_custom_ink ?? t.color_ink;
    } catch (err) {
      console.warn('[loadWeddingSite] draft merge failed, falling back to published:', err);
    }
  }

  let navVariant: string = 'a';
  try {
    const navResult = await supabase
      .from('wedding_sites')
      .select('nav_variant, site_draft')
      .eq('id', tokens.wedding_site_id)
      .maybeSingle();
    const row = (navResult.data as { nav_variant?: string; site_draft?: Record<string, unknown> } | null) || {};
    const sourceVal = mode === 'draft'
      ? ((row.site_draft as Record<string, unknown>)?.nav_variant as string | undefined) ?? row.nav_variant
      : row.nav_variant;
    if (sourceVal === 'a' || sourceVal === 'b' || sourceVal === 'c' || sourceVal === 'none') {
      navVariant = sourceVal;
    }
  } catch {
    // Spalte existiert evtl. noch nicht — Fallback bleibt 'a'
  }
  (tokens as unknown as EffectiveTokens & { nav_variant?: string }).nav_variant = navVariant;

  let bereiche = (bereicheResult.data ?? [])
    .filter((b) => b.wedding_site_id === tokens.wedding_site_id)
    .map((b) => {
      const raw = b as WeddingBereich;
      if (mode === 'draft') {
        return {
          ...raw,
          content: raw.content_draft || raw.content || {},
          variant: (raw.variant_draft ?? raw.variant),
          display_order: raw.display_order_draft ?? raw.display_order,
          is_active: raw.is_active_draft ?? raw.is_active,
        } as WeddingBereich;
      }
      return {
        ...raw,
        content: raw.content_published || raw.content || {},
      } as WeddingBereich;
    })
    .filter((b) => b.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  // Gästebuch-Entries injecten
  const guestbookIdx = bereiche.findIndex((b) => b.bereich_key === 'guestbook');
  if (guestbookIdx !== -1) {
    try {
      const statusFilter = mode === 'draft' ? ['approved', 'pending'] : ['approved'];
      const { data: entries } = await supabase
        .from('wedding_guestbook_entries')
        .select('id, name, message, created_at, status')
        .eq('wedding_site_id', tokens.wedding_site_id)
        .in('status', statusFilter)
        .order('created_at', { ascending: false })
        .limit(200);
      const list = (entries || []).map((e) => {
        const r = e as { id: string; name: string; message: string; created_at: string; status: string };
        return {
          id: r.id,
          name: r.name,
          message: r.message,
          created_at: r.created_at,
          ...(r.status === 'pending' ? { pending: true } : {}),
        };
      });
      const b = bereiche[guestbookIdx];
      bereiche[guestbookIdx] = {
        ...b,
        content: { ...(b.content as Record<string, unknown>), entries: list },
      } as WeddingBereich;
    } catch (err) {
      console.warn('[loadWeddingSite] guestbook entries load failed:', err);
    }
  }

  // Musikwünsche injecten
  const musicIdx = bereiche.findIndex((b) => b.bereich_key === 'musicwishes');
  if (musicIdx !== -1) {
    try {
      const { data: rows } = await supabase
        .from('wedding_music_wishes')
        .select('id, title, artist, guest_name, created_at')
        .eq('wedding_site_id', tokens.wedding_site_id)
        .order('created_at', { ascending: false })
        .limit(500);
      const list = (rows || []).map((e) => {
        const r = e as { id: string; title: string; artist: string; guest_name: string | null; created_at: string };
        return {
          id: r.id,
          title: r.title,
          artist: r.artist,
          guest_name: r.guest_name || '',
          created_at: r.created_at,
        };
      });
      const b = bereiche[musicIdx];
      bereiche[musicIdx] = {
        ...b,
        content: { ...(b.content as Record<string, unknown>), items: list },
      } as WeddingBereich;
    } catch (err) {
      console.warn('[loadWeddingSite] music wishes load failed:', err);
    }
  }

  // Geschenke-Reservierungen mergen
  const giftsIdx = bereiche.findIndex((b) => b.bereich_key === 'gifts');
  if (giftsIdx !== -1) {
    try {
      const { data: rows } = await supabase
        .from('wedding_gift_reservations')
        .select('item_id, guest_name')
        .eq('wedding_site_id', tokens.wedding_site_id);
      const map = new Map<string, string>();
      for (const r of (rows || []) as Array<{ item_id: string; guest_name: string }>) {
        map.set(r.item_id, r.guest_name);
      }
      const b = bereiche[giftsIdx];
      const content = b.content as Record<string, unknown>;
      const items = Array.isArray(content.items)
        ? (content.items as Array<Record<string, unknown>>).map((it) => {
            const id = (it.id as string) || '';
            const guestName = map.get(id);
            if (guestName) {
              return { ...it, reserved: true, reserved_by: guestName };
            }
            return { ...it, reserved: false, reserved_by: '' };
          })
        : [];
      bereiche[giftsIdx] = {
        ...b,
        content: { ...content, items },
      } as WeddingBereich;
    } catch (err) {
      console.warn('[loadWeddingSite] gift reservations load failed:', err);
    }
  }

  // Purchase-Filter
  try {
    const purchasesResult = await supabase
      .from('wedding_purchases')
      .select('bereich_key')
      .eq('wedding_site_id', tokens.wedding_site_id);

    if (purchasesResult.error) {
      console.warn(
        '[loadWeddingSite] purchases query failed, showing all active bereiche:',
        purchasesResult.error.message,
      );
    } else {
      const purchased = new Set(
        (purchasesResult.data || []).map((p) => (p as { bereich_key: string }).bereich_key),
      );
      if (purchased.size > 0) {
        bereiche = bereiche.filter((b) => purchased.has(b.bereich_key));
      } else {
        console.warn(
          '[loadWeddingSite] no purchases found for slug, showing all active bereiche (pre-funnel default):',
          slug,
        );
      }
    }
  } catch (err) {
    console.warn('[loadWeddingSite] purchases lookup threw, showing all active bereiche:', err);
  }

  return { tokens, bereiche };
}

export const SPACING_MULTIPLIER: Record<Spacing, number> = {
  tight: 0.75,
  regular: 1.0,
  airy: 1.25,
  wide: 1.5,
};

/**
 * Per-Stil Image-Filter — gibt Fotos eine konsistente Anmutung pro Stil.
 *
 * Design System v2:
 *   8 Stile statt 5. Image-Filter sind pro Stil grundverschieden,
 *   damit jedes Brautpaar-Foto sich in den Stil einfügt.
 */
const IMAGE_FILTERS: Record<string, string> = {
  // Neue 8 Stile
  editorial: 'contrast(1.04) saturate(0.92)',
  brutalist: 'grayscale(1) contrast(1.25)',
  organic:   'saturate(0.95)',
  mono:      'grayscale(0.4) contrast(1.02)',
  opulent:   'sepia(0.2) brightness(1.05) contrast(1.05)',
  liquefy:   'saturate(0.9) brightness(0.95)',
  kinetic:   'contrast(1.05) saturate(0.95)',
  bauhaus:   'grayscale(1) contrast(1.3)',
  // Legacy-Aliasse, falls noch alte IDs in DB stehen
  klassisch_warm:   'sepia(0.14) saturate(0.95) contrast(1.02) brightness(1.02)',
  modern_klar:      'saturate(0.78) contrast(1.06) brightness(1.04)',
  verspielt_floral: 'saturate(0.82) contrast(0.94) brightness(1.07) sepia(0.08)',
  minimal_ruhig:    'grayscale(1) contrast(1.05)',
  bold_festlich:    'saturate(1.08) contrast(1.12) brightness(0.96)',
  // Kurzform-Aliasse (alt)
  klassisch: 'sepia(0.14) saturate(0.95) contrast(1.02) brightness(1.02)',
  modern:    'saturate(0.78) contrast(1.06) brightness(1.04)',
  floral:    'saturate(0.82) contrast(0.94) brightness(1.07) sepia(0.08)',
  minimal:   'grayscale(1) contrast(1.05)',
  festlich:  'saturate(1.08) contrast(1.12) brightness(0.96)',
};

const PADDING_SCALE = {
  tight: '18px',
  regular: '32px',
  airy: '48px',
  wide: '64px',
};

/**
 * Baut Cloudinary-URLs für verschiedene Aspect-Ratios aus einer Base-URL.
 * Wenn die URL kein Cloudinary-Pfad ist, wird sie unverändert zurückgegeben.
 *
 * Pattern: .../upload/{transform}/v{version}/{public_id}.jpg
 */
export function buildCloudinaryVariants(baseUrl: string | null | undefined): {
  base: string;
  portrait: string;
  square: string;
  wide: string;
  tall: string;
} {
  const fallback = baseUrl || '';
  if (!baseUrl || !baseUrl.includes('res.cloudinary.com')) {
    return { base: fallback, portrait: fallback, square: fallback, wide: fallback, tall: fallback };
  }
  // Inject transform-string nach /upload/
  const inject = (transform: string) =>
    baseUrl.replace('/upload/', `/upload/${transform}/`);

  return {
    base:     inject('f_auto,q_auto,w_1600'),
    portrait: inject('f_auto,q_auto,w_900,c_fill,ar_3:4,g_auto'),
    square:   inject('f_auto,q_auto,w_900,c_fill,ar_1:1,g_auto'),
    wide:     inject('f_auto,q_auto,w_1600,c_fill,ar_16:9,g_auto'),
    tall:     inject('f_auto,q_auto,w_800,c_fill,ar_2:3,g_auto'),
  };
}

/**
 * Generiert das CSS-Variable-Inline-Style für eine Hochzeitsseite.
 *
 * Design System v2:
 *   Zusätzlich zu den Basis-Vars werden Cloudinary-Bild-Vars in 5 Aspect-Ratios
 *   gesetzt (--img-base, --img-portrait, --img-square, --img-wide, --img-tall),
 *   damit Stile gezielt unterschiedliche Crops nutzen können.
 */
export function tokensToCSSVariables(tokens: EffectiveTokens): React.CSSProperties {
  const styleHint = (tokens as unknown as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const imgFilter = IMAGE_FILTERS[styleHint] ?? IMAGE_FILTERS.editorial;

  const imgVars = buildCloudinaryVariants(tokens.hero_image_url);

  const style: Record<string, string> = {
    '--bg': tokens.color_bg,
    '--bg-soft': tokens.color_bg_soft,
    '--accent': tokens.color_accent,
    '--accent-deep': tokens.color_accent_deep,
    '--ink': tokens.color_ink,
    '--font-display': tokens.font_display,
    '--font-body': tokens.font_body,
    '--font-script': tokens.font_script ?? 'inherit',
    '--font-mono': "'JetBrains Mono', ui-monospace, monospace",
    '--display-weight': String(tokens.display_weight),
    '--display-style': tokens.display_style,
    '--align': tokens.dna_align,
    '--spacing': tokens.dna_spacing,
    '--decor': tokens.dna_decor,
    '--contrast': tokens.dna_contrast,
    '--spacing-multiplier': String(SPACING_MULTIPLIER[tokens.dna_spacing]),
    '--ink-soft': `color-mix(in srgb, ${tokens.color_ink} 65%, transparent)`,
    '--muted': `color-mix(in srgb, ${tokens.color_ink} 45%, transparent)`,
    '--border': `color-mix(in srgb, ${tokens.color_ink} 15%, transparent)`,
    '--border-soft': `color-mix(in srgb, ${tokens.color_ink} 8%, transparent)`,
    '--img-filter': imgFilter,
    '--vignette': 'rgba(20, 16, 12, 0.45)',
    '--vignette-soft': 'rgba(20, 16, 12, 0.12)',
    '--gold': '#C9A668',
    '--pad-tight': PADDING_SCALE.tight,
    '--pad-regular': PADDING_SCALE.regular,
    '--pad-airy': PADDING_SCALE.airy,
    '--pad-wide': PADDING_SCALE.wide,
    // Cloudinary Bild-URLs in 5 Aspect-Ratios als CSS-Vars
    '--img-base':     `url('${imgVars.base}')`,
    '--img-portrait': `url('${imgVars.portrait}')`,
    '--img-square':   `url('${imgVars.square}')`,
    '--img-wide':     `url('${imgVars.wide}')`,
    '--img-tall':     `url('${imgVars.tall}')`,
  };

  return style as React.CSSProperties;
}

/**
 * Background-Rhythmus.
 */
export function getBereichBackground(
  index: number,
  bereichKey: string,
  isLast: boolean
): 'bg' | 'bg-soft' {
  const FEATURED: string[] = ['lovestory', 'gifts'];
  if (index === 0) return 'bg';
  if (isLast) return 'bg';
  if (FEATURED.includes(bereichKey)) return 'bg-soft';
  return index % 2 === 0 ? 'bg' : 'bg-soft';
}
