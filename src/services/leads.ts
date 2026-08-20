import { isSupabaseConfigured, supabase } from '@/services/supabase'

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

// Fires the Google Ads "Request quote" conversion action right after a lead is
// actually saved to the database — never on click or page load — so we only
// ever count real, successful submissions. Guarded so it never throws and
// blocks the actual lead submission if gtag hasn't loaded (ad blocker, etc.).
function fireQuoteConversion() {
  try {
    window.dataLayer = window.dataLayer || []
    function gtag(...args: unknown[]) {
      window.dataLayer!.push(args)
    }
    gtag('event', 'conversion', {
      send_to: 'AW-18383188650/gRFICKvh8eAcEKr15L1E',
    })
  } catch {
    // Tracking must never break the actual lead flow.
  }
}

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
  fireQuoteConversion()
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
  fireQuoteConversion()
}

interface AbandonedQuoteDraft {
  name?: string
  email?: string
  phone?: string
  company?: string
  productInterest?: string
  message?: string
  stepReached: string
}

function isWorthSaving(data: AbandonedQuoteDraft) {
  return Boolean(data.name && (data.phone || data.email))
}

function abandonedQuotePayload(data: AbandonedQuoteDraft) {
  return {
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    company: data.company || null,
    product_interest: data.productInterest || null,
    message: data.message || null,
    step_reached: data.stepReached,
  }
}

// Captures whatever the visitor typed into the quote wizard if they close it
// without submitting — but only when there's actually enough to follow up on
// (a name plus a phone or email), so this doesn't fill up with people who
// opened the modal and immediately closed it. Fire-and-forget: never blocks
// or interrupts the close action, and a failure here is silently swallowed
// since losing a partial-lead capture is not worth showing the visitor an
// error for something they didn't ask to happen.
export async function saveAbandonedQuoteDraft(data: AbandonedQuoteDraft) {
  if (!isSupabaseConfigured) return
  if (!isWorthSaving(data)) return

  try {
    await supabase.from('abandoned_quotes').insert(abandonedQuotePayload(data))
  } catch {
    // Best-effort only — never surface this to the visitor.
  }
}

// Covers the case saveAbandonedQuoteDraft can't: the visitor closing the
// browser tab or navigating away entirely, rather than clicking the modal's
// close button. A normal fetch() call gets cancelled the instant the page
// starts unloading — navigator.sendBeacon is the browser API built
// specifically to survive that, queuing the request to complete even after
// the page is gone. Its real limitation: it can't set custom headers, so the
// anon key goes in the URL query string (confirmed this works against
// Supabase's REST API) instead of the usual Authorization header the
// Supabase JS client uses.
export function sendAbandonedQuoteBeacon(data: AbandonedQuoteDraft) {
  if (!isSupabaseConfigured) return
  if (!isWorthSaving(data)) return
  if (typeof navigator === 'undefined' || !navigator.sendBeacon) return

  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/abandoned_quotes?apikey=${import.meta.env.VITE_SUPABASE_ANON_KEY}`
    const blob = new Blob([JSON.stringify(abandonedQuotePayload(data))], { type: 'application/json' })
    navigator.sendBeacon(url, blob)
  } catch {
    // Best-effort only.
  }
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
