import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

export function useCountUp(target: number, duration = 1.6) {
  const ref = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const counter = { value: 0 }
    const ctx = gsap.context(() => {
      gsap.to(counter, {
        value: target,
        duration,
        ease: 'power3.out',
        onUpdate: () => setValue(Math.floor(counter.value)),
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      })
    }, el)

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill()
      })
    }
  }, [target, duration])

  return { ref, value }
}
