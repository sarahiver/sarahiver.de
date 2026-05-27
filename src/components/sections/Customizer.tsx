'use client';

import { useState, useMemo } from 'react';
import { CUSTOMIZER } from '@/lib/content';
import {
  START_STYLES,
  PALETTES,
  FONTS,
  getStartStyle,
  getPalette,
  getFontPair,
  spacingToPadding,
} from '@/lib/customizer';
import Section from '@/components/ui/Section';

type StepKey = 'start' | 'palette' | 'fonts' | 'blocks';

/**
 * Baukasten-Sektion — der zentrale Wow-Moment der Landing.
 *
 * Vier Schritte (Start-Stil → Farben → Schriften → Bereiche),
 * Live-Preview rechts ändert sich anhand der DNA des gewählten Start-Stils.
 *
 * Bei jeder Auswahl: Cheer-Pool-Mikrocopy zeigt sich kurz.
 */
export default function Customizer() {
  const [step, setStep] = useState<StepKey>('start');
  const [startId, setStartId] = useState<string>('klassisch');
  const [paletteId, setPaletteId] = useState<string>('sand-terra');
  const [fontsId, setFontsId] = useState<string>('klassisch-serif');
  const [cheer, setCheer] = useState<string>('');

  const start = useMemo(() => getStartStyle(startId), [startId]);

  // Beim Start-Stil-Wechsel: Defaults für Palette und Fonts übernehmen
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
    setTimeout(() => setCheer(''), 1600);
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

      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12">
        {/* === LINKS: Schritte + Optionen === */}
        <div className="space-y-6">
          {/* Step Tabs */}
          <div
            className="flex gap-2 p-1.5 rounded-2xl border w-fit"
            style={{
              background: 'var(--color-paper-soft)',
              borderColor: 'var(--color-rule)',
            }}
          >
            {CUSTOMIZER.steps.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setStep(s.key as StepKey)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
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

          {/* Step Content */}
          <div className="min-h-[380px]">
            {step === 'start' && (
              <StartStep
                selected={startId}
                onSelect={handleStartChange}
              />
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
            {step === 'blocks' && <BlocksStep onChange={showCheer} />}
          </div>
        </div>

        {/* === RECHTS: Live-Preview === */}
        <div className="lg:sticky lg:top-8 self-start">
          <div className="relative">
            <LivePreview startId={startId} paletteId={paletteId} fontsId={fontsId} />

            {/* Cheer-Toast */}
            {cheer && (
              <div
                className="absolute -top-3 right-4 px-3 py-1.5 rounded-full text-sm text-white shadow-card animate-fade-in"
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
            Live-Vorschau · Stil: {start.name}
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ===================================================
   Step 1: Start-Stil
   =================================================== */
function StartStep({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div>
      <p className="text-sm text-ink-soft mb-5 leading-relaxed">
        Wählt einen Start-Stil — Farben, Schriften und Layout-Eigenheiten werden
        automatisch passend gesetzt. Ihr könnt später alles anpassen.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {START_STYLES.map((s) => {
          const palette = getPalette(s.defaultPalette);
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
              style={{
                background: isSelected ? 'var(--color-paper-warm, #fff)' : 'var(--color-paper-warm, #fff)',
              }}
              aria-pressed={isSelected}
            >
              {/* Palette preview */}
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
                <span
                  className="text-[10px] font-mono tracking-[0.18em] uppercase text-ink-soft"
                >
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
   Step 4: Bereiche-Beispiel (vereinfacht für Landing)
   =================================================== */
function BlocksStep({ onChange }: { onChange: () => void }) {
  const [heroVariant, setHeroVariant] = useState<'A' | 'B' | 'C'>('B');
  const [loveVariant, setLoveVariant] = useState<'A' | 'B' | 'C'>('A');
  const [rsvpVariant, setRsvpVariant] = useState<'A' | 'B' | 'C'>('A');

  const blocks = [
    {
      key: 'hero',
      title: 'Hero-Bereich',
      meta: 'Die erste Sektion eurer Seite',
      options: [
        { id: 'A', name: 'Foto-zentriert' },
        { id: 'B', name: 'Klassisch zentriert' },
        { id: 'C', name: 'Asymmetrisch minimal' },
      ],
      selected: heroVariant,
      onSelect: (v: 'A' | 'B' | 'C') => {
        setHeroVariant(v);
        onChange();
      },
    },
    {
      key: 'love',
      title: 'Lovestory-Bereich',
      meta: 'Wie ihr euch kennengelernt habt',
      options: [
        { id: 'A', name: 'Zeitstrahl' },
        { id: 'B', name: 'Foto-Galerie' },
        { id: 'C', name: 'Brief-Format' },
      ],
      selected: loveVariant,
      onSelect: (v: 'A' | 'B' | 'C') => {
        setLoveVariant(v);
        onChange();
      },
    },
    {
      key: 'rsvp',
      title: 'RSVP-Bereich',
      meta: 'Wie eure Gäste antworten',
      options: [
        { id: 'A', name: 'Klassisch Card' },
        { id: 'B', name: 'Vollbild' },
        { id: 'C', name: 'Casual Chat-Style' },
      ],
      selected: rsvpVariant,
      onSelect: (v: 'A' | 'B' | 'C') => {
        setRsvpVariant(v);
        onChange();
      },
    },
  ];

  return (
    <div>
      <p className="text-sm text-ink-soft mb-5 leading-relaxed">
        Pro Bereich gibt es drei Layout-Varianten. Klickt durch — hier ein
        Beispiel für drei der neun Bereiche.
      </p>
      <div className="space-y-4">
        {blocks.map((b) => (
          <div
            key={b.key}
            className="p-4 rounded-xl border border-rule"
            style={{ background: 'var(--color-paper-warm, #fff)' }}
          >
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <div
                  className="text-base font-medium text-ink"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {b.title}
                </div>
                <div className="text-xs text-muted">{b.meta}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {b.options.map((o) => {
                const isActive = b.selected === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => b.onSelect(o.id as 'A' | 'B' | 'C')}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                      isActive
                        ? 'text-white border-ink'
                        : 'text-ink-soft border-rule hover:border-ink/40'
                    }`}
                    style={isActive ? { background: 'var(--color-ink)' } : undefined}
                  >
                    <span
                      className="block font-mono text-[9px] tracking-wider opacity-60 mb-0.5"
                    >
                      Var. {o.id}
                    </span>
                    {o.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================================================
   Live-Preview — DNA-basiert
   =================================================== */
function LivePreview({
  startId,
  paletteId,
  fontsId,
}: {
  startId: string;
  paletteId: string;
  fontsId: string;
}) {
  const start = getStartStyle(startId);
  const palette = getPalette(paletteId);
  const fonts = getFontPair(fontsId);
  const padding = spacingToPadding(start.dna.spacing);
  const align = start.dna.align;

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-lift border border-rule-soft"
      style={{ background: '#fff' }}
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
          <span style={{ color: 'var(--color-sage-deep)' }}>🔒</span> eure-seite.sarahiver.de
        </div>
      </div>

      {/* Live Hero preview */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          background: `linear-gradient(180deg, ${palette.colors[0]} 0%, ${palette.colors[1]} 100%)`,
          padding,
          textAlign: align,
          minHeight: 360,
        }}
      >
        {/* Decor element above */}
        <DnaDecor decor={start.dna.decor} accent={palette.colors[2]} align={align} />

        {/* Eyebrow */}
        <div
          className="font-mono text-[10px] tracking-[0.3em] uppercase mt-3 mb-4"
          style={{ color: palette.colors[3] }}
        >
          {start.name}
        </div>

        {/* Title */}
        <h3
          className="leading-[0.98] tracking-[-0.015em]"
          style={{
            fontFamily: fonts.display,
            fontWeight: fonts.weight,
            fontStyle: fonts.style,
            fontSize:
              start.dna.contrast === 'high' ? 'clamp(34px, 4.2vw, 58px)' : 'clamp(28px, 3.4vw, 48px)',
            color: palette.colors[palette.colors.length - 1],
          }}
        >
          Sarah{' '}
          <span
            style={{
              fontFamily: fonts.style === 'italic' ? 'var(--font-script)' : fonts.display,
              fontStyle: 'normal',
              color: palette.colors[2],
              fontWeight: 500,
            }}
          >
            &
          </span>
          <br />
          Iver
        </h3>

        {/* Date */}
        <p
          className="mt-3 text-xs tracking-[0.04em]"
          style={{
            color: palette.colors[3],
            fontFamily: fonts.body,
          }}
        >
          27. Juni 2026 · Hamburg
        </p>

        {/* Decor element below for symmetric layouts */}
        {align === 'center' && start.dna.decor !== 'none' && (
          <div className="mt-5">
            <DnaDecor decor={start.dna.decor} accent={palette.colors[2]} align={align} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================================================
   DNA Decor — verschiedene Stil-Akzente
   =================================================== */
function DnaDecor({
  decor,
  accent,
  align,
}: {
  decor: string;
  accent: string;
  align: 'center' | 'left';
}) {
  const justifyClass = align === 'center' ? 'justify-center' : 'justify-start';

  if (decor === 'none') return null;

  if (decor === 'rule') {
    return (
      <div className={`flex items-center gap-3 ${justifyClass}`}>
        <span className="h-px w-12" style={{ background: accent }} />
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: accent }}
        />
        <span className="h-px w-12" style={{ background: accent }} />
      </div>
    );
  }

  if (decor === 'hairline') {
    return <div className={`flex ${justifyClass}`}><span className="h-px w-20" style={{ background: accent }} /></div>;
  }

  if (decor === 'sprig') {
    return (
      <svg
        width="48"
        height="22"
        viewBox="0 0 48 22"
        className={align === 'center' ? 'mx-auto' : ''}
        style={{ color: accent }}
      >
        <path
          d="M2 11 Q 12 4 24 11 Q 36 18 46 11"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="13" cy="8" rx="3" ry="1.5" transform="rotate(-30 13 8)" fill="currentColor" opacity="0.6" />
        <ellipse cx="24" cy="13" rx="3" ry="1.5" fill="currentColor" opacity="0.6" />
        <ellipse cx="35" cy="8" rx="3" ry="1.5" transform="rotate(30 35 8)" fill="currentColor" opacity="0.6" />
      </svg>
    );
  }

  if (decor === 'gold') {
    return (
      <div className={`flex items-center gap-2 ${justifyClass}`}>
        <span className="h-px w-8" style={{ background: 'var(--color-honey)' }} />
        <span className="text-[10px]" style={{ color: 'var(--color-honey)' }}>◆</span>
        <span className="h-px w-8" style={{ background: 'var(--color-honey)' }} />
      </div>
    );
  }

  return null;
}
