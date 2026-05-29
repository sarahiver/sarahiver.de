import DashboardSection from '@/components/dashboard/DashboardSection';
import ComingSoonSection from '@/components/dashboard/ComingSoonSection';

export default function Page() {
  return (
    <DashboardSection
      title="Gästebuch"
      description="Neue Einträge prüfen und freigeben. Nur freigegebene Einträge erscheinen auf der Seite."
    >
      <ComingSoonSection what="Gästebuch" />
    </DashboardSection>
  );
}
