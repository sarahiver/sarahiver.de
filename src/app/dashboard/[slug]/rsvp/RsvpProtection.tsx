'use client';

import { useState, useTransition } from 'react';
import { generateCode } from '@/lib/rsvp-code';
import { saveInviteCode, setInviteCodeProtection } from './code-actions';

/**
 * RSVP-Schutz im Dashboard.
 *
 * Drei Zustände, die das Paar unterscheiden können muss:
 *   nicht eingerichtet  — noch kein Code hinterlegt
 *   eingerichtet, aus   — Code liegt bereit, Gäste brauchen ihn aber nicht
 *   aktiv               — Gäste brauchen den Code
 *
 * Der Klartext-Code erscheint genau einmal: direkt nachdem er gesetzt wurde,
 * aus der Eingabe dieses Formulars. Nach einem Reload ist er weg, weil in der
 * Datenbank nur ein Hash liegt. Deshalb gibt es bewusst kein „Code anzeigen".
 *
 * Der Client bekommt nie den Hash — nur hasCode, enabled und updatedAt.
 */

interface Props {
  slug: string;
  hasCode: boolean;
  enabled: boolean;
  /** ISO-Zeitpunkt der letzten Codeänderung, oder null. */
  updatedAt: string | null;
}

type Feedback = { kind: 'ok' | 'error'; text: string } | null;

