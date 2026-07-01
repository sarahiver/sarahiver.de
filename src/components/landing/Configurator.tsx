'use client';

import React, { useMemo, useState } from 'react';
import {
  STANDARD_BEREICHE,
  ZUSATZ_BEREICHE,
  priceForZusatzCount,
} from '@/lib/bereiche-katalog';
import {
  PALETTES,
  FONTS,
  PREVIEW_ORDER,
  previewSection,
  type Variant,
} from './landing-data';

const DESIGNS: [string, string][] = [
  ['editorial', 'Editorial'],
  ['organic', 'Organic'],
  ['opulent', 'Opulent'],
  ['mono', 'Mono'],
  ['bauhaus', 'Bauhaus'],
];

function tierLabel(count: number): string {
  if (count === 0) return 'Standard';
  if (count <= 3) return '+3 Bereiche';
  if (count <= 6) return '+6 Bereiche';
  if (count <= 9) return '+9 Bereiche';
  return 'Alle Bereiche';
}

const STANDARD_KEYS = STANDARD_BEREICHE.map((b) => b.key);
const ADDON_KEYS = ZUSATZ_BEREICHE.map((b) => b.key);
const LABEL: Record<string, string> = Object.fromEntries(
  [...STANDARD_BEREICHE, ...ZUSATZ_BEREICHE].map((b) => [b.key, b.name]),
);

