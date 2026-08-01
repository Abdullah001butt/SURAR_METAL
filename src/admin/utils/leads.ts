import { supabase } from '@/services/supabase'
import type { LeadStatus } from '@/admin/types'

export interface UnifiedLead {
  id: string
  source: 'quote' | 'contact'
  name: string
  company: string | null
  email: string
  phone: string | null
  interest: string | null
  message: string | null
  status: LeadStatus
  notes: string | null
  created_at: string
}

export const LEAD_STATUS_OPTIONS: LeadStatus[] = ['new', 'contacted', 'quoted', 'won', 'lost']

export async function fetchLeads(): Promise<UnifiedLead[]> {
  const [quotesRes, contactsRes] = await Promise.all([
    supabase.from('quote_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
  ])

  const quotes: UnifiedLead[] = (quotesRes.data ?? []).map((q) => ({
    id: `quote-${q.id}`,
    source: 'quote',
    name: q.name,
    company: q.company,
    email: q.email,
    phone: q.phone,
    interest: q.product_interest,
    message: q.message,
    status: q.status,
    notes: q.notes,
    created_at: q.created_at,
  }))

  const contacts: UnifiedLead[] = (contactsRes.data ?? []).map((c) => ({
    id: `contact-${c.id}`,
    source: 'contact',
    name: c.name,
    company: null,
    email: c.email,
    phone: null,
    interest: null,
    message: c.message,
    status: c.status,
    notes: c.notes,
    created_at: c.created_at,
  }))

  return [...quotes, ...contacts].sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function updateLeadStatus(lead: UnifiedLead, status: LeadStatus) {
  const [source, rawId] = lead.id.split('-')
  const table = source === 'quote' ? 'quote_requests' : 'contact_messages'
  return supabase.from(table).update({ status }).eq('id', Number(rawId))
}
