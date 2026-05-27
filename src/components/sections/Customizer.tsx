'use client';

import { useState, useMemo } from 'react';
import { CUSTOMIZER } from '@/lib/content';
import {
  START_STYLES,
  PALETTES,
  FONTS,
  getStartStyle,
} from '@/lib/customizer';
import { ZUSATZ_BEREICHE } from '@/lib/bereiche';
import Section from '@/components/ui/Section';

type StepKey = 'start' | 'palette' | 'fonts' | 'blocks';

/**
 * Baukasten-Sektion v4 — Mobile-First, ohne fragile Live-Preview.
 *
 * Wesentliche Änderungen vs. v3:
 * 1. Live-Preview entfernt — Reviewer-Punkt: kollabiert auf Mobile
 *    Stattdessen: dezenter Coming-Soon-Placeholder (rechts auf Desktop,
 *    unter den Steps auf Mobile)
 * 2. Sequenzielles Layout statt Split-Screen
 * 3. Empfehlungen pro Start-Stil — gegen Choice Overload
 */
export default function Customizer() {
  const [step, setStep] = useState<StepKey>('start');
  const [startId, setStartId] = useState<string>('klassisch');
  const [paletteId, setPaletteId] = useState<string>('sand-terra');
  const [fontsId, setFontsId] = useState<string>('klassisch-serif');
  const [cheer, setCheer] = useState<string>('');

  const start = useMemo(() => getStartStyle(startId), [startId]);

  const handleStartChange = (id: string) => {
    setStartId(id);
    const s = getStartStyle(id);
    setPaletteId(s.defaultPalette);
    setFontsId(s.defaultFonts);
    showCheer();
  };

  const showCheer = () => {
    const pool = CUSTOMIZER.cheerPool;
    setCheer(pool[Math.floor(Math.random() * pool.length)]);
    setTimeout(() => setCheer(''), 1800);
  };

  return (
    <Section id="customizer" eyebrow={CUSTOMIZER.eyebrow} eyebrowNumber="05">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 mb-12 items-end">
        <h2 className="h2-editorial">
          {CUSTOMIZER.titlePart1} <em>{CUSTOMIZER.titleEm}</em>
          {CUSTOMIZER.titlePart2} <span className="sage">{CUSTOMIZER.titleSage}</span>
        </h2>
        <p className="lede">{CUSTOMIZER.lede}</p>
      </div>

      {/* Mobile + Desktop: Sequential Stack + Preview-Aside on Desktop only */}
      <div className="grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-12">
        {/* === LEFT: Steps + Options (always visible) === */}
        <div className="space-y-6 min-w-0">
          {/* Step Tabs */}
          <div className="overflow-x-auto -mx-2 px-2 lg:overflow-visible lg:mx-0 lg:px-0">
            <div
              className="flex gap-1.5 p-1.5 rounded-2xl border w-fit whitespace-nowrap"
              style={{
                background: 'var(--color-paper-soft)',
                borderColor: 'var(--color-rule)',
              }}
            >
              {CUSTOMIZER.steps.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => setStep(s.key as StepKey)}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all ${
                    step === s.key ? 'text-white shadow-card' : 'text-ink-soft hover:text-ink'
                  }`}
                  style={step === s.key ? { background: 'var(--color-ink)' } : undefined}
                >
                  <span
                    className="font-mono text-[10px] tracking-[0.12em] mr-1.5"
                    style={{
                      color:
                        step === s.key ? 'var(--color-honey)' : 'var(--color-muted-2)',
                    }}
                  >
                    0{i + 1}
                  </span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[380px]">
            {step === 'start' && (
              <StartStep selected={startId} onSelect={handleStartChange} />
            )}
            {step === 'palette' && (
              <PaletteStep
                selected={paletteId}
                onSelect={(id) => {
                  setPaletteId(id);
                  showCheer();
                }}
              />
            )}
            {step === 'fonts' && (
              <FontsStep
                selected={fontsId}
                onSelect={(id) => {
                  setFontsId(id);
                  showCheer();
                }}
              />
            )}
            {step === 'blocks' && <BlocksStep startId={startId} onChange={showCheer} />}
          </div>
        </div>

        {/* === RIGHT: Coming-Soon Preview Placeholder (Desktop only) === */}
        <div className="hidden lg:block lg:sticky lg:top-8 self-start">
          <div className="relative">
            <PreviewPlaceholder
              startName={start.name}
              paletteId={paletteId}
              fontsId={fontsId}
            />

            {cheer && (
              <div
                className="absolute -top-3 right-4 px-3 py-1.5 rounded-full text-sm text-white shadow-card"
                style={{
                  background: 'var(--color-terra)',
                  fontFamily: 'var(--font-script)',
                  transform: 'rotate(-3deg)',
                }}
              >
                {cheer}
              </div>
            )}
          </div>

          <p
            className="mt-4 text-xs text-center text-muted"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Eure aktuelle Auswahl · Stil: {start.name}
          </p>
        </div>

        {/* === MOBILE: Inline Summary === */}
        <div className="lg:hidden">
          <MobileSummary
            startName={start.name}
            paletteId={paletteId}
            fontsId={fontsId}
            cheer={cheer}
          />
        </div>
      </div>
    </Section>
  );
}

/* ===================================================
   Step 1: Start-Stil
   =================================================== */
function StartStep({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-sm text-ink-soft mb-5 leading-relaxed">
        Wählt einen Start-Stil — Farben, Schriften und passende Bereiche werden
        automatisch vorgeschlagen. Ihr könnt später alles anpassen.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {START_STYLES.map((s) => {
          const palette = PALETTES.find((p) => p.id === s.defaultPalette)!;
          const isSelected = selected === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-ink shadow-card -translate-y-px'
                  : 'border-rule hover:border-ink/40'
              }`}
              style={{ background: 'var(--color-paper-warm, #fff)' }}
              aria-pressed={isSelected}
            >
              <div className="flex gap-1 mb-3">
                {palette.colors.map((c, i) => (
                  <span
                    key={i}
                    className="w-5 h-5 rounded-full border border-black/5"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span
                  className="text-base font-medium text-ink"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {s.name}
                </span>
                {isSelected && (
                  <span
                    className="text-xs font-mono tracking-wider"
                    style={{ color: 'var(--color-terra)' }}
                  >
                    ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-muted leading-snug">{s.meta}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ===================================================
   Step 2: Farben
   =================================================== */
function PaletteStep({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-sm text-ink-soft mb-5 leading-relaxed">
        Sechs Farbpaletten — alle Hochzeits-erprobt. Oder mischt später eigene
        Farben dazu.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PALETTES.map((p) => {
          const isSelected = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-ink shadow-card -translate-y-px'
                  : 'border-rule hover:border-ink/40'
              }`}
              style={{ background: 'var(--color-paper-warm, #fff)' }}
              aria-pressed={isSelected}
            >
              <div className="flex gap-1 mb-3 h-8">
                {p.colors.map((c, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-md border border-black/5"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className="text-sm font-medium text-ink"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {p.name}
                </span>
                {isSelected && (
                  <span
                    className="text-xs font-mono"
                    style={{ color: 'var(--color-terra)' }}
                  >
                    ✓
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ===================================================
   Step 3: Schriften
   =================================================== */
function FontsStep({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-sm text-ink-soft mb-5 leading-relaxed">
        Fünf Schrift-Kombinationen — von klassisch bis modern. Jede ist auf
        Lesbarkeit getestet.
      </p>
      <div className="space-y-3">
        {FONTS.map((f) => {
          const isSelected = selected === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onSelect(f.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-ink shadow-card -translate-y-px'
                  : 'border-rule hover:border-ink/40'
              }`}
              style={{ background: 'var(--color-paper-warm, #fff)' }}
              aria-pressed={isSelected}
            >
              <div className="flex items-baseline justify-between gap-4 mb-1">
                <div
                  className="text-2xl"
                  style={{
                    fontFamily: f.display,
                    fontWeight: f.weight,
                    fontStyle: f.style,
                    color: 'var(--color-ink)',
                  }}
                >
                  Sarah & Iver
                </div>
                {isSelected && (
                  <span
                    className="text-xs font-mono"
                    style={{ color: 'var(--color-terra)' }}
                  >
                    ✓
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-xs text-muted">{f.meta}</p>
                <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-ink-soft">
                  {f.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ===================================================
   Step 4: Bereiche — mit Empfehlungen pro Stil
   =================================================== */
function BlocksStep({
  startId,
  onChange,
}: {
  startId: string;
  onChange: () => void;
}) {
  const start = getStartStyle(startId);
  const recommended = new Set(start.recommendedBereiche);

  // Selected = automatisch die Empfehlungen, aber Nutzer kann toggeln
  const [selected, setSelected] = useState<Set<string>>(
    new Set(start.recommendedBereiche)
  );

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    onChange();
  };

  // Bei Stil-Wechsel: setzt auf Empfehlung zurück
  useMemo(() => {
    setSelected(new Set(start.recommendedBereiche));
  }, [start.id, start.recommendedBereiche]);

  return (
    <div>
      <p className="text-sm text-ink-soft mb-3 leading-relaxed">
        {CUSTOMIZER.recommendedLabel}{' '}
        <strong className="text-ink">{recommended.size} Zusatz-Bereiche</strong>{' '}
        für „{start.name}". Toggelt sie an oder aus — alle 11 Zusatz-Bereiche
        sind verfügbar.
      </p>
      <p
        className="text-xs mb-5 italic"
        style={{ color: 'var(--color-terra-deep)' }}
      >
        {selected.size} von 11 Zusatz-Bereichen gewählt
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ZUSATZ_BEREICHE.map((b) => {
          const isSelected = selected.has(b.key);
          const isRecommended = recommended.has(b.key);
          return (
            <button
              key={b.key}
              onClick={() => toggle(b.key)}
              className={`text-left p-3 rounded-lg border text-sm transition-all relative ${
                isSelected ? 'shadow-card' : 'hover:border-ink/40'
              }`}
              style={{
                background: isSelected ? 'var(--color-ink)' : 'var(--color-paper-warm, #fff)',
                borderColor: isSelected ? 'var(--color-ink)' : 'var(--color-rule)',
                color: isSelected ? 'var(--color-paper-warm)' : 'var(--color-ink)',
              }}
              aria-pressed={isSelected}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      border: `1.5px solid ${
                        isSelected ? 'var(--color-paper-warm)' : 'var(--color-rule)'
                      }`,
                      background: isSelected ? 'var(--color-paper-warm)' : 'transparent',
                    }}
                  >
                    {isSelected && (
                      <span className="text-[8px]" style={{ color: 'var(--color-ink)' }}>
                        ✓
                      </span>
                    )}
                  </span>
                  <span className="font-medium truncate">{b.name}</span>
                </div>
                {isRecommended && !isSelected && (
                  <span
                    className="text-[8px] font-mono tracking-[0.18em] uppercase px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{
                      background: 'var(--color-honey-soft)',
                      color: 'var(--color-terra-deep)',
                    }}
                  >
                    Tipp
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ===================================================
   Preview Placeholder — ersetzt Live-Vorschau
   =================================================== */
function PreviewPlaceholder({
  startName,
  paletteId,
  fontsId,
}: {
  startName: string;
  paletteId: string;
  fontsId: string;
}) {
  const palette = PALETTES.find((p) => p.id === paletteId)!;
  const fonts = FONTS.find((f) => f.id === fontsId)!;

  return (
    <div
      className="rounded-2xl border border-rule overflow-hidden"
      style={{ background: 'var(--color-paper-warm, #fff)' }}
    >
      {/* Browser bar */}
      <div className="h-9 bg-[#efece6] border-b border-[#e3dfd5] flex items-center px-3.5 gap-2">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d8d4c8]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#d8d4c8]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#d8d4c8]" />
        </div>
        <div
          className="ml-3.5 bg-white rounded-md px-3 py-1 font-mono text-[10px] flex-1 max-w-[60%] border border-[#e3dfd5]"
          style={{ color: 'var(--color-muted)' }}
        >
          <span style={{ color: 'var(--color-sage-deep)' }}>🔒</span>{' '}
          eure-seite.sarahiver.de
        </div>
      </div>

      {/* Coming-Soon Visual */}
      <div
        className="px-8 py-12 text-center"
        style={{
          background: `linear-gradient(180deg, ${palette.colors[0]} 0%, ${palette.colors[1]} 100%)`,
          minHeight: 360,
        }}
      >
        {/* Pulse-Badge */}
        <div
          className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.65)',
            border: `1px solid ${palette.colors[2]}`,
          }}
        >
          <span className="pre-launch-pulse" />
          <span
            className="font-mono text-[10px] tracking-[0.2em] uppercase"
            style={{ color: palette.colors[3] }}
          >
            {CUSTOMIZER.previewComingSoon}
          </span>
        </div>

        {/* Aktuelle Wahl-Display */}
        <h3
          className="leading-tight mb-3"
          style={{
            fontFamily: fonts.display,
            fontWeight: fonts.weight,
            fontStyle: fonts.style,
            fontSize: 'clamp(28px, 3.4vw, 42px)',
            color: palette.colors[palette.colors.length - 1],
          }}
        >
          {startName}
        </h3>

        <p
          className="text-sm mb-8"
          style={{ color: palette.colors[3], fontFamily: fonts.body }}
        >
          {palette.name} · {fonts.name}
        </p>

        {/* Erklärung */}
        <div
          className="mx-auto max-w-xs p-4 rounded-xl border"
          style={{
            background: 'rgba(255,255,255,0.5)',
            borderColor: palette.colors[2],
          }}
        >
          <p
            className="text-xs leading-relaxed"
            style={{ color: palette.colors[4] }}
          >
            {CUSTOMIZER.previewExplain}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===================================================
   Mobile Summary — kompakte Anzeige unter den Steps
   =================================================== */
function MobileSummary({
  startName,
  paletteId,
  fontsId,
  cheer,
}: {
  startName: string;
  paletteId: string;
  fontsId: string;
  cheer: string;
}) {
  const palette = PALETTES.find((p) => p.id === paletteId)!;
  const fonts = FONTS.find((f) => f.id === fontsId)!;

  return (
    <div
      className="rounded-2xl border p-5 relative"
      style={{
        background: 'var(--color-paper-soft)',
        borderColor: 'var(--color-rule)',
      }}
    >
      {cheer && (
        <div
          className="absolute -top-3 right-4 px-3 py-1.5 rounded-full text-sm text-white shadow-card"
          style={{
            background: 'var(--color-terra)',
            fontFamily: 'var(--font-script)',
            transform: 'rotate(-3deg)',
          }}
        >
          {cheer}
        </div>
      )}

      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted mb-3">
        Eure aktuelle Auswahl
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-muted">Stil</span>
          <span
            className="text-ink font-medium"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {startName}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-muted">Farben</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {palette.colors.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  className="w-3 h-3 rounded-full border border-black/10"
                  style={{ background: c }}
                />
              ))}
            </div>
            <span className="text-ink text-xs">{palette.name}</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-muted">Schriften</span>
          <span
            style={{
              fontFamily: fonts.display,
              fontWeight: fonts.weight,
              fontStyle: fonts.style,
              color: 'var(--color-ink)',
            }}
          >
            {fonts.name}
          </span>
        </div>
      </div>

      <div
        className="mt-4 pt-4 border-t text-xs leading-relaxed text-muted"
        style={{ borderColor: 'var(--color-rule-soft)' }}
      >
        <span className="pre-launch-pulse inline-block mr-2" />
        {CUSTOMIZER.previewComingSoon} — {CUSTOMIZER.previewExplain}
      </div>
    </div>
  );
}
