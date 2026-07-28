import type { DocumentItem } from '@/admin/types'

export function itemAmount(item: DocumentItem): number {
  return item.qty * item.unit_price
}

export function calcTotals(items: DocumentItem[], discount: number, vatRate: number) {
  const gross = items.reduce((sum, item) => sum + itemAmount(item), 0)
  const afterDiscount = gross - discount
  const vatAmount = afterDiscount * (vatRate / 100)
  const net = afterDiscount + vatAmount

  return { gross, discount, vatAmount, net }
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
