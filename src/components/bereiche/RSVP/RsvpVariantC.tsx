'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
 * RSVP Variante C — Chat-Konversation
 *
 * Brautpaar "schreibt", Gast antwortet. Bot-Bubbles + User-Bubbles in einem
 * scrollbaren Thread. Typing-Indikator zwischen Bot-Nachrichten.
 *
 * State-Maschine: jeder Step im Flow ist entweder eine Bot-Message
 * (kind='them') oder ein User-Input (kind='me-*'). Der Flow wird neu
 * berechnet wenn sich relevante State-Werte ändern (attending, persons).
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
}

type FlowStep =
  | { kind: 'them'; text: string }
  | { kind: 'me-text'; field: string; placeholder?: string; allowSkip?: boolean }
  | { kind: 'me-choice'; field: 'attending'; options: { value: boolean; label: string }[] }
  | { kind: 'me-stepper'; field: 'persons' }
  | { kind: 'me-quick'; field: string; options: string[]; allowCustom?: boolean }
  | { kind: 'submit' };

function buildFlow(state: RsvpState, config: RsvpConfig): FlowStep[] {
  const firstName = state.name.split(' ')[0] || 'du';
  const f: FlowStep[] = [];
  f.push({ kind: 'them', text: 'Hey! Schön, dass du hier bist. Wie heißt du?' });
  f.push({ kind: 'me-text', field: 'name', placeholder: 'Vorname Nachname' });
  f.push({ kind: 'them', text: `Hi ${firstName}! Kommt ihr zu unserer Hochzeit?` });
  f.push({
    kind: 'me-choice',
    field: 'attending',
    options: [
      { value: true, label: 'Ja, wir kommen 🎉' },
      { value: false, label: 'Leider nicht 💌' },
    ],
  });
  if (state.attending === true) {
    f.push({ kind: 'them', text: 'Super! Mit wie vielen Personen kommt ihr?' });
    f.push({ kind: 'me-stepper', field: 'persons' });
    const guestCount = Math.max(0, (state.persons || 1) - 1);
    for (let i = 0; i < guestCount; i++) {
      f.push({
        kind: 'them',
        text: i === 0 ? 'Wie heißt deine Begleitung?' : `Und die ${i + 1}. Begleitung?`,
      });
      f.push({
        kind: 'me-text',
        field: `guests.${i}.name`,
        placeholder: 'Name',
        allowSkip: true,
      });
    }
    if (config.ask_dietary || config.ask_allergies) {
      f.push({
        kind: 'them',
        text: "Gibt's Ernährungswünsche, die wir wissen sollten?",
      });
      f.push({
        kind: 'me-quick',
        field: 'dietary',
        options: ['Vegetarisch', 'Vegan', 'Egal'],
        allowCustom: true,
      });
    }
    config.custom_questions.forEach((q) => {
      f.push({ kind: 'them', text: q.label });
      if (q.type === 'boolean') {
        f.push({
          kind: 'me-quick',
          field: `custom.${q.id}`,
          options: ['Ja', 'Nein'],
        });
      } else if (q.type === 'choice' && q.options) {
        f.push({
          kind: 'me-quick',
          field: `custom.${q.id}`,
          options: q.options,
          allowCustom: true,
        });
      } else {
        f.push({
          kind: 'me-text',
          field: `custom.${q.id}`,
          placeholder: 'Eure Antwort',
          allowSkip: !q.required,
        });
      }
    });
  }
  f.push({ kind: 'them', text: 'Eine Nachricht für uns? (Kannst du auch überspringen)' });
  f.push({
    kind: 'me-text',
    field: 'message',
    placeholder: 'Glückwünsche, Anekdoten…',
    allowSkip: true,
  });
  f.push({ kind: 'them', text: 'Perfekt, das war alles. Wir freuen uns auf euch! ✨' });
  f.push({ kind: 'submit' });
  return f;
}

interface ThreadItem {
  side: 'them' | 'me';
  text: string;
}

