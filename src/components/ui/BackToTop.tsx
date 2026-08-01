import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { scrollToTop } from '@/hooks/useLenis'

export function BackToTop() {
  const [visible, setVisible] = useState(false)
  const [rendered, setRendered] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (visible) setRendered(true)
  }, [visible])

  useLayoutEffect(() => {
    if (!rendered) return
    const el = ref.current
    if (!el) return
    if (visible) {
      gsap.fromTo(el, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.6)' })
    } else {
      gsap.to(el, { scale: 0, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => setRendered(false) })
    }
  }, [visible, rendered])

  if (!rendered) return null

  return (
    <button
      ref={ref}
      onClick={scrollToTop}
      onMouseEnter={() => gsap.to(ref.current, { scale: 1.08, duration: 0.25 })}
      onMouseLeave={() => gsap.to(ref.current, { scale: 1, duration: 0.3 })}
      aria-label="Back to top"
      className="fixed bottom-20 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-navy text-white shadow-lg shadow-black/20 lg:bottom-6"
    >
      <ArrowUp size={22} />
    </button>
  )
}
