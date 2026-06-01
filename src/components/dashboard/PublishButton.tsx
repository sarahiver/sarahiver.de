'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardIcon from './DashboardIcon';
import { publishAll, publishBereich, publishSite, type DirtyState } from '@/app/dashboard/[slug]/publish-actions';
import { bereichLabel } from '@/lib/dashboard-nav';
import type { BereichKey } from '@/types/supabase';

/**
 * Publish-Button in der Topbar mit Modal.
 *
 * Anzeige:
 *   - Badge mit Anzahl der dirty Items
 *   - Klick → Modal mit Liste der Änderungen + "Live schalten"-Button
 *   - Im Modal: Vorschau-Link (Draft-Modus) + pro-Item-Publish-Optionen
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
        setState({ siteDirty: false, dirtyBereiche: [], totalDirty: 0 });
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
        setState((s) => ({
          ...s,
          dirtyBereiche: s.dirtyBereiche.filter((k) => k !== key),
          totalDirty: s.totalDirty - 1,
        }));
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
        setState((s) => ({ ...s, siteDirty: false, totalDirty: s.totalDirty - 1 }));
        router.refresh();
      } else {
        notify('err', res.error || 'Veröffentlichen fehlgeschlagen.');
      }
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
              auf „Alles veröffentlichen", um sie auf eure Live-Seite zu übertragen — oder
              einzeln pro Bereich.
            </p>

            <div className="dash-publish-list">
              {state.siteDirty && (
                <div className="dash-publish-item">
                  <div className="dash-publish-item-info">
                    <strong>Stammdaten · Stil · Navigation · Hero-Bild</strong>
                    <span>Allgemeine Einstellungen eurer Seite</span>
                  </div>
                  <button
                    type="button"
                    className="dash-btn-out"
                    onClick={handlePublishSite}
                    disabled={pending}
                  >
                    Einzeln veröffentlichen
                  </button>
                </div>
              )}

              {state.dirtyBereiche.map((key) => (
                <div key={key} className="dash-publish-item">
                  <div className="dash-publish-item-info">
                    <strong>{bereichLabel(key)}</strong>
                    <span>Bereich auf eurer Seite</span>
                  </div>
                  <button
                    type="button"
                    className="dash-btn-out"
                    onClick={() => handlePublishBereich(key)}
                    disabled={pending}
                  >
                    Einzeln veröffentlichen
                  </button>
                </div>
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
