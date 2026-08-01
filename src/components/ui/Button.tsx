import { forwardRef, useRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { gsap } from '@/lib/gsap'
import { cn } from '@/utils/cn'
import { mergeRefs } from '@/utils/mergeRefs'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline-light'
type ButtonSize = 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, iconPosition = 'right', className, children, ...props }, ref) => {
    const btnRef = useRef<HTMLButtonElement>(null)

    return (
      <button
        ref={mergeRefs(ref, btnRef)}
        onMouseEnter={() => gsap.to(btnRef.current, { scale: 1.03, duration: 0.35, ease: 'power3.out' })}
        onMouseLeave={() => gsap.to(btnRef.current, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' })}
        onMouseDown={() => gsap.to(btnRef.current, { scale: 0.97, duration: 0.15, ease: 'power2.out' })}
        onMouseUp={() => gsap.to(btnRef.current, { scale: 1.03, duration: 0.25, ease: 'power2.out' })}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold tracking-tight transition-colors duration-200 cursor-pointer',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </button>
    )
  },
)

Button.displayName = 'Button'
