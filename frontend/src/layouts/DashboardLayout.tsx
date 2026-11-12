import { Link, NavLink, Outlet } from 'react-router-dom'
import { clsx } from 'clsx'

export function DashboardLayout({
  title,
  links,
}: {
  title: string
  links: { to: string; label: string }[]
}) {
  return (
    <div className="container-lux py-10">
      <h1 className="section-title mb-8">{title}</h1>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to.split('/').length <= 3}
              className={({ isActive }) =>
                clsx(
                  'whitespace-nowrap rounded-sm px-3 py-2 text-sm transition',
                  isActive ? 'bg-charcoal text-ivory dark:bg-champagne dark:text-charcoal' : 'hover:bg-black/5 dark:hover:bg-white/5',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/" className="px-3 py-2 text-sm text-[var(--muted)]">← Home</Link>
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
