import DashboardSection from '@/components/dashboard/DashboardSection';
import PhotosSection from './PhotosSection';
import { loadDashboardData } from '@/lib/dashboard-data';
import { loadPhotoUploads } from '@/lib/photo-uploads-data';
import { notFound, redirect } from 'next/navigation';

/**
 * /dashboard/[slug]/photos
 *
 * Anzeige aller von Gästen hochgeladenen Fotos. Nur erreichbar wenn der
 * Foto-Upload-Bereich gebucht ist.
 */
export default async function PhotosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadDashboardData(slug);
  if (!data) notFound();

  if (!data.purchasedKeys.includes('photoupload')) {
    redirect(`/dashboard/${slug}/upgrade`);
  }

  const photos = await loadPhotoUploads(data.site.id);

  return (
    <DashboardSection
      title="Foto-Uploads"
      description="Von Gästen vor und nach der Hochzeit hochgeladene Fotos. Ladet sie als ZIP herunter — danach werden sie automatisch aus dem Online-Speicher gelöscht."
    >
      <PhotosSection slug={slug} initialPhotos={photos} />
    </DashboardSection>
  );
}
