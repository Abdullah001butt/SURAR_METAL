import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const DIGIT_HEIGHT_EM = 1.15

// Arabic UI shows Eastern Arabic-Indic numerals (٠١٢٣...) — Chinese business
// content conventionally keeps plain Western digits, so only 'ar' gets this.
function localizedDigitGlyphs(language: string): string[] {
  if (language !== 'ar') return Array.from({ length: 10 }, (_, n) => String(n))
  const formatter = new Intl.NumberFormat('ar-u-nu-arab')
  return Array.from({ length: 10 }, (_, n) => formatter.format(n))
}

function OdometerDigit({ digit, active, delay, glyphs }: { digit: number; active: boolean; delay: number; glyphs: string[] }) {
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
        {glyphs.map((g, n) => (
          <span key={n} style={{ height: `${DIGIT_HEIGHT_EM}em` }} className="flex items-center justify-center">
            {g}
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
 *  which fits the engineering brand better. Numeral glyphs are locale-aware
 *  (Eastern Arabic-Indic for Arabic), not just the digit's position value. */
export function Odometer({ value, suffix, className }: OdometerProps) {
  const { i18n } = useTranslation()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const digits = String(value).split('').map(Number)
  const glyphs = localizedDigitGlyphs(i18n.language)

  return (
    <span ref={ref} className={className} dir="ltr">
      {digits.map((d, i) => (
        <OdometerDigit key={i} digit={d} active={inView} delay={i * 0.08} glyphs={glyphs} />
      ))}
      {suffix}
    </span>
  )
}
