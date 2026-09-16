import { toPng } from 'html-to-image';
import type { StyleId } from '@/lib/style-migration';
import {
  PAGE_ORDER,
  bereichLabel,
  type BereichKey,
  type ComponentVariant,
} from '@/lib/wedding-config';

/**
 * Export-Schicht für /allelements.
 *
 * TECHNIK — und warum
 * Aufgenommen wird der bereits gerenderte DOM im iframe, nicht eine zweite
 * Darstellung. html-to-image serialisiert genau die Knoten, die der Browser
 * schon gelayoutet hat (inklusive Media Queries der iframe-Breite, echter
 * Webfonts und der Produktionsklassen) und zeichnet sie über ein
 * SVG-foreignObject in ein Canvas.
 *
 * Bewusst KEIN Headless-Chromium auf dem Server: das wären ~50 MB Chromium
 * plus Puppeteer im Funktions-Bundle, Kaltstarts und Laufzeitgrenzen auf dem
 * Hobby-Plan — für eine interne Review-Route unverhältnismäßig. html-to-image
 * ist eine Abhängigkeit von rund 500 KB, die nur auf dieser Route geladen wird.
 *
 * GRENZEN, die daraus folgen (siehe Bericht):
 *   - backdrop-filter und einzelne Blend-Modi rendern im foreignObject nicht
 *     immer identisch zum Bildschirm
 *   - fremde Bilder brauchen CORS-Header; Pexels liefert sie, eigene Quellen
 *     müssen es ebenfalls tun
 *   - sehr lange Seiten stoßen an die Canvas-Grenze des Browsers (~16k px)
 */

/* ------------------------------------------------------------------ Snapshot */

export interface ExportSnapshot {
  exportedAt: string;
  style: StyleId;
  viewport: number;
  mode: 'full-page' | 'components' | 'component';
  component?: BereichKey;
  variant?: ComponentVariant;
  /** Dieselben Keys wie WeddingPageConfiguration — keine Parallelstruktur. */
  configuration: Record<BereichKey, ComponentVariant>;
  /** Die Review-URL, aus der genau dieser Zustand wieder entsteht. */
  url: string;
}

export function buildSnapshot(args: {
  style: StyleId;
  viewportPx: number;
  mode: ExportSnapshot['mode'];
  variants: Record<BereichKey, ComponentVariant>;
  url: string;
  component?: BereichKey;
  variant?: ComponentVariant;
}): ExportSnapshot {
  return {
    exportedAt: new Date().toISOString(),
    style: args.style,
    viewport: args.viewportPx,
    mode: args.mode,
    ...(args.component ? { component: args.component } : {}),
    ...(args.variant ? { variant: args.variant } : {}),
    configuration: args.variants,
    url: args.url,
  };
}

/* ------------------------------------------------------------------ Dateinamen */

export function fileBase(parts: (string | undefined)[]): string {
  return ['sarahiver', ...parts.filter(Boolean)]
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Kurzes, stabiles Kürzel einer freien Variantenkombination. */
export function configSuffix(
  variants: Record<BereichKey, ComponentVariant>,
  preset: ComponentVariant | null,
): string {
  if (preset) return `preset-${preset}`;
  const compact = PAGE_ORDER.map((k) => variants[k]).join('');
  let hash = 0;
  for (let i = 0; i < compact.length; i += 1) {
    hash = (hash * 31 + compact.charCodeAt(i)) >>> 0;
  }
  return `custom-${hash.toString(36)}`;
}

/* ------------------------------------------------------------------ Download */

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ------------------------------------------------------------------ Aufnahme */

/**
 * Animationen in einen reproduzierbaren Zustand bringen.
 *
 * Erst alle Animationen entfernen (das setzt sie zurück), dann im nächsten
 * Frame wieder zulassen und sofort anhalten — so steht jede Aufnahme bei
 * Frame 0 statt bei einem zufälligen Zwischenbild. Übergänge werden komplett
 * abgeschaltet.
 */
export async function freezeAnimations(doc: Document): Promise<() => void> {
  const reset = doc.createElement('style');
  reset.textContent = '*,*::before,*::after{animation:none !important}';
  doc.head.appendChild(reset);

  await new Promise((r) => requestAnimationFrame(() => r(null)));

  const pause = doc.createElement('style');
  pause.textContent =
    '*,*::before,*::after{animation-play-state:paused !important;transition:none !important}';
  doc.head.appendChild(pause);
  reset.remove();

  await new Promise((r) => requestAnimationFrame(() => r(null)));

  return () => {
    pause.remove();
    reset.remove();
  };
}

/** Wartet, bis die Bilder im Knoten geladen sind (oder die Frist abläuft). */
export async function waitForImages(node: HTMLElement, timeoutMs = 8000): Promise<string[]> {
  const imgs = Array.from(node.querySelectorAll('img'));
  const failed: string[] = [];

  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            if (img.naturalWidth === 0) failed.push(img.currentSrc || img.src);
            resolve();
            return;
          }
          const done = (ok: boolean) => {
            if (!ok) failed.push(img.currentSrc || img.src);
            resolve();
          };
          img.addEventListener('load', () => done(true), { once: true });
          img.addEventListener('error', () => done(false), { once: true });
          setTimeout(() => done(img.naturalWidth > 0), timeoutMs);
        }),
    ),
  );

  return failed;
}

