import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGrading } from '../state/grading'
import { Icon, type IconName } from './Icon'
import { cx } from './cx'

type NavKey = 'dashboard' | 'rubrics' | 'assignments' | 'classes' | 'students'

const ITEMS: { key: NavKey; label: string; icon: IconName; to?: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', to: '/' },
  { key: 'rubrics', label: 'My Rubrics', icon: 'check-circle' },
  { key: 'assignments', label: 'My Assignments', icon: 'library-books', to: '/assignments' },
  { key: 'classes', label: 'Classes', icon: 'group' },
  { key: 'students', label: 'Students', icon: 'person' },
]

type SideNavProps = {
  collapsed?: boolean
  active?: NavKey
}

export function SideNav({ collapsed = false, active = 'dashboard' }: SideNavProps) {
  const { resetDemo } = useGrading()
  return (
    <nav
      aria-label="Main"
      className={cx(
        'sticky top-0 flex h-screen shrink-0 flex-col border-r border-n8 bg-white',
        collapsed ? 'w-16' : 'w-[216px]',
      )}
    >
      <Link to="/" aria-label="Rubricly home" className={collapsed ? 'ml-3 mt-4' : 'ml-5 mt-6'}>
        {collapsed ? <LogoBars /> : <img src="/assets/logo-horizontal.svg" alt="Rubricly" width={150} height={32} />}
      </Link>

      <ul className={cx('flex flex-col gap-6', collapsed ? 'mt-14' : 'mt-[63px]')}>
        {ITEMS.map((item) => {
          const isActive = item.key === active
          const content = (
            <span className="flex items-center gap-4 py-1">
              <span className={cx('h-6 w-1', isActive && 'bg-primary')} />
              <Icon name={item.icon} color={isActive ? 'bg-n2' : 'bg-n6'} />
              {!collapsed && (
                <span className={cx('text-base font-semibold', isActive ? 'text-black' : 'text-n5')}>{item.label}</span>
              )}
            </span>
          )
          return (
            <li key={item.key}>
              {item.to ? (
                <Link
                  to={item.to}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className="block hover:[&_span]:text-ink"
                >
                  {content}
                </Link>
              ) : (
                <span title={collapsed ? item.label : undefined} className="block cursor-default">
                  {content}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      <div className="mt-auto flex flex-col gap-6 pb-4">
        <button type="button" aria-label="Notifications" className="relative ml-5 size-6">
          <Icon name="notifications" color="bg-n5" />
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-error" />
        </button>
        <AvatarMenu onResetDemo={resetDemo} />
      </div>
    </nav>
  )
}

/** The four stacked bars from the Rubricly mark, used as the collapsed-nav logo. */
export function LogoBars({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cx('flex w-10 flex-col gap-0.5', className)}>
      <span className="h-1.5 rounded-full bg-logo-1" />
      <span className="h-1.5 rounded-full bg-logo-2" />
      <span className="h-1.5 rounded-full bg-logo-3" />
      <span className="h-1.5 rounded-full bg-logo-4" />
    </span>
  )
}

function AvatarMenu({ onResetDemo }: { onResetDemo?: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div ref={ref} className="relative ml-3">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="block size-10 overflow-hidden rounded-full"
      >
        <img src="/assets/avatar.png" alt="" className="size-full object-cover" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute bottom-0 left-12 z-40 w-48 rounded-lg border border-border bg-white py-2 shadow-elevation-2"
        >
          <p className="px-4 pb-2 text-sm font-semibold text-ink">Mrs. Clary</p>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onResetDemo?.()
            }}
            className="w-full px-4 py-1.5 text-left text-sm text-primary hover:bg-primary-tint"
          >
            Reset demo
          </button>
        </div>
      )}
    </div>
  )
}
