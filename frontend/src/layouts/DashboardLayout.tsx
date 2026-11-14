import { Link, NavLink, Outlet } from 'react-router-dom'
import { clsx } from 'clsx'
import { ChevronRight, Store, ArrowLeft } from 'lucide-react'

export function DashboardLayout({
  title,
  links,
}: {
  title: string
  links: { to: string; label: string }[]
}) {
  return (
    <div className="min-h-screen bg-[#070709] text-white">
      {/* Subtle Ambient Gold Glow Header */}
      <div className="border-b border-neutral-800/80 bg-[#0c0c10]/70 backdrop-blur-md sticky top-0 z-30">
        <div className="container-lux mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#d4af37] shadow-[0_0_8px_#d4af37]" />
            <h1 className="font-display text-lg sm:text-xl tracking-wide text-white">
              {title}
            </h1>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-[#d4af37] transition duration-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Storefront</span>
          </Link>
        </div>
      </div>

      <div className="container-lux mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar for Desktop / Horizontal Nav for Mobile */}
          <aside className="shrink-0">
            <nav className="flex flex-row gap-2 overflow-x-auto pb-2 lg:pb-0 lg:flex-col lg:gap-1.5 p-1 rounded-2xl bg-[#0e0e13]/80 border border-neutral-800/80 backdrop-blur-sm">
              <div className="hidden lg:block px-4 py-3 border-b border-neutral-800/60 mb-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                  Navigation
                </p>
              </div>
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to.split('/').length <= 3}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center justify-between whitespace-nowrap rounded-xl px-4 py-2.5 text-xs tracking-wide transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-[#d4af37]/20 to-transparent text-[#d4af37] border-l-2 border-[#d4af37] font-semibold shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                    )
                  }
                >
                  <span>{l.label}</span>
                  <ChevronRight className="hidden lg:block h-3.5 w-3.5 opacity-40" />
                </NavLink>
              ))}

              <div className="hidden lg:block pt-4 mt-2 border-t border-neutral-800/60 px-3 pb-2">
                <Link
                  to="/shop"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-neutral-400 hover:text-[#d4af37] hover:bg-neutral-800/30 transition duration-200"
                >
                  <Store className="h-3.5 w-3.5 text-[#d4af37]" />
                  <span>Explore Catalogue</span>
                </Link>
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="min-w-0">
            <div className="rounded-2xl border border-neutral-800/80 bg-[#0a0a0e]/60 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
