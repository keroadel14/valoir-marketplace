import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { catalogApi } from '@/api/catalog'

export function CategoriesPage() {
  const { t } = useI18n()
  return (
    <div className="container-lux py-14">
      <h1 className="section-title mb-10">{t.nav.categories}</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {catalogApi.categories().map((c) => (
          <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`} className="card flex h-32 items-end p-5 text-lg hover:border-champagne">
            {c}
          </Link>
        ))}
      </div>
    </div>
  )
}

export function BrandsPage() {
  const { t } = useI18n()
  return (
    <div className="container-lux py-14">
      <h1 className="section-title mb-10">{t.nav.brands}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {catalogApi.brands().map((b) => (
          <Link key={b} to={`/shop?brand=${encodeURIComponent(b)}`} className="card p-8 text-center font-display text-2xl hover:border-champagne">
            {b}
          </Link>
        ))}
      </div>
    </div>
  )
}

export function SellersPage() {
  const { t } = useI18n()
  return (
    <div className="container-lux py-14">
      <h1 className="section-title mb-6">{t.nav.sellers}</h1>
      <p className="text-sm text-[var(--muted)]">Public boutique directory requires a public boutiques list endpoint.</p>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="container-lux py-24 text-center">
      <h1 className="font-display text-5xl">404</h1>
      <Link to="/" className="mt-4 inline-block text-champagne">Home</Link>
    </div>
  )
}
