import { forwardRef, useState } from 'react'
import type { ReactNode, MouseEvent } from 'react'
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline-light'
type ButtonSize = 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  children?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/25',
  secondary: 'bg-navy text-white hover:bg-navy-light',
  ghost: 'bg-transparent text-navy hover:bg-navy/5',
  'outline-light': 'bg-transparent text-white border border-white/30 hover:bg-white/10',
}

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

let rippleId = 0

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, iconPosition = 'right', className, children, onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState<Ripple[]>([])

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 1.6
      const id = rippleId++
      setRipples((prev) => [...prev, { id, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size }])
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650)
      onClick?.(e)
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        onClick={handleClick}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold tracking-tight transition-colors duration-200 cursor-pointer',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              initial={{ scale: 0, opacity: 0.35 }}
              animate={{ scale: 1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="pointer-events-none absolute rounded-full bg-white"
              style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
            />
          ))}
        </AnimatePresence>
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'