export default function RsvpVariantC({ tokens, content }: Props) {
  const config = readConfig(content, {
    name1: tokens.couple_name_1,
    name2: tokens.couple_name_2,
  });

  const [state, setState] = useState<RsvpState>(INITIAL_STATE);
  const [submitted, setSubmitted] = useState(false);
  const [thread, setThread] = useState<ThreadItem[]>([]);
  const [flowIdx, setFlowIdx] = useState(0);
  const [typing, setTyping] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [closed, setClosed] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Deadline-Check nach Hydration (SSR-safe)
  useEffect(() => {
    setClosed(isDeadlinePassed(config.deadline, new Date()));
  }, [config.deadline]);

  // Auto-Scroll zum Thread-Ende
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [thread, typing]);

  // Berechne Flow aus aktuellem State
  const flow = buildFlow(state, config);
  const currentStep: FlowStep | undefined = flow[flowIdx];

  // Bot-Messages auto-pushen mit Typing-Animation
  //
  // Wichtig: `flow` und `currentStep` sind bei jedem Render neue Object-
  // References. Wenn wir sie als Effect-Dependencies nehmen, feuert der
  // Effect bei JEDEM Render — der Cleanup clear't den Timeout, und der
  // Guard via processedIdxRef verhindert ein erneutes Schedulen → wir
  // hängen im Typing-State fest.
  //
  // Lösung: nur auf `flowIdx`/`closed`/`submitted` reagieren. Den Step
  // im Effect-Body via flowRef.current[flowIdx] holen.
  const flowRef = useRef(flow);
  flowRef.current = flow;

  useEffect(() => {
    if (closed || submitted) return;
    const step = flowRef.current[flowIdx];
    if (!step || step.kind !== 'them') return;

    setTyping(true);
    const id = window.setTimeout(() => {
      setTyping(false);
      setThread((t) => [...t, { side: 'them', text: step.text }]);
      setFlowIdx((i) => i + 1);
    }, 700);
    return () => window.clearTimeout(id);
  }, [flowIdx, closed, submitted]);

  // Reset textInput beim Step-Wechsel
  useEffect(() => {
    setTextInput('');
  }, [flowIdx]);

  const setField = useCallback((path: string, value: unknown) => {
    setState((s) => {
      const parts = path.split('.');
      if (parts[0] === 'guests') {
        const idx = parseInt(parts[1], 10);
        const field = parts[2] as keyof RsvpState['guests'][0];
        const guests = s.guests.map((g, i) => (i === idx ? { ...g, [field]: value } : g));
        return { ...s, guests };
      }
      if (parts[0] === 'custom') {
        const qid = parts[1];
        return {
          ...s,
          custom_answers: { ...s.custom_answers, [qid]: String(value) },
        };
      }
      return { ...s, [parts[0]]: value };
    });
  }, []);

  const handleUserResponse = useCallback(
    (displayLabel: string) => {
      setThread((t) => [...t, { side: 'me', text: displayLabel }]);
      setFlowIdx((i) => i + 1);
    },
    [],
  );

  const handleTextSubmit = useCallback(
    (step: Extract<FlowStep, { kind: 'me-text' }>) => {
      const value = textInput.trim();
      if (!value && !step.allowSkip) return;
      setField(step.field, value);
      handleUserResponse(value || '(übersprungen)');
    },
    [textInput, setField, handleUserResponse],
  );

  const handleSkip = useCallback(
    (step: Extract<FlowStep, { kind: 'me-text' }>) => {
      setField(step.field, '');
      handleUserResponse('(übersprungen)');
    },
    [setField, handleUserResponse],
  );

  const handleChoice = useCallback(
    (value: boolean, label: string) => {
      setState((s) => syncGuests({ ...s, attending: value }));
      handleUserResponse(label);
    },
    [handleUserResponse],
  );

  const handleStepper = useCallback(
    (n: number) => {
      setState((s) => syncGuests({ ...s, persons: n }));
      handleUserResponse(`${n} Personen`);
    },
    [handleUserResponse],
  );

  const handleQuickPick = useCallback(
    (step: Extract<FlowStep, { kind: 'me-quick' }>, value: string) => {
      setField(step.field, value);
      handleUserResponse(value);
    },
    [setField, handleUserResponse],
  );

  const handleSubmit = useCallback(() => {
    const payload = buildSubmitPayload(stateRef.current, config);
    console.log('[RSVP C submit]', payload);
    setSubmitted(true);
  }, [config]);

  if (closed) {
    return (
      <div className="rsvp rsvpC-wrap">
        <RsvpHeader config={config} />
        <RsvpClosed />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rsvp rsvpC-wrap">
        <RsvpHeader config={config} />
        <RsvpSuccess
          firstName={state.name.split(' ')[0] || ''}
          couple={config.couple}
          onEdit={() => {
            setSubmitted(false);
            setThread([]);
            setFlowIdx(0);
          }}
        />
      </div>
    );
  }

  // Render Action-Row (Input/Buttons) basierend auf aktuellem Step
  const renderAction = () => {
    if (!currentStep || typing) return null;
    if (currentStep.kind === 'them') return null;

    if (currentStep.kind === 'me-text') {
      return (
        <>
          <div className="rsvpC-input">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTextSubmit(currentStep);
              }}
              placeholder={currentStep.placeholder ?? ''}
              autoComplete="off"

            />
            <button
              type="button"
              className="send-btn"
              onClick={() => handleTextSubmit(currentStep)}
              aria-label="Senden"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
          {currentStep.allowSkip && (
            <div className="rsvpC-quick">
              <button type="button" onClick={() => handleSkip(currentStep)}>
                Überspringen
              </button>
            </div>
          )}
        </>
      );
    }

    if (currentStep.kind === 'me-choice') {
      return (
        <div className="rsvpC-quick">
          {currentStep.options.map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => handleChoice(opt.value, opt.label)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    if (currentStep.kind === 'me-stepper') {
      return (
        <div className="rsvpC-quick" style={{ justifyContent: 'center' }}>
          {[1, 2, 3, 4].map((n) => (
            <button key={n} type="button" onClick={() => handleStepper(n)}>
              {n} {n === 1 ? 'Person' : 'Personen'}
            </button>
          ))}
        </div>
      );
    }

    if (currentStep.kind === 'me-quick') {
      return (
        <>
          <div className="rsvpC-quick">
            {currentStep.options.map((opt) => (
              <button key={opt} type="button" onClick={() => handleQuickPick(currentStep, opt)}>
                {opt}
              </button>
            ))}
          </div>
          {currentStep.allowCustom && (
            <div className="rsvpC-input">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && textInput.trim()) {
                    handleQuickPick(currentStep, textInput.trim());
                  }
                }}
                placeholder="oder eigene Antwort…"
                autoComplete="off"
              />
              <button
                type="button"
                className="send-btn"
                onClick={() => textInput.trim() && handleQuickPick(currentStep, textInput.trim())}
                aria-label="Senden"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          )}
        </>
      );
    }

    if (currentStep.kind === 'submit') {
      return (
        <div className="rsvpC-quick">
          <button
            type="button"
            className="rsvpC-submit-btn"
            onClick={handleSubmit}
          >
            Antwort abschicken ✨
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="rsvp rsvpC-wrap">
      <RsvpHeader config={config} />

      <div className="rsvpC">
        <div className="rsvpC-header">
          <div className="rsvpC-avatar" aria-hidden="true">
            S&I
          </div>
          <div style={{ flex: 1 }}>
            <div className="rsvpC-name">{config.couple || 'Brautpaar'}</div>
            <div className="rsvpC-status">RSVP-Chat · läuft</div>
          </div>
        </div>

        <div className="rsvpC-thread">
          {thread.map((item, i) => (
            <div key={i} className={`rsvpC-bubble ${item.side}`}>
              {item.text}
            </div>
          ))}
          {typing && (
            <div className="rsvpC-typing" aria-label="Brautpaar schreibt…">
              <span />
              <span />
              <span />
            </div>
          )}
          <div ref={threadEndRef} />
        </div>

        <div className="rsvpC-action">{renderAction()}</div>
      </div>
    </div>
  );
}
