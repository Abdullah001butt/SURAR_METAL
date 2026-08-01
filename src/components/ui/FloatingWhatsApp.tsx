import { useLayoutEffect, useRef } from 'react'
import { MessageCircle } from 'lucide-react'
import { gsap } from '@/lib/gsap'

export function FloatingWhatsApp() {
  const ref = useRef<HTMLAnchorElement>(null)

  useLayoutEffect(() => {
    gsap.fromTo(ref.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, delay: 1, ease: 'back.out(1.6)' })
  }, [])

  return (
    <a
      ref={ref}
      href="https://wa.me/971554939866"
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      onMouseEnter={() => gsap.to(ref.current, { scale: 1.08, duration: 0.25, ease: 'power2.out' })}
      onMouseLeave={() => gsap.to(ref.current, { scale: 1, duration: 0.3, ease: 'power2.out' })}
      onMouseDown={() => gsap.to(ref.current, { scale: 0.95, duration: 0.15 })}
      onMouseUp={() => gsap.to(ref.current, { scale: 1.08, duration: 0.2 })}
      className="fixed bottom-20 left-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 lg:bottom-6"
    >
      <MessageCircle size={26} fill="white" />
    </a>
  )
}
