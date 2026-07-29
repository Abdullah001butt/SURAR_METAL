import { supabase } from '@/services/supabase'
import { elementToPdfBlob, sanitizeFilename } from '@/admin/utils/pdfExport'

/** Normalizes a UAE (or already-international) phone number to digits-only
 * international format for wa.me links, e.g. "050 123 4567" -> "971501234567". */
export function normalizePhoneForWhatsApp(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.startsWith('971')) return digits
  if (digits.startsWith('0')) return `971${digits.slice(1)}`
  if (digits.length <= 10) return `971${digits}`
  return digits
}

interface SendDocumentViaWhatsAppOptions {
  element: HTMLElement
  docNumber: string
  docTypeLabel: string
  customerName: string
  customerPhone: string | null | undefined
  netTotal: string
}

export async function sendDocumentViaWhatsApp({
  element,
  docNumber,
  docTypeLabel,
  customerName,
  customerPhone,
  netTotal,
}: SendDocumentViaWhatsAppOptions): Promise<{ ok: true } | { ok: false; reason: string }> {
  const waNumber = customerPhone ? normalizePhoneForWhatsApp(customerPhone) : null
  if (!waNumber) {
    return { ok: false, reason: 'This customer has no phone number on file. Add one to send via WhatsApp.' }
  }

  const blob = await elementToPdfBlob(element)
  const path = `${sanitizeFilename(docNumber)}-${Date.now()}.pdf`

  const { error: uploadError } = await supabase.storage
    .from('document-pdfs')
    .upload(path, blob, { contentType: 'application/pdf', upsert: true })
  if (uploadError) {
    return { ok: false, reason: `Could not upload PDF: ${uploadError.message}` }
  }

  const { data: publicUrlData } = supabase.storage.from('document-pdfs').getPublicUrl(path)
  const pdfUrl = publicUrlData.publicUrl

  const message = [
    `Hello ${customerName},`,
    ``,
    `Please find your ${docTypeLabel} ${docNumber} from Al Surur General Store Equipment Trading LLC.`,
    `Total: AED ${netTotal}`,
    ``,
    `Download: ${pdfUrl}`,
    ``,
    `Thank you for your business.`,
  ].join('\n')

  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
  window.open(waLink, '_blank', 'noopener,noreferrer')

  return { ok: true }
}
