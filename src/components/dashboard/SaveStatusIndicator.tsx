'use client';

/**
 * Status-Anzeige für Auto-Save-Formulare im Dashboard.
 *
 * Vier Zustände:
 *   idle    — "Alle Änderungen werden automatisch gespeichert" (Hinweis-Stil)
 *   saving  — "Wird gespeichert …" (mit pulsendem Dot)
 *   ok      — "Gespeichert ✓" (kurz angezeigt, dann zurück auf idle)
 *   err     — Fehlermeldung
 *
 * Wird in StilTab, StammdatenTab und NavigationForm wiederverwendet.
 */

export type SaveStatus = 'idle' | 'saving' | 'ok' | 'err';

interface Props {
  status: SaveStatus;
  errText: string | null;
}

export default function SaveStatusIndicator({ status, errText }: Props) {
  if (status === 'idle') {
    return (
      <div className="dash-save-status is-idle">
        <span className="dash-save-status-dot" />
        <span>Alle Änderungen werden automatisch gespeichert</span>
      </div>
    );
  }
  if (status === 'saving') {
    return (
      <div className="dash-save-status is-saving">
        <span className="dash-save-status-dot" />
        <span>Wird gespeichert …</span>
      </div>
    );
  }
  if (status === 'ok') {
    return (
      <div className="dash-save-status is-ok">
        <span className="dash-save-status-dot" />
        <span>Gespeichert ✓</span>
      </div>
    );
  }
  return (
    <div className="dash-save-status is-err">
      <span className="dash-save-status-dot" />
      <span>{errText || 'Fehler beim Speichern'}</span>
    </div>
  );
}
