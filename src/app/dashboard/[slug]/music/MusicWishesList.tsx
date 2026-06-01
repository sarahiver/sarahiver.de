'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteWish } from './actions';
import DashboardIcon from '@/components/dashboard/DashboardIcon';

export interface MusicWishRecord {
  id: string;
  title: string;
  artist: string;
  guest_name: string | null;
  created_at: string;
}

interface Props {
  slug: string;
  wishes: MusicWishRecord[];
  coupleNames: string;
}

/**
 * Eingehende-Daten-Liste für Musikwünsche.
 *
 * Funktionen:
 *   - Suche (Titel / Interpret / Gast)
 *   - CSV-Export (DJ-tauglich, mit BOM für Excel, semicolon-separiert)
 *   - Delete pro Eintrag (optimistic)
 *
 * Kein Moderationsschritt — Wünsche sind immer "live".
 */

export default function MusicWishesList({ slug, wishes: initialWishes, coupleNames }: Props) {
  const router = useRouter();
  const [wishes, setWishes] = useState(initialWishes);
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return wishes;
    return wishes.filter(
      (w) =>
        w.title.toLowerCase().includes(term) ||
        w.artist.toLowerCase().includes(term) ||
        (w.guest_name || '').toLowerCase().includes(term),
    );
  }, [wishes, search]);

  const notify = (type: 'ok' | 'err', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2500);
  };

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Wunsch „${title}“ wirklich löschen?`)) return;
    const snap = wishes;
    setWishes((ws) => ws.filter((w) => w.id !== id));
    startTransition(async () => {
      const res = await deleteWish({ slug, wishId: id });
      if (!res.ok) {
        setWishes(snap); // Rollback
        notify('err', res.error || 'Aktion fehlgeschlagen.');
      } else {
        notify('ok', 'Wunsch gelöscht.');
        router.refresh();
      }
    });
  };

  const handleExportCsv = () => {
    // BOM + Semicolon-Trenner für Excel-Kompatibilität (deutsche Locale)
    const header = ['Titel', 'Interpret', 'Von', 'Eingegangen am'];
    const rows = filtered.map((w) => [
      escapeCsv(w.title),
      escapeCsv(w.artist),
      escapeCsv(w.guest_name || ''),
      escapeCsv(formatGermanDate(w.created_at)),
    ]);
    const csv = '\uFEFF' + [header, ...rows].map((r) => r.join(';')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (coupleNames || 'hochzeit').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    link.href = url;
    link.download = `musikwuensche-${safeName}-${todayIso()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify('ok', `${filtered.length} Wünsche exportiert.`);
  };

  return (
    <div className="dash-form">
      {/* Aktionen-Bar */}
      <div className="dash-mw-toolbar">
        <input
          className="dash-input"
          type="search"
          placeholder="Suchen nach Titel, Interpret oder Gast …"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className="dash-btn"
          onClick={handleExportCsv}
          disabled={wishes.length === 0}
          title="CSV für euren DJ herunterladen"
        >
          <DashboardIcon name="download" size={14} />
          <span>CSV exportieren</span>
        </button>
      </div>

      {/* Liste */}
      <section className="dash-form-section" style={{ marginTop: 16 }}>
        {wishes.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <p className="dash-empty-inline-text">
            Keine Treffer für „{search}“.
          </p>
        ) : (
          <div className="dash-mw-list">
            {filtered.map((w) => (
              <article key={w.id} className="dash-mw-card">
                <div className="dash-mw-card-main">
                  <div className="dash-mw-card-title">{w.title}</div>
                  <div className="dash-mw-card-artist">{w.artist}</div>
                </div>
                <div className="dash-mw-card-meta">
                  {w.guest_name && (
                    <span className="dash-mw-card-guest">
                      von <strong>{w.guest_name}</strong>
                    </span>
                  )}
                  <time className="dash-mw-card-time">{formatGermanDate(w.created_at)}</time>
                </div>
                <button
                  type="button"
                  className="dash-btn-text-danger"
                  onClick={() => handleDelete(w.id, w.title)}
                  disabled={pending}
                  aria-label={`Wunsch „${w.title}“ löschen`}
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

function EmptyState() {
  return (
    <div className="dash-empty-state">
      <div className="dash-empty-state-icon">
        <DashboardIcon name="music" size={32} />
      </div>
      <h3>Noch keine Songwünsche</h3>
      <p>
        Sobald eure Gäste Wünsche eintragen, erscheinen sie hier. Den fertigen DJ-Zettel könnt
        ihr dann als CSV exportieren.
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
