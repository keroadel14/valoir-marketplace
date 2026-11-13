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
    clsx(
      'text-xs tracking-[0.15em] uppercase transition hover:text-[#d4af37]',
      isActive ? 'text-[#d4af37] font-medium' : 'text-neutral-400'
    )

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/95 backdrop-blur-md text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-18 items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <button
          type="button"
          className="p-2 lg:hidden text-neutral-300 hover:text-white"
          onClick={() => setOpen(true)}
          aria-label="Open Menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Brand Logo & Name (Faceted V Monogram in Marcellus) */}
        <Link to="/" className="flex items-center gap-3">
          <svg className="h-7 w-7 text-[#d4af37]" viewBox="0 0 100 100" fill="currentColor">
            <polygon points="16,22 32,22 50,68 68,22 84,22 56,84 44,84" />
            <polygon points="44,22 56,22 50,34" />
          </svg>
          <span className="font-['Marcellus',serif] text-2xl font-normal tracking-[0.22em] text-white">
            VALOIR
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          <NavLink to="/shop" className={linkCls}>{t.nav.shop}</NavLink>
          <NavLink to="/categories" className={linkCls}>{t.nav.categories}</NavLink>
          <NavLink to="/brands" className={linkCls}>{t.nav.brands}</NavLink>
          <NavLink to="/sellers" className={linkCls}>{t.nav.sellers}</NavLink>
          {hasRole('Vendor') && (
            <NavLink to="/seller" className={linkCls}>{t.seller.overview}</NavLink>
          )}
          {hasRole('Admin') && (
            <NavLink to="/admin" className={linkCls}>{t.nav.admin}</NavLink>
          )}
        </nav>

        {/* Search Bar */}
        <form
          action="/shop"
          method="get"
          className="hidden md:flex items-center border border-neutral-800 rounded-full px-3.5 py-1.5 bg-neutral-900/60 focus-within:border-[#d4af37]/60 transition"
        >
          <Search className="h-3.5 w-3.5 text-neutral-400 me-2" />
          <input
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.common.search}
            className="w-36 lg:w-48 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
          />
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="text-xs uppercase tracking-wider text-neutral-300 hover:text-[#d4af37] px-2 py-1 rounded transition"
          >
            {lang === 'en' ? 'العربية' : 'EN'}
          </button>

          <button
            type="button"
            onClick={toggle}
            className="p-2 text-neutral-300 hover:text-white transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Link to="/wishlist" className="p-2 text-neutral-300 hover:text-white transition" aria-label="Wishlist">
            <Heart className="h-4 w-4" />
          </Link>

          <Link to="/cart" className="relative p-2 text-neutral-300 hover:text-white transition" aria-label="Cart">
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute top-0 end-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#d4af37] text-[10px] font-bold text-black">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/account" className="hidden sm:inline-block text-xs uppercase tracking-wider text-neutral-300 hover:text-[#d4af37]">
                {user.fullName || t.nav.account}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-xs text-neutral-400 hover:text-red-400 transition"
              >
                {t.nav.logout}
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login" className="text-xs uppercase tracking-wider text-neutral-300 hover:text-[#d4af37]">
                {t.nav.login}
              </Link>
              <Link
                to="/register"
                className="text-xs uppercase tracking-wider bg-[#d4af37] text-black font-medium px-3.5 py-1.5 rounded-full hover:bg-[#e5c358] transition"
              >
                {t.nav.register}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer (100% Opaque, Zero overlap with background) */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Solid Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />

          {/* Opaque Drawer Container */}
          <div className="absolute inset-y-0 start-0 w-80 max-w-[85vw] bg-[#0c0c0e] border-e border-neutral-800 text-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Header with Logo */}
              <div className="mb-8 flex items-center justify-between border-b border-neutral-800 pb-4">
                <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                  <svg className="h-6 w-6 text-[#d4af37]" viewBox="0 0 100 100" fill="currentColor">
                    <polygon points="16,22 32,22 50,68 68,22 84,22 56,84 44,84" />
                    <polygon points="44,22 56,22 50,34" />
                  </svg>
                  <span className="font-['Marcellus',serif] text-xl font-normal tracking-[0.22em] text-white">
                    VALOIR
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white"
                  aria-label="Close Menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col space-y-4">
                <Link
                  to="/shop"
                  onClick={() => setOpen(false)}
                  className="text-base tracking-wider uppercase text-neutral-200 hover:text-[#d4af37] transition"
                >
                  {t.nav.shop}
                </Link>
                <Link
                  to="/categories"
                  onClick={() => setOpen(false)}
                  className="text-base tracking-wider uppercase text-neutral-200 hover:text-[#d4af37] transition"
                >
                  {t.nav.categories}
                </Link>
                <Link
                  to="/brands"
                  onClick={() => setOpen(false)}
                  className="text-base tracking-wider uppercase text-neutral-200 hover:text-[#d4af37] transition"
                >
                  {t.nav.brands}
                </Link>
                <Link
                  to="/sellers"
                  onClick={() => setOpen(false)}
                  className="text-base tracking-wider uppercase text-neutral-200 hover:text-[#d4af37] transition"
                >
                  {t.nav.sellers}
                </Link>

                <div className="my-2 border-t border-neutral-800/80" />

                {user ? (
                  <>
                    <Link to="/account" onClick={() => setOpen(false)} className="text-sm text-neutral-300 hover:text-[#d4af37]">
                      {t.nav.account} ({user.fullName})
                    </Link>
                    {hasRole('Vendor') && (
                      <Link to="/seller" onClick={() => setOpen(false)} className="text-sm text-[#d4af37]">
                        {t.seller.overview}
                      </Link>
                    )}
                    {hasRole('Admin') && (
                      <Link to="/admin" onClick={() => setOpen(false)} className="text-sm text-[#d4af37]">
                        {t.nav.admin}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => { logout(); setOpen(false); }}
                      className="text-start text-sm text-red-400 pt-2"
                    >
                      {t.nav.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="text-sm text-neutral-300 hover:text-[#d4af37]">
                      {t.nav.login}
                    </Link>
                    <Link to="/register" onClick={() => setOpen(false)} className="text-sm text-neutral-300 hover:text-[#d4af37]">
                      {t.nav.register}
                    </Link>
                    <Link to="/register/seller" onClick={() => setOpen(false)} className="text-sm text-[#d4af37]">
                      {t.nav.sellerLogin}
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Language Switcher at Bottom */}
            <div className="pt-6 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => { setLang(lang === 'en' ? 'ar' : 'en'); setOpen(false); }}
                className="w-full py-2.5 text-center text-xs tracking-widest uppercase border border-neutral-700 rounded-lg text-neutral-300 hover:border-[#d4af37] hover:text-[#d4af37] transition"
              >
                {lang === 'en' ? 'تغيير اللغة إلى العربية' : 'Switch to English'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
