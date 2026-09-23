'use client';

import { useMemo, useState, useTransition } from 'react';
import { startCheckout, type CheckoutInput } from './actions';
import { ALL_BEREICH_KEYS, BEREICH_LABEL } from '@/lib/funnel';
import { WEBSITE_PRICE_EUR, DOMAIN_SETUP_PRICE_EUR, ACCESS_MONTHS, CUSTOM_DOMAIN_ENABLED } from '@/lib/pricing';
import { CONSENT_TEXT, VAT_NOTE } from '@/lib/legal';
import { VALID_STYLE_IDS } from '@/lib/style-migration';
import { isValidSlugFormat, isReservedSlug, hasReservedSlugPrefix } from '@/lib/slug-validation';

const STYLE_LABEL: Record<string, string> = {
  editorial: 'Editorial',
  brutalist: 'Brutalist',
  organic: 'Organic',
  mono: 'Mono',
  opulent: 'Opulent',
  liquefy: 'Liquefy',
  kinetic: 'Kinetic',
  bauhaus: 'Bauhaus',
};

interface Props {
  /** Wunschdomain aus dem Domain-Check der Landing (?domain=lea-und-ben.de). */
  initialDomainWish: string;
  canceled: boolean;
  /** Vorauswahl aus der Demo-Seite (/demo/[style]). */
  initialStyle?: string;
}

