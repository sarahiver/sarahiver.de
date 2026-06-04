'use client';

import { useState, useMemo } from 'react';
import { CONFIG } from '@/lib/content';
import { STANDARD_BEREICHE, ZUSATZ_BEREICHE, priceForZusatzCount } from '@/lib/bereiche-katalog';

export default function Konfigurator() {
  const [activeZusatz, setActiveZusatz] = useState<Set<string>>(new Set());
  const [customDomain, setCustomDomain] = useState(false);

  const count = activeZusatz.size;
  const basePrice = priceForZusatzCount(count);
  const totalMonthly = basePrice + (customDomain ? 5 : 0);
  const setupFee = customDomain ? 39 : 0;

  const toggle = (key: string) => {
    setActiveZusatz((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Tier-Anzeige: zeige welche Stufe gerade aktiv ist
  const tierLabel = useMemo(() => {
    if (count === 0) return 'Standard';
    if (count <= 3) return '+3 Bereiche';
    if (count <= 6) return '+6 Bereiche';
    if (count <= 9) return '+9 Bereiche';
    return 'Alle 15 Bereiche';
  }, [count]);

  return (
    <section id="config" className="section rule-top">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">{CONFIG.eyebrow}</span>
            <h2 className="display-large">
              {CONFIG.h_pre} <em>{CONFIG.h_em}</em>{CONFIG.h_post}
            </h2>
          </div>
          <div>
            <p className="lede">{CONFIG.lede}</p>
          </div>
        </div>

        <div className="config">
          {/* === LINKS: Bereich-Auswahl === */}
          <div className="config__left">
            <div className="config__label">Immer dabei (Standard)</div>
            <div className="config__bereiche">
              {STANDARD_BEREICHE.map((b) => (
                <div key={b.key} className="config-pill is-standard">
                  <span>{b.name}</span>
                  <span className="config-pill__lock">FIX</span>
                </div>
              ))}
            </div>

            <div className="config__label" style={{ marginTop: 24 }}>
              Zusatz-Bereiche — frei wählbar
            </div>
            <div className="config__bereiche">
              {ZUSATZ_BEREICHE.map((b) => {
                const active = activeZusatz.has(b.key);
                return (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => toggle(b.key)}
                    className={`config-pill${active ? ' is-active' : ''}`}
                    aria-pressed={active}
                  >
                    <span>{b.name}</span>
                    <span className="config-pill__lock">{active ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* === RECHTS: Live-Preis === */}
          <div className="config__right">
            <div className="config__count">
              <strong>{count}</strong> / 11 Zusatz-Bereiche · <strong>{tierLabel}</strong>
            </div>
            <div className="config__sums">
              <span className="config__price">{totalMonthly}€</span>
              <span className="config__price-unit">pro Monat</span>
            </div>

            <div className="config__addon">
              <div className="config__addon-info">
                <span className="config__addon-label">Eigene Domain</span>
                <span className="config__addon-desc">39 € einmalig · 5 €/Monat</span>
              </div>
              <button
                type="button"
                className={`config__addon-toggle${customDomain ? ' is-on' : ''}`}
                onClick={() => setCustomDomain((s) => !s)}
                aria-pressed={customDomain}
                aria-label="Eigene Domain"
              />
            </div>

            {customDomain && (
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--land-muted)', letterSpacing: '0.04em' }}>
                + 39 € einmalige Einrichtung im ersten Monat
              </div>
            )}

            <div className="config__cta">
              <a href="/signup">
                <span>{CONFIG.cta}</span>
                <span>{CONFIG.ctaSub}</span>
              </a>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--land-muted)', marginTop: 14 }}>
                {CONFIG.legalLine}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
