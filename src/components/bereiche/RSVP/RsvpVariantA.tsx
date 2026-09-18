'use client';

import type { EffectiveTokens } from '@/types/supabase';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';
import type { RsvpRuntime } from './shared';
import { useRsvp } from './useRsvp';
import {
  RsvpAttendance,
  RsvpChecking,
  RsvpClosedNote,
  RsvpCompanions,
  RsvpCustomQuestions,
  RsvpDeadline,
  RsvpDoneFooter,
  RsvpDoneHeading,
  RsvpFood,
  RsvpGate,
  RsvpLead,
  RsvpMessage,
  RsvpPersons,
  RsvpSubmit,
  RsvpSummary,
  RsvpTextField,
  RsvpTitle,
  successCopy,
} from './RsvpFields';

/**
 * RSVP Variante A — CLASSIC
 *
 * Prinzip: Die Variante, mit der Gäste am schnellsten fertig sind.
 * Eine Spalte, eine Leserichtung, keine Kapitel, keine Schritte:
 *
 *   Kopf (Titel, kurzer Text, Frist)
 *   Entscheidung  → zwei gleichwertige Optionen nebeneinander
 *   Name · E-Mail
 *   [Zusage] Personen · Begleitungen · Essen · individuelle Fragen
 *   Nachricht
 *   Senden
 *
 * Ohne Farben und Schriften bleibt es ein direktes Formular von oben nach
 * unten. Logik, Validierung, Sicherheit: useRsvp — identisch mit B und C.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
  runtime?: RsvpRuntime;
}

export default function RsvpVariantA({ tokens, content, weddingSlug, runtime }: Props) {
  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const r = useRsvp({ tokens, content, weddingSlug, runtime });
  const attending = r.form.attending;
  const done = successCopy(r);

  return (
    <div className="rsvp rv rv-a" data-style-rsvp={style} data-rsvp-view={r.view}>
      <StyledBereichBg style={style} marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`} />

      <div className="rv-frame">
        <header className="rv-head">
          <p className="rv-kicker">Rückmeldung</p>
          <RsvpTitle r={r} />
          <RsvpLead r={r} />
          <RsvpDeadline r={r} />
        </header>

        {r.view === 'checking' && <RsvpChecking />}
        {r.view === 'closed' && <RsvpClosedNote />}

        {r.view === 'gate' && (
          <RsvpGate
            r={r}
            lead="Für eure Rückmeldung braucht ihr den Einladungscode aus eurer Einladung."
          />
        )}

        {r.view === 'success' && (
          <section className="rv-done" aria-labelledby={r.fid('done')}>
            <p className="rv-done-kicker">{done.kicker}</p>
            <RsvpDoneHeading r={r}>{done.title}</RsvpDoneHeading>
            <p className="rv-done-text">{done.text}</p>
            <RsvpSummary r={r} />
            <RsvpDoneFooter r={r} />
          </section>
        )}

        {r.view === 'form' && (
          <form className="rv-form" onSubmit={r.submit} noValidate aria-label="Rückmeldung">
            <RsvpAttendance r={r} legend="Seid ihr dabei?" />

            {attending === false && (
              <p className="rv-aside">
                Schade, dass ihr nicht dabei sein könnt. Wenn ihr möchtet, hinterlasst uns noch eine
                Nachricht.
              </p>
            )}

            <div className="rv-pair">
              <RsvpTextField
                r={r}
                k="name"
                label="Vor- und Nachname"
                autoComplete="name"
                value={r.form.name}
                onChange={(v) => r.setField('name', v)}
                maxLength={100}
              />
              <RsvpTextField
                r={r}
                k="email"
                type="email"
                inputMode="email"
                label="E-Mail"
                optional
                autoComplete="email"
                value={r.form.email}
                onChange={(v) => r.setField('email', v)}
                maxLength={160}
              />
            </div>

            {attending === true && (
              <div className="rv-yes">
                <RsvpPersons r={r} />
                <RsvpCompanions r={r} />
                <RsvpFood r={r} />
                <RsvpCustomQuestions r={r} />
              </div>
            )}

            <RsvpMessage r={r} />
            <RsvpSubmit r={r} />
          </form>
        )}
      </div>
    </div>
  );
}
