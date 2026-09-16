'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { StyleId } from '@/lib/style-migration';
import {
  bereichLabel,
  variantsToParam,
  type BereichKey,
  type ComponentVariant,
} from '@/lib/wedding-config';
import type { ContentLoad } from '@/lib/allelements-data';
import {
  buildSnapshot,
  captureNode,
  composeContactSheet,
  configSuffix,
  downloadDataUrl,
  downloadJson,
  fileBase,
  freezeAnimations,
  type SheetTile,
} from '@/lib/allelements-export';

/**
 * Steuerung der Review-Umgebung.
 *
 * Der gesamte Zustand steht in der Adresszeile der Vorschau-URL — ein Fund
 * ist damit als Link teilbar ("Opulent, Gallery C, Mobil"). Die Oberfläche
 * selbst lädt dabei nicht neu; nur der iframe bekommt eine neue src.
 */

type View = 'components' | 'full' | 'compare';

/** Breite, mit der die Vergleichsspalten intern rendern. */
const COMPARE_WIDTH = 1440;

interface Props {
  view: View;
  style: StyleId;
  styles: StyleId[];
  viewport: 'desktop' | 'mobile';
  preset: ComponentVariant | null;
  variants: Record<BereichKey, ComponentVariant>;
  load: ContentLoad;
  order: BereichKey[];
  presetsLoaded: boolean;
  orderMatchesFunnel: boolean;
}

const LOADS: ContentLoad[] = ['kurz', 'mittel', 'lang'];

