import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * /auth/confirm — verifiziert einen per E-Mail zugestellten OTP-Token-Hash
 * (Magic-Link, Passwort-Reset) serverseitig und setzt die Session-Cookies.
 *
 * Wir mailen NICHT den Supabase-`action_link` (der über den Supabase-verify-
 * Endpoint + Site-URL-Redirect läuft und die Tokens im URL-FRAGMENT `#…`
 * zurückgibt — das sieht ein Server-Route-Handler nie), sondern bauen einen
 * eigenen Link mit `token_hash` auf unsere App-Domain. Damit:
 *   - zeigt der Link immer auf NEXT_PUBLIC_APP_URL (kein Site-URL-Fallback
 *     auf localhost),
 *   - läuft die Verifikation serverseitig (keine #access_token-Fragmente).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Erlaubte OTP-Typen (entsprechen generateLink.verification_type).
type EmailOtpType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email';
const VALID_TYPES: EmailOtpType[] = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tokenHash = url.searchParams.get('token_hash');
  const typeParam = url.searchParams.get('type');
  const next = url.searchParams.get('next') || '/dashboard';

  const type = VALID_TYPES.includes(typeParam as EmailOtpType) ? (typeParam as EmailOtpType) : null;

  if (tokenHash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
    console.error('[auth/confirm] verifyOtp failed:', error);
  }

  return NextResponse.redirect(new URL('/login?error=link', url.origin));
}
