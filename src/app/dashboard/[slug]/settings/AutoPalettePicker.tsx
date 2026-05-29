'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';

/**
 * Auto-Palette-Picker: User lädt/dropped ein Bild → Browser sampled die
 * dominanten Farben → User klickt "Übernehmen" → Custom-Farben werden gesetzt.
 *
 * Wichtig: Das Bild wird NICHT hochgeladen. Es wird nur lokal im Browser
 * ausgewertet und danach verworfen. Damit:
 *   - keine Cloudinary-Anbindung nötig
 *   - kein DSGVO-Aspekt (Foto verlässt das Gerät nie)
 *   - sofortige Reaktion, keine Wartezeit
 *
 * Algorithmus: Bild wird auf 100x100 herunterskaliert, dann werden die Pixel
 * in Buckets eingeteilt (Color-Quantization). Die häufigsten Cluster werden
 * als dominante Farben zurückgegeben — sortiert nach Helligkeit, damit wir
 * sie sinnvoll auf bg/bg_soft/accent/accent_deep/ink mappen können.
 */

interface ExtractedPalette {
  bg: string;        // hellste
  bg_soft: string;   // zweithellste
  accent: string;    // mittlere, hohe Sättigung
  accent_deep: string; // dunkler Akzent
  ink: string;       // dunkelste
}

interface Props {
  onApply: (palette: ExtractedPalette) => void;
}

