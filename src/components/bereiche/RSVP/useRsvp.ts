'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import {
  INITIAL_STATE,
  RSVP_LIMITS,
  buildSubmitPayload,
  errorOrder,
  isDeadlinePassed,
  readConfig,
  syncGuests,
  validateRsvp,
  type RsvpConfig,
  type RsvpErrors,
  type RsvpGuest,
  type RsvpMode,
  type RsvpReviewState,
  type RsvpRuntime,
  type RsvpState,
} from './shared';
import { fetchAccess, submitRsvp, unlockRsvp } from './rsvp-client';

/**
 * useRsvp — die komplette RSVP-Produktlogik an einer Stelle.
 *
 *   RSVP-Logik (dieser Hook)
 *     ↓
 *   Variantenkomposition (RsvpVariantA/B/C)
 *     ↓
 *   Stil-Darstellung (CSS je [data-style-rsvp])
 *
 * Kein Variant- und kein Stil-Wissen hier. Alle drei Varianten und später
 * alle acht Designs benutzen dieselben Zustände, dieselbe Validierung und
 * denselben Submit.
 *
 * SICHERHEIT: `access` ist ausschließlich Anzeige-Zustand. Ob gespeichert
 * wird, entscheidet der Server anhand des httpOnly-Cookies. Ein im Browser
 * auf 'unlocked' gesetzter Zustand führt beim Absenden zu 401 → Gate.
 */

export type AccessState = 'checking' | 'open' | 'locked' | 'unlocked';
export type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export interface GateState {
  code: string;
  pending: boolean;
  /** Fehler zum eingegebenen Code (am Feld). */
  error: string | null;
  /** Hinweis ohne Schuld, z. B. abgelaufene Freischaltung. */
  notice: string | null;
}

export interface SentSummary {
  attending: boolean;
  firstName: string;
  persons: number;
  companions: string[];
}

export const RSVP_COPY = {
  gateLabel: 'Einladungscode',
  gateHint: 'Ihr findet ihn auf eurer Einladung.',
  gateSubmit: 'Zur Rückmeldung',
  gatePending: 'Code wird geprüft …',
  gateEmpty: 'Bitte gebt den Einladungscode von eurer Einladung ein.',
  gateWrong: 'Der Einladungscode stimmt leider nicht. Bitte prüft den Code auf eurer Einladung.',
  gateRate: 'Das waren gerade einige Versuche. Bitte probiert es in ein paar Minuten noch einmal.',
  gateUnavailable: 'Die Rückmeldung ist gerade nicht erreichbar. Bitte versucht es später noch einmal.',
  gateError: 'Das hat leider nicht geklappt. Bitte versucht es gleich noch einmal.',
  expired: 'Eure Freischaltung ist abgelaufen. Bitte gebt den Einladungscode noch einmal ein — eure Angaben bleiben erhalten.',
  unlocked: 'Freigeschaltet.',
  unlockedKept: 'Freigeschaltet. Eure Angaben sind noch da — ihr könnt die Rückmeldung jetzt senden.',
  submit: 'Rückmeldung senden',
  submitPending: 'Wird gesendet …',
  submitError: 'Das hat leider nicht geklappt. Bitte versucht es gleich noch einmal.',
  invalid: 'Bitte ergänzt noch die markierten Angaben.',
  duplicate:
    'Unter dieser E-Mail-Adresse liegt uns schon eine Rückmeldung vor. Hat sich etwas geändert? Dann schreibt uns gern direkt.',
  previewNote: 'Vorschau — diese Rückmeldung wurde nicht gespeichert.',
} as const;

/* ------------------------------------------------------------------ Review */

const SAMPLE: RsvpState = {
  name: 'Johanna Albers',
  email: 'johanna@example.de',
  attending: true,
  persons: 2,
  guests: [{ name: 'Felix Albers', dietary: 'vegetarisch', allergies: '' }],
  dietary: '',
  allergies: 'Haselnüsse',
  custom_answers: {},
  message: 'Wir freuen uns riesig auf euch beide und euren Tag!',
};

