import DashboardSection from '@/components/dashboard/DashboardSection';
import ComingSoonSection from '@/components/dashboard/ComingSoonSection';

export default function Page() {
  return (
    <DashboardSection
      title="Musikwünsche"
      description="Was eure Gäste hören möchten — als Liste zum Export für DJ/Band."
    >
      <ComingSoonSection what="Musikwünsche" />
    </DashboardSection>
  );
}
