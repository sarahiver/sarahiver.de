'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PhotoUploadRecord } from '@/lib/photo-uploads-data';
import { deletePhotos } from './actions';
import DashboardIcon from '@/components/dashboard/DashboardIcon';

/**
 * Eingehende Daten: Foto-Uploads von Gästen.
 *
 * Features:
 *  - Foto-Grid mit Vorschau
 *  - Multi-Select (Click toggelt)
 *  - "Alle auswählen" / "Auswahl aufheben"
 *  - ZIP-Download (mit JSZip, lazy-import)
 *  - Auto-Delete nach Download (Datenschutz)
 *  - Manuelles Löschen (ohne Download)
 *
 * Workflow:
 *   1. Gäste laden via /photoupload-Bereich Fotos hoch
 *   2. Brautpaar lädt sich die Fotos als ZIP herunter
 *   3. Die heruntergeladenen Fotos werden automatisch aus Cloudinary
 *      und DB gelöscht — Datenschutz, kein dauerhaftes Hosting
 */

interface Props {
  slug: string;
  initialPhotos: PhotoUploadRecord[];
}

export default function PhotosSection({ slug, initialPhotos }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const notify = (type: 'ok' | 'err', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const photos = initialPhotos;
  const selectedCount = selected.size;
  const isWorking = pending || downloading;

  const stats = useMemo(() => {
    const total = photos.length;
    const uploaders = new Set(photos.map((p) => p.uploaded_by).filter(Boolean));
    return { total, uploaders: uploaders.size };
  }, [photos]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(photos.map((p) => p.id)));
  const deselectAll = () => setSelected(new Set());

  // ====================================================================
  // ZIP-Download + Auto-Delete
  // ====================================================================
  const downloadAndDelete = async (downloadAll: boolean) => {
    const targets = downloadAll
      ? photos
      : photos.filter((p) => selected.has(p.id));

    if (targets.length === 0) {
      notify('err', 'Keine Fotos ausgewählt.');
      return;
    }

    if (
      !window.confirm(
        `${targets.length} Foto(s) als ZIP herunterladen?\n\n` +
          `Nach dem Download werden die Fotos aus Datenschutzgründen ` +
          `automatisch aus dem Online-Speicher gelöscht.`,
      )
    ) {
      return;
    }

    setDownloading(true);
    setDownloadProgress({ current: 0, total: targets.length });

    try {
      // JSZip lazy-loaden — vermeidet Bundle-Bloat
      const JSZipModule = await import('jszip');
      const JSZip = JSZipModule.default;
      const zip = new JSZip();
      const folder = zip.folder('hochzeitsfotos');
      if (!folder) throw new Error('ZIP-Folder konnte nicht erstellt werden.');

      // Bilder runterladen und ins ZIP hängen
      let success = 0;
      let failed = 0;
      for (let i = 0; i < targets.length; i++) {
        const photo = targets[i];
        setDownloadProgress({ current: i + 1, total: targets.length });
        try {
          const res = await fetch(photo.cloudinary_url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          const ext = guessExt(photo.cloudinary_url);
          const safeUploader = (photo.uploaded_by || 'Gast').replace(/[^a-zA-Z0-9äöüÄÖÜß_-]/g, '_');
          const filename = `${safeUploader}_${i + 1}.${ext}`;
          folder.file(filename, blob);
          success++;
        } catch (err) {
          console.error(`[downloadAndDelete] Foto ${photo.id} failed:`, err);
          failed++;
        }
      }

      if (success === 0) {
        notify('err', 'Keine Fotos konnten heruntergeladen werden.');
        setDownloading(false);
        return;
      }

      // ZIP-Datei generieren und Download triggern
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().slice(0, 10);
      a.download = `hochzeitsfotos_${slug}_${today}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      // Auto-Delete nach erfolgreichem Download
      setDownloadProgress({ current: targets.length, total: targets.length });

      const idsToDelete = targets.map((p) => p.id);
      const delResult = await deletePhotos(slug, idsToDelete);

      if (delResult.ok) {
        notify(
          'ok',
          `${success} Foto(s) heruntergeladen und aus dem Online-Speicher entfernt.${
            failed > 0 ? ` ${failed} fehlgeschlagen.` : ''
          }`,
        );
      } else {
        notify(
          'err',
          `Download erfolgreich, aber Löschen fehlgeschlagen: ${delResult.error}`,
        );
      }

      setSelected(new Set());
      router.refresh();
    } catch (err) {
      console.error('[downloadAndDelete] failed:', err);
      notify('err', 'Download fehlgeschlagen.');
    } finally {
      setDownloading(false);
      setDownloadProgress({ current: 0, total: 0 });
    }
  };

  // ====================================================================
  // Delete ohne Download
  // ====================================================================
  const handleDeleteOnly = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    startTransition(async () => {
      const res = await deletePhotos(slug, ids);
      if (res.ok) {
        notify('ok', `${res.count} Foto(s) gelöscht.`);
        setSelected(new Set());
        setConfirmDelete(false);
        router.refresh();
      } else {
        notify('err', res.error || 'Löschen fehlgeschlagen.');
      }
    });
  };

  // ====================================================================
  // Render
  // ====================================================================

  return (
    <div className="dash-photos">
      {/* Stats */}
      <div className="dash-rsvp-stats">
        <StatCard label="Fotos gesamt" value={stats.total} />
        <StatCard label="Verschiedene Hochlader" value={stats.uploaders} />
        <StatCard label="Ausgewählt" value={selectedCount} highlight={selectedCount > 0} />
      </div>

      {/* Hinweis zur Datenschutz-Logik */}
      <p className="dash-guests-status-hint">
        <DashboardIcon name="external" size={12} />
        <span>
          Sobald ihr Fotos als ZIP herunterladet, werden sie aus dem Online-Speicher
          <strong> automatisch entfernt</strong>. So bleiben die Bilder eurer Gäste privat und
          ihr habt sie sicher bei euch zuhause.
        </span>
      </p>

      {/* Aktionsleiste */}
      {photos.length > 0 && (
        <div className="dash-photos-toolbar">
          <div className="dash-photos-toolbar-left">
            <button
              type="button"
              className="dash-btn-out"
              onClick={selectAll}
              disabled={isWorking || selectedCount === photos.length}
            >
              Alle auswählen
            </button>
            <button
              type="button"
              className="dash-btn-out"
              onClick={deselectAll}
              disabled={isWorking || selectedCount === 0}
            >
              Auswahl aufheben
            </button>
          </div>
          <div className="dash-photos-toolbar-right">
            {selectedCount > 0 && (
              <>
                <button
                  type="button"
                  className="dash-btn"
                  onClick={() => downloadAndDelete(false)}
                  disabled={isWorking}
                >
                  <DashboardIcon name="download" size={14} />
                  <span>
                    {downloading
                      ? `Lädt… (${downloadProgress.current}/${downloadProgress.total})`
                      : `${selectedCount} herunterladen & löschen`}
                  </span>
                </button>
                <button
                  type="button"
                  className="dash-btn-out dash-btn-danger-out"
                  onClick={() => setConfirmDelete(true)}
                  disabled={isWorking}
                >
                  <DashboardIcon name="trash" size={14} />
                  <span>Nur löschen</span>
                </button>
              </>
            )}
            <button
              type="button"
              className="dash-btn-out"
              onClick={() => downloadAndDelete(true)}
              disabled={isWorking}
              title="Alle herunterladen & danach automatisch löschen"
            >
              <DashboardIcon name="download" size={14} />
              <span>Alle ({photos.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="dash-photos-empty">
          <div className="dash-photos-empty-icon">
            <DashboardIcon name="camera" size={40} />
          </div>
          <h3>Noch keine Fotos hochgeladen</h3>
          <p>
            Sobald eure Gäste über den Foto-Upload-Bereich auf eurer Hochzeits-Seite Fotos
            hochladen, tauchen sie hier auf.
          </p>
        </div>
      )}

      {/* Foto-Grid */}
      {photos.length > 0 && (
        <div className="dash-photos-grid">
          {photos.map((p) => {
            const isSel = selected.has(p.id);
            return (
              <div
                key={p.id}
                className={`dash-photos-card ${isSel ? 'is-selected' : ''}`}
                onClick={() => !isWorking && toggle(p.id)}
                style={{ backgroundImage: `url(${p.cloudinary_url})` }}
                role="button"
                tabIndex={0}
              >
                {isSel && (
                  <div className="dash-photos-check">
                    <DashboardIcon name="check" size={14} />
                  </div>
                )}
                <div className="dash-photos-card-info">
                  <span className="dash-photos-card-uploader">{p.uploaded_by || 'Gast'}</span>
                  <span className="dash-photos-card-date">
                    {new Date(p.created_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="dash-modal-backdrop" onClick={() => setConfirmDelete(false)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="dash-modal-title">{selectedCount} Foto(s) löschen?</h3>
            <p className="dash-modal-desc">
              Die ausgewählten Fotos werden ohne Download endgültig aus dem Online-Speicher
              entfernt. Diese Aktion lässt sich nicht rückgängig machen.
            </p>
            <div className="dash-modal-actions">
              <button
                type="button"
                className="dash-btn-out"
                onClick={() => setConfirmDelete(false)}
                disabled={pending}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="dash-btn dash-btn-danger"
                onClick={handleDeleteOnly}
                disabled={pending}
              >
                {pending ? 'Lösche…' : 'Endgültig löschen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`dash-toast ${toast.type === 'ok' ? 'is-ok' : 'is-err'}`}>{toast.text}</div>
      )}
    </div>
  );
}

// ====================================================================
// Helpers
// ====================================================================

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`dash-rsvp-stat ${highlight ? 'is-highlight' : ''}`}>
      <div className="dash-rsvp-stat-value">{value}</div>
      <div className="dash-rsvp-stat-label">{label}</div>
    </div>
  );
}

function guessExt(url: string): string {
  const m = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
  return m ? m[1].toLowerCase() : 'jpg';
}
