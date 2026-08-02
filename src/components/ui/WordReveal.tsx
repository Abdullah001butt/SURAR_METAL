import { motion } from 'framer-motion'

interface WordRevealProps {
  text: string
  className?: string
  wordClassName?: string
  delay?: number
  stagger?: number
}

/** Masks and reveals each word sliding up in sequence — a dramatic "product launch" style headline unveil. */
export function WordReveal({ text, className, wordClassName, delay = 0, stagger = 0.08 }: WordRevealProps) {
  const words = text.split(' ')

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.15em] align-bottom">
          <motion.span
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: delay + i * stagger }}
            className={`inline-block ${wordClassName ?? ''}`}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
