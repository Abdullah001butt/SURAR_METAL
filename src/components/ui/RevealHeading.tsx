import { useLayoutEffect, useRef } from 'react'
import type { ElementType, ReactNode } from 'react'
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap'
import { cn } from '@/utils/cn'

interface RevealHeadingProps {
  as?: ElementType
  className?: string
  children: ReactNode
  delay?: number
}

/** Splits heading text into words and reveals them with a clipped stagger as it enters the viewport. */
export function RevealHeading({ as: Tag = 'h2', className, children, delay = 0 }: RevealHeadingProps) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      const split = new SplitText(el, { type: 'lines', linesClass: 'reveal-line', mask: 'lines' })
      gsap.set(split.lines, { yPercent: 110, opacity: 0 })

      gsap.to(split.lines, {
        yPercent: 0,
        opacity: 1,
        duration: 0.6,
        delay,
        ease: 'power3.out',
        stagger: 0.05,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      })

      return () => split.revert()
    }, el)

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill()
      })
    }
  }, [delay])

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  )
}
