'use client';

import React, { useMemo, useState } from 'react';
import { STANDARD_BEREICHE, ZUSATZ_BEREICHE, priceForZusatzCount, BEREICHE } from '@/lib/bereiche-katalog';
import { DnaProvider } from '@/lib/dna-context';
import { BereichRenderer } from '@/components/layout/BereichRenderer';
import type { Variant, WeddingBereich } from '@/types/supabase';
import {
  buildCssVars, demoTokens, dnaFromTokens, DEMO_CONTENT,
  FALLBACK_STYLES, FALLBACK_PALETTES, FALLBACK_FONTS, type PresetBundle,
} from './preview-tokens';

/** Katalog-Keys -> Renderer-/DB-Keys (funnel-Normalisierung). */
const KEYMAP: Record<string, string> = { accomm: 'accommodations', music: 'musicwishes', abc: 'weddingabc' };
const renderKey = (k: string) => KEYMAP[k] ?? k;

const ORDER = [
  'hero', 'countdown', 'lovestory', 'timeline', 'directions', 'accomm', 'gallery',
  'photoupload', 'guestbook', 'music', 'witnesses', 'abc', 'gifts', 'faq', 'rsvp',
];
const LABEL: Record<string, string> = Object.fromEntries(BEREICHE.map((b) => [b.key, b.name]));
const ADDON_KEYS = ZUSATZ_BEREICHE.map((b) => b.key);

function tierLabel(n: number): string {
  if (n === 0) return 'Standard';
  if (n <= 3) return '+3 Bereiche';
  if (n <= 6) return '+6 Bereiche';
  if (n <= 9) return '+9 Bereiche';
  return 'Alle Bereiche';
}

interface Props { presets?: PresetBundle }

