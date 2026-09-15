'use client';

import { useMemo, useState, useTransition } from 'react';
import { startCheckout, type CheckoutInput } from './actions';
import { ALL_BEREICH_KEYS, BEREICH_LABEL } from '@/lib/funnel';
import { WEBSITE_PRICE_EUR, DOMAIN_SETUP_PRICE_EUR, ACCESS_MONTHS } from '@/lib/pricing';
import { VALID_STYLE_IDS } from '@/lib/style-migration';
import { isValidSlugFormat, isReservedSlug } from '@/lib/slug-validation';

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
}

export default function SignupForm({ initialDomainWish, canceled }: Props) {
  const [email, setEmail] = useState('');
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [slug, setSlug] = useState('');
  const [style, setStyle] = useState<string>('editorial');
  const [domain, setDomain] = useState(Boolean(initialDomainWish));
  const [domainWish, setDomainWish] = useState(initialDomainWish);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const slugFormatOk = slug === '' || (isValidSlugFormat(slug) && !isReservedSlug(slug));
  const total = WEBSITE_PRICE_EUR + (domain ? DOMAIN_SETUP_PRICE_EUR : 0);

  const canSubmit = useMemo(
    () =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      name1.trim() &&
      name2.trim() &&
      /^\d{4}-\d{2}-\d{2}$/.test(weddingDate) &&
      slug &&
      slugFormatOk,
    [email, name1, name2, weddingDate, slug, slugFormatOk],
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

      {/* Eigene Domain */}
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

      {/* Zusammenfassung + CTA */}
      <section className="su-summary">
        <div className="su-sum-row">
          <span>Hochzeitswebsite{domain ? ' + eigene Domain' : ''}</span>
          <strong>
            {total} €<small> einmalig</small>
          </strong>
        </div>
        <div className="su-sum-note">
          Kein Abo, keine automatische Verlängerung. Eure Seite ist {ACCESS_MONTHS} Monate online.
        </div>
        {error && <div className="su-error">{error}</div>}
        <button type="button" className="su-cta" onClick={submit} disabled={!canSubmit || pending}>
          {pending ? 'Weiter zu Stripe …' : `Zahlungspflichtig bestellen — ${total} €`}
        </button>
        <p className="su-legal">
          Sichere Zahlung über Stripe. Mit dem Bestellen akzeptiert ihr AGB &amp; Datenschutz.
        </p>
      </section>
    </div>
  );
}

const styles = `
.su-wrap{max-width:760px;margin:0 auto;padding:48px 20px 80px;color:#0F0E0C;font-family:Inter,system-ui,sans-serif;}
.su-head{margin-bottom:28px;}
.su-eyebrow{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8a857c;}
.su-title{font-family:Fraunces,Georgia,serif;font-size:clamp(32px,6vw,46px);line-height:1;margin:8px 0 10px;font-weight:600;}
.su-lede{color:#5f5b53;font-size:15px;line-height:1.6;max-width:48ch;}
.su-note{background:#FBF0D9;border:1px solid #E8D6A8;border-radius:10px;padding:12px 14px;font-size:13px;margin-bottom:20px;}
.su-card{background:#fff;border:1px solid #E7E2D6;border-radius:14px;padding:20px;margin-bottom:16px;}
.su-label{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8a857c;margin-bottom:12px;}
.su-pills{display:flex;flex-wrap:wrap;gap:8px;}
.su-pill{display:inline-flex;align-items:center;gap:8px;border:1px solid #DAD4C7;background:#FAF7F0;border-radius:999px;padding:8px 14px;font-size:13px;color:#0F0E0C;}
.su-pill.is-fixed{background:#F1EDE3;}
.su-domain{display:flex;align-items:center;gap:10px;font-size:14px;cursor:pointer;}
.su-domain small{font-family:'DM Mono',monospace;font-size:11px;color:#a39d92;margin-left:6px;}
.su-styles{display:flex;flex-wrap:wrap;gap:8px;}
.su-style{border:1px solid #DAD4C7;background:#FAF7F0;border-radius:8px;padding:9px 14px;font-size:13px;cursor:pointer;color:#0F0E0C;}
.su-style.is-active{border-color:#0F0E0C;background:#0F0E0C;color:#fff;}
.su-hint{font-size:12px;color:#8a857c;margin-top:10px;line-height:1.5;}
.su-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.su-field{display:flex;flex-direction:column;gap:6px;}
.su-field--full{grid-column:1 / -1;}
.su-field label{font-size:12px;color:#5f5b53;}
.su-field input{border:1px solid #DAD4C7;border-radius:8px;padding:11px 12px;font-size:14px;background:#fff;color:#0F0E0C;}
.su-field input:focus{outline:none;border-color:#0F0E0C;}
.su-field .su-hint{margin-top:2px;}
.su-slug{display:flex;align-items:center;border:1px solid #DAD4C7;border-radius:8px;overflow:hidden;background:#fff;}
.su-slug input{border:none;flex:1;}
.su-slug-suffix{font-family:'DM Mono',monospace;font-size:12px;color:#8a857c;padding:0 12px;white-space:nowrap;}
.su-err-inline{font-size:12px;color:#C2371F;}
.su-summary{position:sticky;bottom:0;background:#fff;border:1px solid #E7E2D6;border-radius:14px;padding:18px 20px;margin-top:8px;box-shadow:0 -6px 24px rgba(0,0,0,.04);}
.su-sum-row{display:flex;justify-content:space-between;align-items:baseline;gap:16px;font-size:14px;}
.su-sum-row strong{font-family:Fraunces,serif;font-size:26px;white-space:nowrap;}
.su-sum-row strong small{font-size:13px;color:#8a857c;font-weight:400;}
.su-sum-note{font-size:12px;color:#8a857c;margin-top:6px;}
.su-error{background:#FBE9E5;border:1px solid #F0C5BC;color:#A8301B;border-radius:8px;padding:10px 12px;font-size:13px;margin-top:12px;}
.su-cta{width:100%;margin-top:14px;background:#0F0E0C;color:#fff;border:none;border-radius:10px;padding:15px;font-size:15px;font-weight:600;cursor:pointer;}
.su-cta:disabled{opacity:.45;cursor:not-allowed;}
.su-legal{font-size:11px;color:#a39d92;line-height:1.5;margin-top:12px;text-align:center;}
@media(max-width:560px){.su-grid{grid-template-columns:1fr;}}
`;
