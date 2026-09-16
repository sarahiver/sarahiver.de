'use server';

import { randomBytes } from 'crypto';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { CONSENT_TEXT, CONSENT_VERSION } from '@/lib/launch';
import { sendLaunchConfirmationMail } from '@/lib/launch-mail';

/**
 * Anmeldung zur Launch-Liste — Double Opt-In.
 *
 * Schritt 1 von 2: Adresse landet als `pending` in der DB, die Bestätigungsmail
 * geht raus. Erst der Klick auf den Link in der Mail setzt `confirmed`
 * (siehe app/launch/bestaetigt/page.tsx). Ohne diesen zweiten Schritt wird
 * niemals eine Launch-Mail an die Adresse gehen.
 *
 * Die Antwort verrät bewusst nicht, ob eine Adresse bereits eingetragen war —
 * sonst wäre das Formular ein Test, ob jemand auf der Liste steht.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Frühestens alle 2 Minuten eine neue Mail an dieselbe Adresse. */
const RESEND_COOLDOWN_MS = 2 * 60 * 1000;

export type SubscribeResult =
  | { ok: true; state: 'sent' | 'already-confirmed' }
  | { ok: false; error: string };

export async function subscribeToLaunch(input: {
  email: string;
  consent: boolean;
}): Promise<SubscribeResult> {
  const email = (input.email || '').trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'Bitte gebt eine gültige E-Mail-Adresse an.' };
  }
  if (!input.consent) {
    return { ok: false, error: 'Bitte bestätigt die Einwilligung, dann können wir euch schreiben.' };
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    console.error('[launch] admin client unavailable');
    return { ok: false, error: 'Das hat gerade nicht geklappt. Bitte versucht es später erneut.' };
  }

  const { data: existingRow, error: readErr } = await admin
    .from('launch_subscribers')
    .select('id, status, confirm_token, last_sent_at')
    .eq('email', email)
    .maybeSingle();

  if (readErr) {
    console.error('[launch] lookup failed:', readErr);
    return { ok: false, error: 'Das hat gerade nicht geklappt. Bitte versucht es später erneut.' };
  }

  const existing = existingRow as
    | { id: string; status: string; confirm_token: string; last_sent_at: string | null }
    | null;

  if (existing?.status === 'confirmed') {
    return { ok: true, state: 'already-confirmed' };
  }

  // Bereits angemeldet, aber noch nicht bestätigt → Mail erneut schicken,
  // sofern der letzte Versand nicht gerade eben war.
  if (existing) {
    const last = existing.last_sent_at ? new Date(existing.last_sent_at).getTime() : 0;
    if (Date.now() - last < RESEND_COOLDOWN_MS) {
      return { ok: true, state: 'sent' };
    }

    await admin
      .from('launch_subscribers')
      .update({ last_sent_at: new Date().toISOString() } as never)
      .eq('id', existing.id);

    await sendLaunchConfirmationMail(email, existing.confirm_token);
    return { ok: true, state: 'sent' };
  }

  const token = randomBytes(32).toString('base64url');

  const { error: insertErr } = await admin.from('launch_subscribers').insert({
    email,
    status: 'pending',
    confirm_token: token,
    consent_text: CONSENT_TEXT,
    consent_version: CONSENT_VERSION,
    last_sent_at: new Date().toISOString(),
  } as never);

  if (insertErr) {
    console.error('[launch] insert failed:', insertErr);
    return { ok: false, error: 'Das hat gerade nicht geklappt. Bitte versucht es später erneut.' };
  }

  await sendLaunchConfirmationMail(email, token);
  return { ok: true, state: 'sent' };
}
