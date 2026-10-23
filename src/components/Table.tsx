import type { ReactNode } from 'react'
import { cx } from './cx'

export type Column<T> = {
  key: string
  header: ReactNode
  /**
   * Column width in px as drawn in Figma at 1440. Columns share space in these
   * proportions, so the table matches Figma at 1440 and scales smoothly either side.
   */
  width: number
  /** Floor for the column; defaults to the cell's min-content so tags and buttons never overflow. */
  minWidth?: number
  /** Let long text wrap instead of widening the column (e.g. names). */
  wrap?: boolean
  render: (row: T) => ReactNode
}

type TableProps<T> = {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  /** Minimum row height in px (Figma rows are 64). Rows grow if text wraps. */
  rowHeight?: number
  empty?: ReactNode
  className?: string
  /** Row to flash with the success tint (e.g. the row just graded). */
  highlightKey?: string | null
}

export function Table<T>({ columns, rows, rowKey, rowHeight = 64, empty, className, highlightKey }: TableProps<T>) {
  // One grid owns the column tracks; every row is a subgrid of it, so header and
  // body cells always line up regardless of content.
  const template = columns
    .map((c) => `minmax(${c.minWidth != null ? `${c.minWidth}px` : 'min-content'}, ${c.width}fr)`)
    .join(' ')

  return (
    <div className={cx('w-full overflow-x-auto rounded-xl border border-border bg-white px-4 py-2', className)}>
      <div role="table" className="grid w-full" style={{ gridTemplateColumns: template }}>
        <div role="row" className="col-span-full grid grid-cols-subgrid">
          {columns.map((c) => (
            <div
              key={c.key}
              role="columnheader"
              className="flex h-12 items-center whitespace-nowrap px-3 text-base font-semibold leading-[1.5] text-ink"
            >
              {c.header}
            </div>
          ))}
        </div>
        {rows.map((row) => (
          <div
            key={rowKey(row)}
            role="row"
            className={cx(
              'col-span-full grid grid-cols-subgrid transition-colors duration-700',
              highlightKey === rowKey(row) && 'bg-success-tint',
            )}
          >
            {columns.map((c) => (
              <div
                key={c.key}
                role="cell"
                className={cx(
                  'flex min-w-0 items-center px-3 py-2 text-sm leading-[1.5] text-ink',
                  !c.wrap && 'whitespace-nowrap',
                )}
                style={{ minHeight: rowHeight }}
              >
                {c.render(row)}
              </div>
            ))}
          </div>
        ))}
        {rows.length === 0 && empty && (
          <div role="row" className="col-span-full px-3 py-6 text-sm text-n4">
            {empty}
          </div>
        )}
      </div>
    </div>
  )
}
