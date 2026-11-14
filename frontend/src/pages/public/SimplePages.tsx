import { useState, useMemo } from 'react'
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

interface BoutiqueProfile {
  name: string
  city: string
  specialty: string
  description: string
  featuredPieces: string
  badge: string
}

const CURATED_BOUTIQUES: BoutiqueProfile[] = [
  {
    name: 'Maison Lumen',
    city: 'Paris, France',
    specialty: 'Haute Couture & Tailoring',
    description: 'Bespoke silk evening capes and timeless cashmere outerwear handcrafted in historical Parisian ateliers.',
    featuredPieces: 'Silk Evening Cape, Cashmere Tailored Coat',
    badge: 'Heritage Partner',
  },
  {
    name: 'Atelier Noor',
    city: 'Geneva, Switzerland',
    specialty: 'High Jewelry & Gemstones',
    description: 'Sustainably sourced emeralds and natural pearls set in hand-engraved 18k recycled gold and platinum.',
    featuredPieces: 'Hand-set Emerald Ring, Pearl Drop Earrings',
    badge: 'Master Jeweler',
  },
  {
    name: 'Studio Harmonia',
    city: 'Milan, Italy',
    specialty: 'Leather Goods & Ceramic Art',
    description: 'Vegetable-tanned Florentine leather travel bags and numbered artisanal ceramic vessels for modern connoisseurs.',
    featuredPieces: 'Ceramic Vase Limited, Leather Weekender',
    badge: 'Artisanal Studio',
  },
  {
    name: 'Atelier Vénitien',
    city: 'Venice, Italy',
    specialty: 'Blown Glass & Tableware',
    description: 'Centuries-old Murano glassblowing traditions reimagined into sculptural homeware and dramatic lighting.',
    featuredPieces: 'Cristallo Decanters, Murano Stemware',
    badge: 'Curated Artisan',
  },
  {
    name: 'Kyoto Kobo',
    city: 'Kyoto, Japan',
    specialty: 'Silk Textiles & Urushi Lacquer',
    description: 'Intricately dyed Nishijin silk textiles paired with natural Japanese lacquerware accessories.',
    featuredPieces: 'Kimono Silk Stoles, Lacquered Boxes',
    badge: 'Heritage Partner',
  },
  {
    name: 'Mayfair Horology',
    city: 'London, UK',
    specialty: 'Independent Watchmaking',
    description: 'Ultra-low production mechanical timepieces celebrating British guilloché dials and bespoke leather straps.',
    featuredPieces: 'Tourbillon Edition 01, Enamel Dial Chrono',
    badge: 'Master Watchmaker',
  },
]

export function SellersPage() {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [filterCity, setFilterCity] = useState<string>('all')

  const cities = useMemo(() => {
    return ['all', ...Array.from(new Set(CURATED_BOUTIQUES.map((b) => b.city.split(',')[1]?.trim() || b.city)))]
  }, [])

  const filtered = useMemo(() => {
    return CURATED_BOUTIQUES.filter((b) => {
      const matchSearch =
        !search ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.specialty.toLowerCase().includes(search.toLowerCase()) ||
        b.city.toLowerCase().includes(search.toLowerCase())
      const matchCity = filterCity === 'all' || b.city.includes(filterCity)
      return matchSearch && matchCity
    })
  }, [search, filterCity])

  return (
    <div className="container-lux py-14">
      {/* Page Header */}
      <div className="mb-12 border-b border-[var(--border)] pb-8">
        <span className="text-xs font-semibold tracking-widest uppercase text-champagne">
          Exclusive Partners
        </span>
        <h1 className="section-title mt-2 mb-3">{t.nav.sellers} & Boutiques</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Discover our curated network of independent ateliers, master jewelers, and bespoke craftsmen vetted for uncompromising excellence.
        </p>

        {/* Search & Filters */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by boutique, craft or city…"
              className="w-full rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:border-champagne focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setFilterCity(city)}
                className={`rounded px-3 py-1.5 transition-colors ${
                  filterCity === city
                    ? 'bg-charcoal text-ivory dark:bg-champagne dark:text-charcoal font-medium'
                    : 'border border-[var(--border)] text-[var(--muted)] hover:border-champagne'
                }`}
              >
                {city === 'all' ? 'All Origins' : city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Boutiques Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((boutique) => (
          <div
            key={boutique.name}
            className="card group flex flex-col justify-between p-6 transition-all hover:border-champagne/80 hover:shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block rounded bg-champagne/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-champagne uppercase">
                    {boutique.badge}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-medium tracking-tight text-[var(--text)] group-hover:text-champagne transition-colors">
                    {boutique.name}
                  </h3>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-champagne/30 bg-champagne/5 font-display text-base font-bold text-champagne">
                  {boutique.name.charAt(0)}
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-[var(--muted)]">
                <svg className="h-3.5 w-3.5 text-champagne/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{boutique.city}</span>
                <span>•</span>
                <span className="font-medium text-[var(--text)]">{boutique.specialty}</span>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
                {boutique.description}
              </p>

              <div className="mt-4 border-t border-[var(--border)] pt-3 text-[11px] text-[var(--muted)]">
                <span className="font-medium text-[var(--text)]">Signature works: </span>
                {boutique.featuredPieces}
              </div>
            </div>

            <div className="mt-6 pt-2">
              <Link
                to={`/shop?brand=${encodeURIComponent(boutique.name)}`}
                className="btn-outline flex w-full items-center justify-center gap-2 py-2 text-xs font-medium tracking-wider uppercase transition-colors hover:bg-champagne hover:text-charcoal hover:border-champagne"
              >
                <span>View Collection</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center text-sm text-[var(--muted)]">
          No boutiques match your current search. Try resetting filters.
        </div>
      )}

      {/* Become a Seller Banner */}
      <div className="mt-16 rounded border border-champagne/30 bg-gradient-to-r from-champagne/5 via-transparent to-champagne/10 p-8 sm:p-12 text-center">
        <span className="text-xs font-semibold tracking-widest uppercase text-champagne">
          Partner With Us
        </span>
        <h2 className="mt-2 font-display text-3xl font-medium text-[var(--text)]">
          Open an Independent Boutique on VALOIR
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
          Are you an established artisan, haute couture designer, or independent luxury maison? Join our invitation-only global marketplace.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            to="/seller"
            className="btn-primary px-6 py-2.5 text-xs font-medium tracking-wider uppercase"
          >
            Seller Portal
          </Link>
          <Link
            to="/register"
            className="btn-outline px-6 py-2.5 text-xs font-medium tracking-wider uppercase"
          >
            Apply for Membership
          </Link>
        </div>
      </div>
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
