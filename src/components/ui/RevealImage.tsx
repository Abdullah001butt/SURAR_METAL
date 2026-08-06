import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface RevealImageProps {
  src: string
  alt: string
  className?: string
  /** Which edge the mask wipes away toward. Defaults to left-to-right. */
  direction?: 'left' | 'right' | 'up'
}

/** Image that reveals itself with a wipe/mask effect as it scrolls into view,
 *  instead of a plain opacity fade — a solid navy panel slides away to
 *  uncover the image underneath. */
export function RevealImage({ src, alt, className, direction = 'left' }: RevealImageProps) {
  const maskInitial =
    direction === 'left' ? { scaleX: 1, originX: 0 } : direction === 'right' ? { scaleX: 1, originX: 1 } : { scaleY: 1, originY: 0 }
  const maskAnimate = direction === 'up' ? { scaleY: 0 } : { scaleX: 0 }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <motion.img
        src={src}
        alt={alt}
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full object-cover"
      />
      <motion.div
        initial={maskInitial}
        whileInView={maskAnimate}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1], delay: 0.1 }}
        className="absolute inset-0 bg-navy"
      />
    </div>
  )
}
