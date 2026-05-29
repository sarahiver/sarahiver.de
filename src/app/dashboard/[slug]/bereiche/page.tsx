import DashboardSection from '@/components/dashboard/DashboardSection';
import ComingSoonSection from '@/components/dashboard/ComingSoonSection';

export default function Page() {
  return (
    <DashboardSection
      title="Bereiche & Reihenfolge"
      description="Welche Bereiche eure Gäste-Seite zeigt, in welcher Reihenfolge und Variante."
    >
      <ComingSoonSection what="Bereiche & Reihenfolge" />
    </DashboardSection>
  );
}
