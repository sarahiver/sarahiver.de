'use client';

import { useState, useTransition } from 'react';
import { signInPassword, sendMagicLink } from './actions';

export default function LoginForm({ linkError }: { linkError: boolean }) {
  const [tab, setTab] = useState<'magic' | 'password'>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(linkError ? 'Der Link war ungültig oder abgelaufen. Bitte neu anfordern.' : null);
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  const doMagic = () => {
    setMsg(null);
    start(async () => {
      const r = await sendMagicLink(email);
      if (r.error) setMsg(r.error);
      else setSent(true);
    });
  };

  const doPassword = () => {
    setMsg(null);
    start(async () => {
      const r = await signInPassword(email, password);
      if (r?.error) setMsg(r.error);
    });
  };

  return (
    <div className="au-wrap">
      <style>{auStyles}</style>
      <h1 className="au-title">Anmelden</h1>
      <p className="au-lede">Euer Zugang zum Hochzeits-Dashboard.</p>

      <div className="au-tabs">
        <button className={`au-tab${tab === 'magic' ? ' on' : ''}`} onClick={() => setTab('magic')} type="button">Magic-Link</button>
        <button className={`au-tab${tab === 'password' ? ' on' : ''}`} onClick={() => setTab('password')} type="button">Passwort</button>
      </div>

      {sent ? (
        <div className="au-ok">Wir haben euch einen Login-Link geschickt. Schaut in euer Postfach 🤍</div>
      ) : (
        <div className="au-card">
          <label className="au-l">E-Mail</label>
          <input className="au-i" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ihr@email.de" />

          {tab === 'password' && (
            <>
              <label className="au-l">Passwort</label>
              <input className="au-i" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </>
          )}

          {msg && <div className="au-err">{msg}</div>}

          {tab === 'magic' ? (
            <button className="au-btn" type="button" onClick={doMagic} disabled={pending || !email}>
              {pending ? 'Senden …' : 'Login-Link senden'}
            </button>
          ) : (
            <button className="au-btn" type="button" onClick={doPassword} disabled={pending || !email || !password}>
              {pending ? 'Anmelden …' : 'Anmelden'}
            </button>
          )}

          <a className="au-link" href="/forgot-password">Passwort vergessen?</a>
        </div>
      )}
    </div>
  );
}

export const auStyles = `
.au-wrap{max-width:420px;margin:0 auto;padding:64px 20px;font-family:Inter,system-ui,sans-serif;color:#0F0E0C;}
.au-title{font-family:Fraunces,Georgia,serif;font-size:34px;font-weight:600;margin:0 0 6px;}
.au-lede{color:#5f5b53;font-size:14px;margin:0 0 24px;}
.au-tabs{display:flex;gap:6px;margin-bottom:16px;}
.au-tab{flex:1;border:1px solid #DAD4C7;background:#FAF7F0;border-radius:8px;padding:9px;font-size:13px;cursor:pointer;color:#0F0E0C;}
.au-tab.on{border-color:#0F0E0C;background:#0F0E0C;color:#fff;}
.au-card{background:#fff;border:1px solid #E7E2D6;border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:8px;}
.au-l{font-size:12px;color:#5f5b53;margin-top:4px;}
.au-i{border:1px solid #DAD4C7;border-radius:8px;padding:11px 12px;font-size:14px;background:#fff;color:#0F0E0C;}
.au-i:focus{outline:none;border-color:#0F0E0C;}
.au-btn{margin-top:10px;background:#0F0E0C;color:#fff;border:none;border-radius:10px;padding:13px;font-size:14px;font-weight:600;cursor:pointer;}
.au-btn:disabled{opacity:.45;cursor:not-allowed;}
.au-link{font-size:12px;color:#8a857c;margin-top:10px;text-decoration:underline;}
.au-err{background:#FBE9E5;border:1px solid #F0C5BC;color:#A8301B;border-radius:8px;padding:9px 11px;font-size:13px;}
.au-ok{background:#EAF3EC;border:1px solid #BBD8C2;color:#2C6B41;border-radius:10px;padding:16px;font-size:14px;line-height:1.5;}
`;
