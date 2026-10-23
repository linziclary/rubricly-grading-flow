import type { ReactNode } from 'react'
import { cx } from './cx'

export type TagTone = 'neutral' | 'info' | 'success' | 'warning' | 'error'
export type TagVariant = 'filled' | 'outlined' | 'plain'

type TagProps = {
  tone?: TagTone
  variant?: TagVariant
  children: ReactNode
  className?: string
  /** When set, the tag renders as a toggle button (used for roster filters and page tabs). */
  onClick?: () => void
  pressed?: boolean
}

const filled: Record<TagTone, string> = {
  neutral: 'bg-n4 border-n4 text-white',
  info: 'bg-info border-info text-white',
  success: 'bg-success border-success text-white',
  warning: 'bg-warning border-warning text-white',
  error: 'bg-error border-error text-white',
}

const outlined: Record<TagTone, string> = {
  neutral: 'border-n4 text-n4',
  info: 'border-info text-info',
  success: 'border-success text-success',
  warning: 'border-warning text-warning',
  error: 'border-error text-error',
}

const plain: Record<TagTone, string> = {
  neutral: 'border-transparent text-n4',
  info: 'border-transparent text-info',
  success: 'border-transparent text-success',
  warning: 'border-transparent text-warning',
  error: 'border-transparent text-error',
}

export function Tag({
  tone = 'neutral',
  variant = 'outlined',
  children,
  className,
  onClick,
  pressed,
}: TagProps) {
  const classes = cx(
    'inline-flex shrink-0 items-center whitespace-nowrap rounded border px-[7px] py-px',
    'text-base font-semibold',
    variant === 'filled' ? filled[tone] : variant === 'outlined' ? outlined[tone] : plain[tone],
    onClick && 'transition-colors hover:brightness-95',
    className,
  )
  if (onClick) {
    return (
      <button type="button" aria-pressed={pressed} onClick={onClick} className={classes}>
        {children}
      </button>
    )
  }
  return <span className={classes}>{children}</span>
}
