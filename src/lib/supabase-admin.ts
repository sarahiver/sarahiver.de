import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin-Client mit Service-Role-Key.
 *
 * ⚠ SICHERHEIT:
 * - Der Service-Role-Key UMGEHT Row Level Security komplett.
 * - Dieser Client darf NUR in Server Code (Server Components, Route Handlers,
 *   Server Actions) verwendet werden, NIE im Browser-Bundle.
 * - Wir nutzen ihn aktuell im Dashboard-Bereich (/app/dashboard/*) für
 *   verlässliches Lesen/Schreiben von wedding_sites, wedding_bereiche und
 *   wedding_purchases — solange keine Auth-Schicht über dem Dashboard liegt.
 * - Sobald Auth (Supabase Auth + Middleware-Schutz unter /dashboard) steht,
 *   kann optional auf den anon-Client mit RLS-Policies umgestellt werden;
 *   bis dahin ist Service-Role + Route-Schutz über die Middleware der saubere
 *   Weg.
 *
 * persistSession=false, weil wir hier serverseitig sind — keine Cookies, kein
 * Token-Refresh nötig.
 */

let cached: ReturnType<typeof createClient> | null = null;

export function createSupabaseAdminClient() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRole) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY — required for the dashboard admin client. ' +
        'Set it in Vercel (Environment Variables) and in .env.local for local dev.',
    );
  }

  cached = createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cached;
}
