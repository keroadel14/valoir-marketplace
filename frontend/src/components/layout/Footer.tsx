import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className="mt-24 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="container-lux grid gap-10 py-14 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl tracking-[0.2em]">{t.brand}</p>
          <p className="mt-3 text-sm text-[var(--muted)]">{t.tagline}</p>
        </div>
        <div className="text-sm space-y-2">
          <p className="font-medium uppercase tracking-wider text-xs">{t.nav.shop}</p>
          <Link to="/shop" className="block text-[var(--muted)] hover:text-champagne">{t.nav.shop}</Link>
          <Link to="/categories" className="block text-[var(--muted)] hover:text-champagne">{t.nav.categories}</Link>
          <Link to="/brands" className="block text-[var(--muted)] hover:text-champagne">{t.nav.brands}</Link>
        </div>
        <div className="text-sm space-y-2">
          <p className="font-medium uppercase tracking-wider text-xs">Support</p>
          <Link to="/help" className="block text-[var(--muted)] hover:text-champagne">{t.nav.help}</Link>
          <Link to="/legal/faq" className="block text-[var(--muted)] hover:text-champagne">{t.legal.faq}</Link>
          <Link to="/legal/contact" className="block text-[var(--muted)] hover:text-champagne">{t.legal.contact}</Link>
        </div>
        <div className="text-sm space-y-2">
          <p className="font-medium uppercase tracking-wider text-xs">Legal</p>
          <Link to="/legal/privacy" className="block text-[var(--muted)] hover:text-champagne">{t.legal.privacy}</Link>
          <Link to="/legal/terms" className="block text-[var(--muted)] hover:text-champagne">{t.legal.terms}</Link>
          <Link to="/legal/shipping" className="block text-[var(--muted)] hover:text-champagne">{t.legal.shipping}</Link>
          <Link to="/legal/returns" className="block text-[var(--muted)] hover:text-champagne">{t.legal.returns}</Link>
        </div>
      </div>
      <div className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} VALOIR. All rights reserved.
      </div>
    </footer>
  )
}