export default function RsvpProtection({ slug, hasCode, enabled, updatedAt }: Props) {
  const [input, setInput] = useState('');
  const [editing, setEditing] = useState(!hasCode);
  const [justSaved, setJustSaved] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, startTransition] = useTransition();

  const state: 'none' | 'off' | 'on' = !hasCode ? 'none' : enabled ? 'on' : 'off';

  const statusText =
    state === 'none'
      ? 'Noch nicht eingerichtet'
      : state === 'on'
        ? 'Aktiv'
        : 'Eingerichtet, aktuell ausgeschaltet';

  function save() {
    setFeedback(null);
    startTransition(async () => {
      const res = await saveInviteCode(slug, input);
      if (!res.ok) {
        setFeedback({ kind: 'error', text: res.error });
        return;
      }
      setJustSaved(res.code ?? input.trim());
      setInput('');
      setEditing(false);
      setCopied(false);
      setFeedback({ kind: 'ok', text: res.message });
    });
  }

  function toggle(next: boolean) {
    setFeedback(null);
    startTransition(async () => {
      const res = await setInviteCodeProtection(slug, next);
      setFeedback(
        res.ok ? { kind: 'ok', text: res.message } : { kind: 'error', text: res.error },
      );
    });
  }

  async function copy() {
    if (!justSaved) return;
    try {
      await navigator.clipboard.writeText(justSaved);
      setCopied(true);
    } catch {
      setFeedback({
        kind: 'error',
        text: 'Kopieren hat nicht geklappt — bitte markiert den Code und kopiert ihn von Hand.',
      });
    }
  }

  return (
    <section className="dash-rsvpcode" aria-labelledby="rsvpcode-title">
      <header className="dash-rsvpcode-head">
        <div>
          <h2 className="dash-rsvpcode-title" id="rsvpcode-title">
            RSVP-Schutz
          </h2>
          <p className="dash-rsvpcode-desc">
            Mit einem Einladungscode können nur Gäste antworten, die ihn von euch bekommen
            haben — zum Beispiel über die Einladung.
          </p>
        </div>

        {/* Status nicht nur über Farbe: Punkt UND Wort. */}
        <p className={`dash-rsvpcode-status is-${state}`}>
          <span className="dash-rsvpcode-dot" aria-hidden="true" />
          {statusText}
        </p>
      </header>

      {updatedAt && (
        <p className="dash-rsvpcode-meta">
          Zuletzt geändert: {new Date(updatedAt).toLocaleDateString('de-DE')}
        </p>
      )}

      {/* --- Einmalige Klartext-Anzeige ------------------------------------ */}
      {justSaved && (
        <div className="dash-rsvpcode-reveal" role="status">
          <p className="dash-rsvpcode-reveal-label">Euer Einladungscode</p>
          <p className="dash-rsvpcode-reveal-code">{justSaved}</p>
          <div className="dash-rsvpcode-reveal-actions">
            <button type="button" className="dash-btn-out" onClick={copy}>
              {copied ? 'Kopiert' : 'Kopieren'}
            </button>
            <span aria-live="polite" className="dash-rsvpcode-copied">
              {copied ? 'In die Zwischenablage kopiert.' : ''}
            </span>
          </div>
          <p className="dash-rsvpcode-warn">
            Bitte speichert oder kopiert euren Einladungscode jetzt. Aus Sicherheitsgründen
            können wir ihn später nicht erneut anzeigen.
          </p>
        </div>
      )}

      {/* --- Eingabe -------------------------------------------------------- */}
      {editing ? (
        <div className="dash-rsvpcode-form">
          <div className="dash-form-field">
            <label className="dash-form-label" htmlFor="rsvp-invite-code">
              Einladungscode
            </label>
            <input
              id="rsvp-invite-code"
              className="dash-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  save();
                }
              }}
              placeholder="z. B. SOMMER2027"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-describedby="rsvp-invite-hint"
            />
            <p className="dash-form-hint" id="rsvp-invite-hint">
              Mindestens 4 Zeichen. Buchstaben, Zahlen und Bindestrich. Groß- und
              Kleinschreibung spielt für eure Gäste keine Rolle.
            </p>
          </div>

          <div className="dash-rsvpcode-actions">
            <button type="button" className="dash-btn" onClick={save} disabled={pending}>
              {pending ? 'Wird gespeichert …' : hasCode ? 'Neuen Code speichern' : 'Code speichern'}
            </button>
            <button
              type="button"
              className="dash-btn-out"
              onClick={() => setInput(generateCode())}
              disabled={pending}
            >
              Code vorschlagen
            </button>
            {hasCode && (
              <button
                type="button"
                className="dash-btn-link"
                onClick={() => {
                  setEditing(false);
                  setInput('');
                  setFeedback(null);
                }}
              >
                Abbrechen
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="dash-rsvpcode-form">
          <p className="dash-rsvpcode-stored">
            Euer Einladungscode ist geschützt gespeichert und wird nicht noch einmal
            angezeigt. Wenn ihr ihn nicht mehr wisst, vergebt einfach einen neuen.
          </p>
          <div className="dash-rsvpcode-actions">
            <button
              type="button"
              className="dash-btn-out"
              onClick={() => {
                setEditing(true);
                setJustSaved(null);
                setFeedback(null);
              }}
            >
              Code ändern
            </button>
          </div>
        </div>
      )}

      {/* --- Schalter ------------------------------------------------------- */}
      <div className="dash-rsvpcode-toggle">
        <label className="dash-rsvpcode-switch">
          <input
            type="checkbox"
            role="switch"
            checked={enabled}
            disabled={pending || !hasCode}
            onChange={(e) => toggle(e.target.checked)}
          />
          <span>Gäste brauchen den Einladungscode</span>
        </label>

        {state === 'none' && (
          <p className="dash-form-hint">
            Richtet zuerst einen Einladungscode ein — dann könnt ihr den Schutz einschalten.
          </p>
        )}
        {state === 'off' && (
          <p className="dash-form-hint">
            Ein Einladungscode ist eingerichtet. Wenn ihr den Schutz wieder einschaltet, gilt
            derselbe Code erneut.
          </p>
        )}
        {state === 'on' && (
          <p className="dash-form-hint">
            Ohne Code kann derzeit niemand über eure Website zu- oder absagen. Alle anderen
            Bereiche eurer Seite bleiben frei sichtbar.
          </p>
        )}
      </div>

      {feedback && (
        <p
          className={feedback.kind === 'ok' ? 'dash-rsvpcode-ok' : 'dash-rsvpcode-error'}
          role={feedback.kind === 'error' ? 'alert' : 'status'}
        >
          {feedback.text}
        </p>
      )}
    </section>
  );
}
