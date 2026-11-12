import { useI18n } from '@/i18n'
import type { ProductFilters } from '@/types'
import { catalogApi } from '@/api/catalog'
import { clsx } from 'clsx'

type Props = {
  filters: ProductFilters
  onChange: (f: ProductFilters) => void
  className?: string
}

export function FilterSidebar({ filters, onChange, className }: Props) {
  const { t } = useI18n()
  const brands = catalogApi.brands()
  const categories = catalogApi.categories()

  const set = (patch: Partial<ProductFilters>) => onChange({ ...filters, ...patch, page: 1 })

  return (
    <aside className={clsx('space-y-6 text-sm', className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-medium uppercase tracking-wider">{t.shop.filters}</h2>
        <button type="button" className="text-xs text-champagne hover:underline" onClick={() => onChange({ page: 1 })}>
          {t.shop.clearAll}
        </button>
      </div>

      <section>
        <h3 className="mb-2 font-medium">{t.shop.category}</h3>
        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c}>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="cat"
                  checked={filters.category === c}
                  onChange={() => set({ category: filters.category === c ? undefined : c })}
                />
                {c}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 font-medium">{t.shop.brand}</h3>
        <ul className="space-y-2">
          {brands.map((b) => (
            <li key={b}>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.brand === b}
                  onChange={() => set({ brand: filters.brand === b ? undefined : b })}
                />
                {b}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 font-medium">{t.shop.price}</h3>
        <div className="flex gap-2">
          <input
            className="input"
            type="number"
            placeholder={t.shop.min}
            value={filters.minPrice ?? ''}
            onChange={(e) => set({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
          <input
            className="input"
            type="number"
            placeholder={t.shop.max}
            value={filters.maxPrice ?? ''}
            onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-medium">{t.shop.rating}</h3>
        {[4, 3].map((r) => (
          <label key={r} className="mb-2 flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="rating"
              checked={filters.rating === r}
              onChange={() => set({ rating: filters.rating === r ? undefined : r })}
            />
            {r}+ ★
          </label>
        ))}
      </section>

      <section>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={!!filters.featuredOnly}
            onChange={(e) => set({ featuredOnly: e.target.checked || undefined })}
          />
          {t.shop.featured}
        </label>
      </section>
    </aside>
  )
}
