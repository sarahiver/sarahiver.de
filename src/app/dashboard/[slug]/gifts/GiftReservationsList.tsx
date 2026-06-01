'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cancelReservation } from './actions';
import DashboardIcon from '@/components/dashboard/DashboardIcon';

export interface GiftReservationRecord {
  id: string;
  item_id: string;
  item_title: string;
  guest_name: string;
  created_at: string;
}

interface Props {
  slug: string;
  reservations: GiftReservationRecord[];
  totalItems: number;
}

/**
 * Eingehende-Daten-Liste für Geschenk-Reservierungen.
 *
 * Pro Reservierung: Gast-Name, Item-Titel (Schnappschuss), Datum, Storno-Action.
 * CSV-Export für eigene Dokumentation.
 */

export default function GiftReservationsList({ slug, reservations: initial, totalItems }: Props) {
  const router = useRouter();
  const [reservations, setReservations] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reservations;
    return reservations.filter(
      (r) =>
        r.item_title.toLowerCase().includes(term) ||
        r.guest_name.toLowerCase().includes(term),
    );
  }, [reservations, search]);

  const notify = (type: 'ok' | 'err', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCancel = (id: string, itemTitle: string, guestName: string) => {
    if (!window.confirm(
      `Reservierung von „${itemTitle}“ durch ${guestName} wirklich aufheben? Das Geschenk wird wieder zur Reservierung freigegeben.`,
    )) return;

    const snap = reservations;
    setReservations((rs) => rs.filter((r) => r.id !== id));
    startTransition(async () => {
      const res = await cancelReservation({ slug, reservationId: id });
      if (!res.ok) {
        setReservations(snap);
        notify('err', res.error || 'Aktion fehlgeschlagen.');
      } else {
        notify('ok', 'Reservierung aufgehoben.');
        router.refresh();
      }
    });
  };

  const handleExportCsv = () => {
    const header = ['Geschenk', 'Reserviert von', 'Reserviert am'];
    const rows = filtered.map((r) => [
      escapeCsv(r.item_title),
      escapeCsv(r.guest_name),
      escapeCsv(formatGermanDate(r.created_at)),
    ]);
    const csv = '\uFEFF' + [header, ...rows].map((r) => r.join(';')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `geschenke-reservierungen-${todayIso()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify('ok', `${filtered.length} Reservierungen exportiert.`);
  };

  return (
    <div className="dash-form">
      {/* Stats-Zeile */}
      {totalItems > 0 && (
        <div className="dash-gifts-stats">
          <div className="dash-gifts-stat">
            <span className="dash-gifts-stat-value">{reservations.length}</span>
            <span className="dash-gifts-stat-label">{reservations.length === 1 ? 'reserviert' : 'reserviert'}</span>
          </div>
          <div className="dash-gifts-stat">
            <span className="dash-gifts-stat-value">{totalItems - reservations.length}</span>
            <span className="dash-gifts-stat-label">verfügbar</span>
          </div>
          <div className="dash-gifts-stat">
            <span className="dash-gifts-stat-value">{totalItems}</span>
            <span className="dash-gifts-stat-label">gesamt</span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      {reservations.length > 0 && (
        <div className="dash-mw-toolbar" style={{ marginTop: 16 }}>
          <input
            className="dash-input"
            type="search"
            placeholder="Suchen nach Geschenk oder Gast …"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="dash-btn"
            onClick={handleExportCsv}
            title="CSV mit allen Reservierungen herunterladen"
          >
            <DashboardIcon name="download" size={14} />
            <span>CSV exportieren</span>
          </button>
        </div>
      )}

      {/* Liste */}
      <section className="dash-form-section" style={{ marginTop: 16 }}>
        {reservations.length === 0 ? (
          <EmptyState totalItems={totalItems} />
        ) : filtered.length === 0 ? (
          <p className="dash-empty-inline-text">
            Keine Treffer für „{search}“.
          </p>
        ) : (
          <div className="dash-mw-list">
            {filtered.map((r) => (
              <article key={r.id} className="dash-mw-card">
                <div className="dash-mw-card-main">
                  <div className="dash-mw-card-title">{r.item_title}</div>
                  <div className="dash-mw-card-artist">
                    Reserviert von <strong>{r.guest_name}</strong>
                  </div>
                </div>
                <div className="dash-mw-card-meta">
                  <time className="dash-mw-card-time">{formatGermanDate(r.created_at)}</time>
                </div>
                <button
                  type="button"
                  className="dash-btn-text-danger"
                  onClick={() => handleCancel(r.id, r.item_title, r.guest_name)}
                  disabled={pending}
                  title="Reservierung aufheben"
                  aria-label={`Reservierung von „${r.item_title}“ aufheben`}
                >
                  <DashboardIcon name="trash" size={14} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {toast && (
        <div className={`dash-toast ${toast.type === 'ok' ? 'is-ok' : 'is-err'}`}>{toast.text}</div>
      )}
    </div>
  );
}

function EmptyState({ totalItems }: { totalItems: number }) {
  return (
    <div className="dash-empty-state">
      <div className="dash-empty-state-icon">
        <DashboardIcon name="gift" size={32} />
      </div>
      <h3>Noch keine Reservierungen</h3>
      <p>
        {totalItems > 0
          ? `Ihr habt ${totalItems} ${totalItems === 1 ? 'Geschenkidee' : 'Geschenkideen'} angelegt. Sobald Gäste reservieren, erscheint die Übersicht hier.`
          : 'Legt zuerst Geschenkideen im Editor an. Sobald Gäste reservieren, erscheinen die Reservierungen hier.'}
      </p>
    </div>
  );
}

function formatGermanDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function escapeCsv(s: string): string {
  if (s.includes(';') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
