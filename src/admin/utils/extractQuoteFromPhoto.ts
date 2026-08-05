import { getGeminiApiKey } from '@/admin/utils/geminiSettings'

export interface ExtractedItem {
  description: string
  spec: string | null
  qty: number | null
  unit: string | null
  unit_price: number | null
}

export interface ExtractedQuote {
  title: string | null
  customer_name: string | null
  dimensions: string | null
  items: ExtractedItem[]
  total_amount: number | null
  currency: string | null
}

const EXTRACTION_PROMPT = `You are reading a photo of a handwritten or printed price quotation (it may be in English, mixed with Arabic, and handwriting may be messy). Extract the data into this exact JSON shape and return ONLY the JSON, no other text:

{
  "title": string | null,
  "customer_name": string | null,
  "dimensions": string | null,
  "items": [
    {
      "description": string,
      "spec": string | null,
      "qty": number | null,
      "unit": string | null,
      "unit_price": number | null
    }
  ],
  "total_amount": number | null,
  "currency": string | null
}

Rules:
- Read every line item, even ones with unclear handwriting — make a best-effort reading rather than skipping it.
- If a price is crossed out and replaced, use the final (uncrossed) value only.
- Numbers only for qty/unit_price/total_amount — no currency symbols inside them.
- If something isn't present in the image, use null. Do not invent data.
- Return raw JSON only — no markdown code fences, no commentary.`

function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const [meta, data] = result.split(',')
      const mediaType = meta.match(/data:(.*);base64/)?.[1] ?? file.type
      resolve({ data, mediaType })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function extractQuoteFromPhoto(file: File): Promise<ExtractedQuote> {
  const apiKey = getGeminiApiKey()
  if (!apiKey) throw new Error('No Gemini API key saved. Add one in Dashboard → Settings first.')

  const { data, mediaType } = await fileToBase64(file)

  const callGemini = (model: string) =>
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: mediaType, data } },
              { text: EXTRACTION_PROMPT },
            ],
          },
        ],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    })

  // gemini-3.5-flash as requested — if that exact model name isn't available
  // on Google's side yet (or on this key's account), fall back to 2.5 flash
  // rather than hard-failing the whole feature.
  let res = await callGemini('gemini-3.5-flash')
  if (res.status === 404) res = await callGemini('gemini-2.5-flash')

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json?.error?.message || `Gemini request failed (${res.status})`)
  }

  const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!text) throw new Error('Gemini returned an empty response — try a clearer photo.')

  try {
    return JSON.parse(text) as ExtractedQuote
  } catch {
    throw new Error('Could not parse the extraction result as JSON.')
  }
}
