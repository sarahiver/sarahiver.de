'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { GA_ID, captureUtm, getConsent, setConsent } from '@/lib/analytics';

/**
 * GA4 + minimaler Einwilligungshinweis.
 *
 * Reihenfolge: Ohne Messungs-ID wird nichts gerendert. Ohne Einwilligung wird
 * kein Google-Skript geladen und keine Verbindung zu Google aufgebaut — erst
 * der Klick auf „Einverstanden" lädt gtag.js. Die Entscheidung liegt in
 * localStorage, es wird kein Cookie von uns gesetzt.
 *
 * Bewusst kein Consent-Management-System: ein Satz, zwei Knöpfe, Link auf die
 * Datenschutzerklärung.
 */
export default function Analytics() {
  const [consent, setConsentState] = useState<'granted' | 'denied' | 'unset'>('unset');

  useEffect(() => {
    captureUtm();
    setConsentState(getConsent());
    const onChange = (e: Event) => setConsentState((e as CustomEvent).detail);
    window.addEventListener('si-consent', onChange);
    return () => window.removeEventListener('si-consent', onChange);
  }, []);

  if (!GA_ID) return null;

  return (
    <>
      {consent === 'granted' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
gtag('config', '${GA_ID}', { anonymize_ip: true });`}
          </Script>
        </>
      )}

      {consent === 'unset' && (
        <div className="si-consent" role="dialog" aria-label="Messung der Seitennutzung">
          <p className="si-consent__text">
            Dürfen wir anonym messen, wie unsere Seite genutzt wird? Das hilft uns, sie zu
            verbessern. Ohne eure Zustimmung laden wir keine Messwerkzeuge.{' '}
            <a href="/datenschutz" target="_blank" rel="noopener noreferrer">
              Datenschutz
            </a>
          </p>
          <div className="si-consent__actions">
            <button
              type="button"
              className="si-consent__btn si-consent__btn--quiet"
              onClick={() => {
                setConsent('denied');
                setConsentState('denied');
              }}
            >
              Nein, danke
            </button>
            <button
              type="button"
              className="si-consent__btn"
              onClick={() => {
                setConsent('granted');
                setConsentState('granted');
              }}
            >
              Einverstanden
            </button>
          </div>
        </div>
      )}
    </>
  );
}
