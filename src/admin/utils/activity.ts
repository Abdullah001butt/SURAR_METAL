import { supabase } from '@/services/supabase'

export type ActivityEventType = 'created' | 'status_change' | 'note' | 'converted'

export interface DocumentActivity {
  id: number
  document_id: number
  event_type: ActivityEventType | string
  note: string | null
  created_at: string
}

export async function logActivity(documentId: number, eventType: ActivityEventType, note?: string) {
  await supabase.from('document_activity').insert({ document_id: documentId, event_type: eventType, note: note ?? null })
}

export async function fetchActivity(documentId: number): Promise<DocumentActivity[]> {
  const { data, error } = await supabase
    .from('document_activity')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
