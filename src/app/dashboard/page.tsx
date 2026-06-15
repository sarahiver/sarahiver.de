import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * /dashboard — Einstieg ohne Slug. Löst die Site des eingeloggten
 * Eigentümers auf und leitet weiter. Liest als eingeloggter User
 * (Anon-Client + RLS-Policy "owner_can_read_own_site").
 */
export const dynamic = 'force-dynamic';

export default async function DashboardIndex() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/dashboard');

  const { data: site } = await supabase
    .from('wedding_sites')
    .select('slug')
    .eq('owner_user_id', user.id)
    .maybeSingle();

  const slug = (site as { slug?: string } | null)?.slug;
  if (slug) redirect(`/dashboard/${slug}`);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '80px 20px', fontFamily: 'Inter, system-ui, sans-serif', color: '#0F0E0C', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 600 }}>Noch keine Hochzeitsseite</h1>
      <p style={{ color: '#5f5b53', lineHeight: 1.6 }}>
        Zu diesem Account ist noch keine Seite verknüpft. Falls ihr gerade gebucht habt,
        dauert die Einrichtung einen Moment — lade die Seite gleich neu.
      </p>
      <p style={{ marginTop: 20 }}>
        <a href="/auth/signout" style={{ color: '#8a857c', fontSize: 13, textDecoration: 'underline' }}>Abmelden</a>
      </p>
    </div>
  );
}
