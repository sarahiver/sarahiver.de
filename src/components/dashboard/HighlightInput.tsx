'use client';

import { useState, useEffect, useRef } from 'react';
import { splitHighlight, mergeHighlight } from '@/lib/highlight-helper';

/**
 * Eingabe für Titel mit hervorgehobenem Wort.
 *
 * Brautpaare sehen zwei klare Felder statt HTML-Tags:
 *   - "Text" mit Platzhalter [highlight]
 *   - "Highlight-Wort" separat
 *
 * Beim Speichern werden beide zu HTML kombiniert (<em>-Tag).
 * Bestehende HTML-Inhalte werden initial zerlegt — rückwärtskompatibel.
 *
 * Live-Vorschau: Direkt unter den beiden Feldern wird gezeigt, wie der
 * Titel später aussieht — das Highlight-Wort wird kursiv/italic dargestellt.
 *
 * Props:
 *   - value: Der gespeicherte HTML-String (kommt aus content)
 *   - onChange: Callback mit neuem HTML-String
 *   - label: Hauptlabel (z.B. "Titel")
 *   - placeholder: Platzhalter im Text-Feld
 */

interface Props {
  value: string;
  onChange: (newHtml: string) => void;
  label?: string;
  placeholder?: string;
}

export default function HighlightInput({
  value,
  onChange,
  label = 'Titel',
  placeholder = 'Ein Donnerstagabend, [highlight].',
}: Props) {
  // Initial-Zustand: HTML aufsplitten
  const initial = useRef(splitHighlight(value || ''));
  const [plain, setPlain] = useState(initial.current.plain);
  const [highlight, setHighlight] = useState(initial.current.highlight);

  // Wenn value von außen ändert (z.B. nach Save router.refresh), sync'en
  const lastValueRef = useRef(value);
  useEffect(() => {
    if (value !== lastValueRef.current) {
      const split = splitHighlight(value || '');
      // Nur updaten wenn unsere lokale Ableitung nicht eh schon passt —
      // sonst überschreiben wir gerade getipte Eingaben.
      const ourCurrentHtml = mergeHighlight(plain, highlight);
      if (ourCurrentHtml !== value) {
        setPlain(split.plain);
        setHighlight(split.highlight);
      }
      lastValueRef.current = value;
    }
  }, [value, plain, highlight]);

  // Bei jeder Änderung das HTML zusammenbauen und propagieren
  const propagate = (nextPlain: string, nextHighlight: string) => {
    const html = mergeHighlight(nextPlain, nextHighlight);
    lastValueRef.current = html; // Sync-Loop vermeiden
    onChange(html);
  };

  const handlePlain = (val: string) => {
    setPlain(val);
    propagate(val, highlight);
  };

  const handleHighlight = (val: string) => {
    setHighlight(val);
    propagate(plain, val);
  };

  const insertPlaceholder = () => {
    // Platzhalter ans Ende anhängen (mit Leerzeichen falls Text da)
    const next = plain.trim()
      ? `${plain.trimEnd()} [highlight]`
      : '[highlight]';
    setPlain(next);
    propagate(next, highlight);
  };

  const hasPlaceholder = plain.includes('[highlight]');

  // Live-Vorschau (HTML mit em-Tag rendern)
  const previewHtml = mergeHighlight(plain, highlight);

  return (
    <div className="dash-form-field">
      <label className="dash-form-label">{label}</label>

      <div className="dash-highlight-input">
        <input
          type="text"
          className="dash-input"
          value={plain}
          onChange={(e) => handlePlain(e.target.value)}
          placeholder={placeholder}
        />

        <div className="dash-highlight-row">
          <input
            type="text"
            className="dash-input"
            value={highlight}
            onChange={(e) => handleHighlight(e.target.value)}
            placeholder={hasPlaceholder ? 'Hervorgehobenes Wort' : 'Platzhalter fehlt'}
            disabled={!hasPlaceholder}
            aria-label="Hervorgehobenes Wort"
          />

          {!hasPlaceholder && (
            <button
              type="button"
              className="dash-btn-link"
              onClick={insertPlaceholder}
              title="Platzhalter ans Ende einfügen"
            >
              + Platzhalter
            </button>
          )}
        </div>
      </div>

      <p className="dash-form-hint">
        Schreibt euren Titel und platziert <code>[highlight]</code> dort, wo das hervorgehobene
        Wort erscheinen soll. Das hervorgehobene Wort erscheint in eurer Schreibschrift.
      </p>

      {/* Live-Vorschau */}
      {previewHtml && (
        <div className="dash-highlight-preview">
          <span className="dash-highlight-preview-label">Vorschau:</span>
          <span
            className="dash-highlight-preview-text"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      )}
    </div>
  );
}
