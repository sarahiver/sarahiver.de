'use client';

import { useState, useEffect } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import {
  INITIAL_STATE,
  buildSubmitPayload,
  isDeadlinePassed,
  readConfig,
  syncGuests,
  type RsvpState,
} from './shared';
import { RsvpHeader, RsvpClosed, RsvpSuccess, CustomQuestionField } from './shared-ui';

/**
 * RSVP Variante A — Klassisches Formular
 *
 * Alle Felder auf einer Seite. Toggle für Zusage/Absage,
 * konditionale Felder werden bei Zusage eingeblendet (max-height-Transition).
 * Begleitpersonen-Cards erscheinen dynamisch bei persons > 1.
 *
 * Hydration-Note: `closed` wird NICHT serverseitig evaluiert (würde
 * Date.now() benötigen → SSR-Mismatch). Stattdessen erst nach Hydration
 * in einem useEffect — wenn die Deadline schon vorbei ist, gibt es einen
 * kurzen "Flash" des Formulars, das ist akzeptabel.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

export default function RsvpVariantA({ tokens, content }: Props) {
  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const config = readConfig(content, {
    name1: tokens.couple_name_1,
    name2: tokens.couple_name_2,
  });
  const [state, setState] = useState<RsvpState>(INITIAL_STATE);
  const [submitted, setSubmitted] = useState(false);
  const [closed, setClosed] = useState(false);

  // Deadline-Check nur nach Hydration (SSR-safe)
  useEffect(() => {
    setClosed(isDeadlinePassed(config.deadline, new Date()));
  }, [config.deadline]);

  if (closed) {
    return (
      <div className="rsvp rsvpA-wrap" data-style-rsvp={style}>
        <RsvpHeader config={config} />
        <RsvpClosed />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rsvp rsvpA-wrap" data-style-rsvp={style}>
        <RsvpHeader config={config} />
        <RsvpSuccess
          firstName={state.name.split(' ')[0] || ''}
          couple={config.couple}
          onEdit={() => setSubmitted(false)}
        />
      </div>
    );
  }

  const showAttending = state.attending === true;

  const updateField = <K extends keyof RsvpState>(field: K, value: RsvpState[K]) => {
    setState((s) => ({ ...s, [field]: value }));
  };

  const updateGuest = (idx: number, field: keyof RsvpState['guests'][0], value: string) => {
    setState((s) => ({
      ...s,
      guests: s.guests.map((g, i) => (i === idx ? { ...g, [field]: value } : g)),
    }));
  };

  const updateCustomAnswer = (questionId: string, value: string) => {
    setState((s) => ({
      ...s,
      custom_answers: { ...s.custom_answers, [questionId]: value },
    }));
  };

  const handlePersonsChange = (delta: number) => {
    setState((s) => {
      const persons = Math.max(1, Math.min(20, s.persons + delta));
      return syncGuests({ ...s, persons });
    });
  };

  const handleAttending = (value: boolean) => {
    setState((s) => syncGuests({ ...s, attending: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.attending === null || !state.name.trim()) return;
    const payload = buildSubmitPayload(state, config);
    // TODO: Submit-Call zu Supabase (lib/supabase.ts -> submitRSVP)
    // Vorerst: optimistisches Success-State
    console.log('[RSVP A submit]', payload);
    setSubmitted(true);
  };

  return (
    <div className="rsvp rsvpA-wrap" data-style-rsvp={style}>
      <RsvpHeader config={config} />

      <form className="rsvpA" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="A-name">Name *</label>
          <input
            id="A-name"
            type="text"
            required
            value={state.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Wie heißt du?"
          />
        </div>

        <div className="field">
          <label htmlFor="A-email">E-Mail (optional)</label>
          <input
            id="A-email"
            type="email"
            value={state.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="für die Bestätigung"
          />
        </div>

        <div>
          <label className="rsvpA-section-label">Kommst du? *</label>
          <div className="toggle-row">
            <button
              type="button"
              className={`toggle-opt ${state.attending === true ? 'is-on' : ''}`}
              onClick={() => handleAttending(true)}
              aria-pressed={state.attending === true}
            >
              <span className="opt-emoji">🎉</span>
              <span className="opt-text">Ja, wir kommen</span>
            </button>
            <button
              type="button"
              className={`toggle-opt ${state.attending === false ? 'is-on' : ''}`}
              onClick={() => handleAttending(false)}
              aria-pressed={state.attending === false}
            >
              <span className="opt-emoji">💌</span>
              <span className="opt-text">Leider nicht</span>
            </button>
          </div>
        </div>

        <div className={`rsvpA-conditional ${showAttending ? '' : 'is-hidden'}`}>
          <div className="field">
            <label>Personen insgesamt</label>
            <div className="stepper" role="group" aria-label="Personenanzahl">
              <button
                type="button"
                onClick={() => handlePersonsChange(-1)}
                disabled={state.persons <= 1}
                aria-label="weniger Personen"
              >
                −
              </button>
              <span className="count">{state.persons}</span>
              <button
                type="button"
                onClick={() => handlePersonsChange(+1)}
                disabled={state.persons >= 20}
                aria-label="mehr Personen"
              >
                +
              </button>
            </div>
          </div>

          {state.guests.map((guest, i) => (
            <div key={i} className="rsvpA-guest-card">
              <div className="rsvpA-guest-head">
                <span>Begleitung {i + 2}</span>
              </div>
              <div className="field">
                <label htmlFor={`A-guest-name-${i}`}>Name</label>
                <input
                  id={`A-guest-name-${i}`}
                  type="text"
                  value={guest.name}
                  onChange={(e) => updateGuest(i, 'name', e.target.value)}
                  placeholder="Name der Begleitperson"
                />
              </div>
              {(config.ask_dietary || config.ask_allergies) && (
                <div className="rsvpA-guest-grid">
                  {config.ask_dietary && (
                    <div className="field">
                      <label>Ernährung</label>
                      <input
                        type="text"
                        value={guest.dietary}
                        onChange={(e) => updateGuest(i, 'dietary', e.target.value)}
                        placeholder="z. B. vegetarisch"
                      />
                    </div>
                  )}
                  {config.ask_allergies && (
                    <div className="field">
                      <label>Allergien</label>
                      <input
                        type="text"
                        value={guest.allergies}
                        onChange={(e) => updateGuest(i, 'allergies', e.target.value)}
                        placeholder="z. B. Nüsse"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {config.ask_dietary && (
            <div className="field">
              <label>Deine Ernährungswünsche</label>
              <input
                type="text"
                value={state.dietary}
                onChange={(e) => updateField('dietary', e.target.value)}
                placeholder="z. B. vegetarisch, vegan"
              />
            </div>
          )}

          {config.ask_allergies && (
            <div className="field">
              <label>Allergien / Unverträglichkeiten</label>
              <input
                type="text"
                value={state.allergies}
                onChange={(e) => updateField('allergies', e.target.value)}
                placeholder="optional"
              />
            </div>
          )}

          {config.custom_questions.map((q) => (
            <CustomQuestionField
              key={q.id}
              question={q}
              value={state.custom_answers[q.id] ?? ''}
              onChange={(val) => updateCustomAnswer(q.id, val)}
            />
          ))}
        </div>

        <div className="field">
          <label htmlFor="A-msg">Nachricht ans Brautpaar (optional)</label>
          <textarea
            id="A-msg"
            value={state.message}
            onChange={(e) => updateField('message', e.target.value)}
            placeholder="Glückwünsche, Anekdoten, was auch immer"
          />
        </div>

        <div className="rsvpA-submit-row">
          <button
            type="submit"
            className="btn-primary"
            disabled={state.attending === null || !state.name.trim()}
          >
            Antwort abschicken
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
