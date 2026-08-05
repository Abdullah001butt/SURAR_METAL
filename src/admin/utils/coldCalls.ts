import { supabase } from '@/services/supabase'

export type ColdCallStatus = 'not_called' | 'called' | 'interested' | 'follow_up' | 'not_interested' | 'converted'
export type ColdCallSource = 'cold_call' | 'directory' | 'referral' | 'linkedin' | 'other'

export interface ColdCall {
  id: number
  name: string
  company: string | null
  phone: string
  source: ColdCallSource
  status: ColdCallStatus
  notes: string | null
  follow_up_date: string | null
  created_at: string
  updated_at: string
}

export const COLD_CALL_STATUS_OPTIONS: ColdCallStatus[] = [
  'not_called',
  'called',
  'interested',
  'follow_up',
  'not_interested',
  'converted',
]

export async function fetchColdCalls(): Promise<ColdCall[]> {
  const { data, error } = await supabase.from('cold_calls').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function updateColdCallStatus(id: number, status: ColdCallStatus) {
  return supabase.from('cold_calls').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function upsertColdCall(
  values: Partial<Omit<ColdCall, 'id' | 'created_at' | 'updated_at'>>,
  id?: number,
) {
  const payload = { ...values, updated_at: new Date().toISOString() }
  return id
    ? supabase.from('cold_calls').update(payload).eq('id', id)
    : supabase.from('cold_calls').insert(payload)
}

export async function deleteColdCall(id: number) {
  return supabase.from('cold_calls').delete().eq('id', id)
}
