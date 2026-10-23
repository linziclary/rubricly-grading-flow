import { cx } from './cx'

// Each Figma icon is a 24px frame with a colour-filled glyph masked at an offset.
// Sizes and offsets come straight from the Figma mask settings.
const ICONS = {
  dashboard: { w: 18, h: 18, x: 3, y: 3 },
  'check-circle': { w: 20, h: 20, x: 2, y: 2 },
  'library-books': { w: 20, h: 20, x: 2, y: 2 },
  group: { w: 22, h: 14, x: 1, y: 5 },
  person: { w: 16, h: 16, x: 4, y: 4 },
  notifications: { w: 15.173, h: 19.5, x: 4.414, y: 2.25 },
  'arrow-back': { w: 15.583, h: 15.175, x: 4.209, y: 4.413 },
} as const

export type IconName = keyof typeof ICONS

type IconProps = {
  name: IconName
  /** Tailwind background-colour class, e.g. `bg-n5`. The icon is drawn with this colour. */
  color?: string
  className?: string
}

export function Icon({ name, color = 'bg-n5', className }: IconProps) {
  const { w, h, x, y } = ICONS[name]
  const url = `url("/assets/icons/${name}.svg")`
  return (
    <span aria-hidden className={cx('relative block size-6 shrink-0', className)}>
      <span
        className={cx('absolute inset-0', color)}
        style={{
          maskImage: url,
          WebkitMaskImage: url,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskSize: `${w}px ${h}px`,
          WebkitMaskSize: `${w}px ${h}px`,
          maskPosition: `${x}px ${y}px`,
          WebkitMaskPosition: `${x}px ${y}px`,
        }}
      />
    </span>
  )
}