export interface CaptureResult {
  dataUrl: string;
  width: number;
  height: number;
  /** Tatsächlich verwendete Auflösung (kann gedeckelt worden sein). */
  pixelRatio: number;
  /** Falsch, wenn die Webfonts nicht eingebettet werden konnten. */
  fontsEmbedded: boolean;
  /** Bilder, die nicht geladen werden konnten — bewusst nicht ersetzt. */
  failedImages: string[];
}

/**
 * Browser brechen bei Canvas-Kanten über ~16.384 px ab — eine Full-Page-
 * Aufnahme in doppelter Auflösung läuft dort schnell hinein (15 Bereiche
 * ergeben leicht 12.000 px Höhe). Deshalb die Auflösung deckeln statt den
 * Export scheitern zu lassen.
 */
const MAX_CANVAS_EDGE = 15800;

export function safePixelRatio(width: number, height: number, wanted: number): number {
  const limit = Math.min(MAX_CANVAS_EDGE / Math.max(1, width), MAX_CANVAS_EDGE / Math.max(1, height));
  // Der Faktor MUSS unter 1 fallen dürfen: eine mobile Full-Page-Ansicht wird
  // schnell 20.000 px hoch. Deckelt man erst bei 1, überschreitet das Canvas
  // die Browsergrenze und das Bild kommt gestaucht zurück statt verkleinert.
  return Math.max(0.25, Math.min(wanted, limit));
}

/**
 * Nimmt einen Knoten auf. pixelRatio 2, damit Typografie, Haarlinien und
 * Icons beurteilbar bleiben.
 */
export async function captureNode(
  node: HTMLElement,
  opts: { pixelRatio?: number; background?: string } = {},
): Promise<CaptureResult> {
  const failedImages = await waitForImages(node);
  const failedSet = new Set(failedImages);

  const width = node.scrollWidth;
  const height = node.scrollHeight;
  const pixelRatio = safePixelRatio(width, height, opts.pixelRatio ?? 2);

  const shared = {
    pixelRatio,
    backgroundColor: opts.background,
    width,
    height,
    cacheBust: false,
    /**
     * Zwei Dinge fliegen raus: die Review-Beschriftungen (die gehören nicht
     * ins Artefakt) und Bilder, die schon im Browser nicht geladen haben.
     * Letzteres ist bewusst kein Ersatzbild — ein nicht erreichbares Bild
     * soll im Export als Lücke sichtbar bleiben und in der Konsole stehen,
     * statt den ganzen Export scheitern zu lassen.
     */
    filter: (el: HTMLElement) => {
      if (!(el instanceof Element)) return true;
      if (
        el.classList?.contains('ae-variant-bar') ||
        el.classList?.contains('ae-block-title') ||
        el.classList?.contains('ae-export-one')
      ) {
        return false;
      }
      if (el instanceof HTMLImageElement) {
        const src = el.currentSrc || el.src;
        if (failedSet.has(src)) return false;
      }
      return true;
    },
  };

  let fontsEmbedded = true;
  let dataUrl: string;
  try {
    dataUrl = await toPng(node, shared);
  } catch (err) {
    // Häufigster Grund: die Webfont-Stylesheets lassen sich nicht einbetten
    // (CORS). Lieber ein Bild mit Ersatzschrift plus deutlicher Ansage als
    // gar kein Export.
    console.warn('[allelements] Aufnahme mit eingebetteten Schriften fehlgeschlagen:', err);
    fontsEmbedded = false;
    dataUrl = await toPng(node, { ...shared, skipFonts: true });
  }

  return { dataUrl, width, height, pixelRatio, fontsEmbedded, failedImages };
}

/* ------------------------------------------------------- Contact Sheet bauen */

