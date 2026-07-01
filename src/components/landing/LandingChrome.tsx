import React from 'react';
import { PRICING_TIERS } from '@/lib/bereiche-katalog';
import { IMG, DEMO } from './landing-data';

export function LandingHeader() {
  return (
    <header className="lp3-header">
      <div className="wrap in">
        <a href="#top" className="lp3-logo">sarah<span>iver</span>.de</a>
        <nav className="lp3-nav" aria-label="Hauptnavigation">
          <a href="#studio">Baukasten</a>
          <a href="#preise">Preise</a>
          <a href="/login">Login</a>
          <a href="#studio" className="cta">Kostenlos starten</a>
        </nav>
      </div>
    </header>
  );
}

export function LandingHero() {
  return (
    <section className="wrap lp3-hero" id="top" aria-labelledby="hero-title">
      <div>
        <span className="eyebrow">Hochzeitsseiten · made in Hamburg</span>
        <h1 id="hero-title">
          Eure Hochzeitsseite, <em>so schön</em> wie <b>der Tag.</b>
        </h1>
        <p className="lead">
          Wählt euren Stil, gestaltet jede Section, ladet eure Gäste ein — online in
          unter einer Stunde. Kein Code, kein Stress.
        </p>
        <div className="actions">
          <a href="#studio" className="cta gold">Jetzt ausprobieren</a>
          <span className="cc">14 Tage gratis · <b>keine Kreditkarte</b></span>
        </div>
        <div className="lp3-trust">
          <div className="lp3-avatars" aria-hidden="true">
            <img src={IMG.a1} alt="" width={36} height={36} />
            <img src={IMG.a2} alt="" width={36} height={36} />
            <img src={IMG.a3} alt="" width={36} height={36} />
          </div>
          <p className="t"><b>120+ Paare</b> vertrauen sarahiver · ⌀ 4,9 ★</p>
        </div>
      </div>
      <figure className="lp3-hero-fig">
        <img
          src={IMG.hero}
          alt="Glückliches Paar lächelt sich im Sonnenuntergang an"
          width={600}
          height={750}
         
        />
        <figcaption className="lp3-hero-badge">
          <span className="n">Sarah &amp; Iver</span>
          <span className="d">11 · 07 · 2026</span>
        </figcaption>
      </figure>
    </section>
  );
}

export function StudioIntro() {
  return (
    <div className="wrap lp3-secintro" id="studio">
      <span className="eyebrow">Probiert es hier · ohne Anmeldung</span>
      <h2>Stellt euch eure Seite <b>zusammen.</b></h2>
      <p>Beispieldaten, live. Komponenten, Stil, Schrift, Farben, drei Varianten je Section — der Preis passt sich live an.</p>
    </div>
  );
}

