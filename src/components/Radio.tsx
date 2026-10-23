import { cx } from './cx'

/** Visual radio dot from the Dialect Radio component. Pair it with a real input for semantics. */
export function RadioDot({ checked, className }: { checked: boolean; className?: string }) {
  return (
    <img
      alt=""
      aria-hidden
      src={checked ? '/assets/icons/radio-selected.svg' : '/assets/icons/radio.svg'}
      width={16}
      height={16}
      className={cx('block size-4 shrink-0', className)}
    />
  )
}

type RadioProps = {
  name: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  label: string
  className?: string
}

export function Radio({ name, value, checked, onChange, label, className }: RadioProps) {
  return (
    <label className={cx('inline-flex cursor-pointer items-center gap-2 text-base text-ink', className)}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="peer sr-only"
      />
      <RadioDot checked={checked} className="rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary" />
      {label}
    </label>
  )
}