export default function Configurator() {
  const [design, setDesign] = useState('editorial');
  const [palette, setPalette] = useState('rose');
  const [font, setFont] = useState('classic');
  const [sel, setSel] = useState<Record<string, boolean>>({
    hero: true, countdown: true, lovestory: true, rsvp: true,
    timeline: true, gallery: true, gifts: true,
  });
  const [vr, setVr] = useState<Record<string, Variant>>({});
  const [mview, setMview] = useState<'edit' | 'view'>('edit');
  const [modal, setModal] = useState(false);

  const variantOf = (k: string): Variant => vr[k] ?? 'a';
  const activeKeys = useMemo(
    () => PREVIEW_ORDER.filter((k) => sel[k]),
    [sel],
  );
  const addonCount = ADDON_KEYS.filter((k) => sel[k]).length;
  const price = priceForZusatzCount(addonCount);
  const tier = tierLabel(addonCount);

  const toggle = (k: string) =>
    setSel((p) => ({ ...p, [k]: !p[k] }));
  const setVariant = (k: string, v: Variant) =>
    setVr((p) => ({ ...p, [k]: v }));

  const pal = PALETTES[palette];
  const f = FONTS[font];
  const siteStyle = {
    '--bg': pal.bg, '--bgs': pal.bgs, '--ink': pal.ink,
    '--ac': pal.ac, '--acd': pal.acd, '--mu': pal.mu,
    '--fd': f.fd, '--fb': f.fb,
  } as unknown as React.CSSProperties;

  const compNames = activeKeys.map((k) => LABEL[k]).join(', ');

  return (
    <>
      <div className="wrap">
        <div className="lp3-mtabs" role="tablist" aria-label="Ansicht wechseln">
          <button role="tab" aria-selected={mview === 'edit'} className={mview === 'edit' ? 'on' : ''} onClick={() => setMview('edit')}>Anpassen</button>
          <button role="tab" aria-selected={mview === 'view'} className={mview === 'view' ? 'on' : ''} onClick={() => setMview('view')}>Vorschau</button>
        </div>
      </div>

      <div className="wrap lp3-studio" data-mview={mview}>
        {/* Steuerung */}
        <aside className="lp3-panel" aria-label="Konfigurator">
          <div className="lp3-grp">
            <div className="lab"><label>Komponenten</label><span className="hint">wählen</span></div>
            <p className="lp3-csub">Immer enthalten</p>
            <div className="lp3-clist">
              {STANDARD_BEREICHE.map((b) => (
                <div key={b.key} className="lp3-citem on lock">
                  <span className="lp3-box">✓</span>{b.name}<span className="lk">inklusive</span>
                </div>
              ))}
            </div>
            <p className="lp3-csub" style={{ marginTop: 10 }}>Zusatz-Bereiche</p>
            <div className="lp3-clist">
              {ZUSATZ_BEREICHE.map((b) => (
                <button key={b.key} type="button" className={`lp3-citem${sel[b.key] ? ' on' : ''}`} onClick={() => toggle(b.key)} aria-pressed={!!sel[b.key]}>
                  <span className="lp3-box">{sel[b.key] ? '✓' : ''}</span>{b.name}
                </button>
              ))}
            </div>
          </div>

          <div className="lp3-grp">
            <div className="lab"><label>Grunddesign</label><span className="hint">Stil</span></div>
            <div className="lp3-chips">
              {DESIGNS.map(([v, l]) => (
                <button key={v} type="button" className={`lp3-chip${design === v ? ' on' : ''}`} onClick={() => setDesign(v)}>{l}</button>
              ))}
            </div>
          </div>

          <div className="lp3-grp">
            <div className="lab"><label>Schrift</label></div>
            <div className="lp3-chips">
              {Object.entries(FONTS).map(([k, fp]) => (
                <button key={k} type="button" className={`lp3-chip${font === k ? ' on' : ''}`} onClick={() => setFont(k)}>{fp.label}</button>
              ))}
            </div>
          </div>

          <div className="lp3-grp">
            <div className="lab"><label>Farben</label></div>
            <div className="lp3-sw">
              {Object.entries(PALETTES).map(([k, p]) => (
                <button key={k} type="button" title={p.n} aria-label={p.n}
                  className={`lp3-swatch${palette === k ? ' on' : ''}`}
                  style={{ background: `linear-gradient(135deg,${p.bg} 50%,${p.ac} 50%)` }}
                  onClick={() => setPalette(k)} />
              ))}
            </div>
          </div>

          <div className="lp3-grp">
            <div className="lab"><label>Varianten je Komponente</label><span className="hint">3 je Section</span></div>
            <div>
              {activeKeys.map((k) => (
                <div key={k} className="lp3-vrow">
                  <span className="vn">{LABEL[k]}</span>
                  <span className="lp3-vseg">
                    {(['a', 'b', 'c'] as Variant[]).map((v) => (
                      <button key={v} type="button" className={`lp3-vb${variantOf(k) === v ? ' on' : ''}`} onClick={() => setVariant(k, v)}>{v.toUpperCase()}</button>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lp3-grp">
            <div className="lp3-pricebar">
              <div className="amt">{price}<span> €/Mon.</span></div>
              <div className="tier">{tier}</div>
            </div>
            <button type="button" className="cta gold" onClick={() => setModal(true)}>Genau so übernehmen →</button>
          </div>
        </aside>

        {/* Vorschau */}
        <div className="lp3-pv">
          <div className="lp3-browser">
            <div className="lp3-bbar">
              <span className="lp3-dot r" /><span className="lp3-dot y" /><span className="lp3-dot g" />
              <span className="lp3-url">sarahiver.de/sarah-und-iver</span>
            </div>
            <div className="lp3-viewport">
              <div className="lp-site" data-style={design} style={siteStyle}>
                {activeKeys.map((k) => (
                  <React.Fragment key={k}>{previewSection(k, variantOf(k))}</React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* mobile sticky Preis + CTA */}
      <div className="lp3-mobar">
        <div>
          <div className="amt">{price}<span> €/Mon.</span></div>
          <div className="tier">{tier}</div>
        </div>
        <button type="button" className="cta gold" onClick={() => setModal(true)}>Übernehmen</button>
      </div>

      {/* Checkout-Modal */}
      {modal && (
        <div className="lp3-ovl" role="dialog" aria-modal="true" aria-label="Auswahl übernehmen" onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }}>
          <div className="lp3-modal">
            <button type="button" className="lp3-mclose" aria-label="Schließen" onClick={() => setModal(false)}>✕</button>
            <h3>Eure Auswahl, direkt startklar</h3>
            <p className="sub">Genau diese Konfiguration richten wir in eurem Konto ein — ihr setzt nur noch Inhalte ein.</p>
            <div className="lp3-sumry">
              <div className="lp3-srow"><span className="k">Grunddesign</span><span className="v">{DESIGNS.find((d) => d[0] === design)?.[1]}</span></div>
              <div className="lp3-srow"><span className="k">Schrift</span><span className="v">{f.label}</span></div>
              <div className="lp3-srow"><span className="k">Farbe</span><span className="v">{pal.n}</span></div>
              <div className="lp3-srow"><span className="k">Komponenten</span><span className="v">{compNames}</span></div>
              <div className="lp3-srow tot"><span className="k">{tier}</span><span className="v">{price} €/Monat</span></div>
            </div>
            <div className="lp3-flowmini"><b>1.</b>&nbsp;Anmelden → <b>2.</b>&nbsp;Dashboard-Link per Mail → <b>3.</b>&nbsp;designen → <b>4.</b>&nbsp;Infos rein → <b>5.</b>&nbsp;live</div>
            <input className="lp3-minput" type="email" placeholder="Eure E-Mail-Adresse" aria-label="E-Mail-Adresse" />
            <button type="button" className="cta gold">Konto anlegen &amp; loslegen</button>
            <p className="lp3-mnote cc">14 Tage gratis · <b>keine Kreditkarte</b> · Erinnerung vor Ablauf · jederzeit kündbar</p>
          </div>
        </div>
      )}
    </>
  );
}
