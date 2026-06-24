'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import type { Variant } from '@/types/supabase';
import { revalidatePath } from 'next/cache';

/**
 * Phasen speichern — Save-the-Date & Archiv.
 *
 * Beide Phasen: manuell an/aus (enabled) UND optionales Datum.
 *   STD:    aktiv solange enabled && (std_until leer || jetzt < std_until)
 *   Archiv: aktiv sobald  enabled && (archiv_from leer || jetzt >= archiv_from)
 *
 * „Archiv jetzt online stellen" = enabled + archiv_from leeren (sofort aktiv).
 * Die automatische Gäste-Mail beim Go-Live folgt in einem späteren Schritt
 * (Cron + manueller Trigger, mit archiv_email_sent_at als Schutz).
 */

export interface PhasePayload {
  slug: string;
  std_enabled: boolean;
  std_until: string | null; // ISO oder null
  std_hero_variant: Variant;
  std_countdown_variant: Variant;
  archiv_enabled: boolean;
  archiv_from: string | null; // ISO oder null
  archiv_message: string | null;
  archiv_hero_variant: Variant;
  archiv_fotoupload_variant: Variant;
}

export type PhaseResult = { ok: true } | { error: string };

async function authedSite(slug: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'Bitte zuerst anmelden.' };

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false as const, error: 'Service gerade nicht verfügbar.' };

  const { data } = await admin
    .from('wedding_sites')
    .select('id, owner_user_id, user_id')
    .eq('slug', slug)
    .maybeSingle();
  const site = data as { id: string; owner_user_id: string | null; user_id: string | null } | null;
  if (!site) return { ok: false as const, error: 'Seite nicht gefunden.' };
  if (site.owner_user_id !== user.id && site.user_id !== user.id) {
    return { ok: false as const, error: 'Keine Berechtigung für diese Seite.' };
  }
  return { ok: true as const, admin, site };
}

function cleanDate(v: string | null): string | null {
  if (!v) return null;
  const t = Date.parse(v);
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

export async function savePhases(p: PhasePayload): Promise<PhaseResult> {
  const res = await authedSite(p.slug);
  if (!res.ok) return { error: res.error };
  const { admin, site } = res;

  const v = (x: Variant): Variant => (x === 'b' || x === 'c' ? x : 'a');

  const { error } = await admin
    .from('wedding_sites')
    .update({
      std_enabled: !!p.std_enabled,
      std_until: cleanDate(p.std_until),
      std_hero_variant: v(p.std_hero_variant),
      std_countdown_variant: v(p.std_countdown_variant),
      archiv_enabled: !!p.archiv_enabled,
      archiv_from: cleanDate(p.archiv_from),
      archiv_message: p.archiv_message?.trim() || null,
      archiv_hero_variant: v(p.archiv_hero_variant),
      archiv_fotoupload_variant: v(p.archiv_fotoupload_variant),
    } as never)
    .eq('id', site.id);

  if (error) {
    console.error('[savePhases] update failed:', error);
    return { error: 'Speichern fehlgeschlagen. Bitte erneut versuchen.' };
  }

  revalidatePath(`/dashboard/${p.slug}`, 'layout');
  revalidatePath(`/${p.slug}`, 'layout');
  return { ok: true };
}

/** „Jetzt aktivieren" — Phase sofort manuell live (enabled + Datum geleert). */
export async function activatePhaseNow(slug: string, phase: 'std' | 'archiv'): Promise<PhaseResult> {
  const res = await authedSite(slug);
  if (!res.ok) return { error: res.error };

  const patch =
    phase === 'std'
      ? { std_enabled: true, std_until: null }
      : { archiv_enabled: true, archiv_from: null };

  const { error } = await res.admin.from('wedding_sites').update(patch as never).eq('id', res.site.id);
  if (error) {
    console.error('[activatePhaseNow] update failed:', error);
    return { error: 'Aktivieren fehlgeschlagen. Bitte erneut versuchen.' };
  }

  revalidatePath(`/dashboard/${slug}`, 'layout');
  revalidatePath(`/${slug}`, 'layout');
  return { ok: true };
}
