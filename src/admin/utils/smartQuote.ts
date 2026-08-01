import { supabase } from '@/services/supabase'
import type { DocumentItem } from '@/admin/types'

export interface FrequentItem {
  description: string
  item_code: string | null
  unit: string
  avg_price: number
  count: number
}

/** Most commonly quoted line items across all past quotations, ranked by frequency. */
export async function fetchFrequentQuoteItems(limit = 8): Promise<FrequentItem[]> {
  const { data: quotationIds } = await supabase.from('documents').select('id').eq('doc_type', 'quotation')
  const ids = (quotationIds ?? []).map((d) => d.id)
  if (ids.length === 0) return []

  const { data: items } = await supabase
    .from('document_items')
    .select('description, item_code, unit, unit_price')
    .in('document_id', ids)

  const grouped = new Map<string, { item_code: string | null; unit: string; prices: number[] }>()
  for (const item of items ?? []) {
    const key = item.description
    const existing = grouped.get(key)
    if (existing) existing.prices.push(item.unit_price)
    else grouped.set(key, { item_code: item.item_code, unit: item.unit, prices: [item.unit_price] })
  }

  return [...grouped.entries()]
    .map(([description, v]) => ({
      description,
      item_code: v.item_code,
      unit: v.unit,
      avg_price: v.prices.reduce((a, b) => a + b, 0) / v.prices.length,
      count: v.prices.length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export interface PriorQuote {
  id: number
  doc_number: string
  doc_date: string
  items: DocumentItem[]
}

/** A customer's past quotations, most recent first, for one-click item reuse. */
export async function fetchCustomerPriorQuotes(customerId: number, excludeDocId?: number): Promise<PriorQuote[]> {
  let query = supabase
    .from('documents')
    .select('id, doc_number, doc_date, items:document_items(*)')
    .eq('customer_id', customerId)
    .eq('doc_type', 'quotation')
    .order('doc_date', { ascending: false })
    .limit(5)

  if (excludeDocId) query = query.neq('id', excludeDocId)

  const { data } = await query
  return (data ?? []) as unknown as PriorQuote[]
}
