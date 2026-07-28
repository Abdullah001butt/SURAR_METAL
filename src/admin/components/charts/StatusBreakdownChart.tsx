import { useState } from 'react'

export interface StatusBreakdownItem {
  key: string
  label: string
  value: number
  color: string
}

interface StatusBreakdownChartProps {
  data: StatusBreakdownItem[]
}

export function StatusBreakdownChart({ data }: StatusBreakdownChartProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const maxValue = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className="space-y-3" role="img" aria-label="Documents by status">
      {data.map((d) => {
        const pct = (d.value / maxValue) * 100
        const isHovered = hovered === d.key
        return (
          <div
            key={d.key}
            className="group"
            onPointerEnter={() => setHovered(d.key)}
            onPointerLeave={() => setHovered(null)}
            tabIndex={0}
            onFocus={() => setHovered(d.key)}
            onBlur={() => setHovered(null)}
          >
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-navy">{d.label}</span>
              <span className="font-semibold text-navy">{d.value}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-bg">
              <div
                className="h-full rounded-full transition-[width,filter] duration-300"
                style={{
                  width: `${Math.max(pct, d.value > 0 ? 3 : 0)}%`,
                  backgroundColor: d.color,
                  filter: isHovered ? 'brightness(1.15)' : undefined,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
