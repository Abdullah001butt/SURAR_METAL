import type { DocumentItem } from '@/admin/types'

export function itemAmount(item: DocumentItem): number {
  return item.qty * item.unit_price
}

export function itemCost(item: DocumentItem): number {
  return item.qty * (item.cost_price ?? 0)
}

export function itemMargin(item: DocumentItem): { amount: number; pct: number } {
  const revenue = itemAmount(item)
  const cost = itemCost(item)
  const amount = revenue - cost
  const pct = revenue > 0 ? (amount / revenue) * 100 : 0
  return { amount, pct }
}

export function calcTotals(items: DocumentItem[], discount: number, vatRate: number, manualTotal?: number | null) {
  const itemGross = items.reduce((sum, item) => sum + itemAmount(item), 0)

  if (manualTotal != null) {
    // A manually-typed total (e.g. a handwritten lump-sum quote) wins over the
    // item-based calculation — items may just describe scope of work without
    // individual pricing (qty/unit filled in, unit price left at 0). In that
    // case itemGross is 0, so the VAT/Gross breakdown must be back-calculated
    // from the manual total itself (treated as VAT-inclusive) instead of
    // showing 0.00 for Gross/VAT while the total shows the real number.
    const net = manualTotal
    const afterDiscount = itemGross > 0 ? itemGross - discount : net / (1 + vatRate / 100)
    const gross = itemGross > 0 ? itemGross : afterDiscount + discount
    const vatAmount = net - afterDiscount
    return { gross, discount, vatAmount, net, isManual: true }
  }

  const afterDiscount = itemGross - discount
  const vatAmount = afterDiscount * (vatRate / 100)
  const net = afterDiscount + vatAmount

  return { gross: itemGross, discount, vatAmount, net, isManual: false }
}

export function calcMarginTotals(items: DocumentItem[]) {
  const revenue = items.reduce((sum, item) => sum + itemAmount(item), 0)
  const cost = items.reduce((sum, item) => sum + itemCost(item), 0)
  const profit = revenue - cost
  const pct = revenue > 0 ? (profit / revenue) * 100 : 0
  return { revenue, cost, profit, pct }
}

export function formatAED(value: number): string {
  return value.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const DOC_TYPE_LABELS: Record<string, string> = {
  quotation: 'QUOTATION',
  invoice: 'INVOICE',
  tax_invoice: 'TAX INVOICE',
  delivery_note: 'DELIVERY INVOICE',
}
