import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

type SectionTitleSize = 'lg' | 'default' | 'sm'

interface SectionTitleProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  light?: boolean
  size?: SectionTitleSize
}

const sizeClasses: Record<SectionTitleSize, string> = {
  lg: 'text-4xl md:text-5xl lg:text-6xl font-semibold',
  default: 'text-3xl md:text-4xl lg:text-5xl font-semibold',
  sm: 'text-2xl md:text-3xl lg:text-4xl font-medium',
}

export function SectionTitle({ eyebrow, title, description, align = 'left', light = false, size = 'default' }: SectionTitleProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary"
        >
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className={cn(
          'mt-4 leading-tight',
          sizeClasses[size],
          light ? 'text-white' : 'text-navy',
        )}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={cn('mt-4 text-base leading-relaxed md:text-lg', light ? 'text-white/70' : 'text-gray')}
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}
