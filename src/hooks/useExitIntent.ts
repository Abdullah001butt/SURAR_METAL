import { useEffect, useRef } from 'react'

interface UseExitIntentOptions {
  onTrigger: () => void
  enabled?: boolean
  mobileInactivityMs?: number
}

export function useExitIntent({ onTrigger, enabled = true, mobileInactivityMs = 45000 }: UseExitIntentOptions) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const fire = () => {
      if (firedRef.current) return
      firedRef.current = true
      onTrigger()
    }

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) fire()
    }

    document.addEventListener('mouseleave', onMouseLeave)

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    let inactivityTimer: ReturnType<typeof setTimeout> | undefined
    if (isTouchDevice) {
      inactivityTimer = setTimeout(fire, mobileInactivityMs)
    }

    return () => {
      document.removeEventListener('mouseleave', onMouseLeave)
      if (inactivityTimer) clearTimeout(inactivityTimer)
    }
  }, [enabled, onTrigger, mobileInactivityMs])
}
