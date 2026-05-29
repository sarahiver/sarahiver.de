'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateStil } from './actions';
import AutoPalettePicker from './AutoPalettePicker';
import SaveStatusIndicator, { type SaveStatus } from '@/components/dashboard/SaveStatusIndicator';
import type { StartStylePreset, PalettePreset, FontPreset } from '@/lib/presets';

interface Props {
  slug: string;
  initial: {
    start_style_id: string;
    palette_preset_id: string | null;
    font_preset_id: string | null;
    custom_bg: string | null;
    custom_bg_soft: string | null;
    custom_accent: string | null;
    custom_accent_deep: string | null;
    custom_ink: string | null;
  };
  styles: StartStylePreset[];
  palettes: PalettePreset[];
  fonts: FontPreset[];
}

/**
 * Stil-Tab mit Auto-Save:
 *  - Klick auf Stil/Palette/Font-Karte → speichert sofort
 *  - Tippen in Custom-Farb-Feld → debounced 800ms, dann speichern
 *  - AutoPalette übernehmen → speichert sofort
 *
 * Status-Indikator oben rechts (Saving / Gespeichert / Fehler). Kein
 * "Speichern"-Button mehr.
 */
export default function StilTab({ slug, initial, styles, palettes, fonts }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(
    Boolean(
      initial.custom_bg ||
        initial.custom_bg_soft ||
        initial.custom_accent ||
        initial.custom_accent_deep ||
        initial.custom_ink,
    ),
  );

  const [styleId, setStyleId] = useState(initial.start_style_id);
  const [paletteId, setPaletteId] = useState(initial.palette_preset_id);
  const [fontId, setFontId] = useState(initial.font_preset_id);
  const [customs, setCustoms] = useState({
    bg: initial.custom_bg || '',
    bg_soft: initial.custom_bg_soft || '',
    accent: initial.custom_accent || '',
    accent_deep: initial.custom_accent_deep || '',
    ink: initial.custom_ink || '',
  });

  // Status-Auto-Reset nach "ok"
  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  // Aktuelle Werte als Ref, damit der debounced Save den letzten State nutzt
  const latestRef = useRef({ styleId, paletteId, fontId, customs });
  latestRef.current = { styleId, paletteId, fontId, customs };

  const doSave = useCallback(() => {
    setStatus('saving');
    setErrText(null);
    const { styleId: s, paletteId: p, fontId: f, customs: c } = latestRef.current;
    startTransition(async () => {
      const res = await updateStil({
        slug,
        start_style_id: s,
        palette_preset_id: p,
        font_preset_id: f,
        custom_bg: c.bg || null,
        custom_bg_soft: c.bg_soft || null,
        custom_accent: c.accent || null,
        custom_accent_deep: c.accent_deep || null,
        custom_ink: c.ink || null,
      });
      if (res.ok) {
        setStatus('ok');
        window.dispatchEvent(new Event('dashboard:editor-saved'));
        router.refresh();
      } else {
        setStatus('err');
        setErrText(res.error || 'Konnte nicht gespeichert werden.');
      }
    });
  }, [slug, router]);

  // === SOFORT-SAVE für diskrete Aktionen (Karten) ===
  // Sie setzen State UND triggern unmittelbar einen Save.
  // Damit der State den Save erreicht, nutzen wir flushSync-ähnliches Pattern:
  // Wir warten einen Microtask (Promise.resolve()), dann ist der State im Ref.
  const saveSoon = () => {
    Promise.resolve().then(() => doSave());
  };

  const handleStyleChange = (newStyleId: string) => {
    const s = styles.find((x) => x.id === newStyleId);
    setStyleId(newStyleId);
    if (s) {
      setPaletteId(s.default_palette_id);
      setFontId(s.default_font_id);
      setCustoms({ bg: '', bg_soft: '', accent: '', accent_deep: '', ink: '' });
    }
    saveSoon();
  };

  const handlePaletteChange = (newId: string) => {
    setPaletteId(newId);
    setCustoms({ bg: '', bg_soft: '', accent: '', accent_deep: '', ink: '' });
    saveSoon();
  };

  const handleFontChange = (newId: string) => {
    setFontId(newId);
    saveSoon();
  };

  const handleAutoPaletteApply = (p: {
    bg: string;
    bg_soft: string;
    accent: string;
    accent_deep: string;
    ink: string;
  }) => {
    setCustoms({ ...p });
    saveSoon();
  };

  const resetCustoms = () => {
    setCustoms({ bg: '', bg_soft: '', accent: '', accent_deep: '', ink: '' });
    saveSoon();
  };

  // === DEBOUNCED Save bei Custom-Farb-Änderung ===
  // 800ms nach letzter Eingabe wird gespeichert.
  const debounceRef = useRef<number | null>(null);
  const handleCustomChange = (key: keyof typeof customs, value: string) => {
    setCustoms((curr) => ({ ...curr, [key]: value }));
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      doSave();
    }, 800);
  };

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const isCustomMode =
    Boolean(customs.bg.trim()) ||
    Boolean(customs.bg_soft.trim()) ||
    Boolean(customs.accent.trim()) ||
    Boolean(customs.accent_deep.trim()) ||
    Boolean(customs.ink.trim());

  return (
    <div className="dash-form">
      <SaveStatusIndicator status={status} errText={errText} />

      {/* Stil-Karten */}
      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Stil</h3>
        <p className="dash-form-section-desc">Der Grundcharakter eurer Seite — Typografie, Decor, Rhythmus.</p>
        <div className="dash-style-grid">
          {styles.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`dash-style-card ${styleId === s.id ? 'is-active' : ''}`}
              onClick={() => handleStyleChange(s.id)}
              disabled={status === 'saving'}
            >
              <span className="dash-style-card-name">{s.name}</span>
              <span className="dash-style-card-meta">{s.meta}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Paletten-Karten */}
      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Farbpalette</h3>
        <p className="dash-form-section-desc">
          Eine kuratierte Auswahl — passt zum gewählten Stil, aber frei kombinierbar.
        </p>
        <div className="dash-palette-grid">
          {palettes.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`dash-palette-card ${
                paletteId === p.id && !isCustomMode ? 'is-active' : ''
              }`}
              onClick={() => handlePaletteChange(p.id)}
              disabled={status === 'saving'}
            >
              <span className="dash-palette-swatches">
                <span style={{ background: p.color_bg }} />
                <span style={{ background: p.color_bg_soft }} />
                <span style={{ background: p.color_accent }} />
                <span style={{ background: p.color_accent_deep }} />
                <span style={{ background: p.color_ink }} />
              </span>
              <span className="dash-palette-name">{p.name}</span>
            </button>
          ))}
        </div>

        {isCustomMode && (
          <p className="dash-form-hint" style={{ marginTop: 6 }}>
            <strong>Aktuell aktiv:</strong> eigene Farben. Klickt eine Palette an, um zur
            Standardpalette zurückzukehren.
          </p>
        )}

        <details className="dash-form-details" open={customOpen} onToggle={(e) => setCustomOpen((e.target as HTMLDetailsElement).open)}>
          <summary>Einzelne Farben anpassen</summary>
          <p className="dash-form-hint">
            Alle fünf Farben müssen gesetzt sein, damit die Custom-Palette greift. Änderungen
            werden automatisch gespeichert.
          </p>

          <AutoPalettePicker onApply={handleAutoPaletteApply} />

          <div className="dash-color-grid">
            <ColorField label="Hintergrund" value={customs.bg} onChange={(v) => handleCustomChange('bg', v)} />
            <ColorField label="Hintergrund weich" value={customs.bg_soft} onChange={(v) => handleCustomChange('bg_soft', v)} />
            <ColorField label="Akzent" value={customs.accent} onChange={(v) => handleCustomChange('accent', v)} />
            <ColorField label="Akzent dunkel" value={customs.accent_deep} onChange={(v) => handleCustomChange('accent_deep', v)} />
            <ColorField label="Text" value={customs.ink} onChange={(v) => handleCustomChange('ink', v)} />
          </div>
          <button type="button" className="dash-btn-out" onClick={resetCustoms} style={{ marginTop: 10 }}>
            Custom-Farben zurücksetzen
          </button>
        </details>
      </section>

      {/* Font-Karten */}
      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Schriften</h3>
        <p className="dash-form-section-desc">Wie sich eure Texte anfühlen.</p>
        <div className="dash-font-grid">
          {fonts.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`dash-font-card ${fontId === f.id ? 'is-active' : ''}`}
              onClick={() => handleFontChange(f.id)}
              disabled={status === 'saving'}
            >
              <span
                className="dash-font-preview"
                style={{
                  fontFamily: f.font_display,
                  fontWeight: f.display_weight,
                  fontStyle: f.display_style,
                }}
              >
                Aa
              </span>
              <span className="dash-font-name">{f.name}</span>
              <span className="dash-font-meta">{shortFontLabel(f)}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Color-Picker mit Hex-Textfeld. */
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="dash-color-field">
      <label className="dash-form-label">{label}</label>
      <div className="dash-color-input-row">
        <input
          type="color"
          className="dash-color-input"
          value={value || '#cccccc'}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          className="dash-input dash-color-text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#farbe oder leer"
          maxLength={7}
        />
      </div>
    </div>
  );
}

function shortFontLabel(f: FontPreset): string {
  const display = f.font_display.split(',')[0].trim().replace(/^"|"$/g, '');
  const body = f.font_body.split(',')[0].trim().replace(/^"|"$/g, '');
  return display === body ? display : `${display} + ${body}`;
}
