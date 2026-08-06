import { motion } from 'framer-motion'

const COLORS = ['#FF5A1F', '#FF8A4C', '#0F172A', '#FFC499']
const PARTICLES = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2
  const distance = 60 + Math.random() * 50
  return {
    id: i,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    rotate: Math.random() * 360,
    color: COLORS[i % COLORS.length],
    isCircle: i % 2 === 0,
  }
})

/** One-shot particle burst — mount it when a success state appears, it plays
 *  once and settles. Pure decoration (no interaction), so it's fine to keep
 *  cheap: transform/opacity only, no layout-affecting properties. */
export function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1, rotate: p.rotate }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute h-2 w-2"
          style={{
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}
