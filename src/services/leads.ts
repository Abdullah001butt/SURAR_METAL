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