export default function Configurator({ presets }: Props) {
  const bundle: PresetBundle = useMemo(() => {
    if (presets && presets.styles.length && presets.palettes.length && presets.fonts.length) return presets;
    return { styles: FALLBACK_STYLES, palettes: FALLBACK_PALETTES, fonts: FALLBACK_FONTS };
  }, [presets]);

  const [styleId, setStyleId] = useState(bundle.styles[0]?.id ?? 'editorial');
  const [paletteId, setPaletteId] = useState(bundle.palettes[0]?.id ?? 'rose');
  const [fontId, setFontId] = useState(bundle.fonts[0]?.id ?? 'classic');
  const [sel, setSel] = useState<Record<string, boolean>>({
    hero: true, countdown: true, lovestory: true, rsvp: true, timeline: true, gallery: true, gifts: true,
  });
  const [vr, setVr] = useState<Record<string, Variant>>({});
  const [focus, setFocus] = useState('hero');
  const [showAll, setShowAll] = useState(false);
  const [mview, setMview] = useState<'edit' | 'view'>('edit');
  const [modal, setModal] = useState(false);

  const variantOf = (k: string): Variant => vr[k] ?? 'a';
  const activeKeys = useMemo(() => ORDER.filter((k) => sel[k]), [sel]);
  const addonCount = ADDON_KEYS.filter((k) => sel[k]).length;
  const price = priceForZusatzCount(addonCount);
  const tier = tierLabel(addonCount);

  const tokens = useMemo(() => demoTokens(styleId, paletteId, fontId, bundle), [styleId, paletteId, fontId, bundle]);
  const cssVars = useMemo(() => buildCssVars(tokens), [tokens]);
  const dna = useMemo(() => dnaFromTokens(tokens), [tokens]);

  const focusKey = sel[focus] ? focus : activeKeys[0] ?? 'hero';
  const focusIdx = activeKeys.indexOf(focusKey);

  const toggle = (k: string) => {
    const wasOff = !sel[k];
    setSel((p) => ({ ...p, [k]: !p[k] }));
    if (wasOff) setFocus(k);
    setShowAll(false);
  };
  const focusOn = (k: string) => { setFocus(k); setShowAll(false); };
  const step = (d: number) => {
    if (!activeKeys.length) return;
    const i = (focusIdx + d + activeKeys.length) % activeKeys.length;
    focusOn(activeKeys[i]);
  };

  const renderBereich = (k: string) => {
    const bereich = {
      bereich_key: renderKey(k),
      variant: variantOf(k),
      content: DEMO_CONTENT[renderKey(k)] ?? {},
    } as unknown as WeddingBereich;
    return <BereichRenderer bereich={bereich} tokens={tokens} weddingSlug="demo" />;
  };

  const compNames = activeKeys.map((k) => LABEL[k]).join(', ');
  const paletteName = bundle.palettes.find((p) => p.id === paletteId)?.name ?? '';
  const fontName = bundle.fonts.find((f) => f.id === fontId)?.name ?? '';
  const styleName = bundle.styles.find((s) => s.id === styleId)?.name ?? '';

  return (
    <>
      <div className="wrap">
        <div className="lp3-mtabs" role="tablist" aria-label="Ansicht wechseln">
          <button role="tab" aria-selected={mview === 'edit'} className={mview === 'edit' ? 'on' : ''} onClick={() => setMview('edit')}>Anpassen</button>
          <button role="tab" aria-selected={mview === 'view'} className={mview === 'view' ? 'on' : ''} onClick={() => setMview('view')}>Vorschau</button>
        </div>
      </div>

      <div className="wrap lp3-studio" data-mview={mview}>
        <aside className="lp3-panel" aria-label="Konfigurator">
          <div className="lp3-grp">
            <div className="lab"><label>Komponenten</label><span className="hint">tippen = Vorschau</span></div>
            <p className="lp3-csub">Immer enthalten</p>
            <div className="lp3-clist">
              {STANDARD_BEREICHE.map((b) => (
                <button key={b.key} type="button"
                  className={`lp3-citem on lock${focusKey === b.key ? ' focus' : ''}`}
                  onClick={() => focusOn(b.key)}>
                  <span className="lp3-box">✓</span>{b.name}<span className="lk">inklusive</span>
                </button>
              ))}
            </div>
            <p className="lp3-csub" style={{ marginTop: 10 }}>Zusatz-Bereiche</p>
            <div className="lp3-clist">
              {ZUSATZ_BEREICHE.map((b) => (
                <div key={b.key} className={`lp3-citem${sel[b.key] ? ' on' : ''}${focusKey === b.key ? ' focus' : ''}`}>
                  <button type="button" className="lp3-cbox" aria-pressed={!!sel[b.key]} aria-label={`${b.name} ${sel[b.key] ? 'entfernen' : 'hinzufügen'}`} onClick={() => toggle(b.key)}>
                    <span className="lp3-box">{sel[b.key] ? '✓' : ''}</span>
                  </button>
                  <button type="button" className="lp3-cname" onClick={() => (sel[b.key] ? focusOn(b.key) : toggle(b.key))}>{b.name}</button>
                </div>
              ))}
            </div>
          </div>

          <div className="lp3-grp">
            <div className="lab"><label>Grunddesign</label><span className="hint">{bundle.styles.length} Stile</span></div>
            <div className="lp3-chips">
              {bundle.styles.map((s) => (
                <button key={s.id} type="button" className={`lp3-chip${styleId === s.id ? ' on' : ''}`} onClick={() => setStyleId(s.id)}>{s.name}</button>
              ))}
            </div>
          </div>

          <div className="lp3-grp">
            <div className="lab"><label>Schrift</label></div>
            <div className="lp3-chips">
              {bundle.fonts.map((fp) => (
                <button key={fp.id} type="button" className={`lp3-chip${fontId === fp.id ? ' on' : ''}`} onClick={() => setFontId(fp.id)}>{fp.name}</button>
              ))}
            </div>
          </div>

          <div className="lp3-grp">
            <div className="lab"><label>Farben</label></div>
            <div className="lp3-sw">
              {bundle.palettes.map((p) => (
                <button key={p.id} type="button" title={p.name} aria-label={p.name}
                  className={`lp3-swatch${paletteId === p.id ? ' on' : ''}`}
                  style={{ background: `linear-gradient(135deg,${p.color_bg} 50%,${p.color_accent} 50%)` }}
                  onClick={() => setPaletteId(p.id)} />
              ))}
            </div>
          </div>

          <div className="lp3-grp">
            <div className="lab"><label>Variante · {LABEL[focusKey]}</label><span className="hint">A / B / C</span></div>
            <div className="lp3-vseg lp3-vseg-wide">
              {(['a', 'b', 'c'] as Variant[]).map((v) => (
                <button key={v} type="button" className={`lp3-vb${variantOf(focusKey) === v ? ' on' : ''}`} onClick={() => setVr((p) => ({ ...p, [focusKey]: v }))}>{v.toUpperCase()}</button>
              ))}
            </div>
          </div>

          <div className="lp3-grp">
            <div className="lp3-pricebar">
              <div className="amt">{price}<span> &euro;/Mon.</span></div>
              <div className="tier">{tier}</div>
            </div>
            <button type="button" className="cta gold" onClick={() => setModal(true)}>Genau so &uuml;bernehmen &rarr;</button>
          </div>
        </aside>

        <div className="lp3-pv">
          <div className="lp3-browser">
            <div className="lp3-bbar">
              <span className="lp3-dot r" /><span className="lp3-dot y" /><span className="lp3-dot g" />
              <span className="lp3-url">sarahiver.de/sarah-und-iver</span>
            </div>
            <div className="lp3-focusbar">
              <div className="lp3-focusnav">
                <button type="button" aria-label="Vorheriger Bereich" onClick={() => step(-1)}>&lsaquo;</button>
                <span className="fname">{showAll ? 'Gesamte Seite' : `${LABEL[focusKey]} · ${focusIdx + 1}/${activeKeys.length}`}</span>
                <button type="button" aria-label="N&auml;chster Bereich" onClick={() => step(1)}>&rsaquo;</button>
              </div>
              <button type="button" className={`lp3-allbtn${showAll ? ' on' : ''}`} onClick={() => setShowAll((v) => !v)}>
                {showAll ? 'Einzeln' : 'Gesamte Seite'}
              </button>
            </div>
            <div className="lp3-stage">
              <div className="wedding-site-wrapper" data-style={styleId} style={cssVars}>
                <DnaProvider dna={dna}>
                  {showAll
                    ? activeKeys.map((k) => <React.Fragment key={k}>{renderBereich(k)}</React.Fragment>)
                    : renderBereich(focusKey)}
                </DnaProvider>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lp3-mobar">
        <div><div className="amt">{price}<span> &euro;/Mon.</span></div><div className="tier">{tier}</div></div>
        <button type="button" className="cta gold" onClick={() => setModal(true)}>&Uuml;bernehmen</button>
      </div>

      {modal && (
        <div className="lp3-ovl" role="dialog" aria-modal="true" aria-label="Auswahl &uuml;bernehmen" onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }}>
          <div className="lp3-modal">
            <button type="button" className="lp3-mclose" aria-label="Schlie&szlig;en" onClick={() => setModal(false)}>&times;</button>
            <h3>Eure Auswahl, direkt startklar</h3>
            <p className="sub">Genau diese Konfiguration richten wir in eurem Konto ein &mdash; ihr setzt nur noch Inhalte ein.</p>
            <div className="lp3-sumry">
              <div className="lp3-srow"><span className="k">Grunddesign</span><span className="v">{styleName}</span></div>
              <div className="lp3-srow"><span className="k">Schrift</span><span className="v">{fontName}</span></div>
              <div className="lp3-srow"><span className="k">Farbe</span><span className="v">{paletteName}</span></div>
              <div className="lp3-srow"><span className="k">Komponenten</span><span className="v">{compNames}</span></div>
              <div className="lp3-srow tot"><span className="k">{tier}</span><span className="v">{price} &euro;/Monat</span></div>
            </div>
            <div className="lp3-flowmini"><b>1.</b>&nbsp;Anmelden &rarr; <b>2.</b>&nbsp;Dashboard-Link per Mail &rarr; <b>3.</b>&nbsp;designen &rarr; <b>4.</b>&nbsp;Infos rein &rarr; <b>5.</b>&nbsp;live</div>
            <input className="lp3-minput" type="email" placeholder="Eure E-Mail-Adresse" aria-label="E-Mail-Adresse" />
            <button type="button" className="cta gold">Konto anlegen &amp; loslegen</button>
            <p className="lp3-mnote cc">14 Tage gratis &middot; <b>keine Kreditkarte</b> &middot; Erinnerung vor Ablauf &middot; jederzeit k&uuml;ndbar</p>
          </div>
        </div>
      )}
    </>
  );
}
