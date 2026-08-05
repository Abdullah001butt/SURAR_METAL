// Vercel Edge Function — takes a photo of a handwritten/printed quotation and
// asks Claude to extract structured line items from it, so the admin doesn't
// have to retype everything by hand into the Document Editor.
//
// Requires an ANTHROPIC_API_KEY environment variable set in the Vercel project
// (Project Settings -> Environment Variables). Get a key at console.anthropic.com.

export const config = { runtime: 'edge' }

const EXTRACTION_PROMPT = `You are reading a photo of a handwritten or printed price quotation (it may be in English, mixed with Arabic, and handwriting may be messy). Extract the data into this exact JSON shape and return ONLY the JSON, no other text:

{
  "title": string | null,          // a short project/job title if shown, e.g. "Sandwich Panel Office"
  "customer_name": string | null,  // the customer/company name if shown (not the letterhead issuer)
  "dimensions": string | null,     // e.g. "W:5m x L:5m x H:2.5m" if shown
  "items": [
    {
      "description": string,      // item description, cleaned up (fix obvious OCR/spelling slips, e.g. "PANGL" -> "Panel", "ONG" -> "One")
      "spec": string | null,      // size/spec if given separately, e.g. "40x1000x2500mm"
      "qty": number | null,       // quantity if shown, else null
      "unit": string | null,      // unit if shown, e.g. "mtr", "pcs", else null
      "unit_price": number | null // per-unit price if shown, else null
    }
  ],
  "total_amount": number | null,  // the final total amount if shown
  "currency": string | null       // e.g. "AED", "DH", "USD" if shown
}

Rules:
- Read every line item, even ones with unclear handwriting — make a best-effort reading rather than skipping it.
- If a price is crossed out and replaced, use the final (uncrossed) value only.
- Numbers only for qty/unit_price/total_amount — no currency symbols inside them.
- If something isn't present in the image, use null. Do not invent data.
- Return raw JSON only — no markdown code fences, no commentary.`

async function isAuthenticatedAdmin(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('authorization')
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!authHeader || !supabaseUrl || !supabaseAnonKey) return false

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { authorization: authHeader, apikey: supabaseAnonKey },
    })
    return res.ok
  } catch {
    return false
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  // This calls a paid API — only logged-in dashboard admins may trigger it,
  // not anyone who discovers the endpoint URL.
  if (!(await isAuthenticatedAdmin(req))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Server is missing ANTHROPIC_API_KEY. Add it in Vercel Project Settings -> Environment Variables.' }),
      { status: 500 },
    )
  }

  let body: { image?: string; mediaType?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 })
  }

  const { image, mediaType } = body
  if (!image || !mediaType) {
    return new Response(JSON.stringify({ error: 'Missing image or mediaType' }), { status: 400 })
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
              { type: 'text', text: EXTRACTION_PROMPT },
            ],
          },
        ],
      }),
    })

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text()
      return new Response(JSON.stringify({ error: `Extraction failed: ${errText}` }), { status: 502 })
    }

    const data = await anthropicRes.json()
    const text: string = data?.content?.[0]?.text ?? ''
    const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '')

    let parsed: unknown
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return new Response(JSON.stringify({ error: 'Could not parse extraction result', raw: text }), { status: 502 })
    }

    return new Response(JSON.stringify(parsed), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: `Unexpected error: ${(err as Error).message}` }), { status: 500 })
  }
}
