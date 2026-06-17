'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { redirect } from 'next/navigation';

const APP = process.env.NEXT_PUBLIC_APP_URL || 'https://sarahiver.de';

export type AuthResult = { error?: string; sent?: boolean };

/** Passwort-Login → bei Erfolg Redirect auf das Dashboard. */
export async function signInPassword(email: string, password: string): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) return { error: 'E-Mail oder Passwort stimmt nicht.' };
  redirect('/dashboard');
}

/**
 * Magic-Link anfordern (kein neuer User — nur bestehende Accounts).
 *
 * Versand über `generateLink` (erzeugt nur Token, kein Supabase-SMTP) +
 * Brevo-API. Verlinkt wird unser eigener /auth/confirm-Endpoint mit token_hash
 * (kein action_link → kein #-Fragment, kein localhost-Fallback).
 */
export async function sendMagicLink(email: string): Promise<AuthResult> {
  const addr = email.trim().toLowerCase();
  const admin = createSupabaseAdminClient();
  if (!admin) return { error: 'Service nicht verfügbar. Bitte später erneut versuchen.' };

  const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email: addr });
  if (error || !data?.properties?.hashed_token) {
    console.error('[auth] magiclink generateLink failed:', error);
    return { error: 'Link konnte nicht gesendet werden. Bitte erneut versuchen.' };
  }

  const link = confirmLink(data.properties.hashed_token, data.properties.verification_type, '/dashboard');
  const ok = await sendBrevo(
    addr,
    'Euer Login-Link für eure Hochzeitsseite',
    mailShell({
      heading: 'Euer Login-Link',
      body: 'Hallo ihr beiden, über den Button kommt ihr direkt in euer Dashboard.',
      buttonLabel: 'Zum Dashboard',
      link,
    }),
  );
  if (!ok) return { error: 'Link konnte nicht gesendet werden. Bitte erneut versuchen.' };
  return { sent: true };
}

/**
 * Passwort-Reset-Mail anfordern.
 *
 * Versand über `generateLink` (type: recovery) + Brevo-API, verlinkt auf
 * /auth/confirm. Aus Datenschutz-Sicht melden wir IMMER "gesendet" zurück
 * (kein Account-Enumeration), egal ob die Adresse existiert.
 */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const addr = email.trim().toLowerCase();
  const admin = createSupabaseAdminClient();
  if (!admin) {
    console.error('[auth] reset: admin client unavailable');
    return { sent: true };
  }

  const { data, error } = await admin.auth.admin.generateLink({ type: 'recovery', email: addr });
  if (error || !data?.properties?.hashed_token) {
    console.error('[auth] reset generateLink failed:', error);
    return { sent: true };
  }

  const link = confirmLink(data.properties.hashed_token, data.properties.verification_type, '/reset-password');
  const ok = await sendBrevo(
    addr,
    'Passwort zurücksetzen',
    mailShell({
      heading: 'Passwort zurücksetzen',
      body: 'Ihr habt angefordert, euer Passwort zurückzusetzen. Über den Button vergebt ihr ein neues.',
      buttonLabel: 'Neues Passwort vergeben',
      link,
    }),
  );
  if (!ok) console.error('[auth] reset: Brevo send failed for', addr);
  return { sent: true };
}

/** Neues Passwort setzen (Session muss aus dem Reset-/Invite-Link aktiv sein). */
export async function setNewPassword(password: string): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sitzung abgelaufen — bitte den Link erneut anfordern.' };
  if (!password || password.length < 8) return { error: 'Passwort muss mindestens 8 Zeichen haben.' };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: 'Passwort konnte nicht gesetzt werden.' };
  redirect('/dashboard');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Baut den /auth/confirm-Link auf unsere App-Domain (kein Supabase-Redirect). */
function confirmLink(tokenHash: string, type: string, next: string): string {
  const u = new URL(`${APP}/auth/confirm`);
  u.searchParams.set('token_hash', tokenHash);
  u.searchParams.set('type', type);
  u.searchParams.set('next', next);
  return u.toString();
}

/**
 * Stellt eine Mail über die Brevo-Transactional-API zu. true bei Erfolg.
 * Env: BREVO_API_KEY, BREVO_SENDER_EMAIL (verifiziert), BREVO_SENDER_NAME (opt.).
 */
async function sendBrevo(to: string, subject: string, htmlContent: string): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'hallo@sarahiver.de';
  const senderName = process.env.BREVO_SENDER_NAME || 'S&I. Wedding';
  if (!apiKey) {
    console.error('[auth] BREVO_API_KEY fehlt — Mail nicht gesendet');
    return false;
  }
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[auth] Brevo send failed:', res.status, detail);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[auth] Brevo send threw:', err);
    return false;
  }
}

/** Schlichtes, markenkonformes HTML-Gerüst für Auth-Mails. */
function mailShell(opts: { heading: string; body: string; buttonLabel: string; link: string }): string {
  const { heading, body, buttonLabel, link } = opts;
  return `<!DOCTYPE html>
<html lang="de">
  <body style="margin:0;background:#F7F5F1;font-family:Inter,Helvetica,Arial,sans-serif;color:#0F0E0C;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F1;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:16px;padding:40px;">
            <tr>
              <td style="font-family:Georgia,serif;font-size:24px;font-weight:600;padding-bottom:8px;">
                ${heading}
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:1.6;color:#5f5b53;padding-bottom:28px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:28px;">
                <a href="${link}" style="display:inline-block;background:#0F0E0C;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;">
                  ${buttonLabel}
                </a>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;line-height:1.6;color:#a39d92;">
                Der Link ist nur für kurze Zeit gültig. Falls ihr ihn nicht angefordert
                habt, könnt ihr diese E-Mail einfach ignorieren.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
