'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { approveEntry, rejectEntry, deleteEntry } from './actions';
import DashboardIcon from '@/components/dashboard/DashboardIcon';

export interface GuestbookEntryRecord {
  id: string;
  name: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
}

interface Props {
  slug: string;
  entries: GuestbookEntryRecord[];
}

type Tab = 'pending' | 'approved' | 'rejected';

/**
 * Moderations-UI für Gästebuch-Einträge.
 *
 * Drei Tabs: ausstehend / freigegeben / abgelehnt.
 * Pro Eintrag: Approve, Reject, Hard-Delete.
 *
 * Optimistic UI: nach Klick wird der Eintrag aus der aktuellen Tab-Liste
 * entfernt (oder Status geändert), bevor der Server bestätigt. Bei Fehler:
 * Rollback durch router.refresh().
 */

export default function GuestbookList({ slug, entries: initialEntries }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('pending');
  const [entries, setEntries] = useState(initialEntries);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [search, setSearch] = useState('');

  const counts = useMemo(() => {
    return {
      pending: entries.filter((e) => e.status === 'pending').length,
      approved: entries.filter((e) => e.status === 'approved').length,
      rejected: entries.filter((e) => e.status === 'rejected').length,
    };
  }, [entries]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries
      .filter((e) => e.status === tab)
      .filter((e) => !term || e.name.toLowerCase().includes(term) || e.message.toLowerCase().includes(term))
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }, [entries, tab, search]);

  const notify = (type: 'ok' | 'err', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2500);
  };

  const handle = (id: string, action: 'approve' | 'reject' | 'delete') => {
    // Optimistic-Update lokal
    const snap = entries;
    if (action === 'delete') {
      setEntries((es) => es.filter((e) => e.id !== id));
    } else {
      setEntries((es) =>
        es.map((e) =>
          e.id === id
            ? { ...e, status: action === 'approve' ? 'approved' : 'rejected', reviewed_at: new Date().toISOString() }
            : e,
        ),
      );
    }
    startTransition(async () => {
      const fn = action === 'approve' ? approveEntry : action === 'reject' ? rejectEntry : deleteEntry;
      const res = await fn({ slug, entryId: id });
      if (!res.ok) {
        setEntries(snap); // Rollback
        notify('err', res.error || 'Aktion fehlgeschlagen.');
      } else {
        const label = action === 'approve' ? 'freigegeben' : action === 'reject' ? 'abgelehnt' : 'gelöscht';
        notify('ok', `Eintrag ${label}.`);
        router.refresh(); // Synct Topbar-Counter etc.
      }
    });
  };

  return (
    <div className="dash-form">
      {/* Tabs */}
      <div className="dash-gb-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'pending'}
          className={`dash-gb-tab ${tab === 'pending' ? 'is-active' : ''}`}
          onClick={() => setTab('pending')}
        >
          Ausstehend
          {counts.pending > 0 && <span className="dash-gb-tab-badge is-warn">{counts.pending}</span>}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'approved'}
          className={`dash-gb-tab ${tab === 'approved' ? 'is-active' : ''}`}
          onClick={() => setTab('approved')}
        >
          Freigegeben
          {counts.approved > 0 && <span className="dash-gb-tab-badge">{counts.approved}</span>}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'rejected'}
          className={`dash-gb-tab ${tab === 'rejected' ? 'is-active' : ''}`}
          onClick={() => setTab('rejected')}
        >
          Abgelehnt
          {counts.rejected > 0 && <span className="dash-gb-tab-badge">{counts.rejected}</span>}
        </button>
      </div>

      {/* Suche */}
      {entries.length > 0 && (
        <div className="dash-form-field" style={{ marginTop: 16 }}>
          <input
            className="dash-input"
            type="search"
            placeholder="Nach Name oder Nachricht suchen …"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Liste */}
      <section className="dash-form-section" style={{ marginTop: 16 }}>
        {filtered.length === 0 ? (
          <EmptyState tab={tab} hasAny={entries.length > 0} />
        ) : (
          <div className="dash-gb-list">
            {filtered.map((entry) => (
              <article key={entry.id} className={`dash-gb-card is-${entry.status}`}>
                <header className="dash-gb-card-head">
                  <div>
                    <strong className="dash-gb-card-name">{entry.name}</strong>
                    <time className="dash-gb-card-time">{formatGermanDate(entry.created_at)}</time>
                  </div>
                  <StatusBadge status={entry.status} />
                </header>
                <p className="dash-gb-card-message">{entry.message}</p>
                <footer className="dash-gb-card-actions">
                  {entry.status !== 'approved' && (
                    <button
                      type="button"
                      className="dash-btn"
                      onClick={() => handle(entry.id, 'approve')}
                      disabled={pending}
                    >
                      <DashboardIcon name="check" size={14} />
                      <span>Freigeben</span>
                    </button>
                  )}
                  {entry.status !== 'rejected' && (
                    <button
                      type="button"
                      className="dash-btn-out"
                      onClick={() => handle(entry.id, 'reject')}
                      disabled={pending}
                    >
                      Ablehnen
                    </button>
                  )}
                  <button
                    type="button"
                    className="dash-btn-text-danger"
                    onClick={() => {
                      if (window.confirm(`Eintrag von „${entry.name}“ wirklich löschen?`)) {
                        handle(entry.id, 'delete');
                      }
                    }}
                    disabled={pending}
                  >
                    <DashboardIcon name="trash" size={14} />
                    <span>Löschen</span>
                  </button>
                </footer>
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

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  if (status === 'pending') return <span className="dash-gb-badge is-warn">Ausstehend</span>;
  if (status === 'approved') return <span className="dash-gb-badge is-ok">Freigegeben</span>;
  return <span className="dash-gb-badge is-muted">Abgelehnt</span>;
}

function EmptyState({ tab, hasAny }: { tab: Tab; hasAny: boolean }) {
  if (!hasAny) {
    return (
      <div className="dash-empty-state">
        <div className="dash-empty-state-icon">
          <DashboardIcon name="book" size={32} />
        </div>
        <h3>Noch keine Einträge</h3>
        <p>
          Sobald eure Gäste das Gästebuch nutzen, erscheinen ihre Einträge hier zur Freigabe.
          Erst nach eurer Bestätigung werden sie auf eurer Hochzeitsseite angezeigt.
        </p>
      </div>
    );
  }
  const text = {
    pending: 'Aktuell keine ausstehenden Einträge — alles geprüft. 🎉',
    approved: 'Noch keine Einträge freigegeben.',
    rejected: 'Keine abgelehnten Einträge.',
  }[tab];
  return <p className="dash-empty-inline-text">{text}</p>;
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