function sampleAnswers(config: RsvpConfig): Record<string, string> {
  const out: Record<string, string> = {};
  for (const q of config.custom_questions) {
    out[q.id] = q.type === 'boolean' ? 'Ja' : q.type === 'choice' ? q.options?.[0] ?? '' : 'Samstag gegen 14 Uhr';
  }
  return out;
}

interface Seed {
  form: RsvpState;
  access: AccessState;
  gate: GateState;
  status: SubmitStatus;
  errors: RsvpErrors;
  sent: SentSummary | null;
}

const EMPTY_GATE: GateState = { code: '', pending: false, error: null, notice: null };

function summarize(state: RsvpState): SentSummary {
  const synced = syncGuests(state);
  return {
    attending: state.attending === true,
    firstName: state.name.trim().split(/\s+/)[0] ?? '',
    persons: state.attending ? synced.persons : 0,
    companions: state.attending ? synced.guests.map((g) => g.name.trim()).filter(Boolean) : [],
  };
}

function seedFor(
  mode: RsvpMode,
  review: RsvpReviewState | null,
  sample: Partial<RsvpState> | undefined,
  config: RsvpConfig,
): Seed {
  const base: Seed = {
    form: INITIAL_STATE,
    access: mode === 'live' ? 'checking' : 'open',
    gate: EMPTY_GATE,
    status: 'idle',
    errors: {},
    sent: null,
  };
  if (mode !== 'review' || !review) return base;

  const yes = syncGuests({
    ...SAMPLE,
    ...sample,
    attending: true,
    custom_answers: { ...sampleAnswers(config), ...(sample?.custom_answers ?? {}) },
  });
  const no: RsvpState = {
    ...INITIAL_STATE,
    name: sample?.name ?? SAMPLE.name,
    email: sample?.email ?? SAMPLE.email,
    attending: false,
    message: sample?.message ?? 'Wir sind leider verreist und denken an euch. Feiert schön!',
  };

  switch (review) {
    case 'gate':
      return { ...base, access: 'locked' };
    case 'gate-wrong':
      return {
        ...base,
        access: 'locked',
        gate: { ...EMPTY_GATE, code: 'Sommerfest-2027', error: RSVP_COPY.gateWrong },
      };
    case 'form-yes':
      return { ...base, form: yes };
    case 'form-no':
      return { ...base, form: no };
    case 'invalid': {
      const form: RsvpState = { ...INITIAL_STATE, attending: true, email: 'johanna@example' };
      return { ...base, form, errors: validateRsvp(form, config) };
    }
    case 'submitting':
      return { ...base, form: yes, status: 'loading' };
    case 'success-yes':
      return { ...base, form: yes, status: 'success', sent: summarize(yes) };
    case 'success-no':
      return { ...base, form: no, status: 'success', sent: summarize(no) };
    case 'error':
      return { ...base, form: yes, status: 'error' };
    default:
      return base;
  }
}

/* -------------------------------------------------------------------- Hook */

