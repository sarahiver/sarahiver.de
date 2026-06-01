import { createSupabaseAdminClient } from './supabase-admin';

export interface PhotoUploadRecord {
  id: string;
  wedding_site_id: string;
  cloudinary_url: string;
  cloudinary_public_id: string | null;
  uploaded_by: string;
  approved: boolean;
  created_at: string;
}

export async function loadPhotoUploads(siteId: string): Promise<PhotoUploadRecord[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.error('[loadPhotoUploads] no admin client');
    return [];
  }

  const { data, error } = await supabase
    .from('wedding_photo_uploads')
    .select('*')
    .eq('wedding_site_id', siteId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[loadPhotoUploads] failed:', error);
    return [];
  }
  return (data || []) as PhotoUploadRecord[];
}
