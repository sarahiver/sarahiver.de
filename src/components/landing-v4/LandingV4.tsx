import type { ComponentType } from 'react';
import {
  DEMOS,
  DEMO_ENTRY,
  DOMAIN,
  FAQ,
  FEATURES,
  FINAL,
  FOOTER,
  HERO,
  LANDING_IMAGES,
  NAV,
  PRICING,
  STEPS,
} from '@/lib/landing-v4';
import { DEMO_PAGES, img } from '@/lib/demo-pages';
import { formatDateDe, CUSTOM_DOMAIN_ENABLED } from '@/lib/pricing';
import DemoCarousel, { type DemoItem } from './DemoCarousel';
import DeviceMockup from './DeviceMockup';
import DomainCheck from './DomainCheck';
import FaqAccordion from './FaqAccordion';
import StyleShowcase from './StyleShowcase';
import {
  IconArrowRight,
  IconCheck,
  IconDevices,
  IconHeart,
  IconInfinity,
  IconInstagram,
  IconNoteArrow,
  IconPalette,
  IconPen,
  IconPinterest,
  IconRocket,
  IconSparkle,
  IconUpload,
  IconUser,
} from './icons';
import { TrackView } from '@/components/analytics/Track';
import { EVENTS } from '@/lib/analytics';

const FEATURE_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  sparkle: IconSparkle,
  heart: IconHeart,
  devices: IconDevices,
  pen: IconPen,
  infinity: IconInfinity,
};

const STEP_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  user: IconUser,
  palette: IconPalette,
  upload: IconUpload,
  rocket: IconRocket,
};

/**
 * Demo-Karten aus den echten Vorlagen bauen.
 *
 * Quelle sind die acht kuratierten Demos (lib/demo-pages.ts) — dieselben
 * Daten, aus denen /demo/[style] rendert. Jede Karte führt damit auf eine
 * echte, vollständige Beispielseite.
 */
function buildDemoItems(): DemoItem[] {
  return DEMO_PAGES.map((d) => ({
    couple: `${d.name1} & ${d.name2}`,
    note: d.location,
    date: formatDateDe(d.date),
    style: d.style.charAt(0).toUpperCase() + d.style.slice(1),
    text: DEMOS.taglines[d.style] ?? d.claim,
    href: `/demo/${d.style}`,
    image: img(d.hero, 1200),
  }));
}

function Logo() {
  return (
    <a className="sd-logo" href="/">
      {NAV.logo.pre}
      <b>{NAV.logo.bold}</b>
      {NAV.logo.post}
    </a>
  );
}

