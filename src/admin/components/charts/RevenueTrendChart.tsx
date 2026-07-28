import { useState, useMemo, useRef } from 'react'
import { formatAED } from '@/admin/utils/documentCalc'

export interface RevenueTrendPoint {
  label: string
  value: number
}

interface RevenueTrendChartProps {
  data: RevenueTrendPoint[]
  height?: number
}

const ORANGE = '#EB6834'
const ORANGE_FILL = 'rgba(235, 104, 52, 0.12)'

export function RevenueTrendChart({ data, height = 220 }: RevenueTrendChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const width = 640
  const padding = { top: 16, right: 16, bottom: 28, left: 16 }
  const plotW = width - padding.left - padding.right
  const plotH = height - padding.top - padding.bottom

  const maxValue = Math.max(1, ...data.map((d) => d.value))
  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0

  const points = useMemo(
    () =>
      data.map((d, i) => ({
        x: padding.left + i * stepX,
        y: padding.top + plotH - (d.value / maxValue) * plotH,
        ...d,
      })),
    [data, stepX, maxValue, plotH, padding.left, padding.top],
  )

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${padding.top + plotH} L ${points[0]?.x ?? 0} ${padding.top + plotH} Z`

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return
    const rect = svgRef.current.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * width
    let nearest = 0
    let nearestDist = Infinity
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX)
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = i
      }
    })
    setHoverIndex(nearest)
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full touch-none"
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
        role="img"
        aria-label="Revenue trend over the last 6 months"
      >
        {/* recessive gridlines */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + plotH * (1 - f)}
            y2={padding.top + plotH * (1 - f)}
            stroke="#E2E8F0"
            strokeWidth={1}
          />
        ))}

        <path d={areaPath} fill={ORANGE_FILL} stroke="none" />
        <path d={linePath} fill="none" stroke={ORANGE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={i}>
            {hoverIndex === i && (
              <line x1={p.x} x2={p.x} y1={padding.top} y2={padding.top + plotH} stroke="#94A3B8" strokeWidth={1} strokeDasharray="3 3" />
            )}
            <circle cx={p.x} cy={p.y} r={hoverIndex === i ? 5 : 3} fill="#ffffff" stroke={ORANGE} strokeWidth={2} />
            <circle
              cx={p.x}
              cy={padding.top + plotH / 2}
              r={Math.max(stepX / 2, 12)}
              fill="transparent"
              onPointerEnter={() => setHoverIndex(i)}
            />
            <text x={p.x} y={height - 8} textAnchor="middle" className="fill-gray text-[10px]">
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-navy px-3 py-2 text-xs text-white shadow-lg"
          style={{ left: `${(hovered.x / width) * 100}%`, top: `${(hovered.y / height) * 100 - 4}%` }}
        >
          <p className="font-display font-bold">AED {formatAED(hovered.value)}</p>
          <p className="text-white/60">{hovered.label}</p>
        </div>
      )}
    </div>
  )
}