export interface SheetTile {
  key: BereichKey;
  variant: ComponentVariant;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Setzt die 45 Einzelaufnahmen zu einem Übersichtsbogen zusammen:
 * Zeile = Bereich, Spalte = Variante. Beschriftung wird hier gezeichnet und
 * stammt nicht aus der Review-Oberfläche.
 */
export async function composeContactSheet(
  tiles: SheetTile[],
  meta: { style: StyleId; viewportLabel: string },
  options: { tileWidth?: number; maxTileHeight?: number } = {},
): Promise<string> {
  const TW = options.tileWidth ?? 520;
  const MAXH = options.maxTileHeight ?? 620;
  const LABEL_W = 190;
  const GAP = 18;
  const PAD = 40;
  const HEAD = 130;
  const COL_HEAD = 34;

  const byKey = new Map<BereichKey, SheetTile[]>();
  for (const t of tiles) {
    const list = byKey.get(t.key) ?? [];
    list.push(t);
    byKey.set(t.key, list);
  }

  const images = await Promise.all(
    tiles.map(
      (t) =>
        new Promise<{ t: SheetTile; img: HTMLImageElement }>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ t, img });
          img.onerror = () => reject(new Error(`Tile ${t.key}-${t.variant} nicht lesbar`));
          img.src = t.dataUrl;
        }),
    ),
  );
  const imgMap = new Map(images.map(({ t, img }) => [`${t.key}-${t.variant}`, img]));

  // Zeilenhöhen: jede Zeile so hoch wie ihre höchste Kachel (gedeckelt).
  const rows = PAGE_ORDER.filter((k) => byKey.has(k));
  const rowHeights = rows.map((k) => {
    const hs = (byKey.get(k) ?? []).map((t) => {
      const scale = TW / t.width;
      return Math.min(MAXH, Math.round(t.height * scale));
    });
    return Math.max(120, ...hs);
  });

  const canvasW = PAD * 2 + LABEL_W + 3 * TW + 2 * GAP;
  const canvasH =
    PAD * 2 + HEAD + COL_HEAD + rowHeights.reduce((a, b) => a + b + GAP, 0);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas nicht verfügbar');

  ctx.fillStyle = '#15120F';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Kopf
  ctx.fillStyle = '#EDE7DE';
  ctx.font = '600 30px Inter, system-ui, sans-serif';
  ctx.fillText('SARAHIVER DESIGN REVIEW', PAD, PAD + 34);
  ctx.fillStyle = '#9A9088';
  ctx.font = '400 19px Inter, system-ui, sans-serif';
  ctx.fillText(
    `${meta.style} · ${meta.viewportLabel} · 15 Bereiche × A/B/C`,
    PAD,
    PAD + 66,
  );
  ctx.fillText(new Date().toLocaleString('de-DE'), PAD, PAD + 94);

  // Spaltenköpfe
  const colX = (i: number) => PAD + LABEL_W + i * (TW + GAP);
  ctx.fillStyle = '#EDE7DE';
  ctx.font = '600 20px Inter, system-ui, sans-serif';
  (['A', 'B', 'C'] as const).forEach((letter, i) => {
    ctx.fillText(letter, colX(i), PAD + HEAD + 20);
  });

  let y = PAD + HEAD + COL_HEAD;

  rows.forEach((key, r) => {
    const rowH = rowHeights[r];

    ctx.fillStyle = '#EDE7DE';
    ctx.font = '600 20px Inter, system-ui, sans-serif';
    ctx.fillText(bereichLabel(key), PAD, y + 24);
    ctx.fillStyle = '#7E756D';
    ctx.font = '400 14px Inter, system-ui, sans-serif';
    ctx.fillText(key, PAD, y + 46);

    (['a', 'b', 'c'] as ComponentVariant[]).forEach((variant, i) => {
      const img = imgMap.get(`${key}-${variant}`);
      const x = colX(i);

      ctx.fillStyle = '#211C18';
      ctx.fillRect(x, y, TW, rowH);

      if (img) {
        const scale = TW / img.width;
        const drawH = Math.min(rowH, Math.round(img.height * scale));
        // Oben ausrichten und unten beschneiden: der Seitenanfang ist das,
        // was verglichen wird.
        ctx.drawImage(img, 0, 0, img.width, Math.round(drawH / scale), x, y, TW, drawH);
      } else {
        ctx.fillStyle = '#5A514A';
        ctx.font = '400 15px Inter, system-ui, sans-serif';
        ctx.fillText('Aufnahme fehlgeschlagen', x + 16, y + 30);
      }

      ctx.strokeStyle = '#3A322C';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, TW - 1, rowH - 1);
    });

    y += rowH + GAP;
  });

  return canvas.toDataURL('image/png');
}
