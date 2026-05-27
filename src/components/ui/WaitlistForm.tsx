'use client';

import { useState, FormEvent } from 'react';
import { CTA } from '@/lib/content';

interface WaitlistFormProps {
  placeholder?: string;
  cta?: string;
  variant?: 'light' | 'dark';
  showPrivacy?: boolean;
}

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function WaitlistForm({
  placeholder = CTA.waitlistPh,
  cta = CTA.waitlistCta,
  variant = 'light',
  showPrivacy = true,
}: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === 'loading') return;
    if (honeypot) {
      setState('error');
      setErrorMessage('Spam erkannt');
      return;
    }
    setState('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Etwas ist schiefgelaufen.');
      }
      setState('success');
      setEmail('');
    } catch (err) {
      setState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Etwas ist schiefgelaufen.');
    }
  };

  if (state === 'success') {
    return (
      <div
        className="p-5 rounded-2xl border flex items-center gap-3"
        style={{
          background: variant === 'dark' ? 'rgba(138,154,123,0.15)' : 'var(--color-sage-soft)',
          borderColor: 'var(--color-sage)',
          color: variant === 'dark' ? '#fff' : 'var(--color-sage-deep)',
        }}
      >
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
          style={{ background: 'var(--color-sage-deep)', color: '#fff' }}
        >
          ✓
        </span>
        <p className="font-medium">{CTA.success}</p>
      </div>
    );
  }

  const isDark = variant === 'dark';

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none -left-[9999px]"
      />

      {/* Combined input + button (pill style) */}
      <div
        className="flex items-center gap-2 p-1.5 rounded-2xl border transition-all focus-within:shadow-card"
        style={{
          background: isDark ? 'rgba(255,255,255,0.06)' : 'var(--color-paper-warm, #fff)',
          borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'var(--color-rule)',
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-0 outline-none px-4 py-2 text-[15px]"
          style={{ color: isDark ? '#fff' : 'var(--color-ink)' }}
          disabled={state === 'loading'}
        />
        <button
          type="submit"
          disabled={state === 'loading' || !email}
          className="h-11 px-5 text-sm font-medium tracking-wide rounded-xl transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2 flex-shrink-0 text-white"
          style={{
            background: 'var(--color-terra)',
            boxShadow: '0 6px 16px -8px rgba(181,116,106,0.6)',
          }}
        >
          {state === 'loading' ? 'Wird gesendet…' : cta}
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {state === 'error' && <p className="mt-3 text-sm text-red-700">{errorMessage}</p>}

      {showPrivacy && (
        <p
          className="mt-3 text-xs leading-relaxed max-w-md"
          style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-muted)' }}
        >
          {CTA.privacy}
        </p>
      )}
    </form>
  );
}
