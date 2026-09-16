import { DEVICE_FRAME, HERO, LANDING_IMAGES } from '@/lib/landing-v4';

/**
 * Geräte-Mockup im Hero.
 *
 * Der Rahmen ist ein freigestelltes PNG, dessen beide Bildschirme transparent
 * sind. Der Inhalt liegt DARUNTER und scheint durch die Löcher — deshalb muss
 * er exakt auf den gemessenen Ausschnitten sitzen (DEVICE_FRAME in
 * lib/landing-v4.ts, Prozentwerte aus dem Original-PNG).
 *
 * Stapelung: Laptop-Inhalt (1) < Handy-Inhalt (2) < Rahmen (3). Der Handy-
 * Bildschirm überlappt den Laptop-Ausschnitt; im Rahmen selbst verdeckt die
 * Handy-Kante den Rest.
 */
export default function DeviceMockup({ heroImage }: { heroImage: string }) {
  const m = HERO.mockup;
  const { laptop, phone } = DEVICE_FRAME;

  const rect = (r: { left: number; top: number; width: number; height: number }) => ({
    left: `${r.left}%`,
    top: `${r.top}%`,
    width: `${r.width}%`,
    height: `${r.height}%`,
  });

  return (
    <div className="sd-device" style={{ aspectRatio: DEVICE_FRAME.aspectRatio }}>
      {/* Laptop-Bildschirm */}
      <div className="sd-device-screen sd-device-screen--laptop" style={rect(laptop)}>
        <div className="sd-mini" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="sd-mini-in">
            <p className="sd-mini-eyebrow">{m.eyebrow}</p>
            <p className="sd-mini-title">{m.couple}</p>
            <p className="sd-mini-sub">{m.line}</p>
            <p className="sd-mini-date">{m.date}</p>
            <span className="sd-mini-btn">{m.button}</span>
          </div>
        </div>
      </div>

      {/* Handy-Bildschirm */}
      <div className="sd-device-screen sd-device-screen--phone" style={rect(phone)}>
        <div className="sd-miniphone">
          <div className="sd-miniphone-hero" style={{ backgroundImage: `url(${heroImage})` }}>
            <span>{m.couple}</span>
          </div>
          <p className="sd-miniphone-head">{m.phoneTitle}</p>
          {m.phoneRows.map((row) => (
            <div className="sd-miniphone-row" key={row}>
              <i />
              <b>{row}</b>
            </div>
          ))}
        </div>
      </div>

      {/* Rahmen zuletzt — liegt über beiden Bildschirmen */}
      <img
        className="sd-device-frame"
        src={LANDING_IMAGES.deviceFrame}
        alt=""
        aria-hidden
        loading="eager"
      />
    </div>
  );
}
