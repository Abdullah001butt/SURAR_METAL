import { useEffect, useState } from 'react'

interface TypingTextProps {
  words: string[]
  className?: string
  typingSpeed?: number
  deletingSpeed?: number
  holdMs?: number
  cursorClassName?: string
}

/** Cycles through a list of words with a character-by-character typewriter effect and a blinking cursor. */
export function TypingText({
  words,
  className,
  typingSpeed = 65,
  deletingSpeed = 35,
  holdMs = 1600,
  cursorClassName,
}: TypingTextProps) {
  const [wordIndex, setWordIndex] = useState(0)
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>('typing')

  useEffect(() => {
    const current = words[wordIndex % words.length]

    if (phase === 'typing') {
      if (text.length < current.length) {
        const t = setTimeout(() => setText(current.slice(0, text.length + 1)), typingSpeed)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setPhase('holding'), holdMs)
      return () => clearTimeout(t)
    }

    if (phase === 'holding') {
      const t = setTimeout(() => setPhase('deleting'), 200)
      return () => clearTimeout(t)
    }

    // deleting
    if (text.length > 0) {
      const t = setTimeout(() => setText(current.slice(0, text.length - 1)), deletingSpeed)
      return () => clearTimeout(t)
    }
    setWordIndex((i) => (i + 1) % words.length)
    setPhase('typing')
  }, [text, phase, wordIndex, words, typingSpeed, deletingSpeed, holdMs])

  return (
    <span className={className}>
      {text}
      <span className={cursorClassName ?? 'ms-0.5 inline-block w-[2px] animate-pulse bg-current align-middle'} style={{ height: '0.9em' }} />
    </span>
  )
}