export default function ReviewShell(props: Props) {
  const [view, setView] = useState<View>(props.view);
  const [syncScroll, setSyncScroll] = useState(true);
  const compareRefs = useRef<(HTMLIFrameElement | null)[]>([null, null, null]);
  const compareCol = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  // Höhe der Vergleichsspalten. Wird im Effekt gemessen — beim Serverrendern
  // gibt es kein window.
  const [portH, setPortH] = useState(760);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const mainFrame = useRef<HTMLIFrameElement | null>(null);
  const [style, setStyle] = useState<StyleId>(props.style);
  const [viewport, setViewport] = useState(props.viewport);
  const [load, setLoad] = useState<ContentLoad>(props.load);
  const [preset, setPreset] = useState<ComponentVariant | null>(props.preset ?? 'a');
  const [variants, setVariants] = useState(props.variants);
  const [customOpen, setCustomOpen] = useState(props.preset === null);

  const src = useMemo(() => {
    const q = new URLSearchParams({ embed: '1', view, style, load });
    if (view === 'full') {
      if (customOpen) q.set('variants', variantsToParam(variants));
      else q.set('config', preset ?? 'a');
    }
    return `/allelements?${q.toString()}`;
  }, [view, style, load, preset, variants, customOpen]);

  const frameWidth = viewport === 'mobile' ? 390 : '100%';

  /** URLs der drei Vergleichsspalten — immer Full Page, Preset A/B/C. */
  const compareSrcs = useMemo(
    () =>
      (['a', 'b', 'c'] as ComponentVariant[]).map(
        (v) =>
          `/allelements?${new URLSearchParams({
            embed: '1',
            view: 'full',
            style,
            load,
            config: v,
          }).toString()}`,
      ),
    [style, load],
  );

  /**
   * Die Spalten rendern intern mit 1440px und werden per transform skaliert.
   * Würde man den iframe einfach auf Drittelbreite setzen, sähe man drei
   * Tablet-Layouts nebeneinander und nicht drei Desktop-Kompositionen.
   * Auf Mobil entfällt das: 390px passen dreimal nebeneinander.
   */
  useEffect(() => {
    if (view !== 'compare') return;
    const el = compareCol.current;
    if (!el) return;

    const measure = () => {
      setPortH(Math.max(400, window.innerHeight - 190));
      if (viewport === 'mobile') {
        setScale(1);
        return;
      }
      const w = el.getBoundingClientRect().width;
      setScale(w > 0 ? w / COMPARE_WIDTH : 1);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [view, viewport]);

  /** Gleichlauf beim Scrollen — sonst vergleicht man Äpfel mit Seite 3. */
  const attachSync = useCallback(
    (index: number) => () => {
      const frame = compareRefs.current[index];
      const win = frame?.contentWindow;
      if (!win) return;

      let busy = false;
      win.addEventListener(
        'scroll',
        () => {
          if (!syncScroll || busy) return;
          busy = true;
          const top = win.scrollY;
          compareRefs.current.forEach((other, i) => {
            if (i === index) return;
            other?.contentWindow?.scrollTo({ top });
          });
          window.requestAnimationFrame(() => {
            busy = false;
          });
        },
        { passive: true },
      );
    },
    [syncScroll],
  );

  /* ----------------------------------------------------------------- Export
     Aufgenommen wird der DOM im iframe — also exakt das, was oben sichtbar
     ist. Die Review-Beschriftungen filtert captureNode heraus, die
     Steuerleiste liegt ohnehin außerhalb des iframes. */

  const viewportPx = viewport === 'mobile' ? 390 : 1440;
  const viewportLabel = viewport === 'mobile' ? 'Mobile 390px' : 'Desktop 1440px';

  const frameDoc = useCallback((): Document | null => {
    const doc = mainFrame.current?.contentDocument ?? null;
    if (!doc) setStatus('Vorschau noch nicht geladen.');
    return doc;
  }, []);

  const report = useCallback(
    (msg: string, failed: string[] = [], fontsEmbedded = true) => {
      const notes: string[] = [];
      if (failed.length) {
        console.warn('[allelements] Bilder nicht geladen:', failed);
        notes.push(`${failed.length} Bild(er) fehlten`);
      }
      if (!fontsEmbedded) notes.push('Schriften nicht eingebettet');
      setStatus(notes.length ? `${msg} — ${notes.join(', ')}, siehe Konsole.` : msg);
    },
    [],
  );

  const exportFullPage = useCallback(async () => {
    const doc = frameDoc();
    if (!doc) return;
    setBusy('Seite wird aufgenommen …');
    const unfreeze = await freezeAnimations(doc);
    try {
      const node = doc.querySelector('.wedding-site-wrapper') as HTMLElement | null;
      if (!node) throw new Error('Kein Seiten-Wrapper gefunden');

      const shot = await captureNode(node, { pixelRatio: 2 });
      const suffix = configSuffix(variants, customOpen ? null : preset);
      const base = fileBase([style, viewport, 'full-page', suffix]);

      downloadDataUrl(shot.dataUrl, `${base}.png`);
      downloadJson(
        buildSnapshot({
          style,
          viewportPx,
          mode: 'full-page',
          variants,
          url: `${window.location.origin}${src}`,
        }),
        `${base}.json`,
      );
      report(
        `Export erstellt — ${shot.width}×${shot.height} px bei ${shot.pixelRatio}×.`,
        shot.failedImages,
        shot.fontsEmbedded,
      );
    } catch (err) {
      console.error('[allelements] Full-Page-Export:', err);
      setStatus(`Export fehlgeschlagen: ${(err as Error)?.message ?? String(err)}`);
    } finally {
      unfreeze();
      setBusy(null);
    }
  }, [frameDoc, report, style, variants, customOpen, preset, viewport, viewportPx, src]);

  const exportSingle = useCallback(
    async (key: BereichKey, variant: ComponentVariant) => {
      const doc = frameDoc();
      if (!doc) return;
      setBusy(`${bereichLabel(key)} ${variant.toUpperCase()} wird aufgenommen …`);
      const unfreeze = await freezeAnimations(doc);
      try {
        const node = doc.querySelector(
          `#c-${key}-${variant} .wedding-site-wrapper`,
        ) as HTMLElement | null;
        if (!node) throw new Error(`Vorschau ${key} ${variant} nicht gefunden`);

        const shot = await captureNode(node, { pixelRatio: 2 });
        const base = fileBase([style, key, variant, viewport]);
        downloadDataUrl(shot.dataUrl, `${base}.png`);
        downloadJson(
          buildSnapshot({
            style,
            viewportPx,
            mode: 'component',
            variants,
            component: key,
            variant,
            url: `${window.location.origin}${src}`,
          }),
          `${base}.json`,
        );
        report(
          `${bereichLabel(key)} ${variant.toUpperCase()} exportiert.`,
          shot.failedImages,
          shot.fontsEmbedded,
        );
      } catch (err) {
        console.error('[allelements] Component-Export:', err);
        setStatus(`Export fehlgeschlagen: ${(err as Error)?.message ?? String(err)}`);
      } finally {
        unfreeze();
        setBusy(null);
      }
    },
    [frameDoc, report, style, variants, viewport, viewportPx, src],
  );

  const exportContactSheet = useCallback(async () => {
    const doc = frameDoc();
    if (!doc) return;
    const unfreeze = await freezeAnimations(doc);
    const tiles: SheetTile[] = [];
    const allFailed: string[] = [];
    let fontsOk = true;
    try {
      let done = 0;
      for (const key of props.order) {
        for (const variant of ['a', 'b', 'c'] as ComponentVariant[]) {
          done += 1;
          setBusy(`Aufnahme ${done} von ${props.order.length * 3}: ${bereichLabel(key)} ${variant.toUpperCase()}`);
          const node = doc.querySelector(
            `#c-${key}-${variant} .wedding-site-wrapper`,
          ) as HTMLElement | null;
          if (!node) continue;
          // Einfache Auflösung genügt: der Bogen ist zum Vergleichen da,
          // nicht zum Prüfen einzelner Haarlinien.
          const shot = await captureNode(node, { pixelRatio: 1 });
          allFailed.push(...shot.failedImages);
          if (!shot.fontsEmbedded) fontsOk = false;
          tiles.push({ key, variant, dataUrl: shot.dataUrl, width: shot.width, height: shot.height });
        }
      }

      setBusy('Bogen wird gesetzt …');
      const sheet = await composeContactSheet(tiles, { style, viewportLabel });
      const base = fileBase([style, viewport, 'components']);
      downloadDataUrl(sheet, `${base}.png`);
      downloadJson(
        buildSnapshot({ style, viewportPx, mode: 'components', variants, url: `${window.location.origin}${src}` }),
        `${base}.json`,
      );
      report(`Contact Sheet erstellt — ${tiles.length} Aufnahmen.`, [...new Set(allFailed)], fontsOk);
    } catch (err) {
      console.error('[allelements] Contact Sheet:', err);
      setStatus(`Export fehlgeschlagen: ${(err as Error)?.message ?? String(err)}`);
    } finally {
      unfreeze();
      setBusy(null);
    }
  }, [frameDoc, report, props.order, style, viewport, viewportLabel, viewportPx, variants, src]);

  /** Klicks auf die Export-Knöpfe in den Variantenleisten abfangen. */
  const attachSingleExport = useCallback(() => {
    const doc = mainFrame.current?.contentDocument;
    if (!doc) return;
    doc.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement)?.closest?.('.ae-export-one') as HTMLElement | null;
      if (!btn) return;
      const key = btn.dataset.exportKey as BereichKey | undefined;
      const variant = btn.dataset.exportVariant as ComponentVariant | undefined;
      if (key && variant) void exportSingle(key, variant);
    });
  }, [exportSingle]);

  return (
    <div className="ae">
      <header className="ae-bar">
        <div className="ae-bar-row">
          <span className="ae-brand">Design Review</span>

          <div className="ae-group" role="group" aria-label="Ansicht">
            {(['components', 'full', 'compare'] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                className={`ae-btn${view === v ? ' is-on' : ''}`}
                onClick={() => setView(v)}
              >
                {v === 'components' ? 'Components' : v === 'full' ? 'Full Page' : 'A/B/C nebeneinander'}
              </button>
            ))}
          </div>

          <div className="ae-group" role="group" aria-label="Viewport">
            {(['desktop', 'mobile'] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={`ae-btn${viewport === v ? ' is-on' : ''}`}
                onClick={() => setViewport(v)}
              >
                {v === 'desktop' ? 'Desktop' : 'Mobile 390'}
              </button>
            ))}
          </div>

          <div className="ae-group" role="group" aria-label="Inhaltslänge">
            {LOADS.map((l) => (
              <button
                key={l}
                type="button"
                className={`ae-btn${load === l ? ' is-on' : ''}`}
                onClick={() => setLoad(l)}
                title="Namen, Ort und Texte in drei Längen"
              >
                {l}
              </button>
            ))}
          </div>

          <div className="ae-group ae-group--export">
            {view === 'components' && (
              <button
                type="button"
                className="ae-btn ae-btn--export"
                onClick={exportContactSheet}
                disabled={busy !== null}
              >
                Export Contact Sheet
              </button>
            )}
            {view === 'full' && (
              <button
                type="button"
                className="ae-btn ae-btn--export"
                onClick={exportFullPage}
                disabled={busy !== null}
              >
                Export Full Page
              </button>
            )}
          </div>

          <a className="ae-open" href={src} target="_blank" rel="noreferrer">
            In neuem Tab ↗
          </a>
        </div>

        <div className="ae-bar-row">
          <div className="ae-group ae-group--wrap" role="group" aria-label="Design">
            {props.styles.map((s) => (
              <button
                key={s}
                type="button"
                className={`ae-btn${style === s ? ' is-on' : ''}`}
                onClick={() => setStyle(s)}
              >
                {s}
              </button>
            ))}
          </div>

          {view === 'full' && (
            <div className="ae-group" role="group" aria-label="Konfiguration">
              {(['a', 'b', 'c'] as ComponentVariant[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`ae-btn${!customOpen && preset === v ? ' is-on' : ''}`}
                  onClick={() => {
                    setPreset(v);
                    setCustomOpen(false);
                  }}
                >
                  Preset {v.toUpperCase()}
                </button>
              ))}
              <button
                type="button"
                className={`ae-btn${customOpen ? ' is-on' : ''}`}
                onClick={() => setCustomOpen(true)}
              >
                Custom
              </button>
            </div>
          )}
        </div>

        {(busy || status) && (
          <p className={`ae-status${busy ? ' is-busy' : ''}`} role="status">
            {busy ?? `✓ ${status}`}
          </p>
        )}
        {!props.presetsLoaded && (
          <p className="ae-warn">
            Presets nicht geladen — Farben und Schriften sind Platzhalter. Struktur und Layout
            stimmen, die Farbwirkung nicht.
          </p>
        )}
        {!props.orderMatchesFunnel && (
          <p className="ae-warn">
            Achtung: die Bereichsliste weicht von lib/funnel.ts ab.
          </p>
        )}
      </header>

      <div className="ae-body">
        <nav className="ae-side" aria-label="Bereiche">
          {view === 'components' ? (
            <ul className="ae-jump">
              {props.order.map((k) => (
                <li key={k}>
                  <button
                    type="button"
                    onClick={() => {
                      const frame = document.getElementById('ae-frame') as HTMLIFrameElement | null;
                      frame?.contentWindow?.document
                        .getElementById(`c-${k}`)
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {bereichLabel(k)}
                  </button>
                </li>
              ))}
            </ul>
          ) : customOpen ? (
            <ul className="ae-custom">
              {props.order.map((k) => (
                <li key={k}>
                  <span>{bereichLabel(k)}</span>
                  <div className="ae-mini">
                    {(['a', 'b', 'c'] as ComponentVariant[]).map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={`ae-btn ae-btn--mini${variants[k] === v ? ' is-on' : ''}`}
                        onClick={() => setVariants((prev) => ({ ...prev, [k]: v }))}
                      >
                        {v.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : view === 'compare' ? (
            <div className="ae-hint">
              <p>
                Drei komplette Seiten in {style}: links alle Bereiche in Variante A, in der
                Mitte B, rechts C.
              </p>
              <label className="ae-check">
                <input
                  type="checkbox"
                  checked={syncScroll}
                  onChange={(e) => setSyncScroll(e.target.checked)}
                />
                Gleichlauf beim Scrollen
              </label>
              {viewport === 'desktop' && (
                <p className="ae-hint-fine">
                  Jede Spalte rendert intern mit {COMPARE_WIDTH}px und wird auf{' '}
                  {Math.round(scale * 100)}% verkleinert — die Kompositionen bleiben also
                  Desktop-Kompositionen.
                </p>
              )}
            </div>
          ) : (
            <p className="ae-hint">
              Preset {(preset ?? 'a').toUpperCase()}: alle 15 Bereiche in Variante{' '}
              {(preset ?? 'a').toUpperCase()}. Für einzelne Bereiche auf Custom wechseln.
            </p>
          )}
        </nav>

        {view === 'compare' ? (
          <div className={`ae-compare${viewport === 'mobile' ? ' is-mobile' : ''}`}>
            {compareSrcs.map((cs, i) => (
              <div className="ae-compare-col" key={cs} ref={i === 0 ? compareCol : undefined}>
                <div className="ae-compare-head">Preset {'ABC'[i]}</div>
                <div
                  className="ae-compare-port"
                  style={{ height: portH }}
                >
                  <iframe
                    key={cs}
                    ref={(el) => {
                      compareRefs.current[i] = el;
                    }}
                    className="ae-compare-frame"
                    src={cs}
                    title={`Preset ${'ABC'[i]}`}
                    onLoad={attachSync(i)}
                    style={
                      viewport === 'desktop'
                        ? {
                            width: COMPARE_WIDTH,
                            height: Math.round(portH / (scale || 1)),
                            transform: `scale(${scale})`,
                            transformOrigin: 'top left',
                          }
                        : { width: 390, height: portH }
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`ae-frame-wrap${viewport === 'mobile' ? ' is-mobile' : ''}`}>
            <iframe
              id="ae-frame"
              key={src}
              ref={mainFrame}
              className="ae-frame"
              src={src}
              title="Vorschau"
              onLoad={attachSingleExport}
              style={{ width: frameWidth }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
