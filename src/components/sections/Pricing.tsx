'use client';

import { useState, useMemo } from 'react';
import { PRICING } from '@/lib/content';
import { ZUSATZ_BEREICHE, BASIS_BEREICHE } from '@/lib/bereiche';
import {
  BASE_PRICE,
  calculateAddonPrice,
  calculateSavings,
  calculateTotal,
} from '@/lib/pricing';
import Section from '@/components/ui/Section';
import WaitlistForm from '@/components/ui/WaitlistForm';

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
  const savings = useMemo(() => calculateSavings(count), [count]);
  const total = useMemo(() => calculateTotal(count), [count]);

  const showCompleteUpsell = count >= 3 && count < ZUSATZ_BEREICHE.length;
  const completeExtra =
    calculateAddonPrice(ZUSATZ_BEREICHE.length) - addonPrice;

  return (
    <Section id="pricing" eyebrow={PRICING.eyebrow} eyebrowNumber="08">
      {/* Pre-Launch-Pill */}
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

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 mb-12 items-end">
        <h2 className="h2-editorial">
          {PRICING.titlePart1} <em>{PRICING.titleEm}</em>
        </h2>
        <p className="lede">{PRICING.lede}</p>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12">
        {/* === LINKS: Konfigurator === */}
        <div className="space-y-6">
          {/* Basis-Paket */}
          <div
            className="border-2 rounded-2xl p-8"
            style={{
              borderColor: 'var(--color-ink)',
              background: 'var(--color-paper-warm, #fff)',
            }}
          >
            <div className="flex items-start justify-between mb-5 gap-4">
              <div>
                <div
                  className="font-mono text-[10px] tracking-[0.22em] uppercase mb-2"
                  style={{ color: 'var(--color-sage-deep)' }}
                >
                  Basis-Paket · 4 Bereiche · immer dabei
                </div>
                <h3
                  className="text-3xl leading-tight text-ink"
                  style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}
                >
                  Eure Hochzeitsseite
                </h3>
              </div>
              <div className="text-right whitespace-nowrap">
                <div
                  className="text-4xl"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)', fontWeight: 500 }}
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
            <div className="flex items-baseline justify-between mb-4">
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
                      isSelected
                        ? 'shadow-card -translate-y-px'
                        : 'hover:border-ink/40'
                    }`}
                    style={{
                      background: isSelected ? 'var(--color-ink)' : 'var(--color-paper-warm, #fff)',
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
                            isSelected ? 'var(--color-paper-warm)' : 'var(--color-rule)'
                          }`,
                          background: isSelected ? 'var(--color-paper-warm)' : 'transparent',
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

        {/* === RECHTS: Live-Summary (sticky) === */}
        <div className="lg:sticky lg:top-8 self-start">
          <div
            className="border rounded-2xl p-7"
            style={{
              borderColor: 'var(--color-rule-soft)',
              background: 'var(--color-paper-soft)',
            }}
          >
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted mb-5">
              Eure Konfiguration
            </div>

            {/* Basis */}
            <div className="flex items-baseline justify-between py-3 border-b border-rule-soft">
              <span className="text-sm text-ink">Basis-Paket (4 Bereiche)</span>
              <span
                className="text-lg"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)', fontWeight: 500 }}
              >
                {BASE_PRICE}€
              </span>
            </div>

            {/* Zusatz */}
            <div className="flex items-baseline justify-between py-3 border-b border-rule-soft">
              <span className="text-sm text-ink">
                {count === 0
                  ? 'Keine Zusatz-Bereiche'
                  : `${count} Zusatz-${count === 1 ? 'Bereich' : 'Bereiche'}`}
              </span>
              <span
                className="text-lg"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)', fontWeight: 500 }}
              >
                {count === 0 ? '—' : `+${addonPrice}€`}
              </span>
            </div>

            {/* Ersparnis */}
            {savings.monthly > 0 && (
              <div
                className="my-4 p-3 rounded-lg text-sm flex items-center justify-between"
                style={{
                  background: 'rgba(138,154,123,0.18)',
                  color: 'var(--color-sage-deep)',
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
                  className="text-4xl"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--color-terra-deep)',
                    fontWeight: 500,
                  }}
                >
                  {total}€
                </div>
                <div className="text-xs text-muted font-mono uppercase tracking-wider">
                  pro Monat
                </div>
              </div>
            </div>

            {/* Yearly */}
            <div className="text-xs text-muted text-right mb-5">
              = {total * 12}€ pro Jahr
              {savings.yearly > 0 && (
                <span
                  className="block font-medium mt-1"
                  style={{ color: 'var(--color-sage-deep)' }}
                >
                  Jährlich gespart: {savings.yearly}€
                </span>
              )}
            </div>

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
              <p className="text-xs text-muted leading-relaxed mb-4">{PRICING.asideNote}</p>
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
                    className="text-sage-deep mt-0.5 flex-shrink-0"
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
