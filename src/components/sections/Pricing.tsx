'use client';

import { useState, useMemo } from 'react';
import { PRICING, CTA } from '@/lib/content';
import { ADDON_COMPONENTS } from '@/lib/addons';
import {
  BASE_PRICE,
  calculateAddonPrice,
  calculateSavings,
  calculateTotal,
} from '@/lib/pricing';
import Section from '@/components/ui/Section';

/**
 * Pricing-Konfigurator mit Live-Volumen-Rabatt.
 *
 * Logik:
 *  - User checked/unchecked Komponenten
 *  - Live-Update von: Aufpreis, Total, Ersparnis, "Komplett-Upsell"
 *  - Ersparnis-Badge erscheint ab 2+ Komponenten
 *  - Komplett-Upsell-Card erscheint ab 4+ Komponenten
 */
export default function Pricing() {
  // Set mit aktiv gewählten Komponenten-IDs
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(ADDON_COMPONENTS.map((c) => c.id)));
  };

  const count = selected.size;
  const addonPrice = useMemo(() => calculateAddonPrice(count), [count]);
  const savings = useMemo(() => calculateSavings(count), [count]);
  const total = useMemo(() => calculateTotal(count), [count]);

  // Zeige Komplett-Upsell ab 4 Komponenten (außer schon alle gewählt)
  const showCompleteUpsell = count >= 4 && count < ADDON_COMPONENTS.length;
  // Wieviel würde es kosten, alles dazuzunehmen?
  const completeUpsellExtra = calculateAddonPrice(ADDON_COMPONENTS.length) - addonPrice;

  return (
    <Section id="pricing" eyebrow={PRICING.eyebrow} eyebrowNumber="05">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 mb-16 items-end">
        <h2 className="h2-editorial">
          {PRICING.title}{' '}
          <em>{PRICING.titleEmphasis}</em>
        </h2>
        <p className="lede">{PRICING.lede}</p>
      </div>

      {/* Konfigurator Grid: Links Komponenten, Rechts Live-Summary */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12">
        {/* === LINKS: Basis + Add-On Auswahl === */}
        <div className="space-y-6">
          {/* Basis-Paket Card */}
          <div className="border-2 border-ink rounded-2xl p-8 bg-paper-warm">
            <div className="flex items-start justify-between mb-4 gap-4">
              <div>
                <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-sage mb-2">
                  Basis-Paket · immer dabei
                </div>
                <h3
                  className="text-3xl font-light leading-tight text-ink"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Eure Hochzeitswebsite.
                </h3>
              </div>
              <div className="text-right whitespace-nowrap">
                <div
                  className="text-4xl font-light text-ink"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {BASE_PRICE}€
                </div>
                <div className="text-xs text-muted font-mono uppercase tracking-wider">
                  pro Monat
                </div>
              </div>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted mt-6">
              {[
                'Hero & Brautpaar-Vorstellung',
                'Save-the-Date & Countdown',
                'Love Story',
                'RSVP mit Gästeliste',
                'Bis zu 100 Gäste',
                'Subdomain inklusive',
                'Theme-Auswahl',
                'DSGVO-konform',
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-sage" aria-hidden="true" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* Add-On Komponenten */}
          <div>
            <div className="flex items-baseline justify-between mb-5">
              <h3 className="text-xl font-medium text-ink">Zusatz-Komponenten</h3>
              <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted">
                {count} von {ADDON_COMPONENTS.length} gewählt
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ADDON_COMPONENTS.map((addon) => {
                const isSelected = selected.has(addon.id);
                return (
                  <button
                    key={addon.id}
                    onClick={() => toggle(addon.id)}
                    className={`text-left p-5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-ink bg-ink text-paper-warm shadow-lg'
                        : 'border-rule bg-paper-warm text-ink hover:border-ink/50 hover:bg-white'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{addon.name}</span>
                        {addon.recommended && (
                          <span
                            className={`text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-sage-soft text-ink'
                                : 'bg-sage-soft text-sage-deep'
                            }`}
                          >
                            Beliebt
                          </span>
                        )}
                      </div>
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'border-paper-warm bg-paper-warm text-ink'
                            : 'border-rule'
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </span>
                    </div>
                    <p
                      className={`text-xs leading-relaxed ${
                        isSelected ? 'text-paper-warm/80' : 'text-muted'
                      }`}
                    >
                      {addon.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* === RECHTS: Live-Summary (sticky auf Desktop) === */}
        <div className="lg:sticky lg:top-8 self-start">
          <div className="border border-rule-soft rounded-2xl p-8 bg-paper-warm">
            <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted mb-5">
              Eure Konfiguration
            </div>

            {/* Basis */}
            <div className="flex items-baseline justify-between py-3 border-b border-rule-soft">
              <span className="text-sm text-ink">Basis-Paket</span>
              <span
                className="text-lg font-light text-ink"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {BASE_PRICE}€
              </span>
            </div>

            {/* Zusatz */}
            <div className="flex items-baseline justify-between py-3 border-b border-rule-soft">
              <span className="text-sm text-ink">
                {count === 0
                  ? 'Keine Zusatz-Komponenten'
                  : `${count} Zusatz-${count === 1 ? 'Komponente' : 'Komponenten'}`}
              </span>
              <span
                className="text-lg font-light text-ink"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {count === 0 ? '—' : `+${addonPrice}€`}
              </span>
            </div>

            {/* Ersparnis-Badge (ab 2+ Komponenten) */}
            {savings.monthly > 0 && (
              <div
                className="my-4 p-3 rounded-lg text-sm flex items-center justify-between"
                style={{
                  background: 'oklch(0.86 0.025 145 / 0.4)',
                  color: 'oklch(0.36 0.045 145)',
                }}
              >
                <span className="font-medium flex items-center gap-2">
                  <span aria-hidden="true">💚</span>
                  Ihr spart {savings.monthly}€/Monat
                </span>
                <span className="font-mono text-xs">{savings.percentage}%</span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-baseline justify-between py-4 mt-2">
              <span className="text-sm font-medium text-ink uppercase tracking-wider">
                Gesamt
              </span>
              <div className="text-right">
                <div
                  className="text-4xl font-light text-ink"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {total}€
                </div>
                <div className="text-xs text-muted font-mono uppercase tracking-wider">
                  pro Monat
                </div>
              </div>
            </div>

            {/* Yearly-Hinweis */}
            <div className="text-xs text-muted text-right mb-6">
              = {total * 12}€ pro Jahr
              {savings.yearly > 0 && (
                <span className="block text-sage-deep font-medium mt-1">
                  Jährliche Ersparnis: {savings.yearly}€
                </span>
              )}
            </div>

            {/* Komplett-Upsell-Card */}
            {showCompleteUpsell && (
              <div className="my-5 p-4 rounded-xl border border-sage bg-sage-soft/30">
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-sage-deep mb-2">
                  💡 Tipp
                </div>
                <p className="text-sm text-ink leading-relaxed mb-3">
                  Für nur <strong>+{completeUpsellExtra}€/Monat</strong> bekommt ihr alle{' '}
                  {ADDON_COMPONENTS.length} Komponenten.
                </p>
                <button
                  onClick={selectAll}
                  className="text-xs font-medium underline decoration-1 underline-offset-2 text-sage-deep hover:no-underline"
                >
                  Komplett-Paket wählen →
                </button>
              </div>
            )}

            {/* CTA: Waitlist Hint */}
            <div className="border-t border-rule-soft pt-5">
              <p className="text-xs text-muted leading-relaxed mb-4">
                Diese Preise gelten beim Launch in Kürze. Trage dich auf die Warteliste ein und
                sicher dir <strong className="text-ink">20% Rabatt</strong> auf die ersten 3
                Monate.
              </p>
              <a
                href="#cta"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block w-full h-13 px-6 text-sm font-medium tracking-wide rounded-full bg-ink text-paper-warm border border-ink transition-all hover:-translate-y-px hover:shadow-lg flex items-center justify-center gap-2.5"
              >
                {CTA.cta}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
