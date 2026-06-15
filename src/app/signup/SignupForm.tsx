'use client';

import { useMemo, useState, useTransition } from 'react';
import { startCheckout, type CheckoutInput } from './actions';
import {
  ADDON_KEYS,
  STANDARD_KEYS,
  BEREICH_LABEL,
  TIERS,
  tierForCount,
  monthlyTotal,
  DOMAIN_SETUP_PRICE,
} from '@/lib/funnel';
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
  initialAddons: string[];
  initialDomain: boolean;
  canceled: boolean;
}

export default function SignupForm({ initialAddons, initialDomain, canceled }: Props) {
  const [email, setEmail] = useState('');
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [slug, setSlug] = useState('');
  const [style, setStyle] = useState<string>('editorial');
  const [addons, setAddons] = useState<Set<string>>(new Set(initialAddons));
  const [domain, setDomain] = useState(initialDomain);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const count = addons.size;
  const tier = tierForCount(count);
  const total = monthlyTotal(count, domain);

  const slugFormatOk = slug === '' || (isValidSlugFormat(slug) && !isReservedSlug(slug));

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

  const toggleAddon = (key: string) => {
    setAddons((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const submit = () => {
    setError(null);
    const payload: CheckoutInput = {
      email,
      name1,
      name2,
      weddingDate,
      slug: slug.toLowerCase(),
      style,
      addons: Array.from(addons),
      domain,
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
        <p className="su-lede">Konfiguration prüfen, Eckdaten eintragen — dann sicher mit Stripe bezahlen.</p>
      </div>

      {canceled && (
        <div className="su-note">Zahlung abgebrochen — eure Auswahl ist noch da. Jederzeit erneut starten.</div>
      )}

      {/* Bereiche */}
      <section className="su-card">
        <div className="su-label">Immer dabei</div>
        <div className="su-pills">
          {STANDARD_KEYS.map((k) => (
            <span key={k} className="su-pill is-fixed">{BEREICH_LABEL[k]} <small>FIX</small></span>
          ))}
        </div>

        <div className="su-label" style={{ marginTop: 20 }}>Zusatz-Bereiche — frei wählbar</div>
        <div className="su-pills">
          {ADDON_KEYS.map((k) => {
            const active = addons.has(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggleAddon(k)}
                className={`su-pill${active ? ' is-active' : ''}`}
                aria-pressed={active}
              >
                {BEREICH_LABEL[k]} <small>{active ? '✓' : '+'}</small>
              </button>
            );
          })}
        </div>

        <label className="su-domain">
          <input type="checkbox" checked={domain} onChange={(e) => setDomain(e.target.checked)} />
          <span>
            Eigene Domain <small>{DOMAIN_SETUP_PRICE} € einmalig · 5 €/Monat</small>
          </span>
        </label>
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
            <label>Euer Name</label>
            <input value={name1} onChange={(e) => setName1(e.target.value)} placeholder="Sarah" />
          </div>
          <div className="su-field">
            <label>Partner/in</label>
            <input value={name2} onChange={(e) => setName2(e.target.value)} placeholder="Iver" />
          </div>
          <div className="su-field">
            <label>Hochzeitsdatum</label>
            <input type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} />
          </div>
          <div className="su-field">
            <label>E-Mail (für Login & Rechnung)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ihr@email.de" />
          </div>
          <div className="su-field su-field--full">
            <label>Eure Web-Adresse</label>
            <div className="su-slug">
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="sarah-und-iver"
              />
              <span className="su-slug-suffix">.sarahiver.de</span>
            </div>
            {!slugFormatOk && (
              <span className="su-err-inline">Nur Buchstaben, Zahlen und Bindestriche — und nicht reserviert.</span>
            )}
          </div>
        </div>
      </section>

      {/* Zusammenfassung + CTA */}
      <section className="su-summary">
        <div className="su-sum-row">
          <span>{count} / 11 Zusatz-Bereiche · {TIERS[tier].label}</span>
          <strong>{total} €<small>/Monat</small></strong>
        </div>
        {domain && <div className="su-sum-note">+ {DOMAIN_SETUP_PRICE} € einmalige Domain-Einrichtung (erste Rechnung)</div>}
        {error && <div className="su-error">{error}</div>}
        <button type="button" className="su-cta" onClick={submit} disabled={!canSubmit || pending}>
          {pending ? 'Weiter zu Stripe …' : 'Zahlungspflichtig buchen'}
        </button>
        <p className="su-legal">
          Sichere Zahlung über Stripe. Monatlich kündbar gemäß Mindestlaufzeit. Mit dem Buchen akzeptiert ihr AGB & Datenschutz.
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
.su-pill{display:inline-flex;align-items:center;gap:8px;border:1px solid #DAD4C7;background:#FAF7F0;border-radius:999px;padding:8px 14px;font-size:13px;cursor:pointer;color:#0F0E0C;}
.su-pill small{font-family:'DM Mono',monospace;font-size:10px;color:#a39d92;}
.su-pill.is-active{border-color:#0F0E0C;background:#0F0E0C;color:#fff;}
.su-pill.is-active small{color:#fff;}
.su-pill.is-fixed{cursor:default;background:#F1EDE3;border-style:dashed;}
.su-domain{display:flex;align-items:center;gap:10px;margin-top:18px;font-size:14px;cursor:pointer;}
.su-domain small{font-family:'DM Mono',monospace;font-size:11px;color:#a39d92;margin-left:6px;}
.su-styles{display:flex;flex-wrap:wrap;gap:8px;}
.su-style{border:1px solid #DAD4C7;background:#FAF7F0;border-radius:8px;padding:9px 14px;font-size:13px;cursor:pointer;color:#0F0E0C;}
.su-style.is-active{border-color:#D63B2F;background:#D63B2F;color:#fff;}
.su-hint{font-size:12px;color:#8a857c;margin-top:10px;}
.su-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.su-field{display:flex;flex-direction:column;gap:6px;}
.su-field--full{grid-column:1 / -1;}
.su-field label{font-size:12px;color:#5f5b53;}
.su-field input{border:1px solid #DAD4C7;border-radius:8px;padding:11px 12px;font-size:14px;background:#fff;color:#0F0E0C;}
.su-field input:focus{outline:none;border-color:#0F0E0C;}
.su-slug{display:flex;align-items:center;border:1px solid #DAD4C7;border-radius:8px;overflow:hidden;background:#fff;}
.su-slug input{border:none;flex:1;}
.su-slug-suffix{font-family:'DM Mono',monospace;font-size:12px;color:#8a857c;padding:0 12px;white-space:nowrap;}
.su-err-inline{font-size:12px;color:#C2371F;}
.su-summary{position:sticky;bottom:0;background:#fff;border:1px solid #E7E2D6;border-radius:14px;padding:18px 20px;margin-top:8px;box-shadow:0 -6px 24px rgba(0,0,0,.04);}
.su-sum-row{display:flex;justify-content:space-between;align-items:baseline;font-size:14px;}
.su-sum-row strong{font-family:Fraunces,serif;font-size:26px;}
.su-sum-row strong small{font-size:13px;color:#8a857c;font-weight:400;}
.su-sum-note{font-size:12px;color:#8a857c;margin-top:4px;}
.su-error{background:#FBE9E5;border:1px solid #F0C5BC;color:#A8301B;border-radius:8px;padding:10px 12px;font-size:13px;margin-top:12px;}
.su-cta{width:100%;margin-top:14px;background:#0F0E0C;color:#fff;border:none;border-radius:10px;padding:15px;font-size:15px;font-weight:600;cursor:pointer;}
.su-cta:disabled{opacity:.45;cursor:not-allowed;}
.su-legal{font-size:11px;color:#a39d92;line-height:1.5;margin-top:12px;text-align:center;}
@media(max-width:560px){.su-grid{grid-template-columns:1fr;}}
`;