export default function LandingV4() {
  const demoItems = buildDemoItems();

  return (
    <div className="sdv4">
      <TrackView event={EVENTS.landingView} onceKey="landing" />

      {/* ---------------------------------------------------------------- Header */}
      <header className="sd-header">
        <div className="sd-wrap sd-header-in">
          <Logo />
          <nav className="sd-nav" aria-label="Hauptnavigation">
            {NAV.links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
            <a className="sd-btn sd-btn--primary sd-btn--sm" href={NAV.cta.href}>
              {NAV.cta.label}
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* ------------------------------------------------------------- Hero */}
        <section className="sd-hero">
          <div className="sd-hero-bg" style={{ backgroundImage: `url(${LANDING_IMAGES.hero})` }} />
          <div className="sd-hero-scrim" />

          <div className="sd-wrap sd-hero-in">
            <div className="sd-hero-copy">
              <p className="sd-eyebrow sd-eyebrow--on-dark">{HERO.eyebrow}</p>
              <h1>
                {HERO.h1[0]}
                <br />
                <em>{HERO.h1[1]}</em>
                <br />
                {HERO.h1[2]}
              </h1>
              <p className="sd-lede sd-lede--light">{HERO.lede}</p>

              <div className="sd-hero-actions">
                <a className="sd-btn sd-btn--primary sd-btn--lg" href={HERO.cta.href}>
                  {HERO.cta.label}
                  <IconArrowRight />
                </a>
                <a className="sd-hero-link" href={HERO.ctaSecondary.href}>
                  {HERO.ctaSecondary.label}
                  <IconArrowRight size={14} />
                </a>
              </div>

              <ul className="sd-ticks">
                {HERO.ticks.map((t) => (
                  <li key={t}>
                    <IconCheck />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="sd-hero-visual">
              <DeviceMockup heroImage={LANDING_IMAGES.hero} />
              <p className="sd-note sd-note--hero">
                {HERO.note}
                <IconNoteArrow />
              </p>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- Features */}
        <section className="sd-features">
          <div className="sd-wrap">
            <p className="sd-eyebrow sd-center">{FEATURES.eyebrow}</p>
            <h2 className="sd-h2 sd-center">{FEATURES.h2}</h2>

            <ul className="sd-feature-grid">
              {FEATURES.items.map((item) => {
                const Icon = FEATURE_ICONS[item.icon];
                return (
                  <li className="sd-feature" key={item.title}>
                    <span className="sd-feature-ico">{Icon ? <Icon /> : null}</span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ------------------------------------------------------------ Stile */}
        <StyleShowcase />

        {/* ------------------------------------------------------------ Demos */}
        <section className="sd-demos" id="beispiele">
          <div className="sd-wrap sd-demos-in">
            <div className="sd-demos-copy">
              <p className="sd-eyebrow">{DEMOS.eyebrow}</p>
              <h2 className="sd-h2">
                {DEMOS.h2[0]}
                <br />
                {DEMOS.h2[1]}
              </h2>
              <p className="sd-lede">{DEMOS.lede}</p>
              <a className="sd-btn sd-btn--ink sd-btn--sm" href={DEMOS.cta.href}>
                {DEMOS.cta.label}
                <IconArrowRight size={14} />
              </a>
            </div>

            <DemoCarousel items={demoItems} />
          </div>
        </section>

        {/* ----------------------------------------------------- Demo-Dashboard */}
        <section className="sd-demoentry" id="testen">
          <div className="sd-wrap sd-demoentry-in">
            <div>
              <p className="sd-eyebrow">{DEMO_ENTRY.eyebrow}</p>
              <h2 className="sd-h2">{DEMO_ENTRY.h2}</h2>
              <p className="sd-lede">{DEMO_ENTRY.lede}</p>
            </div>

            <div className="sd-demoentry-side">
              <ul className="sd-checks">
                {DEMO_ENTRY.points.map((p) => (
                  <li key={p}>
                    <IconCheck size={13} />
                    {p}
                  </li>
                ))}
              </ul>
              <a className="sd-btn sd-btn--ink sd-btn--block" href={DEMO_ENTRY.cta.href}>
                {DEMO_ENTRY.cta.label}
                <IconArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------- Domain-Check
            Im MVP ausgeblendet, solange Custom Domains nicht kaufbar sind. */}
        {CUSTOM_DOMAIN_ENABLED && (
        <section
          className="sd-domain"
          id="domain"
          style={{ backgroundImage: `url(${LANDING_IMAGES.domain})` }}
        >
          <div className="sd-wrap sd-domain-wrap">
            <p className="sd-eyebrow sd-eyebrow--on-dark">{DOMAIN.eyebrow}</p>
            <h2 className="sd-h2 sd-h2--light">{DOMAIN.h2}</h2>
            <p className="sd-lede sd-lede--light">{DOMAIN.lede}</p>

            <DomainCheck />

            <p className="sd-note sd-note--domain">
              {DOMAIN.note.split('\n').map((line, i) => (
                <span key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
              <IconNoteArrow />
            </p>
          </div>
        </section>
        )}

        {/* ----------------------------------------------------------- Preise */}
        <section className="sd-pricing" id="preise">
          <div className="sd-wrap sd-pricing-in">
            <div className="sd-pricing-copy">
              <p className="sd-eyebrow">{PRICING.eyebrow}</p>
              <h2 className="sd-h2">{PRICING.h2}</h2>
              <ul className="sd-checks">
                {PRICING.includes.map((line) => (
                  <li key={line}>
                    <IconCheck size={13} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="sd-price-card">
              <p className="sd-eyebrow">{PRICING.card.eyebrow}</p>
              <p className="sd-price">
                {PRICING.card.price} {PRICING.card.currency}
              </p>
              <p className="sd-price-sub">{PRICING.card.sub}</p>
              <p className="sd-note" style={{ marginTop: 6, fontSize: 12 }}>{PRICING.card.vatNote}</p>
              <a className="sd-btn sd-btn--primary sd-btn--block" href={PRICING.card.cta.href}>
                {PRICING.card.cta.label}
                <IconArrowRight size={14} />
              </a>
            </div>

            {CUSTOM_DOMAIN_ENABLED && (
            <aside className="sd-addon-card">
              <p className="sd-eyebrow">{PRICING.addon.eyebrow}</p>
              <div className="sd-addon-head">
                <h3>{PRICING.addon.title}</h3>
                <span className="sd-addon-price">{PRICING.addon.price}</span>
              </div>
              <p>{PRICING.addon.text}</p>
              <a
                className="sd-btn sd-btn--soft sd-btn--block sd-btn--sm"
                href={PRICING.addon.cta.href}
              >
                {PRICING.addon.cta.label}
              </a>
            </aside>
            )}
          </div>
        </section>

        {/* -------------------------------------------------------- 4 Schritte */}
        <section className="sd-steps" id="ablauf">
          <div className="sd-wrap">
            <p className="sd-eyebrow sd-center">{STEPS.eyebrow}</p>
            <h2 className="sd-h2 sd-center">{STEPS.h2}</h2>

            <ol className="sd-steps-grid">
              {STEPS.items.map((step, i) => {
                const Icon = STEP_ICONS[step.icon];
                return (
                  <li className="sd-step" key={step.num}>
                    <span className="sd-step-ico">{Icon ? <Icon /> : null}</span>
                    <p className="sd-step-title">
                      <span className="sd-step-num">{step.num}</span>
                      {step.title}
                    </p>
                    <p>{step.text}</p>
                    {i < STEPS.items.length - 1 ? (
                      <span className="sd-step-arrow" aria-hidden>
                        <IconArrowRight size={14} />
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* -------------------------------------------------------------- FAQ */}
        <section className="sd-faq" id="faq">
          <div className="sd-wrap sd-faq-in">
            <div className="sd-faq-copy">
              <p className="sd-eyebrow">{FAQ.eyebrow}</p>
              <h2 className="sd-h2">{FAQ.h2}</h2>
              <p className="sd-lede">{FAQ.lede}</p>
              <a className="sd-btn sd-btn--ink sd-btn--sm" href={FAQ.cta.href}>
                {FAQ.cta.label}
                <IconArrowRight size={14} />
              </a>
            </div>

            <FaqAccordion
              items={CUSTOM_DOMAIN_ENABLED ? FAQ.items : FAQ.items.filter((f) => !/eigene Domain/i.test(f.q))}
            />
          </div>
        </section>

        {/* ------------------------------------------------- Schluss mit Hero-Bild */}
        <section
          className="sd-final"
          style={{ backgroundImage: `url(${LANDING_IMAGES.final})` }}
        >
          <div className="sd-wrap">
            <p className="sd-eyebrow sd-eyebrow--on-dark">{FINAL.eyebrow}</p>
            <h2 className="sd-h2 sd-h2--light">
              {FINAL.h2[0]}
              <em>{FINAL.h2[1]}</em>
              {FINAL.h2[2]}
            </h2>
            <p className="sd-lede sd-lede--light">{FINAL.lede}</p>
            <a className="sd-btn sd-btn--primary sd-btn--lg" href={FINAL.cta.href}>
              {FINAL.cta.label}
              <IconArrowRight />
            </a>
          </div>
        </section>
      </main>

      {/* ---------------------------------------------------------------- Footer */}
      <footer className="sd-footer">
        <div className="sd-wrap sd-footer-in">
          <Logo />
          <nav className="sd-footer-links" aria-label="Rechtliches">
            {FOOTER.links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="sd-social">
            {FOOTER.social.map((s) => (
              <a
                key={s.name}
                href={s.href}
                aria-label={s.name}
                target="_blank"
                rel="noreferrer noopener"
              >
                {s.name === 'Instagram' ? <IconInstagram /> : <IconPinterest />}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
