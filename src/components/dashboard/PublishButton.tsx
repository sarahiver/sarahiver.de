'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardIcon from './DashboardIcon';
import {
  publishAll,
  publishBereich,
  publishSite,
  discardAll,
  discardBereich,
  discardSite,
  loadDirtyState,
  type DirtyState,
} from '@/app/dashboard/[slug]/publish-actions';
import { bereichLabel } from '@/lib/dashboard-nav';
import type { DiffEntry } from '@/lib/content-diff';
import type { BereichKey } from '@/types/supabase';

/**
 * Publish-Button in der Topbar mit Modal.
 *
 * Anzeige:
 *   - Badge mit Anzahl der dirty Items
 *   - Klick → Modal mit Liste der Änderungen + "Live schalten"-Button
 *   - Im Modal: aufklappbare Details pro Item, einzeln/alle veröffentlichen,
 *     einzeln/alle verwerfen
 *
 * Auto-Refresh:
 *   - Hört auf 'dashboard:editor-saved'-Events (von allen Auto-Save-Editoren)
 *   - Lädt dann den Dirty-State frisch nach
 *   - Sync mit initialState bei Layout-Reload (router.refresh)
 */

interface Props {
  slug: string;
  initialState: DirtyState;
}

export default function PublishButton({ slug, initialState }: Props) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [showModal, setShowModal] = useState(false);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Bei Layout-Reload (z.B. nach Publish) den frischen Server-State übernehmen
  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  // Auf Save-Events lauschen und Dirty-State neu laden
  useEffect(() => {
    let timer: number | null = null;
    const refresh = () => {
      // Kurz debouncen, damit ein burst von Save-Events nur einen
      // Roundtrip macht. Außerdem brauchen wir kurz Verzögerung, damit
      // der Server-Schreibvorgang abgeschlossen ist (Postgres-Commit).
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(async () => {
        try {
          const fresh = await loadDirtyState(slug);
          setState(fresh);
        } catch (err) {
          console.warn('[PublishButton] reload dirty state failed:', err);
        }
      }, 600);
    };
    window.addEventListener('dashboard:editor-saved', refresh);
    return () => {
      window.removeEventListener('dashboard:editor-saved', refresh);
      if (timer) window.clearTimeout(timer);
    };
  }, [slug]);

  const notify = (type: 'ok' | 'err', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2800);
  };

  // Nichts zu publishen → ausgegrauter Hinweis statt Button
  if (state.totalDirty === 0) {
    return (
      <span className="dash-publish-clean" title="Alles aktuell veröffentlicht">
        <DashboardIcon name="check" size={14} />
        <span>Live & aktuell</span>
      </span>
    );
  }

  const handlePublishAll = () => {
    startTransition(async () => {
      const res = await publishAll(slug);
      if (res.ok) {
        notify('ok', `${res.published ?? 0} Änderung(en) veröffentlicht.`);
        setShowModal(false);
        setState({ siteDirty: false, dirtyBereiche: [], totalDirty: 0, bereichDetails: {}, siteDetails: [] });
        router.refresh();
      } else {
        notify('err', res.error || 'Veröffentlichen fehlgeschlagen.');
      }
    });
  };

  const handlePublishBereich = (key: BereichKey) => {
    startTransition(async () => {
      const res = await publishBereich({ slug, bereich_key: key });
      if (res.ok) {
        notify('ok', `${bereichLabel(key)} veröffentlicht.`);
        setState((s) => {
          const newDetails = { ...s.bereichDetails };
          delete newDetails[key];
          return {
            ...s,
            dirtyBereiche: s.dirtyBereiche.filter((k) => k !== key),
            totalDirty: s.totalDirty - 1,
            bereichDetails: newDetails,
          };
        });
        router.refresh();
      } else {
        notify('err', res.error || 'Veröffentlichen fehlgeschlagen.');
      }
    });
  };

  const handlePublishSite = () => {
    startTransition(async () => {
      const res = await publishSite({ slug });
      if (res.ok) {
        notify('ok', 'Stammdaten/Stil veröffentlicht.');
        setState((s) => ({ ...s, siteDirty: false, totalDirty: s.totalDirty - 1, siteDetails: [] }));
        router.refresh();
      } else {
        notify('err', res.error || 'Veröffentlichen fehlgeschlagen.');
      }
    });
  };

  const handleDiscardAll = () => {
    if (!window.confirm(`Wirklich alle ${state.totalDirty} Änderungen verwerfen? Eure Bearbeitung wird auf den Live-Stand zurückgesetzt — das kann nicht rückgängig gemacht werden.`)) return;
    startTransition(async () => {
      const res = await discardAll(slug);
      if (res.ok) {
        notify('ok', `${res.published ?? 0} Änderung(en) verworfen.`);
        setShowModal(false);
        setState({ siteDirty: false, dirtyBereiche: [], totalDirty: 0, bereichDetails: {}, siteDetails: [] });
        router.refresh();
      } else {
        notify('err', res.error || 'Verwerfen fehlgeschlagen.');
      }
    });
  };

  const handleDiscardBereich = (key: BereichKey) => {
    if (!window.confirm(`Änderungen an „${bereichLabel(key)}“ verwerfen? Der Bereich wird auf den Live-Stand zurückgesetzt.`)) return;
    startTransition(async () => {
      const res = await discardBereich({ slug, bereich_key: key });
      if (res.ok) {
        notify('ok', `${bereichLabel(key)}: Änderungen verworfen.`);
        setState((s) => {
          const newDetails = { ...s.bereichDetails };
          delete newDetails[key];
          return {
            ...s,
            dirtyBereiche: s.dirtyBereiche.filter((k) => k !== key),
            totalDirty: s.totalDirty - 1,
            bereichDetails: newDetails,
          };
        });
        router.refresh();
      } else {
        notify('err', res.error || 'Verwerfen fehlgeschlagen.');
      }
    });
  };

  const handleDiscardSite = () => {
    if (!window.confirm('Änderungen an Stammdaten/Stil/Navigation/Hero verwerfen? Die Live-Werte werden wiederhergestellt.')) return;
    startTransition(async () => {
      const res = await discardSite({ slug });
      if (res.ok) {
        notify('ok', 'Stammdaten/Stil: Änderungen verworfen.');
        setState((s) => ({ ...s, siteDirty: false, totalDirty: s.totalDirty - 1, siteDetails: [] }));
        router.refresh();
      } else {
        notify('err', res.error || 'Verwerfen fehlgeschlagen.');
      }
    });
  };

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <>
      <button
        type="button"
        className="dash-publish-btn"
        onClick={() => setShowModal(true)}
        disabled={pending}
      >
        <span className="dash-publish-dot" aria-hidden="true" />
        <span>{state.totalDirty} {state.totalDirty === 1 ? 'Änderung' : 'Änderungen'} offen</span>
      </button>

      {showModal && (
        <div className="dash-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="dash-modal dash-modal-wide" onClick={(e) => e.stopPropagation()}>
            <h3 className="dash-modal-title">Änderungen veröffentlichen</h3>
            <p className="dash-modal-desc">
              Folgende Änderungen sind aktuell nur in eurer Bearbeitungsansicht sichtbar. Klickt
              auf den Pfeil neben einem Eintrag, um Details zu sehen.
            </p>

            <div className="dash-publish-list">
              {state.siteDirty && (
                <PublishItem
                  itemKey="__site__"
                  title="Stammdaten · Stil · Navigation · Hero-Bild"
                  subtitle="Allgemeine Einstellungen eurer Seite"
                  details={state.siteDetails}
                  expanded={expanded.has('__site__')}
                  onToggle={() => toggleExpand('__site__')}
                  onPublish={handlePublishSite}
                  onDiscard={handleDiscardSite}
                  pending={pending}
                />
              )}

              {state.dirtyBereiche.map((key) => (
                <PublishItem
                  key={key}
                  itemKey={key}
                  title={bereichLabel(key)}
                  subtitle="Bereich auf eurer Seite"
                  details={state.bereichDetails[key] || []}
                  expanded={expanded.has(key)}
                  onToggle={() => toggleExpand(key)}
                  onPublish={() => handlePublishBereich(key)}
                  onDiscard={() => handleDiscardBereich(key)}
                  pending={pending}
                />
              ))}
            </div>

            <p className="dash-form-hint" style={{ marginTop: 16 }}>
              Vor dem Veröffentlichen schauen?{' '}
              <Link href={`/${slug}?preview=draft`} target="_blank" rel="noopener noreferrer">
                Bearbeitungs-Vorschau in neuem Tab öffnen ↗
              </Link>
            </p>

            <div className="dash-modal-actions">
              <button
                type="button"
                className="dash-btn-text-danger"
                onClick={handleDiscardAll}
                disabled={pending}
                style={{ marginRight: 'auto' }}
              >
                Alle verwerfen
              </button>
              <button
                type="button"
                className="dash-btn-out"
                onClick={() => setShowModal(false)}
                disabled={pending}
              >
                Schließen
              </button>
              <button
                type="button"
                className="dash-btn"
                onClick={handlePublishAll}
                disabled={pending}
              >
                {pending ? 'Wird veröffentlicht…' : `Alles veröffentlichen (${state.totalDirty})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`dash-toast ${toast.type === 'ok' ? 'is-ok' : 'is-err'}`}>{toast.text}</div>
      )}
    </>
  );
}

// ====================================================================
// PublishItem — eine Karte im Modal mit aufklappbaren Details
// ====================================================================

function PublishItem({
  title,
  subtitle,
  details,
  expanded,
  onToggle,
  onPublish,
  onDiscard,
  pending,
}: {
  itemKey: string;
  title: string;
  subtitle: string;
  details: DiffEntry[];
  expanded: boolean;
  onToggle: () => void;
  onPublish: () => void;
  onDiscard: () => void;
  pending: boolean;
}) {
  const hasDetails = details && details.length > 0;
  return (
    <div className={`dash-publish-item ${expanded ? 'is-expanded' : ''}`}>
      <div className="dash-publish-item-head">
        <button
          type="button"
          className="dash-publish-item-toggle"
          onClick={onToggle}
          disabled={!hasDetails}
          title={hasDetails ? 'Details anzeigen' : 'Keine Details verfügbar'}
        >
          <span className={`dash-publish-item-chevron ${expanded ? 'is-open' : ''}`} aria-hidden="true">
            ▸
          </span>
          <div className="dash-publish-item-info">
            <strong>{title}</strong>
            <span>
              {hasDetails
                ? `${details.length} ${details.length === 1 ? 'Änderung' : 'Änderungen'} · ${subtitle}`
                : subtitle}
            </span>
          </div>
        </button>
        <div className="dash-publish-item-actions">
          <button
            type="button"
            className="dash-btn-text-danger"
            onClick={onDiscard}
            disabled={pending}
            title="Änderungen verwerfen"
          >
            Verwerfen
          </button>
          <button
            type="button"
            className="dash-btn-out"
            onClick={onPublish}
            disabled={pending}
          >
            Veröffentlichen
          </button>
        </div>
      </div>

      {expanded && hasDetails && (
        <div className="dash-publish-item-details">
          {details.map((d, i) => (
            <DiffRow key={`${d.field}-${i}`} entry={d} />
          ))}
        </div>
      )}
    </div>
  );
}

function DiffRow({ entry }: { entry: DiffEntry }) {
  const typeLabel = entry.type === 'added' ? 'NEU' : entry.type === 'removed' ? 'WEG' : 'ÄND';
  return (
    <div className={`dash-diff-row is-${entry.type}`}>
      <span className={`dash-diff-type is-${entry.type}`}>{typeLabel}</span>
      <div className="dash-diff-content">
        <span className="dash-diff-label">{entry.label}</span>
        {entry.summary ? (
          <span className="dash-diff-summary">{entry.summary}</span>
        ) : (
          <span className="dash-diff-values">
            {entry.before !== undefined && <span className="dash-diff-before">{entry.before || '—'}</span>}
            {entry.before !== undefined && entry.after !== undefined && (
              <span className="dash-diff-arrow" aria-hidden="true">→</span>
            )}
            {entry.after !== undefined && <span className="dash-diff-after">{entry.after || '—'}</span>}
          </span>
        )}
      </div>
    </div>
  );
}
