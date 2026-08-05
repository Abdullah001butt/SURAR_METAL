import { useEffect, useState } from 'react'

/** Whether the page has scrolled past `threshold` px. Polls via requestAnimationFrame
 *  instead of the native 'scroll' event — Lenis (smooth-scroll) doesn't reliably fire
 *  native scroll events on `window` while it's animating, which silently broke every
 *  scroll-gated UI element (Back to Top, the WhatsApp button) that used to listen for it. */
export function useScrollPast(threshold: number): boolean {
  const [past, setPast] = useState(false)

  useEffect(() => {
    let raf: number
    let lastState = false

    const tick = () => {
      const isPast = window.scrollY > threshold
      if (isPast !== lastState) {
        lastState = isPast
        setPast(isPast)
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [threshold])

  return past
}
