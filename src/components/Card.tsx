import type { HTMLAttributes } from 'react'
import { cx } from './cx'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** `accent` is the peach "Lesson objectives" card. */
  tone?: 'default' | 'accent'
}

export function Card({ tone = 'default', className, ...rest }: CardProps) {
  return (
    <div
      className={cx(
        'rounded-xl border px-5 py-4',
        tone === 'default' ? 'border-border bg-white' : 'border-accent bg-accent/23',
        className,
      )}
      {...rest}
    />
  )
}

/** Big number + caption, as on the roster summary and dashboard metric cards. */
export function StatCard({ value, label, className }: { value: string; label: string; className?: string }) {
  return (
    <Card className={cx('flex min-w-0 flex-1 flex-col gap-0.5', className)}>
      <p className="text-f3 font-semibold text-ink">{value}</p>
      <p className="text-base text-n4">{label}</p>
    </Card>
  )
}
