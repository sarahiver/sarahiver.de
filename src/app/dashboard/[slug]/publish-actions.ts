'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { deleteCloudinaryImage } from '@/lib/cloudinary-server';
import { extractPublicId } from '@/lib/cloudinary';
import type { BereichKey } from '@/types/supabase';

/**
 * Publish-Pfad: Kopiert Draft → Published, setzt Dirty zurück, räumt
 * verwaiste Cloudinary-Bilder auf.
 *
 * Drei Funktionen:
 *   - publishBereich:  einzelnen Bereich (content/variant/order/is_active)
 *   - publishSite:     Site-Felder (Stammdaten, Hero-Bild, Stil, Nav)
 *   - publishAll:      alles, was dirty ist
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
  /** Anzahl tatsächlich publishter Items (Bereich-Operationen + Site). */
  published?: number;
}

// ====================================================================
// Cloudinary-Cleanup: URLs aus altem Published, die in neuem Draft nicht
// mehr vorkommen, aus Cloudinary löschen.
// ====================================================================

function collectImageUrls(obj: unknown, urls: Set<string>): void {
  if (!obj) return;
  if (typeof obj === 'string') {
    if (obj.startsWith('http') && obj.includes('cloudinary.com')) {
      urls.add(obj);
    }
    return;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) collectImageUrls(item, urls);
    return;
  }
  if (typeof obj === 'object') {
    for (const value of Object.values(obj as Record<string, unknown>)) {
      collectImageUrls(value, urls);
    }
  }
}

function urlsOnlyInOld(oldContent: unknown, newContent: unknown): string[] {
  const oldSet = new Set<string>();
  const newSet = new Set<string>();
  collectImageUrls(oldContent, oldSet);
  collectImageUrls(newContent, newSet);
  const out: string[] = [];
  for (const u of oldSet) {
    if (!newSet.has(u)) out.push(u);
  }
  return out;
}

async function cleanupCloudinary(urls: string[]): Promise<void> {
  for (const u of urls) {
    try {
      await deleteCloudinaryImage(u);
    } catch (err) {
      console.warn('[publish] cleanup failed for', u, err);
    }
    // Auch direkter public_id-Versuch als Fallback
    const pid = extractPublicId(u);
    if (pid) {
      // bereits abgedeckt in deleteCloudinaryImage — duplicate okay
    }
  }
}

// ====================================================================
// publishBereich
// ====================================================================

export interface PublishBereichPayload {
  slug: string;
  bereich_key: BereichKey;
}

export async function publishBereich(p: PublishBereichPayload): Promise<ActionResult> {
  if (!p.slug || !p.bereich_key) return { ok: false, error: 'Slug oder Bereich fehlt.' };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  const { data: site, error: siteErr } = await supabase
    .from('wedding_sites')
    .select('id')
    .eq('slug', p.slug)
    .maybeSingle();
  if (siteErr || !site) {
    return { ok: false, error: siteErr?.message || 'Site nicht gefunden.' };
  }
  const siteId = (site as { id: string }).id;

  const { data: bereich, error: readErr } = await supabase
    .from('wedding_bereiche')
    .select('content_draft, content_published, variant, variant_draft, display_order, display_order_draft, is_active, is_active_draft')
    .eq('wedding_site_id', siteId)
    .eq('bereich_key', p.bereich_key)
    .maybeSingle();
  if (readErr || !bereich) {
    return { ok: false, error: readErr?.message || 'Bereich nicht gefunden.' };
  }

  type BereichRow = {
    content_draft: Record<string, unknown>;
    content_published: Record<string, unknown>;
    variant: 'a' | 'b' | 'c';
    variant_draft: 'a' | 'b' | 'c' | null;
    display_order: number;
    display_order_draft: number | null;
    is_active: boolean;
    is_active_draft: boolean | null;
  };
  const row = bereich as BereichRow;

  const newContent = row.content_draft || {};
  const newVariant = row.variant_draft ?? row.variant;
  const newOrder = row.display_order_draft ?? row.display_order;
  const newActive = row.is_active_draft ?? row.is_active;

  // Cloudinary-Cleanup vorbereiten: URLs aus altem Published, die im neuen
  // Content nicht mehr drin sind → löschen.
  const toCleanup = urlsOnlyInOld(row.content_published, newContent);

  const { error: updateErr } = await supabase
    .from('wedding_bereiche')
    .update({
      content_published: newContent,
      content: newContent, // alte Spalte mitziehen (Migrationsgrund)
      variant: newVariant,
      display_order: newOrder,
      is_active: newActive,
      is_dirty: false,
      published_at: new Date().toISOString(),
    } as never)
    .eq('wedding_site_id', siteId)
    .eq('bereich_key', p.bereich_key);

  if (updateErr) {
    console.error('[publishBereich] update failed:', updateErr);
    return { ok: false, error: updateErr.message };
  }

  // Cleanup nach erfolgreichem Publish (best-effort, blockiert nicht)
  if (toCleanup.length > 0) {
    cleanupCloudinary(toCleanup).catch((err) =>
      console.warn('[publishBereich] cleanup error:', err),
    );
  }

  revalidatePath(`/dashboard/${p.slug}`, 'layout');
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true, published: 1 };
}

// ====================================================================
// publishSite — schreibt site_draft zurück auf die einzelnen Spalten
// ====================================================================

