import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { useI18n } from '@/i18n'
import { catalogApi } from '@/api/catalog'
import { ProductCard } from '@/components/product/ProductCard'
import { FilterSidebar } from '@/components/filters/FilterSidebar'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import type { ProductFilters } from '@/types'

export function ShopPage() {
  const { t, tr } = useI18n()
  const [params] = useSearchParams()
  const [mobileFilters, setMobileFilters] = useState(false)
  const [filters, setFilters] = useState<ProductFilters>({
    search: params.get('q') || undefined,
    featuredOnly: params.get('featured') ? true : undefined,
    page: 1,
    pageSize: 12,
    sort: 'newest',
  })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['shop', filters],
    queryFn: () => catalogApi.list(filters),
  })

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = []
    if (filters.brand) chips.push({ key: 'brand', label: filters.brand, clear: () => setFilters({ ...filters, brand: undefined }) })
    if (filters.category) chips.push({ key: 'cat', label: filters.category, clear: () => setFilters({ ...filters, category: undefined }) })
    if (filters.featuredOnly) chips.push({ key: 'feat', label: t.shop.featured, clear: () => setFilters({ ...filters, featuredOnly: undefined }) })
    return chips
  }, [filters, t.shop.featured])

  return (
    <div className="container-lux py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title">{t.shop.title}</h1>
          {data && <p className="mt-2 text-sm text-[var(--muted)]">{tr(t.shop.results, { count: data.totalCount })}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="lg:hidden" onClick={() => setMobileFilters(true)}>
            <SlidersHorizontal className="h-4 w-4" /> {t.shop.filters}
          </Button>
          <select
            className="input w-auto"
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value as ProductFilters['sort'] })}
          >
            <option value="newest">{t.shop.newest}</option>
            <option value="price_asc">{t.shop.priceAsc}</option>
            <option value="price_desc">{t.shop.priceDesc}</option>
            <option value="featured">{t.shop.featured}</option>
          </select>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {activeChips.map((c) => (
            <button key={c.key} type="button" className="rounded-full border border-[var(--border)] px-3 py-1 text-xs" onClick={c.clear}>
              {c.label} ×
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <FilterSidebar filters={filters} onChange={setFilters} className="hidden lg:block sticky top-24 self-start" />

        <div>
          {isLoading && <div className="flex justify-center py-20"><Spinner /></div>}
          {isError && (
            <EmptyState title={t.common.error} hint={t.common.retry} />
          )}
          {data && data.items.length === 0 && <EmptyState title={t.shop.noResults} />}
          {data && data.items.length > 0 && (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              {data.items.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          {data && data.totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              <Button variant="outline" disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: (filters.page ?? 1) - 1 })}>
                {t.common.back}
              </Button>
              <span className="flex items-center text-sm text-[var(--muted)]">
                {data.page} / {data.totalPages}
              </span>
              <Button variant="outline" disabled={data.page >= data.totalPages} onClick={() => setFilters({ ...filters, page: (filters.page ?? 1) + 1 })}>
                →
              </Button>
            </div>
          )}
          {isError && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => refetch()}>{t.common.retry}</Button>
            </div>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilters(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-lg bg-[var(--surface)] p-6">
            <FilterSidebar filters={filters} onChange={(f) => { setFilters(f) }} />
            <Button className="mt-6 w-full" onClick={() => setMobileFilters(false)}>{t.shop.apply}</Button>
          </div>
        </div>
      )}
    </div>
  )
}
