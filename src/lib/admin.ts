import { redirect, notFound } from 'next/navigation';
import { createSupabaseServerClient } from './supabase-server';

/**
 * Zugang zum internen Ops-Dashboard (/admin).
 *
 * Geprüft wird ausschließlich serverseitig gegen die Supabase-Session:
 * `app_metadata.role === 'admin'`. app_metadata kann der Nutzer selbst nicht
 * ändern (anders als user_metadata) — deshalb diese Quelle.
 *
 * Rolle setzen (einmalig, im Supabase-SQL-Editor):
 *   update auth.users
 *      set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
 *    where email = 'wedding@sarahiver.de';
 *
 * Jede Admin-Seite UND jede Admin-Action ruft das hier selbst auf — der
 * Layout-Schutz allein reicht nicht.
 */

export interface AdminUser {
  id: string;
  email: string | null;
}

export type AdminCheck =
  | { ok: true; admin: AdminUser }
  | { ok: false; reason: 'unauthenticated' | 'forbidden'; error: string };

export async function checkAdmin(): Promise<AdminCheck> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, reason: 'unauthenticated', error: 'Bitte zuerst anmelden.' };

  const role = (user.app_metadata as { role?: string } | null)?.role;
  if (role !== 'admin') return { ok: false, reason: 'forbidden', error: 'Kein Zugriff.' };

  return { ok: true, admin: { id: user.id, email: user.email ?? null } };
}

/** Für Seiten: nicht eingeloggt → /login, kein Admin → 404 (kein Hinweis auf die Existenz). */
export async function requireAdminPage(): Promise<AdminUser> {
  const r = await checkAdmin();
  if (r.ok) return r.admin;
  if (r.reason === 'unauthenticated') redirect('/login?next=%2Fadmin');
  notFound();
}

/** Schlichtes Server-Log für Admin-Aktionen (keine neue Audit-Tabelle). */
export function logAdminAction(action: string, adminId: string, target: string, extra = '') {
  console.info(`[admin] ${new Date().toISOString()} ${action} by=${adminId} target=${target} ${extra}`.trim());
}
