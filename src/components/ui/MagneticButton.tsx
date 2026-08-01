import { useRef } from 'react'
import type { ReactNode } from 'react'
import { gsap } from '@/lib/gsap'

interface MagneticButtonProps {
  children: ReactNode
  strength?: number
  className?: string
}

/** Wraps any element and makes it subtly follow the cursor within its bounds — snaps back on leave. */
export function MagneticButton({ children, strength = 0.4, className }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    gsap.to(el, { x: x * strength, y: y * strength, duration: 0.5, ease: 'power3.out' })
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
  }

  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className={className}>
      {children}
    </div>
  )
}