export function LandingFlow() {
  const steps = [
    ['01', 'Anmelden', '14 Tage gratis, keine Kreditkarte. Vor Ablauf kommt eine Erinnerung.'],
    ['02', 'Dashboard öffnen', 'Ihr bekommt den Link zu eurem Dashboard direkt per Mail.'],
    ['03', 'Seite designen', 'Stil, Farben, Schriften, Komponenten und Varianten wählen.'],
    ['04', 'Infos einsetzen', 'Namen, Datum, Location, Fotos und Texte ergänzen.'],
    ['05', 'Live gehen', 'Link teilen. Save-the-Date & Archiv sind inklusive.'],
  ];
  return (
    <section className="lp3-band" aria-labelledby="flow-title">
      <div className="wrap">
        <div className="lp3-sechead">
          <span className="eyebrow">So läuft&apos;s</span>
          <h2 id="flow-title">Von der Anmeldung <b>bis live.</b></h2>
        </div>
        <ol className="lp3-flow">
          {steps.map(([n, t, d]) => (
            <li key={n} className="lp3-fstep">
              <span className="fn">{n}</span>
              <h4>{t}</h4>
              <p>{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function LandingFounderProof() {
  const proof = [
    ['120+', 'Paare in DACH'],
    ['4,9/5', '⌀ Bewertung'],
    ['8', 'Design-Stile'],
    ['EU', 'Server · DSGVO'],
    ['1 Std.', 'bis online'],
  ];
  const voices = [
    ['★★★★★', 'In einem Abend stand die Seite. Unsere Gäste dachten, wir hätten jemanden bezahlt.', 'Lea M.', 'Beta-Nutzerin'],
    ['★★★★★', 'Der Stil-Wechsel ist Wahnsinn — drei ausprobiert, bis es saß, ohne Daten neu einzugeben.', 'Paul & Nora', 'Köln'],
    ['★★★★★', 'RSVP, Galerie, Musikwünsche — alles an einem Ort. Hat alles ersetzt.', 'Tim K.', 'Hamburg'],
  ];
  return (
    <section className="lp3-band" aria-labelledby="founder-title">
      <div className="wrap">
        <div className="lp3-founder">
          <img src={IMG.founder} alt="Verliebtes Paar in einem sommerlichen Feld" width={480} height={480} loading="lazy" />
          <div>
            <span className="eyebrow">Von Paaren für Paare</span>
            <blockquote id="founder-title">
              „Wir haben sarahiver für <b>unsere eigene Hochzeit</b> gebaut — weil uns
              alles andere zu teuer, zu kompliziert oder zu hässlich war."
            </blockquote>
            <p className="who"><b>Sarah &amp; Iver Gentz</b><span>Gründer · heiraten im Juli 2026 in Hamburg</span></p>
          </div>
        </div>

        <ul className="lp3-proof">
          {proof.map(([b, s]) => (
            <li key={s}><div className="big">{b}</div><div className="sm">{s}</div></li>
          ))}
        </ul>

        <div className="lp3-tlist">
          {voices.map(([stars, quote, name, src]) => (
            <figure key={name} className="lp3-tcard">
              <div className="stars" aria-label="5 von 5 Sternen">{stars}</div>
              <p>„{quote}"</p>
              <figcaption><b>{name}</b> · {src}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingGallery() {
  const shots = [
    [IMG.g1, 'Paar lächelt sich im Sonnenuntergang an'],
    [IMG.g2, 'Paar umarmt sich draußen im Sommer'],
    [IMG.g3, 'Paar umarmt sich im Sonnenuntergang'],
    [IMG.g4, 'Paar posiert glücklich im Freien'],
  ];
  return (
    <section className="lp3-band" aria-labelledby="gallery-title">
      <div className="wrap">
        <div className="lp3-sechead">
          <span className="eyebrow">Echte Ergebnisse</span>
          <h2 id="gallery-title">Seiten, die <b>nach dem Paar aussehen.</b></h2>
        </div>
        <div className="lp3-gallery">
          {shots.map(([u, alt]) => (
            <img key={u} src={u} alt={alt} width={300} height={375} loading="lazy" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingPricing() {
  return (
    <section className="lp3-band" id="preise" aria-labelledby="pricing-title">
      <div className="wrap">
        <div className="lp3-sechead">
          <span className="eyebrow">Transparent &amp; fair</span>
          <h2 id="pricing-title">Ein Preis, <b>der mitwächst.</b></h2>
          <p>Standard immer 9 €. Jeder Zusatz-Bereich hebt euch in die nächste Stufe — ihr zahlt nur, was ihr nutzt.</p>
        </div>
        <ul className="lp3-ptable">
          {PRICING_TIERS.map((t) => (
            <li key={t.key} className={`lp3-ptier${t.isPopular ? ' hl' : ''}`}>
              <div className="pl">{t.name}</div>
              <div className="pp">{t.price}<span> €</span></div>
              <div className="pd">{t.zusatz === 0 ? 'nur Basis' : t.zusatz === 11 ? 'alle 11 Extras' : `bis ${t.zusatz} Extras`}</div>
            </li>
          ))}
        </ul>
        <p className="lp3-pfoot">Monatlich, <b>jederzeit kündbar</b> — so lange online, wie ihr wollt. Eigene Domain optional: <b>39 € einmalig + 5 €/Monat</b>.</p>
      </div>
    </section>
  );
}

export function LandingFaq() {
  const faqs = [
    ['Kann ich das Design später ändern?', 'Ja — Design, Farben und Schriften jederzeit mit einem Klick wechseln, ohne dass Texte oder Zusagen verloren gehen.'],
    ['Sind meine Daten geschützt?', 'Ihr könnt die ganze Seite oder einzelne Bereiche mit einem Passwort schützen. Gehostet in der EU, DSGVO-konform.'],
    ['Was passiert nach der Hochzeit?', 'Save-the-Date davor und ein Archiv danach sind inklusive — die Seite begleitet euch den ganzen Weg.'],
    ['Wie lange kann die Seite online bleiben?', 'So lange ihr wollt. Monatlich, jederzeit kündbar.'],
  ];
  return (
    <section className="lp3-band" aria-labelledby="faq-title">
      <div className="wrap">
        <div className="lp3-sechead">
          <span className="eyebrow">Antworten</span>
          <h2 id="faq-title">Häufige <b>Fragen.</b></h2>
        </div>
        <div className="lp3-faq">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="lp3-footer">
      <div className="wrap">
        <h2>Baut die Seite, die <b>nur euch gehört.</b></h2>
        <p className="cc" style={{ marginBottom: 8 }}>14 Tage kostenlos · keine Kreditkarte nötig</p>
        <a href="#studio" className="cta">Genau so übernehmen &amp; starten</a>
        <p className="lp3-credit">Beispielbilder: Pexels (freie Lizenz) · Beispieldaten &amp; Stimmen zu Demozwecken</p>
      </div>
    </footer>
  );
}