export default function AutoPalettePicker({ onApply }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [palette, setPalette] = useState<ExtractedPalette | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErr(null);
    if (!file.type.startsWith('image/')) {
      setErr('Bitte eine Bilddatei wählen (JPG, PNG, WebP …).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErr('Datei zu groß (max 20 MB).');
      return;
    }
    setBusy(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      extractPalette(dataUrl)
        .then((p) => {
          setPalette(p);
          setBusy(false);
        })
        .catch((error) => {
          console.error(error);
          setErr('Konnte das Bild nicht analysieren.');
          setBusy(false);
        });
    };
    reader.onerror = () => {
      setErr('Konnte die Datei nicht lesen.');
      setBusy(false);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setPreview(null);
    setPalette(null);
    setErr(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="dash-auto-palette">
      <div className="dash-auto-palette-head">
        <h4 className="dash-auto-palette-title">Palette aus Foto vorschlagen</h4>
        <p className="dash-auto-palette-desc">
          Zieht ein Foto hier rein (z.B. Brautstrauß, Inspirationsbild). Die dominanten Farben
          werden lokal extrahiert und als Custom-Palette übernommen. Das Bild wird nicht hochgeladen.
        </p>
      </div>

      {!preview ? (
        <div
          className={`dash-auto-palette-drop ${dragOver ? 'is-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
          }}
        >
          <p className="dash-auto-palette-drop-text">
            Foto hier ablegen oder <strong>klicken zum Auswählen</strong>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="dash-auto-palette-result">
          <div className="dash-auto-palette-preview">
            <img src={preview} alt="" />
          </div>
          <div className="dash-auto-palette-info">
            {busy && <p className="dash-auto-palette-busy">Farben werden analysiert …</p>}
            {palette && !busy && (
              <>
                <div className="dash-auto-palette-swatches">
                  <Swatch label="BG" color={palette.bg} />
                  <Swatch label="BG soft" color={palette.bg_soft} />
                  <Swatch label="Accent" color={palette.accent} />
                  <Swatch label="Accent dark" color={palette.accent_deep} />
                  <Swatch label="Ink" color={palette.ink} />
                </div>
                <div className="dash-auto-palette-actions">
                  <button
                    type="button"
                    className="dash-btn"
                    onClick={() => onApply(palette)}
                  >
                    Diese Palette übernehmen
                  </button>
                  <button type="button" className="dash-btn-out" onClick={reset}>
                    Anderes Foto
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {err && <p className="dash-form-msg is-err" style={{ marginTop: 8 }}>{err}</p>}
    </div>
  );
}

function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <div className="dash-auto-swatch">
      <span className="dash-auto-swatch-color" style={{ background: color }} />
      <span className="dash-auto-swatch-label">{label}</span>
      <span className="dash-auto-swatch-hex">{color}</span>
    </div>
  );
}

// ====================================================================
// Color extraction algorithm
// ====================================================================

async function extractPalette(dataUrl: string): Promise<ExtractedPalette> {
  const img = await loadImage(dataUrl);

  // Klein-skaliertes Canvas — Performance + Generalisierung über Cluster
  const SIZE = 100;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas-Kontext nicht verfügbar');
  ctx.drawImage(img, 0, 0, SIZE, SIZE);
  const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

  // Color-Quantization: jeden Kanal auf 6 Buckets pro Achse (= 216 buckets total)
  // Jeder Bucket sammelt seine Mittelwerte. Buckets nach Häufigkeit sortieren.
  const BUCKETS = 6;
  const BUCKET_SIZE = 256 / BUCKETS;
  const map = new Map<number, { r: number; g: number; b: number; n: number }>();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 200) continue; // transparente Pixel ignorieren

    const br = Math.floor(r / BUCKET_SIZE);
    const bg = Math.floor(g / BUCKET_SIZE);
    const bb = Math.floor(b / BUCKET_SIZE);
    const key = br * BUCKETS * BUCKETS + bg * BUCKETS + bb;

    const entry = map.get(key);
    if (entry) {
      entry.r += r;
      entry.g += g;
      entry.b += b;
      entry.n += 1;
    } else {
      map.set(key, { r, g, b, n: 1 });
    }
  }

  // Mittelwerte pro Bucket berechnen, nach Häufigkeit sortieren
  const clusters = Array.from(map.values())
    .map((c) => ({
      r: Math.round(c.r / c.n),
      g: Math.round(c.g / c.n),
      b: Math.round(c.b / c.n),
      n: c.n,
    }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 12); // Top 12 Cluster

  // Mapping auf bg / bg_soft / accent / accent_deep / ink
  // Strategie:
  //   - bg     = hellster Cluster (höchste Luminanz)
  //   - ink    = dunkelster Cluster (niedrigste Luminanz)
  //   - accent = mittlerer Cluster mit höchster Sättigung
  //   - bg_soft = zweithellster
  //   - accent_deep = mittlerer dunkler Cluster
  const byLum = [...clusters].sort((a, b) => luminance(b) - luminance(a));
  const bg = byLum[0];
  const bg_soft = byLum[1] ?? bg;
  const ink = byLum[byLum.length - 1];

  // Akzent: höchste Sättigung unter den mittleren Helligkeits-Clustern
  const middleByLum = byLum.slice(2, byLum.length - 1);
  const bySat = [...middleByLum].sort((a, b) => saturation(b) - saturation(a));
  const accent = bySat[0] ?? clusters[0];

  // Accent-Deep: dunklere Variante des Akzents (oder ein dunklerer mittlerer Cluster)
  const darkerCandidates = clusters.filter(
    (c) => luminance(c) < luminance(accent) && luminance(c) > luminance(ink),
  );
  const accent_deep = darkerCandidates[0] ?? darken(accent);

  return {
    bg: toHex(bg),
    bg_soft: toHex(bg_soft),
    accent: toHex(accent),
    accent_deep: toHex(accent_deep),
    ink: toHex(ink),
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'));
    img.src = src;
  });
}

function luminance(c: { r: number; g: number; b: number }): number {
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

function saturation(c: { r: number; g: number; b: number }): number {
  const max = Math.max(c.r, c.g, c.b);
  const min = Math.min(c.r, c.g, c.b);
  return max === 0 ? 0 : (max - min) / max;
}

function darken(c: { r: number; g: number; b: number }) {
  return {
    r: Math.round(c.r * 0.6),
    g: Math.round(c.g * 0.6),
    b: Math.round(c.b * 0.6),
  };
}

function toHex(c: { r: number; g: number; b: number }): string {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}