export default function SignupForm({ initialDomainWish, canceled, initialStyle }: Props) {
  const [email, setEmail] = useState('');
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [slug, setSlug] = useState('');
  const [style, setStyle] = useState<string>(initialStyle || 'editorial');
  const [domain, setDomain] = useState(Boolean(initialDomainWish));
  const [domainWish, setDomainWish] = useState(initialDomainWish);
  // Pflicht-Zustimmungen — nie vorausgewählt, jede einzeln aktiv zu setzen.
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentImmediate, setConsentImmediate] = useState(false);
  const [consentAck, setConsentAck] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const slugFormatOk =
    slug === '' || (isValidSlugFormat(slug) && !isReservedSlug(slug) && !hasReservedSlugPrefix(slug));
  const withDomain = CUSTOM_DOMAIN_ENABLED && domain;
  const total = WEBSITE_PRICE_EUR + (withDomain ? DOMAIN_SETUP_PRICE_EUR : 0);

  const canSubmit = useMemo(
    () =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      name1.trim() &&
      name2.trim() &&
      /^\d{4}-\d{2}-\d{2}$/.test(weddingDate) &&
      slug &&
      slugFormatOk &&
      consentTerms &&
      consentImmediate &&
      consentAck,
    [email, name1, name2, weddingDate, slug, slugFormatOk, consentTerms, consentImmediate, consentAck],
  );

  const submit = () => {
    setError(null);
    const payload: CheckoutInput = {
      email,
      name1,
      name2,
      weddingDate,
      slug: slug.toLowerCase(),
      style,
      domain,
      domainWish: domain ? domainWish.trim().toLowerCase() : '',
      consents: { terms: consentTerms, immediate: consentImmediate, acknowledge: consentAck },
    };
    startTransition(async () => {
      const res = await startCheckout(payload);
      if ('error' in res) {
        setError(res.error);
        return;
      }
      window.location.href = res.url;
    });
  };

  return (
    <div className="su-wrap">
      <style>{styles}</style>

      <div className="su-head">
        <span className="su-eyebrow">Eure Hochzeitsseite</span>
        <h1 className="su-title">Fast geschafft</h1>
        <p className="su-lede">
          Eckdaten eintragen, einmal bezahlen — danach bekommt ihr sofort den Login zu eurem
          Dashboard.
        </p>
      </div>

      {canceled && (
        <div className="su-note">
          Zahlung abgebrochen — eure Eingaben sind noch da. Ihr könnt jederzeit erneut starten.
        </div>
      )}

      {/* Leistungsumfang */}
      <section className="su-card">
        <div className="su-label">Alles enthalten</div>
        <div className="su-pills">
          {ALL_BEREICH_KEYS.map((k) => (
            <span key={k} className="su-pill is-fixed">
              {BEREICH_LABEL[k]}
            </span>
          ))}
        </div>
        <p className="su-hint">
          Alle Bereiche sind im Preis enthalten. Ihr entscheidet im Dashboard, welche ihr benutzt
          und in welcher Reihenfolge sie auf eurer Seite stehen.
        </p>
      </section>

      {/* Stil */}
      <section className="su-card">
        <div className="su-label">Start-Stil</div>
        <div className="su-styles">
          {VALID_STYLE_IDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              className={`su-style${style === s ? ' is-active' : ''}`}
              aria-pressed={style === s}
            >
              {STYLE_LABEL[s] ?? s}
            </button>
          ))}
        </div>
        <p className="su-hint">Den Stil könnt ihr später im Dashboard jederzeit ändern.</p>
      </section>

      {/* Eckdaten */}
      <section className="su-card">
        <div className="su-grid">
          <div className="su-field">
            <label htmlFor="su-name1">Euer Name</label>
            <input id="su-name1" value={name1} onChange={(e) => setName1(e.target.value)} placeholder="Sarah" />
          </div>
          <div className="su-field">
            <label htmlFor="su-name2">Partner/in</label>
            <input id="su-name2" value={name2} onChange={(e) => setName2(e.target.value)} placeholder="Iver" />
          </div>
          <div className="su-field">
            <label htmlFor="su-date">Hochzeitsdatum</label>
            <input
              id="su-date"
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
            />
          </div>
          <div className="su-field">
            <label htmlFor="su-email">E-Mail (für Login &amp; Rechnung)</label>
            <input
              id="su-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihr@email.de"
            />
          </div>
          <div className="su-field su-field--full">
            <label htmlFor="su-slug">Eure Web-Adresse</label>
            <div className="su-slug">
              <input
                id="su-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="sarah-und-iver"
              />
              <span className="su-slug-suffix">.sarahiver.de</span>
            </div>
            {!slugFormatOk && (
              <span className="su-err-inline">
                Nur Buchstaben, Zahlen und Bindestriche — und nicht reserviert.
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Eigene Domain — im MVP nicht kaufbar (siehe CUSTOM_DOMAIN_ENABLED) */}
      {CUSTOM_DOMAIN_ENABLED && (
      <section className="su-card">
        <label className="su-domain">
          <input type="checkbox" checked={domain} onChange={(e) => setDomain(e.target.checked)} />
          <span>
            Eigene Domain verbinden <small>{DOMAIN_SETUP_PRICE_EUR} € einmalig</small>
          </span>
        </label>
        {domain && (
          <div className="su-field" style={{ marginTop: 14 }}>
            <label htmlFor="su-domainwish">Eure Wunschdomain</label>
            <input
              id="su-domainwish"
              value={domainWish}
              onChange={(e) => setDomainWish(e.target.value)}
              placeholder="lea-und-ben.de"
            />
            <span className="su-hint">
              Wir melden uns nach dem Kauf und richten sie für euch ein.
            </span>
          </div>
        )}
      </section>
      )}

      {/* Zusammenfassung + CTA */}
      <section className="su-summary">
        <div className="su-sum-row">
          <span>Hochzeitswebsite{withDomain ? ' + eigene Domain' : ''}</span>
          <strong>
            {total} €<small> einmalig</small>
          </strong>
        </div>
        <div className="su-sum-note">
          Kein Abo, keine automatische Verlängerung. Eure Seite ist {ACCESS_MONTHS} Monate online.
          <br />
          {VAT_NOTE}
        </div>
        <div className="su-consents">
          <label className="su-consent">
            <input type="checkbox" checked={consentTerms} onChange={(e) => setConsentTerms(e.target.checked)} />
            <span>
              Ich akzeptiere die{' '}
              <a href="/agb" target="_blank" rel="noopener">AGB</a> und habe die{' '}
              <a href="/widerruf" target="_blank" rel="noopener">Widerrufsbelehrung</a> sowie die{' '}
              <a href="/datenschutz" target="_blank" rel="noopener">Datenschutzerklärung</a> zur Kenntnis genommen.
            </span>
          </label>
          <label className="su-consent">
            <input type="checkbox" checked={consentImmediate} onChange={(e) => setConsentImmediate(e.target.checked)} />
            <span>{CONSENT_TEXT.immediate}</span>
          </label>
          <label className="su-consent">
            <input type="checkbox" checked={consentAck} onChange={(e) => setConsentAck(e.target.checked)} />
            <span>{CONSENT_TEXT.acknowledge}</span>
          </label>
        </div>
        {error && <div className="su-error">{error}</div>}
        <button type="button" className="su-cta" onClick={submit} disabled={!canSubmit || pending}>
          {pending ? 'Weiter zu Stripe …' : `Zahlungspflichtig bestellen — ${total} €`}
        </button>
        <p className="su-legal">Sichere Zahlung über Stripe.</p>
      </section>
    </div>
  );
}

