import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface IconRevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

/** "Materializes" an icon into view as it scrolls in: a circular clip-path
 *  expands from the center while the icon itself scales up and settles with
 *  a spring, and a thin ring sweeps around it once. Lucide icons don't expose
 *  raw stroke path data for a literal hand-drawn animation, so this is the
 *  honest equivalent — a reveal that reads as "drawing itself in" without
 *  pretending to trace paths it doesn't have access to. */
export function IconReveal({ children, delay = 0, className }: IconRevealProps) {
  return (
    <motion.div
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      whileInView={{ clipPath: 'circle(75% at 50% 50%)' }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.65, 0, 0.35, 1] }}
      className={className}
    >
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: delay + 0.05 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
