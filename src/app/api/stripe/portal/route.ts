import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

/**
 * /api/stripe/portal?slug=…
 *
 * Öffnet das Stripe-Billing-Portal für die eingeloggte Inhaber:in einer Site.
 * Dort kann sie Zahlungsart ändern, Rechnungen sehen, kündigen/reaktivieren —
 * alles von Stripe gehostet, ohne dass wir Kartendaten anfassen.
 *
 * Schutz: nur eingeloggt UND nur für die eigene Site (owner_user_id/user_id).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarahiver.de';
  const backToDashboard = `${appUrl}/dashboard/${slug}`;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.redirect(`${backToDashboard}?billing=unavailable`);
  }

  // 1) Eingeloggt?
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${appUrl}/login?next=${encodeURIComponent(`/dashboard/${slug}`)}`);
  }

  // 2) Site + Ownership prüfen (Admin-Client, RLS-unabhängig)
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.redirect(`${backToDashboard}?billing=unavailable`);

  const { data: site } = await admin
    .from('wedding_sites')
    .select('owner_user_id, user_id, stripe_customer_id')
    .eq('slug', slug)
    .maybeSingle();

  const row = site as
    | { owner_user_id: string | null; user_id: string | null; stripe_customer_id: string | null }
    | null;

  if (!row) return NextResponse.redirect(`${appUrl}/dashboard?billing=notfound`);

  const owns = row.owner_user_id === user.id || row.user_id === user.id;
  if (!owns) return NextResponse.redirect(`${appUrl}/dashboard?billing=forbidden`);

  if (!row.stripe_customer_id) {
    // Kein Stripe-Kunde hinterlegt (z. B. Alt-Site) — nichts zu verwalten.
    return NextResponse.redirect(`${backToDashboard}?billing=nocustomer`);
  }

  // 3) Portal-Session erzeugen und weiterleiten
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: row.stripe_customer_id,
      return_url: backToDashboard,
    });
    return NextResponse.redirect(session.url);
  } catch (err) {
    console.error('[stripe/portal] session create failed:', err);
    return NextResponse.redirect(`${backToDashboard}?billing=error`);
  }
}
