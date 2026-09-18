'use client';

import type { ReactNode } from 'react';
import type { EffectiveTokens } from '@/types/supabase';
import StyledBereichBg from '@/components/decoration/StyledBereichBg';
import type { RsvpRuntime } from './shared';
import { useRsvp, type RsvpController } from './useRsvp';
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
 * RSVP Variante B — EDITORIAL JOURNEY
 *
 * Prinzip: eine geführte Rückmeldung in Kapiteln — aber EIN Formular.
 * Kein Wizard, keine Weiter-Knöpfe: alle Kapitel stehen untereinander, jedes
 * mit eigener Randspalte (Nummer, Titel, redaktionelle Notiz) und eigener
 * Satzspalte für die Felder.
 *
 *   01  Seid ihr dabei?
 *   02  Wer kommt?            (bei Absage: Von wem?)
 *   03  Essen & Besonderheiten (nur bei Zusage und wenn es etwas zu fragen gibt)
 *   04  Noch etwas?
 *
 * Die Nummern werden gezählt, nicht fest vergeben — bei einer Absage heißt
 * „Noch etwas?" 03, nicht 04. Ohne Farben und Schriften bleibt die
 * Zweispaltigkeit aus Rand und Satz das Erkennungszeichen.
 */

interface Props {
  tokens: EffectiveTokens;
  content: Record<string, unknown>;
  weddingSlug?: string;
  runtime?: RsvpRuntime;
}

function Chapter({
  r,
  id,
  no,
  title,
  note,
  children,
  className,
}: {
  r: RsvpController;
  id: string;
  no: number | string;
  title: ReactNode;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const headingId = r.fid(`ch-${id}`);
  return (
    <section
      className={`rv-chapter rv-chapter--${id}${className ? ` ${className}` : ''}`}
      aria-labelledby={headingId}
    >
      <div className="rv-chapter-side">
        <span className="rv-chapter-no" aria-hidden="true">
          {typeof no === 'number' ? String(no).padStart(2, '0') : no}
        </span>
        <h3 className="rv-chapter-title" id={headingId}>
          {title}
        </h3>
        {note && <p className="rv-chapter-note">{note}</p>}
      </div>
      <div className="rv-chapter-main">{children}</div>
    </section>
  );
}

export default function RsvpVariantB({ tokens, content, weddingSlug, runtime }: Props) {
  const style =
    (tokens as EffectiveTokens & { start_style_id?: string }).start_style_id ?? 'editorial';
  const r = useRsvp({ tokens, content, weddingSlug, runtime });
  const attending = r.form.attending;
  const done = successCopy(r);

  const hasFoodChapter =
    attending === true &&
    (r.config.ask_dietary || r.config.ask_allergies || r.config.custom_questions.length > 0);

  let n = 0;
  const next = () => (n += 1);

  return (
    <div className="rsvp rv rv-b" data-style-rsvp={style} data-rsvp-view={r.view}>
      <StyledBereichBg style={style} marqueeText={`${tokens.couple_name_1} ★ ${tokens.couple_name_2} ★`} />

      <div className="rv-frame">
        <header className="rv-head">
          <div className="rv-head-main">
            <p className="rv-kicker">Rückmeldung</p>
            <RsvpTitle r={r} />
            <RsvpLead r={r} />
          </div>
          <aside className="rv-head-side">
            <RsvpDeadline r={r} />
            {r.config.couple && <p className="rv-head-couple">{r.config.couple}</p>}
          </aside>
        </header>

        {r.view === 'checking' && <RsvpChecking />}
        {r.view === 'closed' && <RsvpClosedNote />}

        {r.view === 'gate' && (
          <Chapter
            r={r}
            id="gate"
            no="00"
            title="Vorab"
            note="Der Code steht auf eurer Einladung. So bleiben die Rückmeldungen unter uns."
           
          >
            <RsvpGate r={r} lead="Gebt den Einladungscode ein — danach geht es direkt zu eurer Rückmeldung." />
          </Chapter>
        )}

        {r.view === 'success' && (
          <section className="rv-done" aria-labelledby={r.fid('done')}>
            <div className="rv-done-side">
              <p className="rv-done-kicker">{done.kicker}</p>
              <RsvpSummary r={r} />
            </div>
            <div className="rv-done-main">
              <RsvpDoneHeading r={r}>{done.title}</RsvpDoneHeading>
              <p className="rv-done-text">{done.text}</p>
              <RsvpDoneFooter r={r} />
            </div>
          </section>
        )}

        {r.view === 'form' && (
          <form className="rv-form" onSubmit={r.submit} noValidate aria-label="Rückmeldung">
            <Chapter
              r={r}
              id="attend"
              no={next()}
              title="Seid ihr dabei?"
              note="Eine Antwort gilt für alle, die mit euch kommen."
            >
              <RsvpAttendance
                r={r}
                legend="Seid ihr dabei?"
                legendHidden
                yesLabel="Ja, wir kommen"
                noLabel="Leider nicht"
                yesNote="Wir feiern mit euch."
                noNote="Wir sind in Gedanken dabei."
              />
            </Chapter>

            <Chapter
              r={r}
              id="who"
              no={next()}
              title={attending === false ? 'Von wem?' : 'Wer kommt?'}
              note={
                attending === false
                  ? 'Damit wir wissen, von wem die Nachricht ist.'
                  : 'Namen helfen uns bei der Tischplanung.'
              }
            >
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
                <>
                  <RsvpPersons r={r} />
                  <RsvpCompanions r={r} />
                </>
              )}
            </Chapter>

            {hasFoodChapter && (
              <Chapter
                r={r}
                id="food"
                no={next()}
                title="Essen & Besonderheiten"
                note="Wir geben alles an die Küche weiter."
              >
                <RsvpFood r={r} legendHidden legend="Essen" />
                <RsvpCustomQuestions r={r} />
              </Chapter>
            )}

            <Chapter
              r={r}
              id="more"
              no={next()}
              title="Noch etwas?"
              note={
                attending === false
                  ? 'Schade, dass ihr nicht dabei sein könnt. Ein paar Worte freuen uns trotzdem.'
                  : 'Grüße, Fragen oder einfach ein paar Worte.'
              }
            >
              <RsvpMessage r={r} />
              <RsvpSubmit r={r} />
            </Chapter>
          </form>
        )}
      </div>
    </div>
  );
}
