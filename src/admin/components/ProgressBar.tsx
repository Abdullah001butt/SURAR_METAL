import { cn } from '@/utils/cn'

interface ProgressBarProps {
  value: number
  className?: string
  showLabel?: boolean
}

function colorFor(value: number) {
  if (value >= 100) return '#059669'
  if (value >= 60) return '#EB6834'
  if (value >= 25) return '#2563EB'
  return '#64748B'
}

export function ProgressBar({ value, className, showLabel = true }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${clamped}%`, backgroundColor: colorFor(clamped) }} />
      </div>
      {showLabel && <span className="w-9 shrink-0 text-end text-xs font-semibold text-navy">{clamped}%</span>}
    </div>
  )
}
