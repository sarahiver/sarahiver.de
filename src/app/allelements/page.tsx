import type { Metadata } from 'next';
import { loadAllPresets } from '@/lib/presets';
import { VALID_STYLE_IDS, resolveStyleId, type StyleId } from '@/lib/style-migration';
import {
  PAGE_ORDER,
  PAGE_ORDER_MATCHES_FUNNEL,
  isComponentVariant,
  presetConfiguration,
  variantsFromParam,
  type BereichKey,
  type ComponentVariant,
} from '@/lib/wedding-config';
import { FALLBACK_PALETTE, type ContentLoad, type StylePalette } from '@/lib/allelements-data';
import PreviewStage from '@/components/allelements/PreviewStage';
import ReviewShell from '@/components/allelements/ReviewShell';

/**
 * /allelements — interne QA- und Design-Review-Umgebung.
 *
 * Zwei Betriebsarten derselben Route:
 *   ohne ?embed   Review-Oberfläche mit Steuerung; die Vorschau läuft in
 *                 einem <iframe> auf dieselbe URL mit ?embed=1
 *   mit  ?embed=1 nur die Vorschau, ohne jede Review-Chrome
 *
 * Der Umweg über den iframe ist kein Zierrat: Media Queries beziehen sich auf
 * das Viewport, nicht auf einen Container. Ein auf 390px verschmälerter Div
 * würde die Desktop-Regeln zeigen und Mobile-Fehler verstecken.
 *
 * Nicht indexieren — interne Seite.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Design Review — sarahiver.de',
  robots: { index: false, follow: false },
};

type SP = {
  view?: string;
  style?: string;
  viewport?: string;
  config?: string;
  variants?: string;
  load?: string;
  embed?: string;
};

function readLoad(v: string | undefined): ContentLoad {
  return v === 'kurz' || v === 'lang' ? v : 'mittel';
}

export default async function AllElementsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  const view = sp.view === 'full' ? 'full' : 'components';
  const style = resolveStyleId(sp.style) as StyleId;
  const viewport = sp.viewport === 'mobile' ? 'mobile' : 'desktop';
  const load = readLoad(sp.load);

  // Preset A/B/C oder freie Kombination je Bereich.
  const preset: ComponentVariant | null =
    sp.config && isComponentVariant(sp.config) ? sp.config : null;
  const variants: Record<BereichKey, ComponentVariant> = preset
    ? presetConfiguration(style, preset).variants
    : variantsFromParam(sp.variants);

  // Paletten und Schriften aus denselben Preset-Tabellen wie im Produktivpfad.
  const { styles, palettes, fonts } = await loadAllPresets();
  const paletteById = new Map(palettes.map((p) => [p.id, p]));
  const fontById = new Map(fonts.map((f) => [f.id, f]));
  const styleRow = styles.find((s) => s.id === style);

  const p = styleRow ? paletteById.get(styleRow.default_palette_id) : undefined;
  const f = styleRow ? fontById.get(styleRow.default_font_id) : undefined;
  const presetsLoaded = Boolean(p && f);

  const palette: StylePalette = presetsLoaded
    ? {
        color_bg: p!.color_bg,
        color_bg_soft: p!.color_bg_soft,
        color_accent: p!.color_accent,
        color_accent_deep: p!.color_accent_deep,
        color_ink: p!.color_ink,
        font_display: f!.font_display,
        font_body: f!.font_body,
        font_script: (f as { font_script?: string | null }).font_script ?? null,
        display_weight: f!.display_weight ?? 400,
        display_style: (f!.display_style === 'italic' ? 'italic' : 'normal') as
          | 'normal'
          | 'italic',
      }
    : FALLBACK_PALETTE;

  const stage = (
    <PreviewStage view={view} style={style} palette={palette} variants={variants} load={load} />
  );

  // --- Vorschau im iframe: nur die Bühne ---
  if (sp.embed === '1') return stage;

  return (
    <ReviewShell
      view={view}
      style={style}
      styles={[...VALID_STYLE_IDS] as StyleId[]}
      viewport={viewport}
      preset={preset}
      variants={variants}
      load={load}
      order={[...PAGE_ORDER]}
      presetsLoaded={presetsLoaded}
      orderMatchesFunnel={PAGE_ORDER_MATCHES_FUNNEL}
    />
  );
}
