export interface ParsedCapture {
  name: string
  phone: string | null
  note: string
}

const PHONE_RE = /(\+?\d[\d\s-]{6,}\d)/

export function parseQuickCapture(raw: string): ParsedCapture {
  const text = raw.trim()
  const phoneMatch = text.match(PHONE_RE)
  const phone = phoneMatch ? phoneMatch[0].replace(/\s+/g, '') : null
  const withoutPhone = phone ? text.replace(phoneMatch![0], '').trim() : text

  // Split on commas — first segment is the name, the rest is the note/interest.
  const segments = withoutPhone.split(',').map((s) => s.trim()).filter(Boolean)
  const name = segments[0] || 'Unnamed lead'
  const note = segments.slice(1).join(', ') || withoutPhone.replace(name, '').trim() || 'Logged via Quick Capture'

  return { name, phone, note }
}
