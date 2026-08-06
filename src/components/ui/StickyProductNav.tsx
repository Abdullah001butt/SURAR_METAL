import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollPast } from '@/hooks/useScrollPast'
import { cn } from '@/utils/cn'

interface StickyProductNavProps {
  sections: { id: string; label: string }[]
}

/** A slim pill nav that appears once you've scrolled past the hero, letting
 *  visitors jump between a product page's sections instead of scrolling
 *  manually. Highlights whichever section is currently most in view. */
export function StickyProductNav({ sections }: StickyProductNavProps) {
  const visible = useScrollPast(420)
  const [active, setActive] = useState(sections[0]?.id)

  useEffect(() => {
    let raf: number
    const tick = () => {
      let current = sections[0]?.id
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) {
          current = s.id
        }
      }
      setActive((prev) => (prev === current ? prev : current))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [sections])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-0 top-24 z-30 flex justify-center"
        >
          <div className="glass flex items-center gap-1 rounded-full bg-white/90 p-1.5 shadow-lg ring-1 ring-navy/5">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={cn(
                  'rounded-full px-4 py-2 text-xs font-semibold transition-colors',
                  active === s.id ? 'bg-primary text-white' : 'text-navy/60 hover:bg-bg',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
