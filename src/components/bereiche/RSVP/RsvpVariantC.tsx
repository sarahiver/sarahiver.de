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
  RsvpTextField,
  RsvpTitle,
  successCopy,
} from './RsvpFields';

/**
 * RSVP Variante C — STATEMENT
 *
 * Prinzip: Die Entscheidung IST die Komponente. Die Frage steht groß, die
 * zwei Antworten stehen als typografische Aussagen darunter. Alles andere
 * erscheint erst, wenn geantwortet wurde — ruhig, kompakt, einspaltig.
 *
 *   Seid ihr dabei?
 *   Ja, wir kommen.  /  Leider nicht.
 *   ── nach der Wahl ──
 *   eine Überleitungszeile
 *   kompaktes Formular
 *
 * Vor der Wahl ist die Sektion kurz (Frage + zwei Antworten). Ohne Farben
 * und Schriften bleibt der Größensprung zwischen Frage/Antworten und den
 * nachgeordneten Feldern das Erkennungszeichen.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
  runtime?: RsvpRuntime;
}

export default function RsvpVariantC({ tokens, content, weddingSlug, runtime }: Props) {
  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const r = useRsvp({ tokens, content, weddingSlug, runtime });
  const attending = r.form.attending;
  const done = successCopy(r);

  return (
    <div className="rsvp rv rv-c" data-style-rsvp={style} data-rsvp-view={r.view}>
      <StyledBereichBg style={style} marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`} />

      <div className="rv-frame">
        <header className="rv-head">
          <RsvpTitle r={r} as="p" className="rv-kicker rv-title-kicker" />
          <RsvpDeadline r={r} />
        </header>

        {r.view === 'checking' && <RsvpChecking />}
        {r.view === 'closed' && <RsvpClosedNote />}

        {r.view === 'gate' && (
          <div className="rv-stage rv-stage--gate">
            <h2 className="rv-statement">Bevor ihr antwortet.</h2>
            <RsvpGate
              r={r}
              lead="Gebt den Einladungscode aus eurer Einladung ein, dann geht es direkt weiter."
            />
          </div>
        )}

        {r.view === 'success' && (
          <section className="rv-done" aria-labelledby={r.fid('done')}>
            <RsvpDoneHeading r={r} as="h2" className="rv-statement rv-done-title">
              {done.short}
            </RsvpDoneHeading>
            <p className="rv-done-text">
              {done.yes
                ? `${r.sent?.firstName ? `${r.sent.firstName}, wir` : 'Wir'} freuen uns sehr darauf, diesen Tag mit euch zu feiern.`
                : 'Für eure Rückmeldung. Schade, dass ihr nicht dabei sein könnt — wir denken an euch.'}
            </p>
            {r.sent && (
              <p className="rv-done-meta">
                {r.sent.attending
                  ? `Zusage für ${r.sent.persons} ${r.sent.persons === 1 ? 'Person' : 'Personen'}`
                  : 'Absage gesendet'}
              </p>
            )}
            <RsvpDoneFooter r={r} />
          </section>
        )}

        {r.view === 'form' && (
          <form className="rv-form" onSubmit={r.submit} noValidate aria-label="Rückmeldung">
            <div className="rv-stage">
              <RsvpAttendance
                r={r}
                legend={<h2 className="rv-statement">Seid ihr dabei?</h2>}
                yesLabel="Ja, wir kommen."
                noLabel="Leider nicht."
                className="rv-choice--statement"
                lead={<RsvpLead r={r} className="rv-lead rv-stage-lead" />}
              />
            </div>

            {attending !== null && (
              <div className="rv-details" data-attending={attending ? 'yes' : 'no'}>
                <p className="rv-details-lead">
                  {attending
                    ? 'Wie schön. Nur noch ein paar Angaben.'
                    : 'Schade. Wenn ihr mögt, lasst uns ein paar Worte da.'}
                </p>

                <div className="rv-details-fields">
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

                  {attending && (
                    <>
                      <RsvpPersons r={r} />
                      <RsvpCompanions r={r} />
                      <RsvpFood r={r} />
                      <RsvpCustomQuestions r={r} />
                    </>
                  )}

                  <RsvpMessage r={r} />
                  <RsvpSubmit r={r} />
                </div>
              </div>
            )}

            {/* Vor der Wahl gibt es nichts zu senden. Wer trotzdem Enter drückt
                (oder die Validierung auslöst), bekommt den Hinweis an der Frage. */}
            {attending === null && r.notice && (
              <p className="rv-notice" role="status">
                {r.notice}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
