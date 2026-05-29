import DashboardSection from '@/components/dashboard/DashboardSection';
import ComingSoonSection from '@/components/dashboard/ComingSoonSection';

export default function Page() {
  return (
    <DashboardSection
      title="RSVP-Antworten"
      description="Hier seht ihr, wer zugesagt, abgesagt oder noch nicht geantwortet hat."
    >
      <ComingSoonSection what="RSVP-Antworten" />
    </DashboardSection>
  );
}
