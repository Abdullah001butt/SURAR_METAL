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
  planning: 'bg-violet-50 text-violet-600',
  in_progress: 'bg-blue-50 text-blue-600',
  on_hold: 'bg-amber-50 text-amber-600',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600',
}

const LABELS: Record<string, string> = {
  in_progress: 'In Progress',
  on_hold: 'On Hold',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize', STYLES[status] ?? 'bg-navy/5 text-navy/60')}>
      {LABELS[status] ?? status}
    </span>
  )
}
