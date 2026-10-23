import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

type SheetProps = {
  open: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  width?: number
}

/** Right-hand side sheet (dialog) built from the Dialect modal surface. */
export function Sheet({ open, onClose, title, children, width = 440 }: SheetProps) {
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
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30" onMouseDown={onClose}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ width }}
        className="flex h-full max-w-full animate-[sheet-in_200ms_ease-out] flex-col bg-white shadow-elevation-2 outline-none"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-7 py-6">
          <h2 className="text-f5 font-semibold text-ink">{title}</h2>
          <Button size="sm" variant="borderless" tone="neutral" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-7 py-6">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
