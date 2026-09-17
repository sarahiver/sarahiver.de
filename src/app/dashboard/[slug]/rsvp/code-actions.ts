'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { hashCode, validateCode } from '@/lib/rsvp-code';
import { setRsvpCodeEnabled, setRsvpCodeHash } from '@/lib/rsvp-server';

/**
 * Server Actions für den Einladungscode.
 *
 * Alles Sicherheitsrelevante liegt weiter in lib/rsvp-code.ts und
 * lib/rsvp-server.ts (Phase 1) — hier steht nur die Autorisierung und die
 * Verdrahtung mit dem Dashboard. Keine zweite Validierungs- oder
 * Hash-Logik.
 *
 * Der Klartext-Code verlässt diese Funktionen nicht: er wird gehasht und
 * verworfen. Zurück an den Client geht er ausschließlich als Echo der
 * gerade getätigten Eingabe, damit das Paar ihn einmal kopieren kann —
 * nie aus der Datenbank gelesen.
 */

export type CodeResult =
  | { ok: true; message: string; code?: string }
  | { ok: false; error: string };

/** Dieselbe Besitzprüfung wie in den übrigen Dashboard-Actions. */
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
  return { ok: true as const, admin, siteId: site.id };
}

/** Ist für diese Site bereits ein Code hinterlegt? */
async function hasCode(admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>, siteId: string) {
  const { data } = await admin
    .from('wedding_rsvp_codes')
    .select('wedding_site_id')
    .eq('wedding_site_id', siteId)
    .maybeSingle();
  return Boolean(data);
}

/**
 * Code setzen oder ändern — technisch derselbe Vorgang.
 * setRsvpCodeHash() schiebt updated_at weiter, womit alle bestehenden
 * Freischaltungen sofort ungültig werden.
 */
export async function saveInviteCode(slug: string, rawCode: string): Promise<CodeResult> {
  const auth = await authedSite(slug);
  if (!auth.ok) return { ok: false, error: auth.error };

  const check = validateCode(rawCode);
  if (!check.ok) return { ok: false, error: check.error ?? 'Dieser Code geht so nicht.' };

  const existed = await hasCode(auth.admin, auth.siteId);

  let hash: string;
  try {
    hash = await hashCode(rawCode);
  } catch (err) {
    console.error('[rsvp-code] hashing failed:', err);
    return { ok: false, error: 'Das hat gerade nicht geklappt. Bitte versucht es erneut.' };
  }

  const saved = await setRsvpCodeHash(auth.siteId, hash);
  if (!saved) {
    return { ok: false, error: 'Der Code konnte nicht gespeichert werden. Bitte versucht es erneut.' };
  }

  revalidatePath(`/dashboard/${slug}/rsvp`);

  return {
    ok: true,
    message: existed ? 'Einladungscode geändert.' : 'Einladungscode gespeichert.',
    // Echo der Eingabe für die einmalige Anzeige. Kommt aus dem Request,
    // nicht aus der Datenbank.
    code: rawCode.trim(),
  };
}

/**
 * Schutz an- oder ausschalten.
 * Ohne hinterlegten Code ist Aktivieren nicht möglich — sonst entstünde eine
 * Seite, deren RSVP niemand bedienen kann.
 */
export async function setInviteCodeProtection(slug: string, enabled: boolean): Promise<CodeResult> {
  const auth = await authedSite(slug);
  if (!auth.ok) return { ok: false, error: auth.error };

  if (enabled && !(await hasCode(auth.admin, auth.siteId))) {
    return { ok: false, error: 'Bitte richtet zuerst einen Einladungscode ein.' };
  }

  const done = await setRsvpCodeEnabled(auth.siteId, enabled);
  if (!done) {
    return { ok: false, error: 'Die Einstellung konnte nicht gespeichert werden.' };
  }

  revalidatePath(`/dashboard/${slug}/rsvp`);
  return {
    ok: true,
    message: enabled ? 'RSVP-Schutz aktiviert.' : 'RSVP-Schutz deaktiviert.',
  };
}
