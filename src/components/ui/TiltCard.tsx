import { useRef } from 'react'
import type { ReactNode, MouseEvent } from 'react'
import { gsap } from '@/lib/gsap'
import { cn } from '@/utils/cn'

interface TiltCardProps {
  children: ReactNode
  className?: string
  maxTilt?: number
}

export function TiltCard({ children, className, maxTilt = 8 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height

    gsap.to(el, {
      rotateX: maxTilt - py * maxTilt * 2,
      rotateY: px * maxTilt * 2 - maxTilt,
      duration: 0.5,
      ease: 'power3.out',
      overwrite: true,
    })

    if (glareRef.current) {
      gsap.set(glareRef.current, {
        background: `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.16), transparent 60%)`,
      })
    }
  }

  const handleMouseLeave = () => {
    gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d', perspective: 800 }}
      className={cn('relative', className)}
    >
      {children}
      <div
        ref={glareRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </div>
  )
}
