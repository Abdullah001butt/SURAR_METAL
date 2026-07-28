import { cn } from '@/utils/cn'

const STYLES: Record<string, string> = {
  new: 'bg-blue-50 text-blue-600',
  contacted: 'bg-amber-50 text-amber-600',
  quoted: 'bg-violet-50 text-violet-600',
  won: 'bg-emerald-50 text-emerald-600',
  lost: 'bg-red-50 text-red-600',
  draft: 'bg-navy/5 text-navy/60',
  sent: 'bg-blue-50 text-blue-600',
  paid: 'bg-emerald-50 text-emerald-600',
  overdue: 'bg-red-50 text-red-600',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize', STYLES[status] ?? 'bg-navy/5 text-navy/60')}>
      {status}
    </span>
  )
}
