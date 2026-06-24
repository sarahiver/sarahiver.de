'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Variant } from '@/types/supabase';
import EditorShell from '@/components/dashboard/EditorShell';
import { savePhases, setPhaseVariant } from './actions';

interface Props {
  slug: string;
  initial: {
    std_enabled: boolean;
    std_until: string | null;
    std_hero_variant: Variant;
    std_countdown_variant: Variant;
    archiv_enabled: boolean;
    archiv_from: string | null;
    archiv_message: string | null;
    archiv_hero_variant: Variant;
    archiv_fotoupload_variant: Variant;
  };
}

type Tab = 'std' | 'archiv';
type ActMode = 'off' | 'now' | 'date';

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : '';
}
function fromDateInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v + 'T00:00:00');
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}
// Aktivierungs-Modus aus (enabled, date) ableiten
function deriveMode(enabled: boolean, date: string): ActMode {
  if (!enabled) return 'off';
  return date ? 'date' : 'now';
}

export default function PhasenForm({ slug, initial }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('std');

  // STD
  const [stdEnabled, setStdEnabled] = useState(initial.std_enabled);
  const [stdUntil, setStdUntil] = useState(toDateInput(initial.std_until));
  const [stdHero, setStdHero] = useState<Variant>(initial.std_hero_variant);
  const [stdCountdown, setStdCountdown] = useState<Variant>(initial.std_countdown_variant);

  // ARCHIV
  const [archivEnabled, setArchivEnabled] = useState(initial.archiv_enabled);
  const [archivFrom, setArchivFrom] = useState(toDateInput(initial.archiv_from));
  const [archivMessage, setArchivMessage] = useState(initial.archiv_message ?? '');
  const [archivHero, setArchivHero] = useState<Variant>(initial.archiv_hero_variant);
  const [archivFoto, setArchivFoto] = useState<Variant>(initial.archiv_fotoupload_variant);

  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const stdMode = deriveMode(stdEnabled, stdUntil);
  const archivMode = deriveMode(archivEnabled, archivFrom);

  // Variante sofort persistieren + Vorschau live neu laden (wie VariantPicker).
  function applyVariant(field: string, value: Variant, setLocal: (v: Variant) => void) {
    setLocal(value); // optimistisch
    void setPhaseVariant(slug, field, value).then((res) => {
      if (!('error' in res)) {
        window.dispatchEvent(new Event('dashboard:editor-saved'));
        router.refresh();
      } else {
        setStatus('error');
        setMsg(res.error);
      }
    });
  }

  function setStdModeTo(m: ActMode) {
    if (m === 'off') setStdEnabled(false);
    if (m === 'now') {
      setStdEnabled(true);
      setStdUntil('');
    }
    if (m === 'date') setStdEnabled(true);
  }
  function setArchivModeTo(m: ActMode) {
    if (m === 'off') setArchivEnabled(false);
    if (m === 'now') {
      setArchivEnabled(true);
      setArchivFrom('');
    }
    if (m === 'date') setArchivEnabled(true);
  }

  async function save() {
    setStatus('saving');
    setMsg('');
    const res = await savePhases({
      slug,
      std_enabled: stdEnabled,
      std_until: stdMode === 'date' ? fromDateInput(stdUntil) : null,
      std_hero_variant: stdHero,
      std_countdown_variant: stdCountdown,
      archiv_enabled: archivEnabled,
      archiv_from: archivMode === 'date' ? fromDateInput(archivFrom) : null,
      archiv_message: archivMessage,
      archiv_hero_variant: archivHero,
      archiv_fotoupload_variant: archivFoto,
    });
    if ('error' in res) {
      setStatus('error');
      setMsg(res.error);
      return;
    }
    setStatus('saved');
    window.dispatchEvent(new Event('dashboard:editor-saved'));
    router.refresh();
  }

  const previewQuery = tab === 'std' ? '&phase=std' : '&phase=archiv';

  return (
    <div>
      {/* Tab-Umschalter */}
      <div style={tabbar}>
        <button type="button" onClick={() => setTab('std')} style={{ ...tabBtn, ...(tab === 'std' ? tabOn : {}) }}>
          Save-the-Date
        </button>
        <button type="button" onClick={() => setTab('archiv')} style={{ ...tabBtn, ...(tab === 'archiv' ? tabOn : {}) }}>
          Archiv
        </button>
      </div>

      <EditorShell
        weddingSlug={slug}
        bereichKey="hero"
        previewQuery={previewQuery}
        editorTitle={tab === 'std' ? 'Save-the-Date' : 'Archiv'}
        editorDescription="Aktivierung wählen und Komponenten gestalten. Rechts seht ihr die Live-Vorschau dieser Phase."
      >
        {tab === 'std' ? (
          <div style={col}>
            <Activation
              mode={stdMode}
              onMode={setStdModeTo}
              dateLabel="Bis zu diesem Datum (danach automatisch Hauptseite)"
              dateValue={stdUntil}
              onDate={setStdUntil}
            />
            <div style={divider} />
            <VariantRow label="Hero" hint="Namen, Bild, Datum, Ort" value={stdHero} onChange={(v) => applyVariant('std_hero_variant', v, setStdHero)} />
            <VariantRow label="Countdown" hint="Countdown bis zum großen Tag" value={stdCountdown} onChange={(v) => applyVariant('std_countdown_variant', v, setStdCountdown)} />
            <p style={tip}>
              Die Inhalte (Namen, Datum, Bild …) pflegt ihr in den Editoren{' '}
              <a href={`/dashboard/${slug}/bereiche/hero`} style={link}>Hero</a> und{' '}
              <a href={`/dashboard/${slug}/bereiche/countdown`} style={link}>Countdown</a> — hier wählt ihr nur das Layout.
            </p>
          </div>
        ) : (
          <div style={col}>
            <Activation
              mode={archivMode}
              onMode={setArchivModeTo}
              dateLabel="Ab diesem Datum automatisch online"
              dateValue={archivFrom}
              onDate={setArchivFrom}
            />
            <div style={divider} />
            <VariantRow label="Hero" hint="Kopf der Archiv-Seite" value={archivHero} onChange={(v) => applyVariant('archiv_hero_variant', v, setArchivHero)} />
            <label style={field}>
              <span style={lbl}>Danksagung (Text)</span>
              <textarea
                value={archivMessage}
                onChange={(e) => setArchivMessage(e.target.value)}
                placeholder="Danke, dass ihr diesen Tag mit uns gefeiert habt …"
                style={{ ...input, minHeight: 100, resize: 'vertical', lineHeight: 1.5, maxWidth: '100%' }}
              />
            </label>
            <VariantRow label="Fotoupload" hint="Gäste laden ihre Bilder hoch" value={archivFoto} onChange={(v) => applyVariant('archiv_fotoupload_variant', v, setArchivFoto)} />
            <p style={tip}>
              Bilder für die Danksagung, die Download-Galerie und deren Varianten folgen im nächsten Schritt.
            </p>
          </div>
        )}

        <div style={saveRow}>
          <button type="button" onClick={save} disabled={status === 'saving'} style={saveBtn}>
            {status === 'saving' ? 'Speichern …' : 'Speichern'}
          </button>
          {status === 'saved' && <span style={{ color: '#3F4A33', fontSize: 14 }}>Gespeichert ✓</span>}
          {status === 'error' && <span style={{ color: '#7A1F1A', fontSize: 14 }}>{msg}</span>}
        </div>
      </EditorShell>
    </div>
  );
}

