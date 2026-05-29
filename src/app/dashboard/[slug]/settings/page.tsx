import DashboardSection from '@/components/dashboard/DashboardSection';
import ComingSoonSection from '@/components/dashboard/ComingSoonSection';

export default function Page() {
  return (
    <DashboardSection
      title="Stil & Stammdaten"
      description="Brautpaar-Namen, Datum, Stil, Farben und Fonts."
    >
      <ComingSoonSection what="Stil & Stammdaten" />
    </DashboardSection>
  );
}
