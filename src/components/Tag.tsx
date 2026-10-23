import type { ReactNode } from 'react'
import { cx } from './cx'

export type TagTone = 'neutral' | 'info' | 'success' | 'warning' | 'error'
export type TagVariant = 'filled' | 'inverted' | 'plain'

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
  neutral: 'bg-n4 text-white',
  info: 'bg-info text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  error: 'bg-error text-white',
}

const inverted: Record<TagTone, string> = {
  neutral: 'bg-n8 text-n4',
  info: 'bg-info-bg text-info',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  error: 'bg-error-bg text-error',
}

const plain: Record<TagTone, string> = {
  neutral: 'text-n4',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
}

export function Tag({
  tone = 'neutral',
  variant = 'inverted',
  children,
  className,
  onClick,
  pressed,
}: TagProps) {
  const classes = cx(
    'inline-flex shrink-0 items-center whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold',
    variant === 'filled' ? filled[tone] : variant === 'inverted' ? inverted[tone] : plain[tone],
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
