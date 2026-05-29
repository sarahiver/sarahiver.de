import DashboardSection from '@/components/dashboard/DashboardSection';
import ComingSoonSection from '@/components/dashboard/ComingSoonSection';

export default function Page() {
  return (
    <DashboardSection
      title="Geschenke-Reservierungen"
      description="Wer welches Wunsch-Item reserviert hat."
    >
      <ComingSoonSection what="Geschenke-Reservierungen" />
    </DashboardSection>
  );
}
