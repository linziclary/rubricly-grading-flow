import type { ReactNode } from 'react'
import { cx } from './cx'

/** Dark success toast from "05 · Roster after submit". Position it with `className`, or use `floating`. */
export function Toast({
  message,
  actions,
  className,
  floating,
}: {
  message: ReactNode
  actions?: ReactNode
  className?: string
  /** Pin to the top of the content area, centred beside the collapsed nav (as in Figma). */
  floating?: boolean
}) {
  return (
    <div
      role="status"
      className={cx(
        'flex items-center gap-4 rounded-md bg-ink py-3.5 pl-5 pr-3 shadow-elevation-2',
        floating && 'fixed left-[calc(50%+32px)] top-8 z-40 -translate-x-1/2 animate-[toast-in_200ms_ease-out]',
        className,
      )}
    >
      <p className="whitespace-pre text-base font-semibold text-white">{message}</p>
      {actions}
    </div>
  )
}
