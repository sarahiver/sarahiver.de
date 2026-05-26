'use client';

import { useState, FormEvent } from 'react';
import { CTA } from '@/lib/content';

interface WaitlistFormProps {
  /**
   * Layout-Variante:
   * - 'inline': Email + Button nebeneinander (Hero, CTA-Section)
   * - 'stacked': Email + Button untereinander (kompakte Bereiche)
   */
  variant?: 'inline' | 'stacked';
  /**
   * Honeypot-Feld zur Spam-Abwehr (Bots füllen alle Felder, Menschen nicht).
   */
  showPrivacy?: boolean;
}

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function WaitlistForm({
  variant = 'inline',
  showPrivacy = true,
}: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === 'loading') return;

    // Honeypot-Check: Wenn gefüllt = Bot
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
      <div className="p-6 rounded-xl border border-[oklch(0.46_0.04_145)] bg-[oklch(0.86_0.025_145)]/30">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 rounded-full bg-[oklch(0.46_0.04_145)] text-white flex items-center justify-center text-xs">
            ✓
          </span>
          <p className="text-ink font-medium">{CTA.success}</p>
        </div>
      </div>
    );
  }

  const inputClasses =
    'w-full h-13 px-5 text-base text-ink bg-paper-warm border border-rule rounded-full placeholder:text-muted-2 focus:outline-none focus:border-ink transition-colors';

  const buttonClasses =
    'h-13 px-6 text-sm font-medium tracking-wide rounded-full bg-ink text-paper-warm border border-ink transition-all duration-200 hover:-translate-y-px hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2.5';

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      {/* Honeypot: visuell versteckt, screenreader auch */}
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

      <div className={variant === 'inline' ? 'flex flex-col sm:flex-row gap-3' : 'flex flex-col gap-3'}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={CTA.placeholder}
          className={`${inputClasses} ${variant === 'inline' ? 'sm:flex-1' : ''}`}
          disabled={state === 'loading'}
        />
        <button type="submit" disabled={state === 'loading' || !email} className={buttonClasses}>
          {state === 'loading' ? 'Wird gesendet…' : CTA.cta}
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {state === 'error' && (
        <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
      )}

      {showPrivacy && (
        <p className="mt-4 text-xs text-muted leading-relaxed max-w-md">{CTA.privacy}</p>
      )}
    </form>
  );
}
