import React from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const getVariantClasses = (variant: ButtonVariant = 'default') => {
  const variants: Record<ButtonVariant, string> = {
    default: 'bg-teal-500 text-navy-900 hover:bg-teal-600',
    destructive: 'bg-rose-500 text-white hover:bg-rose-600',
    outline: 'border border-slate-700 bg-transparent text-white hover:bg-navy-800 hover:text-teal-400',
    secondary: 'bg-navy-800 text-white hover:bg-navy-700',
    ghost: 'hover:bg-navy-800 hover:text-teal-400 text-slate-400',
    link: 'text-teal-400 underline-offset-4 hover:underline',
  }
  return variants[variant]
}

const getSizeClasses = (size: ButtonSize = 'default') => {
  const sizes: Record<ButtonSize, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3 text-xs',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  }
  return sizes[size]
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        getVariantClasses(variant),
        getSizeClasses(size),
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button }
