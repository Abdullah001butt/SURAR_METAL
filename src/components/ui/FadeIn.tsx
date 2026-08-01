import { useLayoutEffect, useRef } from 'react'
import type { ElementType, ReactNode } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { cn } from '@/utils/cn'

interface FadeInProps {
  as?: ElementType
  className?: string
  children: ReactNode
  delay?: number
  y?: number
  /** Reveal immediately on mount instead of waiting for scroll (for above-the-fold content) */
  immediate?: boolean
}

/** Single-element scroll-triggered (or immediate) fade + rise — the GSAP replacement for framer's whileInView fade. */
export function FadeIn({ as: Tag = 'div', className, children, delay = 0, y = 16, immediate = false }: FadeInProps) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 0, y })
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay,
        ease: 'power3.out',
        scrollTrigger: immediate
          ? undefined
          : {
              trigger: el,
              start: 'top 88%',
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
  }, [delay, y, immediate])

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  )
}
