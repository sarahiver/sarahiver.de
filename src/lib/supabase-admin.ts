import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin-Client mit Service-Role-Key.
 *
 * ⚠ SICHERHEIT:
 * - Der Service-Role-Key UMGEHT Row Level Security komplett.
 * - Dieser Client darf NUR in Server Code verwendet werden, NIE im Browser-Bundle.
 *
 * Verhalten bei fehlender ENV:
 *   - Loggt deutlich (mit Hinweis was zu tun ist)
 *   - Wirft KEINE Exception — der Aufrufer (Dashboard-Loader) prüft auf null
 *     und kann eine bessere UI-Meldung anzeigen.
 *
 * persistSession=false, weil wir hier serverseitig sind — keine Cookies, kein
 * Token-Refresh nötig.
 */

type AdminClient = ReturnType<typeof createClient>;
let cached: AdminClient | null = null;

export function createSupabaseAdminClient(): AdminClient | null {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    console.error(
      '[supabase-admin] Missing NEXT_PUBLIC_SUPABASE_URL — set it in Vercel/Env.',
    );
    return null;
  }
  if (!serviceRole) {
    console.error(
      '[supabase-admin] Missing SUPABASE_SERVICE_ROLE_KEY. ' +
        'Add it to Vercel Environment Variables (Production + Preview + Development), ' +
        'redeploy, and try again.',
    );
    return null;
  }

  cached = createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cached;
}
