'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateStil } from './actions';
import AutoPalettePicker from './AutoPalettePicker';
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
 * Stil-Tab — Karten-Auswahl für Stil, Palette und Font, plus aufklappbarer
 * Custom-Override-Bereich für Brautpaare, die einzelne Farben anpassen wollen.
 *
 * Verhalten beim Stilwechsel: setzt automatisch default_palette_id und
 * default_font_id aus dem gewählten Stil — kann der User danach aber wieder
 * frei ändern. So fühlt sich der Stilwechsel "passend" an statt zufällig.
 */
export default function StilTab({ slug, initial, styles, palettes, fonts }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
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

  const handleStyleChange = (newStyleId: string) => {
    setStyleId(newStyleId);
    // Sinnvolle Defaults bei Stilwechsel mitsetzen (User kann überschreiben)
    const s = styles.find((s) => s.id === newStyleId);
    if (s) {
      setPaletteId(s.default_palette_id);
      setFontId(s.default_font_id);
    }
  };

  // Modus-Erkennung: wenn irgendein Custom-Feld einen Hex-Wert hat, sind wir
  // im Custom-Mode → die Palette-Karten sind nicht "aktiv".
  const isCustomMode =
    Boolean(customs.bg.trim()) ||
    Boolean(customs.bg_soft.trim()) ||
    Boolean(customs.accent.trim()) ||
    Boolean(customs.accent_deep.trim()) ||
    Boolean(customs.ink.trim());

  const dirty =
    styleId !== initial.start_style_id ||
    paletteId !== initial.palette_preset_id ||
    fontId !== initial.font_preset_id ||
    customs.bg !== (initial.custom_bg || '') ||
    customs.bg_soft !== (initial.custom_bg_soft || '') ||
    customs.accent !== (initial.custom_accent || '') ||
    customs.accent_deep !== (initial.custom_accent_deep || '') ||
    customs.ink !== (initial.custom_ink || '');

  const save = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await updateStil({
        slug,
        start_style_id: styleId,
        palette_preset_id: paletteId,
        font_preset_id: fontId,
        custom_bg: customs.bg || null,
        custom_bg_soft: customs.bg_soft || null,
        custom_accent: customs.accent || null,
        custom_accent_deep: customs.accent_deep || null,
        custom_ink: customs.ink || null,
      });
      if (res.ok) {
        setMsg({ type: 'ok', text: 'Stil gespeichert.' });
        window.dispatchEvent(new Event('dashboard:editor-saved'));
        router.refresh();
      } else {
        setMsg({ type: 'err', text: res.error || 'Konnte nicht gespeichert werden.' });
      }
    });
  };

  const resetCustoms = () => {
    setCustoms({ bg: '', bg_soft: '', accent: '', accent_deep: '', ink: '' });
  };

  return (
    <div className="dash-form">
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
              disabled={pending}
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
              onClick={() => {
                setPaletteId(p.id);
                // Klick auf Palette = "ich will doch die Preset-Palette":
                // Customs leeren, damit der Constraint sauber ist
                setCustoms({ bg: '', bg_soft: '', accent: '', accent_deep: '', ink: '' });
              }}
              disabled={pending}
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
            Alle fünf Farben müssen gesetzt sein, damit die Custom-Palette greift. Lasst die
            Felder leer, um die ausgewählte Palette zu nutzen.
          </p>

          <AutoPalettePicker
            onApply={(p) => {
              setCustoms({
                bg: p.bg,
                bg_soft: p.bg_soft,
                accent: p.accent,
                accent_deep: p.accent_deep,
                ink: p.ink,
              });
            }}
          />

          <div className="dash-color-grid">
            <ColorField label="Hintergrund" value={customs.bg} onChange={(v) => setCustoms({ ...customs, bg: v })} />
            <ColorField label="Hintergrund weich" value={customs.bg_soft} onChange={(v) => setCustoms({ ...customs, bg_soft: v })} />
            <ColorField label="Akzent" value={customs.accent} onChange={(v) => setCustoms({ ...customs, accent: v })} />
            <ColorField label="Akzent dunkel" value={customs.accent_deep} onChange={(v) => setCustoms({ ...customs, accent_deep: v })} />
            <ColorField label="Text" value={customs.ink} onChange={(v) => setCustoms({ ...customs, ink: v })} />
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
              onClick={() => setFontId(f.id)}
              disabled={pending}
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

      {msg && (
        <div className={`dash-form-msg ${msg.type === 'ok' ? 'is-ok' : 'is-err'}`}>{msg.text}</div>
      )}

      <div className="dash-form-foot">
        <button type="button" className="dash-btn" onClick={save} disabled={!dirty || pending}>
          {pending ? 'Wird gespeichert …' : dirty ? 'Stil speichern' : 'Gespeichert'}
        </button>
      </div>
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