const styles = `
.su-consents{display:grid;gap:10px;margin:16px 0 14px;text-align:left;}
.su-consent{display:grid;grid-template-columns:20px 1fr;gap:10px;align-items:start;font-size:13px;line-height:1.5;color:#2D2520;cursor:pointer;}
.su-consent input{width:18px;height:18px;margin-top:1px;accent-color:#8E574E;}
.su-consent a{color:inherit;text-decoration:underline;}
.su-wrap{max-width:760px;margin:0 auto;padding:48px 20px 80px;color:#2D2520;font-family:Inter,system-ui,sans-serif;}
.su-head{margin-bottom:28px;}
.su-eyebrow{font-family:Inter,system-ui,sans-serif;font-size:11px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:#8E574E;}
.su-title{font-family:Fraunces,Georgia,serif;font-size:clamp(29px,5.4vw,42px);line-height:1.06;letter-spacing:-.02em;margin:8px 0 10px;font-weight:300;font-variation-settings:'opsz' 144,'SOFT' 0,'WONK' 0;}
.su-lede{color:#8A7F73;font-size:15px;line-height:1.6;max-width:48ch;}
.su-note{background:#ECD7B6;border:1px solid #D4A574;border-radius:10px;padding:12px 14px;font-size:13px;margin-bottom:20px;}
.su-card{background:#fff;border:1px solid #E2D6C1;border-radius:10px;padding:22px;margin-bottom:16px;}
.su-label{font-family:Inter,system-ui,sans-serif;font-size:11px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:#8E574E;margin-bottom:12px;}
.su-pills{display:flex;flex-wrap:wrap;gap:8px;}
.su-pill{display:inline-flex;align-items:center;gap:8px;border:1px solid #E2D6C1;background:#F4EDE2;border-radius:999px;padding:8px 14px;font-size:13px;color:#2D2520;}
.su-pill.is-fixed{background:#F4EDE2;}
.su-domain{display:flex;align-items:center;gap:10px;font-size:14px;cursor:pointer;}
.su-domain small{font-family:Inter,system-ui,sans-serif;font-size:11px;color:#8A7F73;margin-left:6px;}
.su-styles{display:flex;flex-wrap:wrap;gap:8px;}
.su-style{border:1px solid #E2D6C1;background:#F4EDE2;border-radius:8px;padding:9px 14px;font-size:13px;cursor:pointer;color:#2D2520;}
.su-style.is-active{border-color:#B5746A;background:#B5746A;color:#fff;}
.su-hint{font-size:12px;color:#8A7F73;margin-top:10px;line-height:1.5;}
.su-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.su-field{display:flex;flex-direction:column;gap:6px;}
.su-field--full{grid-column:1 / -1;}
.su-field label{font-size:12px;color:#5A4F46;}
.su-field input{border:1px solid #E2D6C1;border-radius:8px;padding:11px 12px;font-size:14px;background:#fff;color:#2D2520;}
.su-field input:focus{outline:2px solid #B5746A;outline-offset:2px;border-color:#B5746A;}
.su-field .su-hint{margin-top:2px;}
.su-slug{display:flex;align-items:center;border:1px solid #E2D6C1;border-radius:8px;overflow:hidden;background:#fff;}
.su-slug input{border:none;flex:1;}
.su-slug-suffix{font-family:Inter,system-ui,sans-serif;font-size:12px;color:#8A7F73;padding:0 12px;white-space:nowrap;}
.su-err-inline{font-size:12px;color:#8E574E;}
.su-summary{position:sticky;bottom:0;background:#fff;border:1px solid #E2D6C1;border-radius:10px;padding:18px 20px;margin-top:8px;box-shadow:0 -6px 24px rgba(0,0,0,.04);}
.su-sum-row{display:flex;justify-content:space-between;align-items:baseline;gap:16px;font-size:14px;}
.su-sum-row strong{font-family:Fraunces,serif;font-size:26px;white-space:nowrap;}
.su-sum-row strong small{font-size:13px;color:#8A7F73;font-weight:400;}
.su-sum-note{font-size:12px;color:#8A7F73;margin-top:6px;}
.su-error{background:#F6E4E0;border:1px solid #E8C9C0;color:#8E574E;border-radius:8px;padding:10px 12px;font-size:13px;margin-top:12px;}
.su-cta{width:100%;margin-top:14px;background:#B5746A;color:#fff;border:none;border-radius:999px;padding:16px;font-size:15px;font-weight:500;cursor:pointer;transition:background .2s ease;}
.su-cta:hover:not(:disabled){background:#8E574E;}
.su-cta:disabled{opacity:.45;cursor:not-allowed;}
.su-legal{font-size:11px;color:#8A7F73;line-height:1.5;margin-top:12px;text-align:center;}
@media(max-width:560px){.su-grid{grid-template-columns:1fr;}}
`;
