import { isSupabaseConfigured, supabase } from '@/services/supabase'

interface QuoteSubmission {
  name: string
  company: string
  email: string
  phone: string
  productInterest: string
  message?: string
}

interface ContactSubmission {
  name: string
  email: string
  message: string
}

export async function submitQuoteRequest(data: QuoteSubmission) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured yet.')
  }

  const { error } = await supabase.from('quote_requests').insert({
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone,
    product_interest: data.productInterest,
    message: data.message || null,
  })

  if (error) throw new Error(error.message)
}

interface LeadMagnetSubmission {
  name: string
  phone: string
  email?: string
}

export async function submitLeadMagnetRequest(data: LeadMagnetSubmission) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured yet.')
  }

  const { error } = await supabase.from('quote_requests').insert({
    name: data.name,
    phone: data.phone,
    email: data.email || null,
    product_interest: 'Warehouse Storage Buying Guide (download)',
    source: 'buying_guide',
  })

  if (error) throw new Error(error.message)
}

export async function submitContactMessage(data: ContactSubmission) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured yet.')
  }

  const { error } = await supabase.from('contact_messages').insert({
    name: data.name,
    email: data.email,
    message: data.message,
  })

  if (error) throw new Error(error.message)
}
