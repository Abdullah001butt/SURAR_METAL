interface GaugeChartProps {
  value: number
  size?: number
}

function colorFor(value: number) {
  if (value >= 70) return '#059669'
  if (value >= 40) return '#EB6834'
  return '#DC2626'
}

function labelFor(value: number) {
  if (value >= 85) return 'Excellent'
  if (value >= 70) return 'Healthy'
  if (value >= 40) return 'Needs Attention'
  return 'Critical'
}

export function GaugeChart({ value, size = 220 }: GaugeChartProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = size / 2 - 14
  const cx = size / 2
  const cy = size / 2
  const startAngle = 180
  const endAngle = 0
  const angle = startAngle - (clamped / 100) * (startAngle - endAngle)

  const polar = (a: number) => {
    const rad = (a * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) }
  }

  const start = polar(startAngle)
  const end = polar(endAngle)
  const needle = polar(angle)
  const color = colorFor(clamped)

  return (
    <div className="flex flex-col items-center" role="img" aria-label={`Business health score: ${clamped} out of 100, ${labelFor(clamped)}`}>
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        <path d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`} fill="none" stroke="#E2E8F0" strokeWidth={14} strokeLinecap="round" />
        <path
          d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${needle.x} ${needle.y}`}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
        />
        <text x={cx} y={cy - 6} textAnchor="middle" className="font-display" style={{ fontSize: size * 0.2, fontWeight: 700, fill: '#0F172A' }}>
          {Math.round(clamped)}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" style={{ fontSize: 12, fill: '#64748B' }}>
          / 100
        </text>
      </svg>
      <span className="mt-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ color, backgroundColor: `${color}1A` }}>
        {labelFor(clamped)}
      </span>
    </div>
  )
}
