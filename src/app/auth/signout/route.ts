import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/** /auth/signout — Session beenden, zur Startseite. */
async function signOut(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', new URL(req.url).origin));
}

export const GET = signOut;
export const POST = signOut;
