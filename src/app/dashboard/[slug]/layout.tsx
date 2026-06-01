import { loadDashboardData, loadDashboardStats } from '@/lib/dashboard-data';
import { loadDirtyState } from './publish-actions';
import { buildDashboardNav } from '@/lib/dashboard-nav';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/components/dashboard/DashboardTopbar';
import DashboardErrorBoundary from '@/components/dashboard/DashboardErrorBoundary';
import { DashboardDataProvider } from '@/components/dashboard/DashboardDataProvider';

/**
 * Layout für /dashboard/[slug]/*
 *
 * Lädt Site + Bereiche EINMAL und stellt sie allen Sub-Pages via Context
 * zur Verfügung. Rendert Sidebar (links) + Topbar (oben) und einen
 * Content-Slot rechts unten für die jeweilige Page.
 *
 * Server Component — Sidebar/Topbar sind Client-Inseln darin.
 */

export const dynamic = 'force-dynamic'; // Dashboard-Daten nie statisch cachen

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadDashboardData(slug);
  if (!data) {
    return (
      <div style={{ padding: 40, fontFamily: 'system-ui, sans-serif', maxWidth: 640, margin: '40px auto' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 24 }}>Dashboard konnte nicht geladen werden</h1>
        <p style={{ color: '#5f5e5a', lineHeight: 1.6 }}>
          Für den Slug <code>{slug}</code> konnten keine Daten geladen werden. Mögliche Ursachen:
        </p>
        <ul style={{ color: '#5f5e5a', lineHeight: 1.7 }}>
          <li>Die Site existiert nicht (falscher Slug?)</li>
          <li>Der Service-Role-Key ist nicht oder falsch in den Vercel-Environment-Variablen gesetzt</li>
          <li>Die Supabase-Verbindung schlägt fehl</li>
        </ul>
        <p style={{ color: '#5f5e5a', fontSize: 13 }}>
          Details stehen im Vercel-Runtime-Log (Tag <code>[dashboard-data]</code> oder <code>[supabase-admin]</code>).
        </p>
      </div>
    );
  }

  const stats = await loadDashboardStats(data.site.id, data.bereiche);
  const dirtyState = await loadDirtyState(slug);
  const navSections = buildDashboardNav({
    bereiche: data.bereiche.map((b) => ({
      bereich_key: b.bereich_key,
      is_active: b.is_active,
      display_order: b.display_order,
    })),
    purchasedKeys: data.purchasedKeys,
    stats,
  });

  const coupleNames = formatCouple(data.site.couple_name_1, data.site.couple_name_2);

  return (
    <div className="dash-shell">
      <DashboardSidebar slug={slug} sections={navSections} dirtyBereiche={dirtyState.dirtyBereiche} />
      <div className="dash-main">
        <DashboardTopbar
          slug={slug}
          coupleNames={coupleNames}
          weddingDateISO={data.site.wedding_date}
          dirtyState={dirtyState}
        />
        <main className="dash-content">
          <DashboardErrorBoundary>
            <DashboardDataProvider
              site={data.site}
              bereiche={data.bereiche}
              purchasedKeys={data.purchasedKeys}
              stats={stats}
            >
              {children}
            </DashboardDataProvider>
          </DashboardErrorBoundary>
        </main>
      </div>
    </div>
  );
}

function formatCouple(a: string | null, b: string | null): string {
  const aa = (a || '').trim();
  const bb = (b || '').trim();
  if (aa && bb) return `${aa} & ${bb}`;
  return aa || bb || 'Hochzeit';
}
