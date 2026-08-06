import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const DIGIT_HEIGHT_EM = 1.15

function OdometerDigit({ digit, active, delay }: { digit: number; active: boolean; delay: number }) {
  return (
    <span
      className="relative inline-block overflow-hidden align-top"
      style={{ height: `${DIGIT_HEIGHT_EM}em`, width: '0.62em' }}
    >
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={{ y: 0 }}
        animate={active ? { y: `-${digit * DIGIT_HEIGHT_EM}em` } : { y: 0 }}
        transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} style={{ height: `${DIGIT_HEIGHT_EM}em` }} className="flex items-center justify-center">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

interface OdometerProps {
  value: number
  suffix?: string
  className?: string
}

/** Renders a number as spinning odometer reels — each digit rolls from 0 to
 *  its final value on a slight cascading delay, rather than counting up
 *  frame-by-frame. A more "mechanical/precision" feel than a linear counter,
 *  which fits the engineering brand better. */
export function Odometer({ value, suffix, className }: OdometerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const digits = String(value).split('').map(Number)

  return (
    <span ref={ref} className={className}>
      {digits.map((d, i) => (
        <OdometerDigit key={i} digit={d} active={inView} delay={i * 0.08} />
      ))}
      {suffix}
    </span>
  )
}
