import { Link, NavLink } from 'react-router-dom'
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, X } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/i18n'
import { useTheme } from '@/stores/theme'
import { useAuth } from '@/stores/auth'
import { useCart } from '@/stores/cart'
import { clsx } from 'clsx'

export function Header() {
  const { t, lang, setLang } = useI18n()
  const { theme, toggle } = useTheme()
  const { user, logout, hasRole } = useAuth()
  const count = useCart((s) => s.count())
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    clsx('text-sm tracking-wide transition hover:text-champagne', isActive && 'text-champagne')

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
      <div className="container-lux flex h-16 items-center justify-between gap-4">
        <button type="button" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="font-display text-2xl font-semibold tracking-[0.2em]">
          {t.brand}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <NavLink to="/shop" className={linkCls}>{t.nav.shop}</NavLink>
          <NavLink to="/categories" className={linkCls}>{t.nav.categories}</NavLink>
          <NavLink to="/brands" className={linkCls}>{t.nav.brands}</NavLink>
          <NavLink to="/sellers" className={linkCls}>{t.nav.sellers}</NavLink>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <form
            className="hidden items-center gap-2 md:flex"
            onSubmit={(e) => {
              e.preventDefault()
              window.location.href = `/shop?q=${encodeURIComponent(q)}`
            }}
          >
            <Search className="h-4 w-4 text-[var(--muted)]" />
            <input
              className="w-40 border-0 bg-transparent text-sm outline-none placeholder:text-[var(--muted)] lg:w-52"
              placeholder={t.common.search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>

          <button type="button" className="btn-ghost p-2" onClick={toggle} aria-label="Theme">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            className="btn-ghost hidden p-2 text-xs uppercase tracking-wider sm:inline"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          >
            {lang === 'en' ? 'عربي' : 'EN'}
          </button>
          <Link to="/wishlist" className="btn-ghost p-2" aria-label="Wishlist">
            <Heart className="h-4 w-4" />
          </Link>
          <Link to="/cart" className="btn-ghost relative p-2" aria-label="Cart">
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
  <span className="absolute -end-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-champagne text-[10px] text-charcoal">
    {count}
  </span>
)}
          </Link>
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              {hasRole('Admin', 'SuperAdmin') && (
                <Link to="/admin" className="text-xs uppercase tracking-wider text-champagne">{t.nav.admin}</Link>
              )}
              {hasRole('Vendor') && (
                <Link to="/seller" className="text-xs uppercase tracking-wider">{t.nav.dashboard}</Link>
              )}
              <Link to="/account" className="text-xs uppercase tracking-wider">{t.nav.account}</Link>
              <button type="button" className="text-xs uppercase tracking-wider text-[var(--muted)]" onClick={() => logout()}>
                {t.nav.logout}
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden text-xs uppercase tracking-wider sm:inline">{t.nav.login}</Link>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0 w-72 bg-[var(--surface)] p-6 shadow-elev">
            <div className="mb-8 flex justify-between">
              <span className="font-display text-xl tracking-widest">{t.brand}</span>
              <button type="button" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex flex-col gap-4 text-sm">
              <Link to="/shop" onClick={() => setOpen(false)}>{t.nav.shop}</Link>
              <Link to="/categories" onClick={() => setOpen(false)}>{t.nav.categories}</Link>
              <Link to="/brands" onClick={() => setOpen(false)}>{t.nav.brands}</Link>
              <Link to="/sellers" onClick={() => setOpen(false)}>{t.nav.sellers}</Link>
              <Link to="/login" onClick={() => setOpen(false)}>{t.nav.login}</Link>
              <Link to="/register" onClick={() => setOpen(false)}>{t.nav.register}</Link>
              <Link to="/register/seller" onClick={() => setOpen(false)}>{t.nav.sellerLogin}</Link>
              <button type="button" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
                {lang === 'en' ? 'العربية' : 'English'}
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
