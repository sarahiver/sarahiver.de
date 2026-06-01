import { createSupabaseAdminClient } from './supabase-admin';

export interface GuestListEntry {
  id: string;
  wedding_site_id: string;
  name: string;
  email: string;
  group_name: string;
  invited_at: string;
  reminder_sent_at: string | null;
  reminder_count: number;
  created_at: string;
}

export async function loadGuestList(siteId: string): Promise<GuestListEntry[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.error('[loadGuestList] no admin client');
    return [];
  }

  const { data, error } = await supabase
    .from('wedding_guest_list')
    .select('*')
    .eq('wedding_site_id', siteId)
    .order('name', { ascending: true });

  if (error) {
    console.error('[loadGuestList] failed:', error);
    return [];
  }
  return (data || []) as GuestListEntry[];
}
