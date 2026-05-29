'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setBereichVariant } from '../actions';
import type { BereichKey } from '@/types/supabase';

/**
 * VariantPicker — drei Karten (A/B/C), wählt die Variante des aktuellen
 * Bereichs. Detail-UI zur Schnellauswahl im "Bereiche & Reihenfolge"-Tab.
 *
 * Beschreibungen sind generisch — pro Bereich-Key später spezifischer
 * machen, sobald die Bereich-Editoren stehen.
 */

interface Props {
  slug: string;
  bereichKey: BereichKey;
  initial: 'a' | 'b' | 'c';
}

const VARIANT_DESCRIPTIONS: Record<string, Record<'a' | 'b' | 'c', { name: string; desc: string }>> = {
  hero: {
    a: { name: 'Klassisch', desc: 'Vollbild-Foto mit Overlay-Text.' },
    b: { name: 'Split', desc: 'Foto links, Text rechts.' },
    c: { name: 'Minimal', desc: 'Nur Text auf farbigem Grund.' },
  },
  lovestory: {
    a: { name: 'Klassisch', desc: 'Erzähltext, zentriert.' },
    b: { name: 'Mit Bildern', desc: 'Text mit Foto-Akzenten.' },
    c: { name: 'Zeitleiste', desc: 'Stationen mit Daten.' },
  },
  witnesses: {
    a: { name: 'Foto-Karten', desc: 'Rundes Porträt pro Person.' },
    b: { name: 'Zeilen-Liste', desc: 'Kompakt, klein.' },
    c: { name: 'Editorial', desc: 'Großes Polaroid + Vorstellung.' },
  },
  // Fallback für andere Bereiche
  _default: {
    a: { name: 'Variante A', desc: 'Standard-Ausführung.' },
    b: { name: 'Variante B', desc: 'Alternative Darstellung.' },
    c: { name: 'Variante C', desc: 'Erweiterte Darstellung.' },
  },
};

export default function VariantPicker({ slug, bereichKey, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState<'a' | 'b' | 'c'>(initial);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const labels = VARIANT_DESCRIPTIONS[bereichKey] ?? VARIANT_DESCRIPTIONS._default;

  const select = (v: 'a' | 'b' | 'c') => {
    if (v === active || pending) return;
    const previous = active;
    setActive(v);
    startTransition(async () => {
      const res = await setBereichVariant({ slug, bereich_key: bereichKey, variant: v });
      if (res.ok) {
        setMsg({ type: 'ok', text: `Variante ${v.toUpperCase()} aktiviert.` });
        window.dispatchEvent(new Event('dashboard:editor-saved'));
        router.refresh();
        setTimeout(() => setMsg(null), 2000);
      } else {
        setActive(previous);
        setMsg({ type: 'err', text: res.error || 'Konnte nicht gewechselt werden.' });
      }
    });
  };

  return (
    <div className="dash-variant-picker">
      <div className="dash-variant-picker-head">
        <h3 className="dash-variant-picker-title">Variante</h3>
        <p className="dash-variant-picker-desc">
          Drei Darstellungs-Varianten für diesen Bereich. Eure Inhalte bleiben erhalten — nur die
          Optik ändert sich.
        </p>
      </div>
      <div className="dash-variant-picker-grid">
        {(['a', 'b', 'c'] as const).map((v) => (
          <button
            key={v}
            type="button"
            className={`dash-variant-picker-card ${active === v ? 'is-active' : ''}`}
            onClick={() => select(v)}
            disabled={pending}
          >
            <span className="dash-variant-picker-letter">{v.toUpperCase()}</span>
            <span className="dash-variant-picker-name">{labels[v].name}</span>
            <span className="dash-variant-picker-meta">{labels[v].desc}</span>
          </button>
        ))}
      </div>
      {msg && (
        <div className={`dash-form-msg ${msg.type === 'ok' ? 'is-ok' : 'is-err'}`}>{msg.text}</div>
      )}
    </div>
  );
}
