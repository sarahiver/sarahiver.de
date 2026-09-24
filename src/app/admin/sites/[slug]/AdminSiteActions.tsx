'use client';

import { useState, useTransition } from 'react';
import { adminResendLoginLink, adminResendContractMail } from '@/app/admin/actions';

/** Die beiden erlaubten Admin-Aktionen. Die Prüfung passiert serverseitig. */
export default function AdminSiteActions({ slug, canResendContract }: { slug: string; canResendContract: boolean }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (fn: (slug: string) => Promise<{ ok: boolean; message: string }>) => {
    setMsg(null);
    startTransition(async () => {
      const res = await fn(slug);
      setMsg({ ok: res.ok, text: res.message });
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
        <button type="button" style={btn} disabled={pending} onClick={() => run(adminResendLoginLink)}>
          Login-Link erneut senden
        </button>
        <button
          type="button"
          style={{ ...btn, opacity: canResendContract ? 1 : 0.5 }}
          disabled={pending || !canResendContract}
          onClick={() => run(adminResendContractMail)}
        >
          Vertragsbestätigung erneut senden
        </button>
      </div>
      {msg && (
        <p style={{ marginTop: 10, fontSize: 13, color: msg.ok ? '#1f7a45' : '#a62828' }}>{msg.text}</p>
      )}
    </div>
  );
}

const btn: React.CSSProperties = {
  minHeight: 38,
  padding: '0 16px',
  border: 0,
  borderRadius: 6,
  background: '#1a1714',
  color: '#fff',
  fontSize: 13,
  cursor: 'pointer',
};
