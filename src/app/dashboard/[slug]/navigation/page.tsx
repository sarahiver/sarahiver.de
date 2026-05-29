import DashboardSection from '@/components/dashboard/DashboardSection';
import NavigationForm from './NavigationForm';
import { loadDashboardData } from '@/lib/dashboard-data';
import { notFound } from 'next/navigation';

/**
 * /dashboard/[slug]/navigation
 *
 * Bisher ein einzelnes Setting (nav_variant). Später erweiterbar um
 * Sticky-Verhalten, Logo-Position, Mobile-Verhalten.
 */
export default async function NavigationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadDashboardData(slug);
  if (!data) notFound();

  const current = data.site.nav_variant ?? 'a';

  return (
    <DashboardSection
      title="Navigation"
      description="Wie die Menüleiste auf eurer Hochzeitsseite aussieht."
    >
      <NavigationForm slug={slug} initialVariant={current} />
    </DashboardSection>
  );
}
