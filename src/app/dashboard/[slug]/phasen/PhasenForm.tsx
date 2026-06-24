'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Variant } from '@/types/supabase';
import { savePhases, archivGoLiveNow } from './actions';

interface Props {
  slug: string;
  initial: {
    std_enabled: boolean;
    std_until: string | null;
    std_variant: Variant;
    archiv_enabled: boolean;
    archiv_from: string | null;
    archiv_message: string | null;
  };
}

// ISO → yyyy-MM-dd für <input type="date">
function toDateInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}
function fromDateInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v + 'T00:00:00');
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

export default function PhasenForm({ slug, initial }: Props) {
  const router = useRouter();
  const [stdEnabled, setStdEnabled] = useState(initial.std_enabled);
  const [stdUntil, setStdUntil] = useState(toDateInput(initial.std_until));
  const [stdVariant, setStdVariant] = useState<Variant>(initial.std_variant);
  const [archivEnabled, setArchivEnabled] = useState(initial.archiv_enabled);
  const [archivFrom, setArchivFrom] = useState(toDateInput(initial.archiv_from));
  const [archivMessage, setArchivMessage] = useState(initial.archiv_message ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [golive, setGolive] = useState<'idle' | 'saving'>('idle');
  const [msg, setMsg] = useState('');

  async function save() {
    setStatus('saving');
    setMsg('');
    const res = await savePhases({
      slug,
      std_enabled: stdEnabled,
      std_until: fromDateInput(stdUntil),
      std_variant: stdVariant,
      archiv_enabled: archivEnabled,
      archiv_from: fromDateInput(archivFrom),
      archiv_message: archivMessage,
    });
    if ('error' in res) {
      setStatus('error');
      setMsg(res.error);
      return;
    }
    setStatus('saved');
    router.refresh();
  }

  async function goLive() {
    setGolive('saving');
    setMsg('');
    const res = await archivGoLiveNow(slug);
    if ('error' in res) {
      setGolive('idle');
      setStatus('error');
      setMsg(res.error);
      return;
    }
    setArchivEnabled(true);
    setArchivFrom('');
    setGolive('idle');
    setStatus('saved');
    router.refresh();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* SAVE-THE-DATE */}
      <div style={card}>
        <div style={cardHead}>
          <div>
            <h3 style={h3}>Save-the-Date</h3>
            <p style={sub}>Eine schlanke Vorab-Seite: Hero (Namen, Bild, Datum, Ort) + Countdown.</p>
          </div>
          <Toggle on={stdEnabled} onChange={() => setStdEnabled((v) => !v)} />
        </div>

        {stdEnabled && (
          <div style={body}>
            <label style={field}>
              <span style={lbl}>Variante</span>
              <div style={segwrap}>
                {(['a', 'b', 'c'] as Variant[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setStdVariant(v)}
                    style={{ ...seg, ...(stdVariant === v ? segOn : {}) }}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            </label>
            <label style={field}>
              <span style={lbl}>Automatisch zur Hauptseite wechseln am</span>
              <input type="date" value={stdUntil} onChange={(e) => setStdUntil(e.target.value)} style={input} />
              <span style={hint}>Leer lassen = nur manuell (bleibt an, bis ihr ihn ausschaltet).</span>
            </label>
            <a href={`/${slug}?phase=std`} target="_blank" rel="noreferrer" style={previewLink}>
              Vorschau öffnen →
            </a>
          </div>
        )}
      </div>

      {/* ARCHIV */}
      <div style={card}>
        <div style={cardHead}>
          <div>
            <h3 style={h3}>Archiv</h3>
            <p style={sub}>Nach der Hochzeit: Hero + Danksagung + Fotoupload. (Download-Galerie folgt.)</p>
          </div>
          <Toggle on={archivEnabled} onChange={() => setArchivEnabled((v) => !v)} />
        </div>

        {archivEnabled && (
          <div style={body}>
            <label style={field}>
              <span style={lbl}>Danksagung</span>
              <textarea
                value={archivMessage}
                onChange={(e) => setArchivMessage(e.target.value)}
                placeholder="Danke, dass ihr diesen Tag mit uns gefeiert habt …"
                style={{ ...input, minHeight: 110, resize: 'vertical', lineHeight: 1.5 }}
              />
            </label>
            <label style={field}>
              <span style={lbl}>Automatisch online ab</span>
              <input type="date" value={archivFrom} onChange={(e) => setArchivFrom(e.target.value)} style={input} />
              <span style={hint}>Leer lassen = sofort online, sobald „an". Oder direkt:</span>
            </label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <button type="button" onClick={goLive} disabled={golive === 'saving'} style={goLiveBtn}>
                {golive === 'saving' ? 'Wird aktiviert …' : 'Archiv jetzt online stellen'}
              </button>
              <a href={`/${slug}?phase=archiv`} target="_blank" rel="noreferrer" style={previewLink}>
                Vorschau öffnen →
              </a>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button type="button" onClick={save} disabled={status === 'saving'} style={saveBtn}>
          {status === 'saving' ? 'Speichern …' : 'Speichern'}
        </button>
        {status === 'saved' && <span style={{ color: '#3F4A33', fontSize: 14 }}>Gespeichert ✓</span>}
        {status === 'error' && <span style={{ color: '#7A1F1A', fontSize: 14 }}>{msg}</span>}
      </div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={on}
      style={{
        width: 46,
        height: 28,
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        background: on ? '#9E2A2B' : '#D6D0C5',
        position: 'relative',
        transition: 'background .15s ease',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 21 : 3,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left .15s ease',
        }}
      />
    </button>
  );
}

const card: React.CSSProperties = { border: '1px solid #E2DDD3', borderRadius: 14, background: '#FFFFFF', padding: 22 };
const cardHead: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 };
const h3: React.CSSProperties = { fontSize: 18, fontWeight: 700, margin: 0, fontFamily: 'Fraunces, Georgia, serif' };
const sub: React.CSSProperties = { margin: '4px 0 0', fontSize: 13.5, color: '#5f5b53', lineHeight: 1.5 };
const body: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18, paddingTop: 18, borderTop: '1px solid #EEE9E0' };
const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#3f3b34' };
const hint: React.CSSProperties = { fontSize: 12, color: '#a39d92' };
const input: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 14,
  color: '#0F0E0C',
  background: '#FFFFFF',
  border: '1px solid #E2DDD3',
  borderRadius: 9,
  padding: '10px 12px',
  outline: 'none',
  maxWidth: 280,
};
const segwrap: React.CSSProperties = { display: 'flex', gap: 6 };
const seg: React.CSSProperties = {
  width: 44,
  height: 38,
  borderRadius: 9,
  border: '1px solid #E2DDD3',
  background: '#fff',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'JetBrains Mono, monospace',
  color: '#5f5b53',
};
const segOn: React.CSSProperties = { background: '#0F0E0C', color: '#fff', borderColor: '#0F0E0C' };
const previewLink: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#9E2A2B', textDecoration: 'none' };
const saveBtn: React.CSSProperties = {
  background: '#0F0E0C',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '13px 26px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};
const goLiveBtn: React.CSSProperties = {
  background: '#9E2A2B',
  color: '#fff',
  border: 'none',
  borderRadius: 9,
  padding: '11px 18px',
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
};
