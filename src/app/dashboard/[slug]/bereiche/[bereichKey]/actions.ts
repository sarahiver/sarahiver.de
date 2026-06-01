'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { deleteCloudinaryImage } from '@/lib/cloudinary-server';
import type { BereichKey } from '@/types/supabase';

/**
 * Server Actions für Bereich-Editoren — initial für Hero, später wiederverwendet
 * für andere Bereiche.
 *
 * Zwei Aktionen:
 *  - updateHeroImage:    schreibt wedding_sites.hero_image_url + löscht
 *                        die vorherige Cloudinary-Datei
 *  - updateBereichContent: generisch — merge in wedding_bereiche.content jsonb
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

// ====================================================================
// HERO-IMAGE: schreibt direkt in wedding_sites, weil hero_image_url eine
// eigene Spalte ist (nicht im jsonb der Bereiche).
// ====================================================================

export interface UpdateHeroImagePayload {
  slug: string;
  /** Neue Cloudinary-secure_url oder null beim Entfernen. */
  imageUrl: string | null;
}

export async function updateHeroImage(p: UpdateHeroImagePayload): Promise<ActionResult> {
  if (!p.slug) return { ok: false, error: 'Slug fehlt.' };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  // Aktuellen Wert lesen, um danach das alte Bild zu löschen
  const { data: site, error: readErr } = await supabase
    .from('wedding_sites')
    .select('id, hero_image_url')
    .eq('slug', p.slug)
    .maybeSingle();

  if (readErr || !site) {
    return { ok: false, error: readErr?.message || 'Site nicht gefunden.' };
  }
  const previousUrl = (site as { hero_image_url: string | null }).hero_image_url;

  // Update durchführen
  const { error: updateErr } = await supabase
    .from('wedding_sites')
    .update({
      hero_image_url: p.imageUrl,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('slug', p.slug);

  if (updateErr) {
    console.error('[updateHeroImage] update failed:', updateErr);
    return { ok: false, error: updateErr.message };
  }

  // Alte Datei aus Cloudinary löschen — best-effort, blockiert nicht
  if (previousUrl && previousUrl !== p.imageUrl) {
    deleteCloudinaryImage(previousUrl).catch((err) => {
      console.warn('[updateHeroImage] cleanup failed (non-fatal):', err);
    });
  }

  revalidatePath(`/dashboard/${p.slug}`, 'layout');
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true };
}

// ====================================================================
// BEREICH-CONTENT: generisch — schreibt jsonb-Felder in wedding_bereiche
// ====================================================================

export interface UpdateBereichContentPayload {
  slug: string;
  bereich_key: BereichKey;
  /**
   * Patch (nicht-replace): nur die genannten Felder werden geändert,
   * der Rest des jsonb-Objekts bleibt erhalten.
   */
  contentPatch: Record<string, unknown>;
  /**
   * Optional: alte Cloudinary-URLs, die nach erfolgreichem Update aus
   * Cloudinary gelöscht werden sollen. Nicht-Cloudinary-URLs werden
   * ignoriert. Best-effort.
   */
  cleanupUrls?: Array<string | null | undefined>;
}

export async function updateBereichContent(p: UpdateBereichContentPayload): Promise<ActionResult> {
  if (!p.slug || !p.bereich_key) return { ok: false, error: 'Slug oder Bereich fehlt.' };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  // Aktuelles content-jsonb holen, damit wir mergen können (nicht overwriten)
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
    .select('content')
    .eq('wedding_site_id', siteId)
    .eq('bereich_key', p.bereich_key)
    .maybeSingle();

  if (readErr) {
    console.error('[updateBereichContent] read failed:', readErr);
    return { ok: false, error: readErr.message };
  }

  // Falls der Bereich-Datensatz noch nicht existiert (Edge-Case bei Pre-Setup),
  // legen wir ihn an. Sonst: Patch in bestehendes content mergen.
  const currentContent = (bereich as { content: Record<string, unknown> } | null)?.content || {};
  const newContent = { ...currentContent, ...p.contentPatch };

  if (!bereich) {
    const { error: insertErr } = await supabase.from('wedding_bereiche').insert({
      wedding_site_id: siteId,
      bereich_key: p.bereich_key,
      variant: 'a',
      is_active: true,
      display_order: 10, // wird in Bereiche-Verwaltung neu vergeben falls nötig
      content: newContent,
    } as never);
    if (insertErr) {
      console.error('[updateBereichContent] insert failed:', insertErr);
      return { ok: false, error: insertErr.message };
    }
  } else {
    const { error: updateErr } = await supabase
      .from('wedding_bereiche')
      .update({ content: newContent } as never)
      .eq('wedding_site_id', siteId)
      .eq('bereich_key', p.bereich_key);
    if (updateErr) {
      console.error('[updateBereichContent] update failed:', updateErr);
      return { ok: false, error: updateErr.message };
    }
  }

  // Cleanup alter Cloudinary-URLs — best-effort
  if (Array.isArray(p.cleanupUrls)) {
    for (const url of p.cleanupUrls) {
      if (url) {
        deleteCloudinaryImage(url).catch((err) => {
          console.warn('[updateBereichContent] cleanup failed for', url, '(non-fatal):', err);
        });
      }
    }
  }

  revalidatePath(`/dashboard/${p.slug}`, 'layout');
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true };
}
