import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import { cx } from './cx'

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  maxLength?: number
  helper?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, maxLength, helper, value, className, rows = 3, ...rest },
  ref,
) {
  const id = useId()
  const length = typeof value === 'string' ? value.length : 0
  const description = helper ?? (maxLength ? `${length}/${maxLength} characters` : undefined)
  return (
    <div className={cx('flex w-full flex-col gap-2', className)}>
      <label htmlFor={id} className="text-base font-semibold text-black/80">
        {label}
      </label>
      <textarea
        ref={ref}
        id={id}
        value={value}
        maxLength={maxLength}
        rows={rows}
        aria-describedby={description ? `${id}-desc` : undefined}
        className="w-full resize-y rounded-lg border border-n3 bg-white px-4 py-3 text-base text-black/80 placeholder:text-n5 focus:border-primary focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-primary/25"
        {...rest}
      />
      {description && (
        <p id={`${id}-desc`} className="px-4 text-xs text-black/60" aria-live="polite">
          {description}
        </p>
      )}
    </div>
  )
})
