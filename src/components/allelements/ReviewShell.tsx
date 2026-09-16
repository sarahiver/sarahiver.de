'use client';

import { useMemo, useState } from 'react';
import type { StyleId } from '@/lib/style-migration';
import {
  bereichLabel,
  variantsToParam,
  type BereichKey,
  type ComponentVariant,
} from '@/lib/wedding-config';
import type { ContentLoad } from '@/lib/allelements-data';

/**
 * Steuerung der Review-Umgebung.
 *
 * Der gesamte Zustand steht in der Adresszeile der Vorschau-URL — ein Fund
 * ist damit als Link teilbar ("Opulent, Gallery C, Mobil"). Die Oberfläche
 * selbst lädt dabei nicht neu; nur der iframe bekommt eine neue src.
 */

interface Props {
  view: 'components' | 'full';
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
  const [view, setView] = useState(props.view);
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

  return (
    <div className="ae">
      <header className="ae-bar">
        <div className="ae-bar-row">
          <span className="ae-brand">Design Review</span>

          <div className="ae-group" role="group" aria-label="Ansicht">
            {(['components', 'full'] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={`ae-btn${view === v ? ' is-on' : ''}`}
                onClick={() => setView(v)}
              >
                {v === 'components' ? 'Components' : 'Full Page'}
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
          ) : (
            <p className="ae-hint">
              Preset {(preset ?? 'a').toUpperCase()}: alle 15 Bereiche in Variante{' '}
              {(preset ?? 'a').toUpperCase()}. Für einzelne Bereiche auf Custom wechseln.
            </p>
          )}
        </nav>

        <div className={`ae-frame-wrap${viewport === 'mobile' ? ' is-mobile' : ''}`}>
          <iframe
            id="ae-frame"
            key={src}
            className="ae-frame"
            src={src}
            title="Vorschau"
            style={{ width: frameWidth }}
          />
        </div>
      </div>
    </div>
  );
}