function Activation({
  mode,
  onMode,
  dateLabel,
  dateValue,
  onDate,
}: {
  mode: ActMode;
  onMode: (m: ActMode) => void;
  dateLabel: string;
  dateValue: string;
  onDate: (v: string) => void;
}) {
  const opts: { key: ActMode; label: string }[] = [
    { key: 'off', label: 'Aus' },
    { key: 'now', label: 'Jetzt live' },
    { key: 'date', label: 'Per Datum' },
  ];
  return (
    <div style={field}>
      <span style={lbl}>Aktivierung</span>
      <div style={segwrap}>
        {opts.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onMode(o.key)}
            style={{ ...segWide, ...(mode === o.key ? segOn : {}) }}
          >
            {o.label}
          </button>
        ))}
      </div>
      {mode === 'date' && (
        <div style={{ marginTop: 10 }}>
          <span style={{ ...lbl, display: 'block', marginBottom: 6 }}>{dateLabel}</span>
          <input type="date" value={dateValue} onChange={(e) => onDate(e.target.value)} style={input} />
        </div>
      )}
      <span style={hint}>
        {mode === 'off'
          ? 'Diese Phase ist ausgeschaltet.'
          : mode === 'now'
            ? 'Sofort live — bleibt aktiv, bis ihr umschaltet.'
            : 'Greift automatisch zum gewählten Datum. „Jetzt live" ist dann nicht nötig.'}
      </span>
    </div>
  );
}