export interface PublishSitePayload {
  slug: string;
}

const SITE_DRAFT_FIELDS = [
  'couple_name_1',
  'couple_name_2',
  'wedding_date',
  'wedding_location',
  'hero_image_url',
  'start_style_id',
  'palette_preset_id',
  'palette_custom_bg',
  'palette_custom_bg_soft',
  'palette_custom_accent',
  'palette_custom_accent_deep',
  'palette_custom_ink',
  'font_preset_id',
  'nav_variant',
  'dna_align_override',
  'dna_spacing_override',
  'dna_decor_override',
  'dna_contrast_override',
] as const;

export async function publishSite(p: PublishSitePayload): Promise<ActionResult> {
  if (!p.slug) return { ok: false, error: 'Slug fehlt.' };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  const { data: site, error: readErr } = await supabase
    .from('wedding_sites')
    .select('id, site_draft, hero_image_url')
    .eq('slug', p.slug)
    .maybeSingle();
  if (readErr || !site) {
    return { ok: false, error: readErr?.message || 'Site nicht gefunden.' };
  }
  type SiteRow = { id: string; site_draft: Record<string, unknown> | null; hero_image_url: string | null };
  const row = site as SiteRow;

  const draft = row.site_draft || {};
  const updatePayload: Record<string, unknown> = {
    site_is_dirty: false,
    site_published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Nur Felder schreiben, die im Draft auch vorkommen
  for (const f of SITE_DRAFT_FIELDS) {
    if (f in draft) updatePayload[f] = draft[f];
  }

  // Cloudinary-Cleanup für Hero-Bild
  const oldHero = row.hero_image_url;
  const newHero = (draft.hero_image_url as string | null | undefined) ?? oldHero;
  const toCleanup: string[] = [];
  if (oldHero && oldHero !== newHero && oldHero.includes('cloudinary.com')) {
    toCleanup.push(oldHero);
  }

  const { error: updateErr } = await supabase
    .from('wedding_sites')
    .update(updatePayload as never)
    .eq('id', row.id);

  if (updateErr) {
    console.error('[publishSite] update failed:', updateErr);
    return { ok: false, error: updateErr.message };
  }

  if (toCleanup.length > 0) {
    cleanupCloudinary(toCleanup).catch((err) =>
      console.warn('[publishSite] cleanup error:', err),
    );
  }

  revalidatePath(`/dashboard/${p.slug}`, 'layout');
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true, published: 1 };
}

// ====================================================================
// publishAll — alles, was dirty ist
// ====================================================================

export async function publishAll(slug: string): Promise<ActionResult> {
  if (!slug) return { ok: false, error: 'Slug fehlt.' };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  const { data: site, error: siteErr } = await supabase
    .from('wedding_sites')
    .select('id, site_is_dirty')
    .eq('slug', slug)
    .maybeSingle();
  if (siteErr || !site) {
    return { ok: false, error: siteErr?.message || 'Site nicht gefunden.' };
  }
  type SiteRow = { id: string; site_is_dirty: boolean };
  const siteRow = site as SiteRow;

  let count = 0;

  // 1. Site-Felder publishen wenn dirty
  if (siteRow.site_is_dirty) {
    const res = await publishSite({ slug });
    if (!res.ok) return res;
    count += res.published || 0;
  }

  // 2. Alle dirty Bereiche
  const { data: dirtyBereiche, error: dirtyErr } = await supabase
    .from('wedding_bereiche')
    .select('bereich_key')
    .eq('wedding_site_id', siteRow.id)
    .eq('is_dirty', true);

  if (dirtyErr) {
    return { ok: false, error: dirtyErr.message };
  }

  for (const b of (dirtyBereiche || []) as Array<{ bereich_key: BereichKey }>) {
    const res = await publishBereich({ slug, bereich_key: b.bereich_key });
    if (!res.ok) return res;
    count += res.published || 0;
  }

  revalidatePath(`/dashboard/${slug}`, 'layout');
  revalidatePath(`/${slug}`, 'layout');
  return { ok: true, published: count };
}

// ====================================================================
// loadDirtyState — für UI-Anzeige (welche Bereiche sind dirty?)
// ====================================================================

export interface DirtyState {
  siteDirty: boolean;
  dirtyBereiche: BereichKey[];
  totalDirty: number;
}

export async function loadDirtyState(slug: string): Promise<DirtyState> {
  const empty: DirtyState = { siteDirty: false, dirtyBereiche: [], totalDirty: 0 };
  if (!slug) return empty;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return empty;

  const { data: site } = await supabase
    .from('wedding_sites')
    .select('id, site_is_dirty')
    .eq('slug', slug)
    .maybeSingle();
  if (!site) return empty;

  const siteRow = site as { id: string; site_is_dirty: boolean };

  const { data: dirty } = await supabase
    .from('wedding_bereiche')
    .select('bereich_key')
    .eq('wedding_site_id', siteRow.id)
    .eq('is_dirty', true);

  const keys = ((dirty || []) as Array<{ bereich_key: BereichKey }>).map((d) => d.bereich_key);

  return {
    siteDirty: siteRow.site_is_dirty,
    dirtyBereiche: keys,
    totalDirty: (siteRow.site_is_dirty ? 1 : 0) + keys.length,
  };
}
