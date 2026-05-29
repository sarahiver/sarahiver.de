import DashboardSection from '@/components/dashboard/DashboardSection';
import ComingSoonSection from '@/components/dashboard/ComingSoonSection';

export default function Page() {
  return (
    <DashboardSection
      title="Foto-Uploads"
      description="Die Bilder, die eure Gäste vor der Hochzeit hochgeladen haben."
    >
      <ComingSoonSection what="Foto-Uploads" />
    </DashboardSection>
  );
}
