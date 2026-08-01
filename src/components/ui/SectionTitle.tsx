import { motion } from 'framer-motion'
import { RevealHeading } from '@/components/ui/RevealHeading'
import { cn } from '@/utils/cn'

interface SectionTitleProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  light?: boolean
}

export function SectionTitle({ eyebrow, title, description, align = 'left', light = false }: SectionTitleProps) {
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
      <RevealHeading
        className={cn(
          'mt-4 text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl',
          light ? 'text-white' : 'text-navy',
        )}
      >
        {title}
      </RevealHeading>
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