interface Args {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
  runtime?: RsvpRuntime;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useRsvp({ tokens, content, weddingSlug, runtime }: Args) {
  const mode: RsvpMode = runtime?.mode ?? 'live';
  const review = mode === 'review' ? runtime?.reviewState ?? 'form' : null;
  const slug = weddingSlug ?? '';

  const config = useMemo(
    () => readConfig(content, { name1: tokens.couple_name_1, name2: tokens.couple_name_2 }),
    [content, tokens.couple_name_1, tokens.couple_name_2],
  );

  // Ein Seed für den ersten Render. Die Review setzt ihn deterministisch,
  // live/preview beginnen leer.
  const seed = useMemo(
    () => seedFor(mode, review, runtime?.sample, config),
    // Absichtlich nur einmal: der Seed ist der Startzustand, kein Abo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [form, setForm] = useState<RsvpState>(seed.form);
  const [errors, setErrors] = useState<RsvpErrors>(seed.errors);
  const [access, setAccess] = useState<AccessState>(seed.access);
  const [gate, setGate] = useState<GateState>(seed.gate);
  const [status, setStatus] = useState<SubmitStatus>(seed.status);
  const [sent, setSent] = useState<SentSummary | null>(seed.sent);
  const [notice, setNotice] = useState<string | null>(
    review === 'invalid' ? RSVP_COPY.invalid : null,
  );
  const [closed, setClosed] = useState(false);
  const [focusTarget, setFocusTarget] = useState<string | null>(null);

  const inFlight = useRef(false);

  // IDs je Instanz — /allelements rendert A, B und C auf einer Seite.
  const rawId = useId();
  const uid = `rsvp${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const fid = useCallback((key: string) => `${uid}-${key}`, [uid]);

  /* ---- Access-Status (nur live) ---------------------------------------- */
  useEffect(() => {
    if (mode !== 'live') return;
    if (!slug) {
      setAccess('open');
      return;
    }
    const ctrl = new AbortController();
    fetchAccess(slug, ctrl.signal).then((res) => {
      if (ctrl.signal.aborted) return;
      if (res.kind === 'locked') setAccess('locked');
      else if (res.kind === 'unlocked') setAccess('unlocked');
      // 'open' und 'unknown': Formular zeigen. Ist der Schutz doch aktiv,
      // antwortet der Submit mit 401 und das Gate erscheint — ohne
      // Datenverlust, weil der Formularzustand im Speicher bleibt.
      else setAccess('open');
    });
    return () => ctrl.abort();
  }, [mode, slug]);

  /* ---- Deadline (nach Hydration, SSR-sicher; nicht in der Review) ------ */
  useEffect(() => {
    if (mode === 'review') return;
    setClosed(isDeadlinePassed(config.deadline, new Date()));
  }, [mode, config.deadline]);

  /* ---- Fokus nach Zustandswechseln ------------------------------------ */
  useEffect(() => {
    if (!focusTarget) return;
    const el = document.getElementById(fid(focusTarget));
    if (el) {
      el.focus({ preventScroll: false });
      if (focusTarget === 'done' || focusTarget === 'gate-title') {
        el.scrollIntoView({ block: 'nearest' });
      }
    }
    setFocusTarget(null);
  }, [focusTarget, fid]);

  /* ---- Feldänderungen -------------------------------------------------- */
  const clearError = useCallback((key: string) => {
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }, []);

  const setField = useCallback(
    <K extends 'name' | 'email' | 'dietary' | 'allergies' | 'message'>(field: K, value: string) => {
      setForm((s) => ({ ...s, [field]: value }));
      clearError(field);
      if (status === 'error') setStatus('idle');
    },
    [clearError, status],
  );

  const setAttending = useCallback(
    (value: boolean) => {
      setForm((s) => syncGuests({ ...s, attending: value }));
      clearError('attending');
      if (!value) {
        // Fehler zu Fragen, die bei einer Absage nicht mehr gestellt werden,
        // dürfen nicht stehen bleiben.
        setErrors((e) => {
          const next: RsvpErrors = {};
          for (const [k, v] of Object.entries(e)) if (!k.startsWith('cq-')) next[k] = v;
          return next;
        });
      }
    },
    [clearError],
  );

  const changePersons = useCallback((delta: number) => {
    setForm((s) =>
      syncGuests({ ...s, persons: Math.max(1, Math.min(RSVP_LIMITS.personsMax, s.persons + delta)) }),
    );
  }, []);

  const setGuest = useCallback((index: number, field: keyof RsvpGuest, value: string) => {
    setForm((s) => ({
      ...s,
      guests: s.guests.map((g, i) => (i === index ? { ...g, [field]: value } : g)),
    }));
  }, []);

  const setAnswer = useCallback(
    (questionId: string, value: string) => {
      setForm((s) => ({ ...s, custom_answers: { ...s.custom_answers, [questionId]: value } }));
      clearError(`cq-${questionId}`);
    },
    [clearError],
  );

  /* ---- Gate ------------------------------------------------------------ */
  const setCode = useCallback((code: string) => {
    setGate((g) => ({ ...g, code, error: null }));
  }, []);

  const afterUnlock = useCallback(() => {
    const hasData = Boolean(form.name.trim() || form.attending !== null);
    setAccess('unlocked');
    setGate(EMPTY_GATE);
    setNotice(hasData ? RSVP_COPY.unlockedKept : null);
    setFocusTarget(hasData ? 'submit' : 'attending-yes');
  }, [form.name, form.attending]);

  const submitGate = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (gate.pending) return;
      if (!gate.code.trim()) {
        setGate((g) => ({ ...g, error: RSVP_COPY.gateEmpty }));
        setFocusTarget('code');
        return;
      }
      setGate((g) => ({ ...g, pending: true, error: null }));

      if (mode !== 'live') {
        await wait(450);
        if (gate.code.trim().toLowerCase() === 'falsch') {
          setGate((g) => ({ ...g, pending: false, error: RSVP_COPY.gateWrong }));
          setFocusTarget('code');
        } else {
          afterUnlock();
        }
        return;
      }

      const res = await unlockRsvp(slug, gate.code);
      if (res.kind === 'ok') {
        afterUnlock();
        return;
      }
      const message =
        res.kind === 'wrong'
          ? RSVP_COPY.gateWrong
          : res.kind === 'rate-limited'
            ? RSVP_COPY.gateRate
            : res.kind === 'unavailable'
              ? RSVP_COPY.gateUnavailable
              : RSVP_COPY.gateError;
      setGate((g) => ({ ...g, pending: false, error: message }));
      setFocusTarget('code');
    },
    [gate.pending, gate.code, mode, slug, afterUnlock],
  );

  /* ---- Submit ---------------------------------------------------------- */
  const submit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (inFlight.current || status === 'loading') return;

      const found = validateRsvp(form, config);
      const keys = errorOrder(config).filter((k) => found[k]);
      if (keys.length) {
        setErrors(found);
        setNotice(RSVP_COPY.invalid);
        setFocusTarget(keys[0] === 'attending' ? 'attending-yes' : keys[0]);
        return;
      }

      inFlight.current = true;
      setErrors({});
      setNotice(null);
      setStatus('loading');

      try {
        if (mode !== 'live') {
          await wait(700);
          setSent(summarize(form));
          setStatus('success');
          setFocusTarget('done');
          return;
        }

        const res = await submitRsvp(slug, buildSubmitPayload(form, config));
        switch (res.kind) {
          case 'ok':
            setSent(summarize(form));
            setStatus('success');
            setFocusTarget('done');
            break;
          case 'unauthorized':
            // Cookie abgelaufen, Code geändert oder Schutz neu gesetzt.
            // Formularzustand bleibt im Speicher und kommt nach dem
            // erneuten Freischalten unverändert zurück.
            setStatus('idle');
            setAccess('locked');
            setGate({ ...EMPTY_GATE, notice: RSVP_COPY.expired });
            setFocusTarget('code');
            break;
          case 'duplicate':
            setStatus('idle');
            if (form.email.trim()) {
              setErrors({ email: RSVP_COPY.duplicate });
              setFocusTarget('email');
            } else {
              setStatus('error');
            }
            break;
          case 'invalid':
            setStatus('idle');
            if (res.field) {
              setErrors({ [res.field]: res.message });
              setNotice(RSVP_COPY.invalid);
              setFocusTarget(res.field === 'attending' ? 'attending-yes' : res.field);
            } else {
              setStatus('error');
            }
            break;
          default:
            setStatus('error');
        }
      } finally {
        inFlight.current = false;
      }
    },
    [status, form, config, mode, slug],
  );

  /** Bewusster Neustart nach Erfolg — z. B. für einen weiteren Haushalt am selben Gerät. */
  const restart = useCallback(() => {
    setForm(INITIAL_STATE);
    setErrors({});
    setSent(null);
    setNotice(null);
    setStatus('idle');
    setFocusTarget('attending-yes');
  }, []);

  const view: 'checking' | 'closed' | 'gate' | 'success' | 'form' = closed
    ? 'closed'
    : access === 'checking'
      ? 'checking'
      : access === 'locked'
        ? 'gate'
        : status === 'success'
          ? 'success'
          : 'form';

  return {
    mode,
    uid,
    fid,
    config,
    view,
    form,
    errors,
    gate,
    status,
    sent,
    notice,
    access,
    setField,
    setAttending,
    changePersons,
    setGuest,
    setAnswer,
    setCode,
    submitGate,
    submit,
    restart,
  };
}

export type RsvpController = ReturnType<typeof useRsvp>;
