import DashboardSection from '@/components/dashboard/DashboardSection';
import { loadDashboardData, loadDashboardStats } from '@/lib/dashboard-data';
import { bereichLabel } from '@/lib/dashboard-nav';
import type { BereichKey } from '@/types/supabase';

/**
 * /dashboard/[slug] — Übersichtsseite (Startseite des Dashboards).
 *
 * Zeigt:
 *  - eine "Status"-Box (in_progress / ready_for_review / live)
 *  - Kacheln mit den wichtigsten Kennzahlen (RSVP, Gästebuch-pending, Musik,
 *    Geschenke reserviert, Foto-Uploads)
 *  - eine "Bereiche-Liste" als Schnellnavigation
 *
 * Wir laden die Daten hier nochmal direkt — Server Component, Page-Level —
 * weil der Layout-Context nur in Client-Components verfügbar ist und Stats
 * im Layout schon einmal berechnet wurden. Das Doppel-Laden vermeiden wir
 * später, wenn wir die Logik in einen geteilten Server-Helper auslagern.
 */

export default async function DashboardOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadDashboardData(slug);
  if (!data) return null; // Layout fängt das schon mit notFound() ab

  const stats = await loadDashboardStats(data.site.id, data.bereiche);
  const status = data.site.status ?? 'in_progress';
  const activeBereiche = data.bereiche.filter((b) => b.is_active);

  return (
    <DashboardSection
      title="Übersicht"
      description="Stand eurer Hochzeitsseite auf einen Blick."
    >
      <StatusBox status={status} />

      <div className="dash-stat-grid">
        <StatCard label="RSVPs" value={stats.rsvpTotal} sub="Antworten gesamt" />
        <StatCard
          label="Gästebuch"
          value={stats.guestbookApproved}
          sub={
            stats.guestbookPending > 0
              ? `${stats.guestbookPending} warten auf Freigabe`
              : 'alles freigegeben'
          }
          warning={stats.guestbookPending > 0}
        />
        <StatCard label="Musikwünsche" value={stats.musicWishes} sub="von Gästen eingereicht" />
        <StatCard label="Foto-Uploads" value={stats.photoUploads} sub="von Gästen" />
        <StatCard
          label="Geschenke"
          value={stats.giftsReserved}
          sub={`von ${stats.giftsTotal} reserviert`}
        />
        <StatCard label="Aktive Bereiche" value={activeBereiche.length} sub="auf der Gäste-Seite" />
      </div>

      <div className="dash-bereiche-overview">
        <h2 className="dash-h2">Aktive Bereiche</h2>
        <p className="dash-help-text">
          Klickt auf einen Bereich, um seine Inhalte zu bearbeiten.
        </p>
        <ul className="dash-bereich-list">
          {activeBereiche.map((b) => (
            <li key={b.id} className="dash-bereich-item">
              <a href={`/dashboard/${slug}/bereiche/${b.bereich_key}`}>
                <span className="dash-bereich-name">{bereichLabel(b.bereich_key as BereichKey)}</span>
                <span className="dash-bereich-variant">Variante {b.variant.toUpperCase()}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </DashboardSection>
  );
}

function StatCard({
  label,
  value,
  sub,
  warning,
}: {
  label: string;
  value: number;
  sub?: string;
  warning?: boolean;
}) {
  return (
    <div className={`dash-stat-card ${warning ? 'is-warning' : ''}`}>
      <div className="dash-stat-label">{label}</div>
      <div className="dash-stat-value">{value}</div>
      {sub && <div className="dash-stat-sub">{sub}</div>}
    </div>
  );
}

function StatusBox({ status }: { status: string }) {
  const labels: Record<string, { title: string; desc: string; tone: string }> = {
    in_progress: {
      title: 'In Bearbeitung',
      desc: 'Pflegt eure Inhalte ein — wenn alles drin ist, gebt euch über die Statusseite frei.',
      tone: 'info',
    },
    ready_for_review: {
      title: 'Daten freigegeben',
      desc: 'Wir prüfen eure Inhalte und finalisieren die Seite. Ihr werdet benachrichtigt.',
      tone: 'success',
    },
    finalized: {
      title: 'Finalisiert',
      desc: 'Die Seite ist fertig vorbereitet und wartet auf das Live-Schalten.',
      tone: 'success',
    },
    live: {
      title: 'Live',
      desc: 'Eure Seite ist online. Änderungen sind weiterhin möglich.',
      tone: 'success',
    },
  };
  const s = labels[status] ?? labels.in_progress;
  return (
    <div className={`dash-status-box is-${s.tone}`}>
      <strong>{s.title}</strong>
      <span>{s.desc}</span>
    </div>
  );
}
