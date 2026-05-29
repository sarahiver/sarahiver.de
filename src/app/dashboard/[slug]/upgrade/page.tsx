import DashboardSection from '@/components/dashboard/DashboardSection';
import DashboardIcon from '@/components/dashboard/DashboardIcon';
import { loadDashboardData } from '@/lib/dashboard-data';
import { COMPONENT_CATALOG, ALL_BEREICH_KEYS, priceLabel } from '@/lib/component-catalog';
import type { BereichKey } from '@/types/supabase';
import { notFound } from 'next/navigation';

/**
 * /dashboard/[slug]/upgrade
 *
 * Übersicht: welche Komponenten ihr habt, welche es noch gibt. Aktuell nur
 * Anzeige — der eigentliche Checkout (Stripe) wird später angebunden.
 */

export default async function UpgradePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadDashboardData(slug);
  if (!data) notFound();

  const purchased = new Set<BereichKey>(data.purchasedKeys);
  const purchasedItems = ALL_BEREICH_KEYS.filter((k) => purchased.has(k))
    .map((k) => COMPONENT_CATALOG[k]);
  const availableItems = ALL_BEREICH_KEYS.filter((k) => !purchased.has(k))
    .map((k) => COMPONENT_CATALOG[k]);

  return (
    <DashboardSection
      title="Pakete & Upgrades"
      description="Was ihr habt — und was ihr noch dazubuchen könnt."
    >
      {/* Gebucht */}
      <div className="dash-upgrade-block">
        <div className="dash-upgrade-block-head">
          <h2 className="dash-h2">Gebuchte Komponenten</h2>
          <span className="dash-upgrade-count">{purchasedItems.length} aktiv</span>
        </div>
        <div className="dash-upgrade-grid">
          {purchasedItems.map((c) => (
            <div key={c.key} className="dash-upgrade-card is-purchased">
              <div className="dash-upgrade-card-head">
                <span className="dash-upgrade-card-icon"><DashboardIcon name={c.icon} size={16} /></span>
                <span className="dash-upgrade-card-title">{c.label}</span>
                <span className="dash-upgrade-card-badge">
                  <DashboardIcon name="check" size={11} />
                  enthalten
                </span>
              </div>
              <p className="dash-upgrade-card-desc">{c.desc}</p>
              <div className="dash-upgrade-card-foot">
                <a
                  href={`/dashboard/${slug}/bereiche/${c.key}`}
                  className="dash-upgrade-card-link"
                >
                  Inhalte pflegen →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verfügbar */}
      {availableItems.length > 0 && (
        <div className="dash-upgrade-block">
          <div className="dash-upgrade-block-head">
            <h2 className="dash-h2">Komponenten dazubuchen</h2>
            <span className="dash-upgrade-count">{availableItems.length} verfügbar</span>
          </div>
          <p className="dash-help-text">
            Erweitert eure Hochzeitsseite — die Buchung schalten wir nach Zahlungseingang frei.
          </p>
          <div className="dash-upgrade-grid">
            {availableItems.map((c) => (
              <div key={c.key} className="dash-upgrade-card">
                <div className="dash-upgrade-card-head">
                  <span className="dash-upgrade-card-icon"><DashboardIcon name={c.icon} size={16} /></span>
                  <span className="dash-upgrade-card-title">{c.label}</span>
                  <span className="dash-upgrade-card-price">{priceLabel(c.priceEur)}</span>
                </div>
                <p className="dash-upgrade-card-desc">{c.desc}</p>
                <div className="dash-upgrade-card-foot">
                  {/* TODO: Stripe-Checkout — aktuell nur visuell */}
                  <button type="button" className="dash-btn" disabled>
                    <DashboardIcon name="plus" size={12} />
                    Dazubuchen (bald)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardSection>
  );
}
