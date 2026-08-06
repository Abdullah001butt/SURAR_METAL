/** A slowly-drifting technical-drawing grid (fine lines + bolder lines every
 *  5th cell) — evokes an engineering blueprint rather than generic decor,
 *  fitting for a steel fabrication/racking-design business. Pure CSS
 *  (repeating-linear-gradient backgrounds + a background-position keyframe),
 *  no JS, no canvas — cheap to render and safe to leave running indefinitely. */
export function BlueprintGrid({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden opacity-[0.07] ${className}`}
      style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(255,255,255,0.9) 0px, rgba(255,255,255,0.9) 1px, transparent 1px, transparent 200px),
          repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0px, rgba(255,255,255,0.9) 1px, transparent 1px, transparent 200px),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 40px),
          repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 40px)
        `,
        backgroundSize: '200px 200px, 200px 200px, 40px 40px, 40px 40px',
        animation: 'blueprint-drift 40s linear infinite',
      }}
    />
  )
}
