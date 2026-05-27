'use client';

import { useState, useMemo } from 'react';
import { PRICING } from '@/lib/content';
import { ZUSATZ_BEREICHE, BASIS_BEREICHE } from '@/lib/bereiche';
import {
  BASE_PRICE,
  calculateAddonPrice,
  calculateSavings,
  calculateTotal,
  calculateLifetimeCost,
  MIN_TERM_MONTHS,
} from '@/lib/pricing';
import Section from '@/components/ui/Section';
import WaitlistForm from '@/components/ui/WaitlistForm';

/**
 * Pricing v4 — Reviewer-Fixes umgesetzt:
 * 1. Laufzeit-Erklärung als prominenter Info-Block (oben)
 * 2. Streichpreis-Logik: ohne Rabatt vs. mit Rabatt nebeneinander
 * 3. Gesamtkosten-Anzeige (über 12 Monate) für Klarheit
 * 4. "8+ Bereiche = Komplettpaket" Cap deutlicher kommuniziert
 */
export default function Pricing() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(ZUSATZ_BEREICHE.map((b) => b.key)));

  const count = selected.size;
  const addonPrice = useMemo(() => calculateAddonPrice(count), [count]);
  const addonWithoutDiscount = useMemo(() => count * 4, [count]);
  const savings = useMemo(() => calculateSavings(count), [count]);
  const total = useMemo(() => calculateTotal(count), [count]);
  const lifetimeCost = useMemo(() => calculateLifetimeCost(count), [count]);

  const showCompleteUpsell = count >= 5 && count < ZUSATZ_BEREICHE.length;
  const completeExtra = calculateAddonPrice(ZUSATZ_BEREICHE.length) - addonPrice;

  return (
    <Section id="pricing" eyebrow={PRICING.eyebrow} eyebrowNumber="08">
      <div
        className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full"
        style={{
          background: 'rgba(212,165,116,0.16)',
          border: '1px solid rgba(212,165,116,0.32)',
        }}
      >
        <span className="pre-launch-pulse" />
        <span
          className="font-mono text-[10px] tracking-[0.2em] uppercase"
          style={{ color: 'var(--color-terra-deep)' }}
        >
          {PRICING.pill}
        </span>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 mb-10 items-end">
        <h2 className="h2-editorial">
          {PRICING.titlePart1} <em>{PRICING.titleEm}</em>
        </h2>
        <p className="lede">{PRICING.lede}</p>
      </div>

      {/* === NEUE LAUFZEIT-ERKLÄRUNG === */}
      <div
        className="mb-10 p-6 rounded-2xl border"
        style={{
          background: 'var(--color-paper-soft)',
          borderColor: 'var(--color-rule)',
        }}
      >
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted mb-4">
          {PRICING.termsExplained.title}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PRICING.termsExplained.items.map((item) => (
            <div key={item.label}>
              <div
                className="text-2xl mb-1"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-terra-deep)',
                  fontWeight: 500,
                }}
              >
                {item.value}
              </div>
              <div className="text-xs font-medium text-ink mb-1">{item.label}</div>
              <div className="text-xs text-muted leading-snug">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12">
        {/* === LINKS: Konfigurator === */}
        <div className="space-y-6">
          {/* Basis-Paket */}
          <div
            className="border-2 rounded-2xl p-6 lg:p-8"
            style={{
              borderColor: 'var(--color-ink)',
              background: 'var(--color-paper-warm, #fff)',
            }}
          >
            <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
              <div>
                <div
                  className="font-mono text-[10px] tracking-[0.22em] uppercase mb-2"
                  style={{ color: 'var(--color-sage-deep)' }}
                >
                  Basis-Paket · 4 Bereiche · immer dabei
                </div>
                <h3
                  className="text-2xl lg:text-3xl leading-tight text-ink"
                  style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}
                >
                  Eure Hochzeitsseite
                </h3>
              </div>
              <div className="text-right whitespace-nowrap">
                <div
                  className="text-3xl lg:text-4xl"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--color-ink)',
                    fontWeight: 500,
                  }}
                >
                  {BASE_PRICE}€
                </div>
                <div className="text-xs text-muted font-mono uppercase tracking-wider">
                  pro Monat
                </div>
              </div>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-ink-soft mt-5">
              {BASIS_BEREICHE.map((b) => (
                <li key={b.key} className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: 'var(--color-sage-deep)' }}
                  />
                  {b.name}
                </li>
              ))}
              <li className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: 'var(--color-sage-deep)' }}
                />
                Voller Baukasten
              </li>
              <li className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: 'var(--color-sage-deep)' }}
                />
                DSGVO-konform
              </li>
            </ul>
          </div>

          {/* Zusatz-Bereiche */}
          <div>
            <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-xl font-medium text-ink">Zusatz-Bereiche</h3>
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
                {count} von {ZUSATZ_BEREICHE.length} gewählt
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ZUSATZ_BEREICHE.map((b) => {
                const isSelected = selected.has(b.key);
                return (
                  <button
                    key={b.key}
                    onClick={() => toggle(b.key)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected ? 'shadow-card -translate-y-px' : 'hover:border-ink/40'
                    }`}
                    style={{
                      background: isSelected
                        ? 'var(--color-ink)'
                        : 'var(--color-paper-warm, #fff)',
                      borderColor: isSelected ? 'var(--color-ink)' : 'var(--color-rule)',
                      color: isSelected ? 'var(--color-paper-warm)' : 'var(--color-ink)',
                    }}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-sm font-medium">{b.name}</span>
                        {b.featured && (
                          <span
                            className="text-[8px] font-mono tracking-[0.18em] uppercase px-1.5 py-0.5 rounded"
                            style={{
                              background: isSelected
                                ? 'var(--color-honey)'
                                : 'var(--color-terra-soft)',
                              color: isSelected
                                ? 'var(--color-ink)'
                                : 'var(--color-terra-deep)',
                            }}
                          >
                            Bestseller
                          </span>
                        )}
                      </div>
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          border: `2px solid ${
                            isSelected
                              ? 'var(--color-paper-warm)'
                              : 'var(--color-rule)'
                          }`,
                          background: isSelected
                            ? 'var(--color-paper-warm)'
                            : 'transparent',
                          color: 'var(--color-ink)',
                        }}
                      >
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </span>
                    </div>
                    <p
                      className="text-xs leading-snug"
                      style={{
                        color: isSelected
                          ? 'rgba(244,237,226,0.75)'
                          : 'var(--color-muted)',
                      }}
                    >
                      {b.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* === RECHTS: Sticky Summary mit Streichpreis === */}
        <div className="lg:sticky lg:top-8 self-start">
          <div
            className="border rounded-2xl p-6 lg:p-7"
            style={{
              borderColor: 'var(--color-rule-soft)',
              background: 'var(--color-paper-soft)',
            }}
          >
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted mb-5">
              Eure Konfiguration
            </div>

            <div className="flex items-baseline justify-between py-3 border-b border-rule-soft">
              <span className="text-sm text-ink">Basis-Paket (4 Bereiche)</span>
              <span
                className="text-lg"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-ink)',
                  fontWeight: 500,
                }}
              >
                {BASE_PRICE}€
              </span>
            </div>

            {/* === STREICHPREIS-LOGIK === */}
            {count > 0 && (
              <div className="py-3 border-b border-rule-soft">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-sm text-ink">
                    {count} Zusatz-{count === 1 ? 'Bereich' : 'Bereiche'}
                  </span>
                  <div className="text-right">
                    {savings.monthly > 0 && (
                      <span className="text-sm text-muted line-through mr-2">
                        +{addonWithoutDiscount}€
                      </span>
                    )}
                    <span
                      className="text-lg"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        color:
                          savings.monthly > 0
                            ? 'var(--color-sage-deep)'
                            : 'var(--color-ink)',
                        fontWeight: 500,
                      }}
                    >
                      +{addonPrice}€
                    </span>
                  </div>
                </div>
                {savings.monthly > 0 && (
                  <p className="text-xs" style={{ color: 'var(--color-sage-deep)' }}>
                    Ihr spart {savings.monthly}€/Monat · {savings.percentage}% Rabatt
                  </p>
                )}
              </div>
            )}

            {count === 0 && (
              <div className="flex items-baseline justify-between py-3 border-b border-rule-soft">
                <span className="text-sm text-muted">Keine Zusatz-Bereiche</span>
                <span className="text-lg text-muted">—</span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-baseline justify-between py-4 mt-2">
              <span className="text-sm font-medium text-ink uppercase tracking-wider">
                Pro Monat
              </span>
              <div className="text-right">
                <div
                  className="text-4xl"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--color-terra-deep)',
                    fontWeight: 500,
                  }}
                >
                  {total}€
                </div>
              </div>
            </div>

            {/* Gesamtkosten über 12 Monate === NEU === */}
            <div
              className="p-3 rounded-lg mb-4 text-xs"
              style={{
                background: 'var(--color-paper-warm, #fff)',
                border: '1px dashed var(--color-rule)',
              }}
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-muted">Über {MIN_TERM_MONTHS} Monate</span>
                <span
                  className="text-base font-medium"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--color-ink)',
                  }}
                >
                  {lifetimeCost}€
                </span>
              </div>
              <p className="text-muted leading-relaxed">
                Mindestlaufzeit = typischer Hochzeits-Planungs-Horizont. Danach
                läuft die Seite noch 6 Monate weiter (Galerie, Gästebuch).
              </p>
            </div>

            {savings.yearly > 0 && (
              <div
                className="mb-4 p-2.5 rounded-lg text-xs flex items-center justify-between"
                style={{
                  background: 'rgba(138,154,123,0.18)',
                  color: 'var(--color-sage-deep)',
                }}
              >
                <span className="font-medium">
                  Gesamt-Ersparnis ({MIN_TERM_MONTHS} Monate)
                </span>
                <span
                  className="font-medium"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {savings.yearly}€
                </span>
              </div>
            )}

            {/* Komplett-Upsell */}
            {showCompleteUpsell && (
              <div
                className="my-4 p-3 rounded-xl border"
                style={{
                  background: 'rgba(212,165,116,0.12)',
                  borderColor: 'var(--color-honey)',
                }}
              >
                <div
                  className="font-mono text-[10px] tracking-[0.18em] uppercase mb-1.5"
                  style={{ color: 'var(--color-terra-deep)' }}
                >
                  💡 Tipp
                </div>
                <p className="text-xs text-ink leading-relaxed mb-2">
                  Für nur <strong>+{completeExtra}€/Monat</strong> bekommt ihr alle{' '}
                  {ZUSATZ_BEREICHE.length} Zusatz-Bereiche.
                </p>
                <button
                  onClick={selectAll}
                  className="text-xs font-medium underline decoration-1 underline-offset-2"
                  style={{ color: 'var(--color-terra-deep)' }}
                >
                  Komplett-Paket wählen →
                </button>
              </div>
            )}

            {/* Waitlist */}
            <div className="border-t border-rule-soft pt-5 mt-2">
              <p className="text-xs text-muted leading-relaxed mb-4">
                {PRICING.asideNote}
              </p>
              <WaitlistForm cta={PRICING.asideCta} showPrivacy={false} />
            </div>
          </div>

          {/* Aside Inclusion List */}
          <div
            className="mt-4 p-5 rounded-xl border"
            style={{
              borderColor: 'var(--color-rule-soft)',
              background: 'transparent',
            }}
          >
            <h4 className="text-sm font-medium text-ink mb-3">
              {PRICING.asideTitle}
            </h4>
            <ul className="space-y-1.5 text-xs text-ink-soft">
              {PRICING.asideList.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: 'var(--color-sage-deep)' }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
