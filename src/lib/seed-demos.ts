import { createSupabaseAdminClient } from './supabase-admin';
import { DEMO_PAGES, buildDemoBereiche, img, type DemoPage } from './demo-pages';

/**
 * Demo-Seeding — legt 1-3 oeffentliche Beispiel-Hochzeitsseiten an, die auf der
 * Landing als "Live ansehen"-Beispiele verlinkt werden UND spaeter als Vorlage
 * fuer die Sandbox (/testen) geklont werden.
 *
 * Spiegelt provision.ts: eigener Demo-Owner (auth user), Preset-Modus ueber die
 * Style-Defaults, Kaeufe zur Freischaltung. Unterschied: content_published ist
 * mit echten Beispielinhalten gefuellt und subscription_status = null
 * (=> oeffentlich sichtbar, keine Zugriffssperre in lib/access.ts).
 *
 * WICHTIG: status = 'published'. Mit 'draft' laesst die RLS-Policy auf
 * wedding_bereiche keine Zeilen durch — die Gaesteseite rendert dann zwar
 * (Tokens kommen aus der View), aber komplett ohne Inhalt. Genau das war der
 * Grund fuer die leeren Demo-Seiten.
 *
 * Idempotent ueber den Slug: Bereiche/Kaeufe werden pro Lauf neu gesetzt.
 * Nur mit Service-Role-Client (server-only) aufrufen.
 */

export type DemoTemplate = DemoPage;

/**
 * Vorlagen und Bereichsinhalte kommen aus lib/demo-pages.ts — dieselbe Quelle
 * wie die öffentlichen Demo-Seiten (/demo/[style]) und die Landing-Karten.
 * So zeigen Seed-Sites und Demo-Seiten exakt dieselbe Hochzeit.
 */
export const DEMO_TEMPLATES: DemoTemplate[] = DEMO_PAGES;

export function buildBereiche(t: DemoTemplate) {
  return buildDemoBereiche(t);
}

export interface SeedResult { ok: boolean; created: string[]; errors: string[] }

type AdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

export const DEMO_OWNER_EMAIL = 'demo-owner@sarahiver.de';

/** Demo-Owner (auth user) sicherstellen — Eigentuemer aller Demo-/Sandbox-Seiten. */
export async function ensureDemoOwner(admin: AdminClient): Promise<string | null> {
  const created = await admin.auth.admin.createUser({ email: DEMO_OWNER_EMAIL, email_confirm: true });
  if (created.data?.user) return created.data.user.id;
  const link = await admin.auth.admin.generateLink({ type: 'magiclink', email: DEMO_OWNER_EMAIL });
  return link.data?.user?.id ?? null;
}

/** Legt eine Demo-Site (Site + Bereiche + Kaeufe) an bzw. aktualisiert sie (idempotent nach slug). */
export async function provisionDemoSite(
  admin: AdminClient,
  opts: { slug: string; template: DemoTemplate; ownerId: string },
): Promise<{ ok: boolean; siteId?: string; error?: string }> {
  const { slug, template: t, ownerId } = opts;

  const { data: styleRow } = await admin
    .from('start_styles').select('default_palette_id, default_font_id').eq('id', t.style).maybeSingle();
  if (!styleRow) return { ok: false, error: `style '${t.style}' not found` };
  const { default_palette_id, default_font_id } = styleRow as { default_palette_id: string; default_font_id: string };

  const siteFields = {
    slug,
    couple_name_1: t.name1, couple_name_2: t.name2,
    wedding_date: t.date, wedding_location: t.location, hero_image_url: img(t.hero, 1800),
    start_style_id: t.style, palette_preset_id: default_palette_id, font_preset_id: default_font_id,
    nav_variant: 'a', status: 'published',
    owner_user_id: ownerId, user_id: ownerId,
    subscription_status: null, subscription_tier: 'p11',
  };

  const { data: existing } = await admin.from('wedding_sites').select('id').eq('slug', slug).maybeSingle();
  let siteId: string;
  if (existing) {
    siteId = (existing as { id: string }).id;
    await admin.from('wedding_sites').update(siteFields as never).eq('id', siteId);
  } else {
    const { data: site, error: siteErr } = await admin
      .from('wedding_sites').insert(siteFields as never).select('id').single();
    if (siteErr || !site) return { ok: false, error: `site insert failed (${siteErr?.message})` };
    siteId = (site as { id: string }).id;
  }

  await admin.from('wedding_bereiche').delete().eq('wedding_site_id', siteId);
  const rows = buildBereiche(t).map((b, i) => ({
    wedding_site_id: siteId, bereich_key: b.key, variant: b.variant, display_order: i, is_active: true,
    content: b.content, content_draft: b.content, content_published: b.content,
  }));
  const { error: bErr } = await admin.from('wedding_bereiche').insert(rows as never);
  if (bErr) return { ok: false, siteId, error: `bereiche insert failed (${bErr.message})` };

  await admin.from('wedding_purchases').delete().eq('wedding_site_id', siteId);
  const purchases = buildBereiche(t).map((b) => ({ wedding_site_id: siteId, bereich_key: b.key }));
  const { error: pErr } = await admin.from('wedding_purchases').insert(purchases as never);
  if (pErr) return { ok: false, siteId, error: `purchases insert failed (${pErr.message})` };

  return { ok: true, siteId };
}

export async function seedDemos(): Promise<SeedResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, created: [], errors: ['admin client unavailable'] };
  const ownerId = await ensureDemoOwner(admin);
  if (!ownerId) return { ok: false, created: [], errors: ['demo owner could not be created'] };

  const created: string[] = [];
  const errors: string[] = [];
  for (const t of DEMO_TEMPLATES) {
    const r = await provisionDemoSite(admin, { slug: t.slug, template: t, ownerId });
    if (r.ok) created.push(t.slug);
    else errors.push(`${t.slug}: ${r.error}`);
  }
  return { ok: errors.length === 0, created, errors };
}
