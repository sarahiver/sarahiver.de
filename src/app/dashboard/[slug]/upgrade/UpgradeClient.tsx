'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardIcon from '@/components/dashboard/DashboardIcon';
import { TIERS, tierForCount, type Tier } from '@/lib/funnel';
import { addBereiche } from './actions';

export interface AddableItem {
  key: string;
  label: string;
  desc: string;
  icon: string;
}

interface Props {
  slug: string;
  addable: AddableItem[];
  currentAddonCount: number;
  currentTier: Tier;
  isTrialing: boolean;
}

export default function UpgradeClient({ slug, addable, currentAddonCount, currentTier, isTrialing }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const newCount = currentAddonCount + selected.size;
  const newTier = tierForCount(newCount);

  const currentMonthly = TIERS[currentTier].monthly;
  const newMonthly = TIERS[newTier].monthly;
  const delta = newMonthly - currentMonthly;
  const tierChanges = newTier !== currentTier;

  function toggle(key: string) {
    if (status === 'saving') return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function confirm() {
    if (selected.size === 0) return;
    setStatus('saving');
    setMessage('');
    const res = await addBereiche(slug, Array.from(selected));
    if ('error' in res) {
      setStatus('error');
      setMessage(res.error);
      return;
    }
    setStatus('done');
    setMessage(
      res.charged
        ? 'Freigeschaltet — die anteilige Differenz wurde berechnet. Die neuen Bereiche stehen jetzt in eurer Navigation.'
        : tierChanges
          ? 'Freigeschaltet — die neue Stufe greift nach eurer Testphase. Die Bereiche könnt ihr schon jetzt befüllen.'
          : 'Freigeschaltet — die neuen Bereiche stehen jetzt in eurer Navigation.',
    );
    setSelected(new Set());
    router.refresh();
  }

  if (addable.length === 0) {
    return (
      <div style={doneBox}>
        <strong style={{ fontSize: 15 }}>Ihr habt schon alles 🎉</strong>
        <p style={{ margin: '6px 0 0', color: '#5f5b53', fontSize: 14 }}>
          Alle verfügbaren Bereiche sind gebucht. Es gibt nichts mehr nachzubuchen.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={grid}>
        {addable.map((c) => {
          const on = selected.has(c.key);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => toggle(c.key)}
              style={{ ...card, ...(on ? cardOn : {}) }}
              disabled={status === 'saving'}
            >
              <span style={cardHead}>
                <span style={iconWrap}>
                  <DashboardIcon name={c.icon} size={16} />
                </span>
                <span style={cardTitle}>{c.label}</span>
                <span style={{ ...checkbox, ...(on ? checkboxOn : {}) }}>
                  {on && <DashboardIcon name="check" size={11} />}
                </span>
              </span>
              <span style={cardDesc}>{c.desc}</span>
            </button>
          );
        })}
      </div>

      {selected.size > 0 && (
        <div style={summary}>
          <div style={{ flex: 1, minWidth: 220 }}>
            {tierChanges ? (
              <>
                <strong style={{ fontSize: 14 }}>
                  Neue Stufe: {TIERS[newTier].label} — {newMonthly} €/Monat
                </strong>
                <p style={summaryNote}>
                  {delta > 0 ? `+${delta} €/Monat gegenüber jetzt (${currentMonthly} €). ` : ''}
                  {isTrialing
                    ? 'Während eurer Testphase fällt nichts an — der neue Preis greift erst danach.'
                    : 'Die anteilige Differenz für den laufenden Monat wird sofort berechnet.'}
                </p>
              </>
            ) : (
              <>
                <strong style={{ fontSize: 14 }}>Im aktuellen Paket enthalten</strong>
                <p style={summaryNote}>
                  {selected.size === 1 ? 'Dieser Bereich' : 'Diese Bereiche'} {selected.size === 1 ? 'ist' : 'sind'}{' '}
                  von eurer Stufe ({TIERS[currentTier].label}) bereits abgedeckt — kein Aufpreis.
                </p>
              </>
            )}
          </div>
          <button type="button" onClick={confirm} style={confirmBtn} disabled={status === 'saving'}>
            {status === 'saving'
              ? 'Wird freigeschaltet …'
              : `${selected.size} ${selected.size === 1 ? 'Bereich' : 'Bereiche'} freischalten`}
          </button>
        </div>
      )}

      {status === 'done' && <p style={okMsg}>{message}</p>}
      {status === 'error' && <p style={errMsg}>{message}</p>}
    </div>
  );
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  gap: 12,
};
const card: React.CSSProperties = {
  textAlign: 'left',
  background: '#FFFFFF',
  border: '1px solid #E2DDD3',
  borderRadius: 12,
  padding: 16,
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  fontFamily: 'Inter, system-ui, sans-serif',
  transition: 'border-color .12s ease, box-shadow .12s ease',
};
const cardOn: React.CSSProperties = {
  borderColor: '#0F0E0C',
  boxShadow: '0 0 0 1px #0F0E0C',
};
const cardHead: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10 };
const iconWrap: React.CSSProperties = {
  display: 'inline-flex',
  width: 28,
  height: 28,
  borderRadius: 8,
  background: '#F2EFE9',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#0F0E0C',
  flexShrink: 0,
};
const cardTitle: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: '#0F0E0C', flex: 1 };
const cardDesc: React.CSSProperties = { fontSize: 13, lineHeight: 1.5, color: '#5f5b53' };
const checkbox: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 6,
  border: '1px solid #D6D0C5',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#FFFFFF',
  flexShrink: 0,
};
const checkboxOn: React.CSSProperties = { background: '#0F0E0C', borderColor: '#0F0E0C' };
const summary: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  flexWrap: 'wrap',
  marginTop: 20,
  padding: '16px 18px',
  background: '#F7F5F1',
  border: '1px solid #E2DDD3',
  borderRadius: 12,
};
const summaryNote: React.CSSProperties = { margin: '4px 0 0', fontSize: 13, lineHeight: 1.5, color: '#5f5b53' };
const confirmBtn: React.CSSProperties = {
  background: '#0F0E0C',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 10,
  padding: '13px 22px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};
const doneBox: React.CSSProperties = {
  background: '#F1F4EF',
  border: '1px solid #D8E0CF',
  borderRadius: 12,
  padding: 20,
};
const okMsg: React.CSSProperties = {
  marginTop: 16,
  padding: '12px 14px',
  background: '#F1F4EF',
  border: '1px solid #D8E0CF',
  borderRadius: 8,
  color: '#3F4A33',
  fontSize: 14,
  lineHeight: 1.5,
};
const errMsg: React.CSSProperties = {
  marginTop: 16,
  padding: '12px 14px',
  background: '#FCEEEC',
  border: '1px solid #F3CFC9',
  borderRadius: 8,
  color: '#7A1F1A',
  fontSize: 14,
  lineHeight: 1.5,
};
