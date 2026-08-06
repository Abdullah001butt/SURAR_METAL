import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/** A small dot + trailing ring that follows the cursor, expanding over
 *  interactive elements. Desktop only — bails out entirely on touch/coarse
 *  pointers (checked once on mount, not per-move) so it's a no-op on mobile. */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const ringX = useSpring(x, { stiffness: 300, damping: 28, mass: 0.4 })
  const ringY = useSpring(y, { stiffness: 300, damping: 28, mass: 0.4 })

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    setEnabled(true)
    // Hide the native cursor only once we know JS is running and it's a fine
    // pointer — never hide it purely via CSS, or a JS error would leave the
    // visitor with no cursor at all.
    document.documentElement.classList.add('custom-cursor-active')

    const move = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      const target = e.target as HTMLElement
      setHovering(!!target.closest('a, button, [role="button"], input, textarea, select'))
    }
    const leave = () => setVisible(false)

    window.addEventListener('mousemove', move)
    document.documentElement.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('mousemove', move)
      document.documentElement.removeEventListener('mouseleave', leave)
      document.documentElement.classList.remove('custom-cursor-active')
    }
  }, [x, y])

  if (!enabled) return null

  return (
    <>
      <motion.div
        style={{ left: x, top: y, opacity: visible ? 1 : 0 }}
        className="pointer-events-none fixed z-[200] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
      />
      <motion.div
        style={{ left: ringX, top: ringY, opacity: visible ? 1 : 0 }}
        animate={{ scale: hovering ? 1.8 : 1 }}
        transition={{ scale: { type: 'spring', stiffness: 300, damping: 20 } }}
        className="pointer-events-none fixed z-[200] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/50"
      />
    </>
  )
}
