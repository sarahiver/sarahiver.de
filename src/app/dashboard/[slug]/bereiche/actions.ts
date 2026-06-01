'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import type { BereichKey } from '@/types/supabase';

/**
 * Server Actions für die Bereiche-Verwaltung.
 *
 * Drei Operationen:
 *  - reorderBereiche: setzt display_order für mehrere Bereiche neu
 *  - setBereichVariant: wechselt die Variante eines Bereichs (a|b|c)
 *  - toggleBereichActive: aktiviert/deaktiviert einen Bereich (is_active)
 *
 * Hero ist immer fixiert (display_order ≤ 10) und kann nicht deaktiviert
 * werden. Footer (später) gleiches Prinzip.
 *
 * Alle Operationen revalidieren Dashboard- und Gäste-Seite.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const KNOWN_VARIANTS = ['a', 'b', 'c'] as const;
type Variant = (typeof KNOWN_VARIANTS)[number];

const FIXED_KEYS: BereichKey[] = ['hero']; // Footer kommt später dazu

// ====================================================================
// REORDER — alle variablen Bereiche neu sortieren
// ====================================================================

export interface ReorderPayload {
  slug: string;
  /**
   * Geordnete Liste von Bereich-Keys (nur die variablen — Hero/Footer sind
   * fixiert und werden automatisch beibehalten).
   */
  orderedKeys: BereichKey[];
}

export async function reorderBereiche(p: ReorderPayload): Promise<ActionResult> {
  if (!p.slug) return { ok: false, error: 'Slug fehlt.' };
  if (!Array.isArray(p.orderedKeys) || p.orderedKeys.length === 0) {
    return { ok: false, error: 'Reihenfolge leer.' };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: 'Datenbankverbindung nicht verfügbar.' };

  // Site-ID für die Updates
  const { data: site, error: siteErr } = await supabase
    .from('wedding_sites')
    .select('id')
    .eq('slug', p.slug)
    .maybeSingle();
  if (siteErr || !site) {
    return { ok: false, error: siteErr?.message || 'Site nicht gefunden.' };
  }
  const siteId = (site as { id: string }).id;

  // Variable Bereiche bekommen display_order ab 20 (in 5er-Schritten),
  // damit Hero bei 10 bleibt und genug Luft für Insert dazwischen ist.
  const updates = p.orderedKeys.map((key, idx) => ({
    bereich_key: key,
    display_order: 20 + idx * 5,
  }));

  // Sequentiell, damit wir genau wissen, wo's hakt. Bei ~15 Updates ist
  // Performance kein Thema. Bei Bedarf später auf parallel.
  for (const u of updates) {
    const { error } = await supabase
      .from('wedding_bereiche')
      .update({ display_order_draft: u.display_order, is_dirty: true } as never)
      .eq('wedding_site_id', siteId)
      .eq('bereich_key', u.bereich_key);
    if (error) {
      console.error('[reorderBereiche] update failed:', { key: u.bereich_key, error });
      return { ok: false, error: `${u.bereich_key}: ${error.message}` };
    }
  }

  revalidatePath(`/dashboard/${p.slug}`, 'layout');
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true };
}

// ====================================================================
// VARIANTE wechseln
// ====================================================================

export interface SetVariantPayload {
  slug: string;
  bereich_key: BereichKey;
  variant: Variant;
}

export async function setBereichVariant(p: SetVariantPayload): Promise<ActionResult> {
  if (!p.slug) return { ok: false, error: 'Slug fehlt.' };
  if (!KNOWN_VARIANTS.includes(p.variant)) {
    return { ok: false, error: `Ungültige Variante: ${p.variant}` };
  }

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

  const { error } = await supabase
    .from('wedding_bereiche')
    .update({ variant_draft: p.variant, is_dirty: true } as never)
    .eq('wedding_site_id', siteId)
    .eq('bereich_key', p.bereich_key);

  if (error) {
    console.error('[setBereichVariant] failed:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/${p.slug}`, 'layout');
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true };
}

// ====================================================================
// AKTIVIEREN/DEAKTIVIEREN
// ====================================================================

export interface ToggleActivePayload {
  slug: string;
  bereich_key: BereichKey;
  is_active: boolean;
}

export async function toggleBereichActive(p: ToggleActivePayload): Promise<ActionResult> {
  if (!p.slug) return { ok: false, error: 'Slug fehlt.' };

  if (FIXED_KEYS.includes(p.bereich_key) && !p.is_active) {
    return {
      ok: false,
      error: `${p.bereich_key} kann nicht deaktiviert werden — Pflicht-Bereich.`,
    };
  }

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

  const { error } = await supabase
    .from('wedding_bereiche')
    .update({ is_active_draft: p.is_active, is_dirty: true } as never)
    .eq('wedding_site_id', siteId)
    .eq('bereich_key', p.bereich_key);

  if (error) {
    console.error('[toggleBereichActive] failed:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/${p.slug}`, 'layout');
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true };
}
