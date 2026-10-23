import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from './cx'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  /** Right-aligned button row. */
  actions?: ReactNode
  width?: number
  className?: string
}

export function Modal({ open, onClose, title, children, actions, width = 620, className }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      prev?.focus()
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6" onMouseDown={onClose}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ width }}
        className={cx(
          'flex max-h-full max-w-full flex-col gap-4 overflow-auto rounded-lg bg-white px-7 pb-6 pt-7 shadow-elevation-2 outline-none',
          className,
        )}
      >
        <h2 className="text-f4 font-semibold text-ink">{title}</h2>
        {children}
        {actions && <div className="flex items-center justify-end gap-2">{actions}</div>}
      </div>
    </div>,
    document.body,
  )
}
