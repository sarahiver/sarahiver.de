'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import type { BereichKey } from '@/types/supabase';

/**
 * Server Actions für Bereich-Editoren — Draft-aware.
 *
 * Schreib-Pfad:
 *   - updateHeroImage:    schreibt site_draft.hero_image_url
 *   - updateBereichContent: schreibt wedding_bereiche.content_draft (jsonb merge)
 *
 * Dirty-Flags werden gesetzt, sodass die Publish-UI weiß, was es zu
 * veröffentlichen gibt.
 *
 * Cloudinary-Cleanup passiert NICHT mehr hier (beim Draft-Wechsel das
 * vorherige Bild noch live ist). Cleanup beim Publish.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

// ====================================================================
// HERO-IMAGE → wedding_sites.site_draft.hero_image_url
// ====================================================================

export interface UpdateHeroImagePayload {
  slug: string;
  imageUrl: string | null;
}

export async function updateHeroImage(p: UpdateHeroImagePayload): Promise<ActionResult> {
  if (!p.slug) return { ok: false, error: 'Slug fehlt.' };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  const { data: site, error: readErr } = await supabase
    .from('wedding_sites')
    .select('id, site_draft')
    .eq('slug', p.slug)
    .maybeSingle();

  if (readErr || !site) {
    return { ok: false, error: readErr?.message || 'Site nicht gefunden.' };
  }

  const currentDraft = ((site as { site_draft: Record<string, unknown> | null }).site_draft) || {};
  const nextDraft = { ...currentDraft, hero_image_url: p.imageUrl };

  const { error: updateErr } = await supabase
    .from('wedding_sites')
    .update({
      site_draft: nextDraft,
      site_is_dirty: true,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('slug', p.slug);

  if (updateErr) {
    console.error('[updateHeroImage] update failed:', updateErr);
    return { ok: false, error: updateErr.message };
  }

  revalidatePath(`/dashboard/${p.slug}`, 'layout');
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true };
}

// ====================================================================
// BEREICH-CONTENT → wedding_bereiche.content_draft (merge)
// ====================================================================

export interface UpdateBereichContentPayload {
  slug: string;
  bereich_key: BereichKey;
  contentPatch: Record<string, unknown>;
  /**
   * Wird nicht mehr verwendet — Cleanup passiert jetzt beim Publish, nicht
   * hier. Bleibt im Type, um die Aufruf-Signatur nicht zu brechen.
   */
  cleanupUrls?: Array<string | null | undefined>;
}

export async function updateBereichContent(p: UpdateBereichContentPayload): Promise<ActionResult> {
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
    .select('content_draft')
    .eq('wedding_site_id', siteId)
    .eq('bereich_key', p.bereich_key)
    .maybeSingle();

  if (readErr) {
    console.error('[updateBereichContent] read failed:', readErr);
    return { ok: false, error: readErr.message };
  }

  const currentDraft =
    (bereich as { content_draft: Record<string, unknown> } | null)?.content_draft || {};
  const newDraft = { ...currentDraft, ...p.contentPatch };

  if (!bereich) {
    const { error: insertErr } = await supabase.from('wedding_bereiche').insert({
      wedding_site_id: siteId,
      bereich_key: p.bereich_key,
      variant: 'a',
      is_active: true,
      display_order: 10,
      content: newDraft,
      content_draft: newDraft,
      content_published: newDraft,
      is_dirty: false,
      published_at: new Date().toISOString(),
    } as never);
    if (insertErr) {
      console.error('[updateBereichContent] insert failed:', insertErr);
      return { ok: false, error: insertErr.message };
    }
  } else {
    const { error: updateErr } = await supabase
      .from('wedding_bereiche')
      .update({
        content_draft: newDraft,
        is_dirty: true,
      } as never)
      .eq('wedding_site_id', siteId)
      .eq('bereich_key', p.bereich_key);
    if (updateErr) {
      console.error('[updateBereichContent] update failed:', updateErr);
      return { ok: false, error: updateErr.message };
    }
  }

  revalidatePath(`/dashboard/${p.slug}`, 'layout');
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true };
}
