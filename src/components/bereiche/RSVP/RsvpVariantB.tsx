'use client';

import { useState, useEffect, useMemo } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import {
  INITIAL_STATE,
  buildSubmitPayload,
  isDeadlinePassed,
  readConfig,
  syncGuests,
  type RsvpState,
  type RsvpConfig,
} from './shared';
import { RsvpHeader, RsvpClosed, RsvpSuccess } from './shared-ui';

/**
 * RSVP Variante B — Slide-Stepper (Typeform-Style)
 *
 * Eine Frage pro Slide, Fortschrittsleiste oben, Weiter-Button.
 * Step-Liste wird dynamisch aus state aufgebaut (bei Absage Skips).
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

type StepId =
  | 'name'
  | 'attending'
  | 'persons'
  | 'guest'
  | 'dietary'
  | 'custom'
  | 'message'
  | 'summary';

interface Step {
  id: StepId;
  guestIndex?: number;
}

function buildSteps(state: RsvpState, config: RsvpConfig): Step[] {
  const steps: Step[] = [];
  steps.push({ id: 'name' });
  steps.push({ id: 'attending' });
  if (state.attending === true) {
    steps.push({ id: 'persons' });
    state.guests.forEach((_, i) => steps.push({ id: 'guest', guestIndex: i }));
    if (config.ask_dietary || config.ask_allergies) steps.push({ id: 'dietary' });
    if (config.custom_question) steps.push({ id: 'custom' });
  }
  steps.push({ id: 'message' });
  steps.push({ id: 'summary' });
  return steps;
}

export default function RsvpVariantB({ tokens, content }: Props) {
  const config = readConfig(content, {
    name1: tokens.couple_name_1,
    name2: tokens.couple_name_2,
  });
  const [state, setState] = useState<RsvpState>(INITIAL_STATE);
  const [submitted, setSubmitted] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [closed, setClosed] = useState(false);

  // Deadline-Check nach Hydration (SSR-safe)
  useEffect(() => {
    setClosed(isDeadlinePassed(config.deadline, new Date()));
  }, [config.deadline]);

  const steps = useMemo(() => buildSteps(state, config), [state, config]);
  const safeIdx = Math.max(0, Math.min(steps.length - 1, stepIdx));
  const step = steps[safeIdx];
  const total = steps.length;
  const progress = ((safeIdx + 1) / total) * 100;

  if (closed) {
    return (
      <div className="rsvp rsvpB-wrap">
        <RsvpHeader config={config} />
        <RsvpClosed />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rsvp rsvpB-wrap">
        <RsvpHeader config={config} />
        <RsvpSuccess
          firstName={state.name.split(' ')[0] || ''}
          couple={config.couple}
          onEdit={() => {
            setSubmitted(false);
            setStepIdx(0);
          }}
        />
      </div>
    );
  }

  const updateField = <K extends keyof RsvpState>(field: K, value: RsvpState[K]) => {
    setState((s) => ({ ...s, [field]: value }));
  };

  const updateGuest = (idx: number, field: keyof RsvpState['guests'][0], value: string) => {
    setState((s) => ({
      ...s,
      guests: s.guests.map((g, i) => (i === idx ? { ...g, [field]: value } : g)),
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
    // Auto-advance nach Auswahl
    setTimeout(() => setStepIdx((i) => i + 1), 200);
  };

  const goNext = () => setStepIdx((i) => Math.min(steps.length - 1, i + 1));
  const goBack = () => setStepIdx((i) => Math.max(0, i - 1));

  const handleSubmit = () => {
    const payload = buildSubmitPayload(state);
    console.log('[RSVP B submit]', payload);
    setSubmitted(true);
  };

  const handleEnterKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
      goNext();
    }
  };

  return (
    <div className="rsvp rsvpB-wrap">
      <RsvpHeader config={config} />

      <div className="rsvpB">
        <div className="rsvpB-progress">
          <div className="rsvpB-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="rsvpB-meta">
          <span>
            Frage {safeIdx + 1} von {total}
          </span>
          {config.couple && <span>{config.couple}</span>}
        </div>

        <div className="rsvpB-slide" key={`${step.id}-${step.guestIndex ?? ''}`}>
          {step.id === 'name' && (
            <>
              <p className="q">Wie heißt du?</p>
              <p className="q-sub">Den Namen, mit dem du auf der Gästeliste stehst.</p>
              <div className="rsvpB-grid2">
                <div className="field">
                  <input
                    type="text"
                    value={state.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    onKeyDown={handleEnterKey}
                    placeholder="Vor- und Nachname"
                    autoFocus
                  />
                </div>
                <div className="field">
                  <input
                    type="email"
                    value={state.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    onKeyDown={handleEnterKey}
                    placeholder="E-Mail (optional)"
                  />
                </div>
              </div>
            </>
          )}

          {step.id === 'attending' && (
            <>
              <p
                className="q"
                dangerouslySetInnerHTML={{
                  __html: 'Schaffst du es zu unserer <em>Hochzeit</em>?',
                }}
              />
              <div className="rsvpB-grid2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <button
                  type="button"
                  className={`toggle-opt ${state.attending === true ? 'is-on' : ''}`}
                  onClick={() => handleAttending(true)}
                >
                  <span className="opt-emoji">🎉</span>
                  <span className="opt-text">Ja, wir feiern!</span>
                </button>
                <button
                  type="button"
                  className={`toggle-opt ${state.attending === false ? 'is-on' : ''}`}
                  onClick={() => handleAttending(false)}
                >
                  <span className="opt-emoji">💌</span>
                  <span className="opt-text">Leider nicht</span>
                </button>
              </div>
            </>
          )}

          {step.id === 'persons' && (
            <>
              <p className="q">Mit wie vielen Personen kommt ihr?</p>
              <p className="q-sub">Inklusive dir.</p>
              <div style={{ display: 'grid', placeItems: 'center' }}>
                <div className="stepper">
                  <button
                    type="button"
                    onClick={() => handlePersonsChange(-1)}
                    disabled={state.persons <= 1}
                  >
                    −
                  </button>
                  <span className="count">{state.persons}</span>
                  <button
                    type="button"
                    onClick={() => handlePersonsChange(+1)}
                    disabled={state.persons >= 20}
                  >
                    +
                  </button>
                </div>
              </div>
            </>
          )}

          {step.id === 'guest' && step.guestIndex !== undefined && (
            <>
              <p className="q">Wie heißt deine Begleitung?</p>
              <p className="q-sub">
                Begleitperson {step.guestIndex + 1} — du kannst den Namen auch leer lassen,
                falls noch nicht klar.
              </p>
              <div className="field">
                <input
                  type="text"
                  value={state.guests[step.guestIndex]?.name ?? ''}
                  onChange={(e) => updateGuest(step.guestIndex!, 'name', e.target.value)}
                  onKeyDown={handleEnterKey}
                  placeholder="Name"
                  autoFocus
                />
              </div>
            </>
          )}

          {step.id === 'dietary' && (
            <>
              <p className="q">Gibt&apos;s Ernährungswünsche oder Allergien?</p>
              <p className="q-sub">Wir geben das an die Küche weiter.</p>
              {config.ask_dietary && (
                <div className="field" style={{ maxWidth: 380, margin: '0 auto' }}>
                  <label>Ernährung</label>
                  <input
                    type="text"
                    value={state.dietary}
                    onChange={(e) => updateField('dietary', e.target.value)}
                    onKeyDown={handleEnterKey}
                    placeholder="z. B. vegetarisch"
                  />
                </div>
              )}
              {config.ask_allergies && (
                <div className="field" style={{ maxWidth: 380, margin: '0 auto' }}>
                  <label>Allergien</label>
                  <input
                    type="text"
                    value={state.allergies}
                    onChange={(e) => updateField('allergies', e.target.value)}
                    onKeyDown={handleEnterKey}
                    placeholder="optional"
                  />
                </div>
              )}
            </>
          )}

          {step.id === 'custom' && (
            <>
              <p className="q">{config.custom_question}</p>
              <div className="field">
                <input
                  type="text"
                  value={state.custom_answer}
                  onChange={(e) => updateField('custom_answer', e.target.value)}
                  onKeyDown={handleEnterKey}
                  placeholder="kurze Antwort genügt"
                  autoFocus
                />
              </div>
            </>
          )}

          {step.id === 'message' && (
            <>
              <p className="q">Möchtest du uns noch was sagen?</p>
              <p className="q-sub">Glückwünsche, Anekdoten, oder einfach Hallo. Optional.</p>
              <div className="field">
                <textarea
                  value={state.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  placeholder="(optional)"
                />
              </div>
            </>
          )}

          {step.id === 'summary' && (
            <>
              <p className="q">Passt das so?</p>
              <p className="q-sub">Du kannst danach jederzeit zurück und ändern.</p>
              <div className="rsvpB-summary">
                <div>
                  <span>Name</span>
                  <span>{state.name || '—'}</span>
                </div>
                <div>
                  <span>E-Mail</span>
                  <span>{state.email || '—'}</span>
                </div>
                <div>
                  <span>Kommen</span>
                  <span>
                    {state.attending === true ? 'Ja' : state.attending === false ? 'Nein' : '—'}
                  </span>
                </div>
                {state.attending && (
                  <div>
                    <span>Personen</span>
                    <span>{state.persons}</span>
                  </div>
                )}
                {state.attending && state.guests.length > 0 && (
                  <div>
                    <span>Begleitung</span>
                    <span>
                      {state.guests.map((g) => g.name || '(offen)').join(', ')}
                    </span>
                  </div>
                )}
                {state.attending && state.dietary && (
                  <div>
                    <span>Ernährung</span>
                    <span>{state.dietary}</span>
                  </div>
                )}
                {state.attending && state.allergies && (
                  <div>
                    <span>Allergien</span>
                    <span>{state.allergies}</span>
                  </div>
                )}
                {state.attending && state.custom_answer && (
                  <div>
                    <span>{config.custom_question.slice(0, 18)}…</span>
                    <span>{state.custom_answer}</span>
                  </div>
                )}
                {state.message && (
                  <div>
                    <span>Nachricht</span>
                    <span>{state.message}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="rsvpB-nav">
          <button
            type="button"
            className="rsvpB-back"
            disabled={safeIdx === 0}
            onClick={goBack}
          >
            ← Zurück
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={
              (step.id === 'name' && !state.name.trim()) ||
              (step.id === 'attending' && state.attending === null)
            }
            onClick={step.id === 'summary' ? handleSubmit : goNext}
          >
            {step.id === 'summary' ? 'Antwort abschicken' : 'Weiter'}
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
      </div>
    </div>
  );
}
