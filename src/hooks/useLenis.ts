import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.65,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.5,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(raf)
    }
  }, [])
}
