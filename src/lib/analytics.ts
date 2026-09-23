/**
 * Kleine Analytics-Schicht für den MVP-Funnel (nur GA4).
 *
 * Grundsätze:
 *   - Läuft ausschließlich im Browser.
 *   - Ohne NEXT_PUBLIC_GA_MEASUREMENT_ID passiert gar nichts.
 *   - Ohne Einwilligung passiert gar nichts (siehe consent.ts-Teil unten):
 *     Das Skript wird erst nach „Einverstanden" geladen.
 *   - Niemals personenbezogene Daten: keine Namen, E-Mails, Slugs, Daten,
 *     Nachrichten, Gäste- oder Zahlungsdaten. Nur Stil, Betrag, Währung,
 *     Position und UTM-Werte.
 *   - Kein direkter gtag()-Aufruf außerhalb dieser Datei.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
const CONSENT_KEY = 'si_analytics_consent';
const UTM_KEY = 'si_utm';
const ONCE_PREFIX = 'si_evt_';

/** Alle Funnel-Events an einer Stelle — keine freien Strings im Code. */
export const EVENTS = {
  landingView: 'landing_view',
  designPreviewClick: 'design_preview_click',
  demoView: 'demo_view',
  demoCtaClick: 'demo_cta_click',
  signupStart: 'signup_start',
  styleSelected: 'style_selected',
  checkoutStart: 'checkout_start',
  checkoutSuccess: 'checkout_success',
  siteCreated: 'site_created',
  dashboardOpen: 'dashboard_open',
  publishSuccess: 'publish_success',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
export type EventParams = Record<string, string | number | undefined>;

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    gtag?: Gtag;
    dataLayer?: unknown[];
  }
}

const isBrowser = () => typeof window !== 'undefined';
const debug = () => process.env.NODE_ENV !== 'production';

/* -------------------------------------------------------------------------
   Einwilligung
   ------------------------------------------------------------------------- */

export type ConsentState = 'granted' | 'denied' | 'unset';

export function getConsent(): ConsentState {
  if (!isBrowser()) return 'unset';
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : 'unset';
  } catch {
    return 'unset';
  }
}

export function setConsent(value: 'granted' | 'denied') {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* Speicher gesperrt — dann gilt für diese Sitzung „keine Messung". */
  }
  window.dispatchEvent(new CustomEvent('si-consent', { detail: value }));
}

/* -------------------------------------------------------------------------
   UTM — beim ersten Aufruf merken, danach als Parameter mitgeben
   ------------------------------------------------------------------------- */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export function captureUtm() {
  if (!isBrowser()) return;
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) found[k] = v.slice(0, 100);
    }
    if (Object.keys(found).length && !window.sessionStorage.getItem(UTM_KEY)) {
      window.sessionStorage.setItem(UTM_KEY, JSON.stringify(found));
    }
  } catch {
    /* egal */
  }
}

export function getUtm(): Record<string, string> {
  if (!isBrowser()) return {};
  try {
    const raw = window.sessionStorage.getItem(UTM_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/* -------------------------------------------------------------------------
   Events
   ------------------------------------------------------------------------- */

export function trackEvent(name: EventName, params: EventParams = {}) {
  if (!isBrowser()) return;
  // Kampagnenparameter notfalls hier noch sichern — sonst fehlen sie dem
  // allerersten Ereignis eines Aufrufs.
  captureUtm();
  const clean: EventParams = { ...getUtm() };
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') clean[k] = v;
  }
  if (debug()) console.info('[analytics]', name, clean);
  if (!GA_ID || getConsent() !== 'granted') return;
  try {
    window.gtag?.('event', name, clean);
  } catch {
    /* Messung darf nie die Seite stören. */
  }
}

/**
 * Wie trackEvent, aber höchstens einmal je Schlüssel und Sitzung — für
 * Seitenaufrufe und für Ereignisse, die ein Reload sonst wiederholt
 * (z. B. checkout_success auf der Erfolgsseite).
 */
export function trackOnce(key: string, name: EventName, params: EventParams = {}) {
  if (!isBrowser()) return;
  const storageKey = `${ONCE_PREFIX}${key}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, '1');
  } catch {
    /* Ohne Speicher lieber einmal zu viel messen als gar nicht. */
  }
  trackEvent(name, params);
}
