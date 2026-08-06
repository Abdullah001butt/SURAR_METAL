import { motion, useScroll, useSpring } from 'framer-motion'

/** Thin progress bar pinned to the top of the viewport, filling as the visitor
 *  scrolls down the page — a small "wow" touch borrowed from editorial/SaaS
 *  sites that also gives a subtle sense of how much of the page is left. */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 40, restDelta: 0.001 })

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-primary via-primary to-primary/60"
    />
  )
}