function VariantRow({
  label,
  hint: rowHint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: Variant;
  onChange: (v: Variant) => void;
}) {
  return (
    <div style={{ ...field, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F0E0C' }}>{label}</div>
        <div style={{ fontSize: 12, color: '#a39d92' }}>{rowHint}</div>
      </div>
      <div style={segwrap}>
        {(['a', 'b', 'c'] as Variant[]).map((v) => (
          <button key={v} type="button" onClick={() => onChange(v)} style={{ ...seg, ...(value === v ? segOn : {}) }}>
            {v.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

const tabbar: React.CSSProperties = { display: 'flex', gap: 6, marginBottom: 18 };
const tabBtn: React.CSSProperties = {
  padding: '9px 18px', borderRadius: 9, border: '1px solid #E2DDD3', background: '#fff',
  fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#5f5b53', fontFamily: 'Inter, system-ui, sans-serif',
};
const tabOn: React.CSSProperties = { background: '#0F0E0C', color: '#fff', borderColor: '#0F0E0C' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16 };
const divider: React.CSSProperties = { height: 1, background: '#EEE9E0', margin: '4px 0' };
const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#3f3b34' };
const hint: React.CSSProperties = { fontSize: 12, color: '#a39d92', lineHeight: 1.45 };
const tip: React.CSSProperties = { fontSize: 12.5, color: '#a39d92', lineHeight: 1.5, margin: '4px 0 0' };
const link: React.CSSProperties = { color: '#9E2A2B', textDecoration: 'none', fontWeight: 600 };
const input: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, color: '#0F0E0C', background: '#FFFFFF',
  border: '1px solid #E2DDD3', borderRadius: 9, padding: '10px 12px', outline: 'none', maxWidth: 280,
};
const segwrap: React.CSSProperties = { display: 'flex', gap: 6 };
const seg: React.CSSProperties = {
  width: 42, height: 36, borderRadius: 8, border: '1px solid #E2DDD3', background: '#fff',
  fontWeight: 700, fontSize: 12.5, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', color: '#5f5b53',
};
const segWide: React.CSSProperties = {
  flex: 1, minWidth: 80, height: 38, borderRadius: 8, border: '1px solid #E2DDD3', background: '#fff',
  fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', color: '#5f5b53',
};
const segOn: React.CSSProperties = { background: '#0F0E0C', color: '#fff', borderColor: '#0F0E0C' };
const saveRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 16, marginTop: 22 };
const saveBtn: React.CSSProperties = {
  background: '#0F0E0C', color: '#fff', border: 'none', borderRadius: 10,
  padding: '13px 26px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
};
