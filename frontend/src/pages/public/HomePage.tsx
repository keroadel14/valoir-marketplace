import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useI18n } from '@/i18n'
import { catalogApi } from '@/api/catalog'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

export function HomePage() {
  const { t } = useI18n()
  const { data, isLoading } = useQuery({
    queryKey: ['home-featured'],
    queryFn: () => catalogApi.list({ featuredOnly: true, pageSize: 4 }),
  })
  const { data: newest } = useQuery({
    queryKey: ['home-new'],
    queryFn: () => catalogApi.list({ sort: 'newest', pageSize: 4 }),
  })

  return (
    <div>
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="container-lux grid min-h-[70vh] items-center gap-10 py-16 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-champagne">VALOIR 2026</p>
            <h1 className="font-display text-5xl leading-tight md:text-6xl lg:text-7xl">{t.home.heroTitle}</h1>
            <p className="mt-6 max-w-md text-[var(--muted)] leading-relaxed">{t.home.heroSub}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/shop"><Button>{t.home.shopNow}</Button></Link>
              <Link to="/register/seller"><Button variant="outline">{t.home.becomeSeller}</Button></Link>
            </div>
          </div>
          <div className="relative hidden aspect-[4/5] bg-gradient-to-br from-champagne/20 via-ivory-200 to-charcoal/20 dark:from-champagne/10 dark:via-charcoal-100 dark:to-charcoal-900 lg:block" />
        </div>
      </section>

      <section className="container-lux py-20">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="section-title">{t.home.featured}</h2>
          <Link to="/shop?featured=1" className="text-sm text-champagne hover:underline">{t.common.viewAll}</Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {data?.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
        {data?.source === 'demo' && (
          <p className="mt-6 text-center text-xs text-[var(--muted)]">
            Catalog preview data · connect public product API for live inventory
          </p>
        )}
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)] py-20">
        <div className="container-lux">
          <h2 className="section-title mb-10">{t.home.newArrivals}</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {newest?.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className="container-lux py-20 text-center">
        <h2 className="section-title">{t.home.newsletter}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted)]">{t.home.newsletterHint}</p>
        <form className="mx-auto mt-8 flex max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
          <input className="input" type="email" required placeholder="you@email.com" />
          <Button type="submit">{t.home.subscribe}</Button>
        </form>
      </section>
    </div>
  )
}
