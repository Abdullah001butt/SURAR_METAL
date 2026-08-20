import { useEffect, useState } from 'react'

/** Whether the page has scrolled past `threshold` px. Listens for the native
 *  'scroll' event (passive, rAF-throttled) rather than continuously polling —
 *  this codebase has no smooth-scroll library (no Lenis or similar) that would
 *  suppress native scroll events, so there's no need to pay for an always-on
 *  animation-frame loop on every page just to catch scroll position changes
 *  that, in practice, only happen while the user is actually scrolling. */
export function useScrollPast(threshold: number): boolean {
  const [past, setPast] = useState(false)

  useEffect(() => {
    let raf = 0
    let lastState = window.scrollY > threshold
    setPast(lastState)

    const check = () => {
      raf = 0
      const isPast = window.scrollY > threshold
      if (isPast !== lastState) {
        lastState = isPast
        setPast(isPast)
      }
    }

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(check)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [threshold])

  return past
}
