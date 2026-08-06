import { motion } from 'framer-motion'

interface GradientOrbsProps {
  /** Tailwind color tokens for the two orbs — defaults suit dark/navy sections. */
  colorA?: string
  colorB?: string
}

/** Two soft, slowly-drifting blurred orbs for ambient motion in dark sections
 *  (Statistics, Testimonials, CtaBanner). Pure decoration — pointer-events off,
 *  aria-hidden, and cheap (opacity/transform only, no layout thrash). */
export function GradientOrbs({ colorA = 'bg-primary/20', colorB = 'bg-primary/10' }: GradientOrbsProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className={`absolute -left-24 top-1/4 h-72 w-72 rounded-full ${colorA} blur-[100px]`}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`absolute -right-16 bottom-0 h-96 w-96 rounded-full ${colorB} blur-[120px]`}
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  )
}
