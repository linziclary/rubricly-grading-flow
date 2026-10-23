import type { ButtonHTMLAttributes } from 'react'
import { cx } from './cx'

export type ButtonVariant = 'filled' | 'ghost' | 'borderless'
export type ButtonTone = 'primary' | 'neutral' | 'success' | 'warning'
export type ButtonSize = 'md' | 'sm'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  tone?: ButtonTone
  size?: ButtonSize
}

const filled: Record<ButtonTone, string> = {
  primary: 'bg-primary text-white hover:bg-[#cf6000] active:bg-[#b95400]',
  neutral: 'bg-action-neutral text-white hover:bg-n4',
  success: 'bg-action-success text-white hover:bg-[#15964a]',
  warning: 'bg-warning text-white hover:bg-[#a04500]',
}

const ghost: Record<ButtonTone, string> = {
  primary: 'border-primary text-primary hover:bg-primary-tint',
  neutral: 'border-action-neutral text-action-neutral hover:bg-surface-muted',
  success: 'border-action-success text-action-success hover:bg-[#ebf7ef]',
  warning: 'border-warning text-warning hover:bg-white/60',
}

const borderless: Record<ButtonTone, string> = {
  primary: 'text-primary hover:bg-primary-tint',
  neutral: 'text-action-neutral hover:text-n4 hover:bg-black/5',
  success: 'text-action-success hover:bg-[#ebf7ef]',
  warning: 'text-warning hover:bg-primary-tint',
}

// Figma strokes sit inside the frame, so ghost buttons trade 2px of padding for the border
// to keep the same outer size as filled buttons (48px md / 36px sm).
const sizes: Record<ButtonSize, { base: string; pad: string; padGhost: string }> = {
  md: { base: 'text-base font-semibold rounded-lg', pad: 'px-4 py-3', padGhost: 'px-3.5 py-2.5' },
  sm: { base: 'text-sm font-semibold rounded-md', pad: 'px-3 py-2', padGhost: 'px-2.5 py-1.5' },
}

export function Button({
  variant = 'filled',
  tone = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const s = sizes[size]
  return (
    <button
      type={type}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap transition-colors',
        s.base,
        variant === 'ghost' ? cx('border-2', s.padGhost, ghost[tone]) : s.pad,
        variant === 'filled' && filled[tone],
        variant === 'borderless' && borderless[tone],
        variant === 'filled' && 'disabled:bg-n8 disabled:text-n6',
        variant !== 'filled' && 'disabled:border-n8 disabled:text-n6 disabled:bg-transparent',
        className,
      )}
      {...rest}
    />
  )
}
