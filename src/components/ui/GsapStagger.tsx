import { useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { cn } from '@/utils/cn'

interface GsapStaggerProps {
  children: ReactNode
  className?: string
  /** CSS selector for the direct items to stagger-reveal, relative to the wrapper */
  itemSelector?: string
  stagger?: number
  y?: number
}

/** Reveals direct child items with a scroll-triggered stagger — used for card grids. */
export function GsapStagger({ children, className, itemSelector = ':scope > *', stagger = 0.06, y = 30 }: GsapStaggerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(itemSelector, el)
      if (items.length === 0) return

      gsap.set(items, { opacity: 0, y })
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      })
    }, el)

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill()
      })
    }
  }, [itemSelector, stagger, y])

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
