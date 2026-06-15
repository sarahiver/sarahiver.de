'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
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

/** Magic-Link anfordern (kein neuer User — nur bestehende Accounts). */
export async function sendMagicLink(email: string): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: `${APP}/auth/callback?next=/dashboard`, shouldCreateUser: false },
  });
  if (error) return { error: 'Link konnte nicht gesendet werden. Bitte erneut versuchen.' };
  return { sent: true };
}

/** Passwort-Reset-Mail anfordern. */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${APP}/auth/callback?next=/reset-password`,
  });
  // Aus Datenschutz-Sicht immer "gesendet" zurückmelden (kein Account-Enumeration).
  if (error) console.error('[auth] reset request error:', error);
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
