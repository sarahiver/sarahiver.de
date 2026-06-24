'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TIERS, tierForCount, type Tier } from '@/lib/funnel';
import { scheduleDowngrade, cancelPendingDowngrade } from './actions';

const TIER_ORDER: Tier[] = ['std', 'p3', 'p6', 'p9', 'p11'];
const rank = (t: Tier) => TIER_ORDER.indexOf(t);

function formatDe(iso: string | null): string {
  if (!iso) return 'zum Ende der laufenden Periode';
  try {
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

export interface DowngradeAddon {
  key: string;
  label: string;
}

interface Props {
  slug: string;
  addons: DowngradeAddon[];
  currentTier: Tier;
  pending?: { tier: Tier; effectiveAt: string | null; keepKeys: string[] } | null;
}

export default function DowngradeClient({ slug, addons, currentTier, pending }: Props) {
  const router = useRouter();

  // ----- Pending-Modus: geplanter Wechsel + Aufheben -----
  if (pending) {
    return <PendingNotice slug={slug} pending={pending} addons={addons} onChange={() => router.refresh()} />;
  }

  // ----- Auswahl-Modus: behalten / abwählen -----
  const [keep, setKeep] = useState<Set<string>>(new Set(addons.map((a) => a.key)));
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState('');

  const keptCount = keep.size;
  const newTier = tierForCount(keptCount);
  const isDowngrade = rank(newTier) < rank(currentTier);
  const newMonthly = TIERS[newTier].monthly;
  const droppedCount = addons.length - keptCount;

  function toggle(key: string) {
    if (status === 'saving') return;
    setKeep((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function confirm() {
    if (!isDowngrade) return;
    setStatus('saving');
    setError('');
    const res = await scheduleDowngrade(slug, Array.from(keep));
    if ('error' in res) {
      setStatus('error');
      setError(res.error);
      return;
    }
    router.refresh();
  }

  if (addons.length === 0) return null;

  return (
    <div>
      <p style={hint}>
        Wählt ab, was ihr nicht mehr braucht. Der Wechsel greift <strong>zum Periodenende</strong> — bis
        dahin bleibt alles online, und eure Inhalte gehen nicht verloren.
      </p>
      <div style={list}>
        {addons.map((a) => {
          const on = keep.has(a.key);
          return (
            <label key={a.key} style={{ ...rowS, ...(on ? {} : rowOff) }}>
              <input type="checkbox" checked={on} onChange={() => toggle(a.key)} style={cb} />
              <span style={{ textDecoration: on ? 'none' : 'line-through', color: on ? 'var(--ink,#0F0E0C)' : '#a39d92' }}>
                {a.label}
              </span>
              {!on && <span style={dropTag}>wird entfernt</span>}
            </label>
          );
        })}
      </div>

      {droppedCount > 0 && (
        <div style={summary}>
          <div style={{ flex: 1, minWidth: 220 }}>
            {isDowngrade ? (
              <>
                <strong style={{ fontSize: 14 }}>
                  Neue Stufe: {TIERS[newTier].label} — {newMonthly} €/Monat
                </strong>
                <p style={note}>
                  {droppedCount} {droppedCount === 1 ? 'Bereich wird' : 'Bereiche werden'} zum Periodenende
                  ausgeblendet. Inhalte bleiben gespeichert und kommen beim erneuten Dazubuchen zurück.
                </p>
              </>
            ) : (
              <>
                <strong style={{ fontSize: 14 }}>Noch dieselbe Stufe</strong>
                <p style={note}>
                  Das Abwählen reicht noch nicht für eine günstigere Stufe ({TIERS[currentTier].label} bleibt).
                  Wählt mehr ab, um zu sparen.
                </p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={confirm}
            disabled={!isDowngrade || status === 'saving'}
            style={{ ...dgBtn, opacity: !isDowngrade || status === 'saving' ? 0.5 : 1 }}
          >
            {status === 'saving' ? 'Wird geplant …' : 'Wechsel zum Periodenende planen'}
          </button>
        </div>
      )}
      {status === 'error' && <p style={errMsg}>{error}</p>}
    </div>
  );
}

function PendingNotice({
  slug,
  pending,
  addons,
  onChange,
}: {
  slug: string;
  pending: { tier: Tier; effectiveAt: string | null; keepKeys: string[] };
  addons: DowngradeAddon[];
  onChange: () => void;
}) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState('');

  const keepLabels = addons.filter((a) => pending.keepKeys.includes(a.key)).map((a) => a.label);
  const dropLabels = addons.filter((a) => !pending.keepKeys.includes(a.key)).map((a) => a.label);

  async function cancel() {
    setStatus('saving');
    setError('');
    const res = await cancelPendingDowngrade(slug);
    if ('error' in res) {
      setStatus('error');
      setError(res.error);
      return;
    }
    onChange();
  }

  return (
    <div style={pendingBox}>
      <strong style={{ fontSize: 15 }}>Geplanter Wechsel: {TIERS[pending.tier].label} ({TIERS[pending.tier].monthly} €/Monat)</strong>
      <p style={{ ...note, marginTop: 6 }}>
        Wirksam am <strong>{formatDe(pending.effectiveAt)}</strong>. Bis dahin bleibt alles unverändert online.
      </p>
      {dropLabels.length > 0 && (
        <p style={{ ...note, marginTop: 8 }}>
          Wird ausgeblendet: {dropLabels.join(', ')}. Inhalte bleiben gespeichert.
        </p>
      )}
      {keepLabels.length > 0 && (
        <p style={{ ...note, marginTop: 4 }}>Bleibt: {keepLabels.join(', ')}.</p>
      )}
      <button type="button" onClick={cancel} disabled={status === 'saving'} style={cancelBtn}>
        {status === 'saving' ? 'Wird aufgehoben …' : 'Wechsel aufheben'}
      </button>
      {status === 'error' && <p style={errMsg}>{error}</p>}
    </div>
  );
}

const hint: React.CSSProperties = { fontSize: 14, color: '#5f5b53', lineHeight: 1.5, margin: '0 0 14px' };
const list: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8 };
const rowS: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '11px 14px',
  border: '1px solid #E2DDD3',
  borderRadius: 10,
  background: '#FFFFFF',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Inter, system-ui, sans-serif',
};
const rowOff: React.CSSProperties = { background: '#FAF8F4', borderColor: '#EBE7DF' };
const cb: React.CSSProperties = { width: 17, height: 17, accentColor: '#0F0E0C' };
const dropTag: React.CSSProperties = {
  marginLeft: 'auto',
  fontSize: 11,
  fontWeight: 600,
  color: '#7A1F1A',
  background: '#FCEEEC',
  border: '1px solid #F3CFC9',
  padding: '3px 8px',
  borderRadius: 999,
};
const summary: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  flexWrap: 'wrap',
  marginTop: 18,
  padding: '16px 18px',
  background: '#F7F5F1',
  border: '1px solid #E2DDD3',
  borderRadius: 12,
};
const note: React.CSSProperties = { margin: '4px 0 0', fontSize: 13, lineHeight: 1.5, color: '#5f5b53' };
const dgBtn: React.CSSProperties = {
  background: '#7A1F1A',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 10,
  padding: '13px 20px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};
const pendingBox: React.CSSProperties = {
  background: '#FBF2E9',
  border: '1px solid #ECD9C2',
  borderRadius: 12,
  padding: '20px 22px',
};
const cancelBtn: React.CSSProperties = {
  marginTop: 14,
  background: 'transparent',
  color: '#0F0E0C',
  border: '1px solid #0F0E0C',
  borderRadius: 9,
  padding: '10px 18px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};
const errMsg: React.CSSProperties = {
  marginTop: 14,
  padding: '12px 14px',
  background: '#FCEEEC',
  border: '1px solid #F3CFC9',
  borderRadius: 8,
  color: '#7A1F1A',
  fontSize: 14,
};
