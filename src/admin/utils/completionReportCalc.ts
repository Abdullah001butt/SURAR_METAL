import type { CompletionReportItem } from '@/admin/types'

export function calcReportTotal(items: CompletionReportItem[]): number {
  return items.reduce((sum, item) => sum + (item.amount || 0), 0)
}
