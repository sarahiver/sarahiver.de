import Stripe from 'stripe';

/**
 * Stripe-Client (Server-only).
 *
 * ⚠ Nutzt STRIPE_SECRET_KEY — NIE im Browser-Bundle importieren.
 * Null-safe wie supabase-admin: fehlt der Key, wird geloggt und null
 * zurückgegeben, statt zu crashen.
 */

let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (cached) return cached;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error(
      '[stripe] Missing STRIPE_SECRET_KEY. In Vercel-Env setzen (Test: sk_test_…), redeploy.',
    );
    return null;
  }

  cached = new Stripe(key);
  return cached;
}
