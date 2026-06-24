'use client';

import { useState } from 'react';

/**
 * ContactForm — Client-Insel für /kontakt.
 *
 * Bewusst KEIN <form>-Tag (Next/Artifact-Konvention) — Submit über onClick.
 * Honeypot-Feld `company` ist visuell versteckt und bleibt bei echten Usern leer.
 */

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState(''); // Honeypot
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const disabled = status === 'sending';

  async function submit() {
    setError('');

    if (!name.trim()) return setError('Bitte gib deinen Namen an.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setError('Bitte gib eine gültige E-Mail-Adresse an.');
    if (!message.trim()) return setError('Bitte schreib uns eine Nachricht.');

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, company }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setError(data?.error || 'Die Nachricht konnte nicht gesendet werden.');
        return;
      }
      setStatus('sent');
    } catch {
      setStatus('error');
      setError('Verbindungsfehler. Bitte versuch es später erneut.');
    }
  }

  if (status === 'sent') {
    return (
      <div style={successBox}>
        <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, marginBottom: 6 }}>
          Nachricht ist raus 🤍
        </div>
        <p style={{ color: '#5f5b53', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
          Danke! Wir haben deine Nachricht erhalten und melden uns zeitnah unter{' '}
          <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={row}>
        <label style={labelStyle}>
          Name
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Euer Name"
            disabled={disabled}
          />
        </label>
        <label style={labelStyle}>
          E-Mail
          <input
            style={inputStyle}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ihr@beispiel.de"
            disabled={disabled}
          />
        </label>
      </div>

      <label style={labelStyle}>
        Betreff <span style={{ color: '#a39d92', fontWeight: 400 }}>(optional)</span>
        <input
          style={inputStyle}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Worum geht's?"
          disabled={disabled}
        />
      </label>

      <label style={labelStyle}>
        Nachricht
        <textarea
          style={{ ...inputStyle, minHeight: 140, resize: 'vertical', lineHeight: 1.5 }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Eure Nachricht an uns …"
          disabled={disabled}
        />
      </label>

      {/* Honeypot — für Menschen unsichtbar */}
      <input
        type="text"
        name="company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />

      {error && <p style={errorStyle}>{error}</p>}

      <button style={{ ...buttonStyle, opacity: disabled ? 0.6 : 1 }} onClick={submit} disabled={disabled}>
        {status === 'sending' ? 'Wird gesendet …' : 'Nachricht senden'}
      </button>

      <p style={{ fontSize: 12, color: '#a39d92', lineHeight: 1.5, margin: 0 }}>
        Mit dem Absenden stimmt ihr zu, dass wir eure Angaben zur Bearbeitung der Anfrage
        verarbeiten. Details in unserer{' '}
        <a href="/datenschutz" style={{ color: '#a39d92', textDecoration: 'underline' }}>
          Datenschutzerklärung
        </a>
        .
      </p>
    </div>
  );
}

const row: React.CSSProperties = { display: 'flex', gap: 16, flexWrap: 'wrap' };
const labelStyle: React.CSSProperties = {
  flex: '1 1 200px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 13,
  fontWeight: 600,
  color: '#3f3b34',
};
const inputStyle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 15,
  fontWeight: 400,
  color: '#0F0E0C',
  background: '#FFFFFF',
  border: '1px solid #E2DDD3',
  borderRadius: 10,
  padding: '12px 14px',
  outline: 'none',
};
const buttonStyle: React.CSSProperties = {
  background: '#0F0E0C',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 10,
  padding: '14px 24px',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Inter, system-ui, sans-serif',
  marginTop: 4,
};
const errorStyle: React.CSSProperties = {
  color: '#B4231F',
  fontSize: 13,
  margin: 0,
  background: '#FCEEEC',
  border: '1px solid #F3CFC9',
  borderRadius: 8,
  padding: '10px 12px',
};
const successBox: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E2DDD3',
  borderRadius: 14,
  padding: 28,
};
