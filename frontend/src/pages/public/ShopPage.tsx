import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n } from '@/i18n'
import { catalogApi } from '@/api/catalog'
import { ProductCard } from '@/components/product/ProductCard'
import { FilterSidebar } from '@/components/filters/FilterSidebar'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import type { ProductFilters } from '@/types'

const CATEGORY_TABS = [
  { key: undefined, en: 'All Pieces', ar: 'كل القطع' },
  { key: 'jewelry', en: 'Haute Joaillerie', ar: 'المجوهرات الراقية' },
  { key: 'fashion', en: 'Silks & Couture', ar: 'أزياء وكوتور' },
  { key: 'leather', en: 'Leather Goods', ar: 'الجلود الفاخرة' },
  { key: 'watches', en: 'Horlogerie', ar: 'الساعات النادرة' },
  { key: 'beauty', en: 'Scent & Care', ar: 'عطور وعناية' },
  { key: 'home', en: 'Living & Art', ar: 'ديكور وفنون' },
]

export function ShopPage() {
  const { t, lang } = useI18n()
  const isAr = lang === 'ar'
  const [params, setParams] = useSearchParams()
  const [mobileFilters, setMobileFilters] = useState(false)

  const initialCat = params.get('category') || undefined

  const [filters, setFilters] = useState<ProductFilters>({
    search: params.get('q') || undefined,
    category: initialCat,
    featuredOnly: params.get('featured') ? true : undefined,
    page: 1,
    pageSize: 12,
    sort: (params.get('sort') as ProductFilters['sort']) || 'newest',
  })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['shop', filters],
    queryFn: () => catalogApi.list(filters),
  })

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = []
    if (filters.brand) {
      chips.push({
        key: 'brand',
        label: `${isAr ? 'العلامة' : 'Brand'}: ${filters.brand}`,
        clear: () => setFilters((f) => ({ ...f, brand: undefined })),
      })
    }
    if (filters.category) {
      const tab = CATEGORY_TABS.find((t) => t.key === filters.category)
      chips.push({
        key: 'cat',
        label: tab ? (isAr ? tab.ar : tab.en) : filters.category,
        clear: () => {
          setFilters((f) => ({ ...f, category: undefined, page: 1 }))
          setParams((p) => {
            p.delete('category')
            return p
          })
        },
      })
    }
    if (filters.featuredOnly) {
      chips.push({
        key: 'feat',
        label: isAr ? 'المختارات المميزة' : 'Featured Editions',
        clear: () => setFilters((f) => ({ ...f, featuredOnly: undefined })),
      })
    }
    if (filters.search) {
      chips.push({
        key: 'search',
        label: `"${filters.search}"`,
        clear: () => {
          setFilters((f) => ({ ...f, search: undefined, page: 1 }))
          setParams((p) => {
            p.delete('q')
            return p
          })
        },
      })
    }
    return chips
  }, [filters, isAr, setParams])

  const handleCategorySelect = (catKey?: string) => {
    setFilters((prev) => ({ ...prev, category: catKey, page: 1 }))
    setParams((prev) => {
      if (catKey) prev.set('category', catKey)
      else prev.delete('category')
      return prev
    })
  }

  return (
    <div className="bg-[#0B0C0E] text-white min-h-screen">
      {/* Editorial Luxury Header - Gold & Elegance */}
      <section className="relative border-b border-[#D4AF37]/25 bg-gradient-to-b from-[#141519] to-[#0B0C0E] py-14 md:py-20">
        <div className="container-lux text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3.5 py-1 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.25em] text-[#E5C158] mb-5">
            <Sparkles className="h-3 w-3" />
            <span>{isAr ? 'كتالوج ٢٠٢٦ الفاخر' : 'VALOIR · HAUTE SÉLECTION'}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl uppercase tracking-[0.08em] text-white">
            {isAr ? 'المجموعة الكاملة' : 'GOLD & ELEGANCE'}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm md:text-base font-light leading-relaxed text-white/70">
            {isAr
              ? 'مختارات نادرة من الحرفية الأوروبية الرفيعة والمجوهرات والساعات والأزياء الخالدة.'
              : 'Our curated collection of timeless craftsmanship, independent ateliers, and pre-eminent luxury.'}
          </p>

          {/* Quick Category Selection Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {CATEGORY_TABS.map((tab) => {
              const active = filters.category === tab.key
              return (
                <button
                  key={tab.key || 'all'}
                  type="button"
                  onClick={() => handleCategorySelect(tab.key)}
                  className={`border px-3.5 py-1.5 text-[11px] sm:text-xs uppercase tracking-[0.16em] transition-all duration-300 ${
                    active
                      ? 'border-[#D4AF37] bg-[#D4AF37] text-black font-medium shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'border-white/15 bg-white/5 text-white/80 hover:border-[#D4AF37]/60 hover:text-white'
                  }`}
                >
                  {isAr ? tab.ar : tab.en}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <div className="container-lux py-10 md:py-14">
        {/* Top Control Bar: Results count, Filters trigger, Sort */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#E5C158]">
              {data ? `${data.totalCount} ${isAr ? 'قطعة استثنائية' : 'TIMELESS CREATIONS'}` : '...'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="lg:hidden border-white/20 bg-white/5 text-xs uppercase tracking-[0.15em] text-white hover:border-[#D4AF37]"
              onClick={() => setMobileFilters(true)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 me-1.5 text-[#E5C158]" />
              {t.shop?.filters || (isAr ? 'التصفية' : 'Filters')}
            </Button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[11px] uppercase tracking-[0.15em] text-white/50">
                {isAr ? 'الترتيب:' : 'Sort:'}
              </span>
              <select
                className="border border-white/15 bg-[#121316] px-3 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                value={filters.sort}
                onChange={(e) =>
                  setFilters({ ...filters, sort: e.target.value as ProductFilters['sort'], page: 1 })
                }
              >
                <option value="newest">{isAr ? 'الأحدث أولاً' : 'Newest Editions'}</option>
                <option value="featured">{isAr ? 'المختارات المميزة' : 'Featured Pieces'}</option>
                <option value="price_asc">{isAr ? 'السعر: من الأقل' : 'Price: Low to High'}</option>
                <option value="price_desc">{isAr ? 'السعر: من الأعلى' : 'Price: High to Low'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-white/50 me-1">
              {isAr ? 'الفلاتر:' : 'Active:'}
            </span>
            {activeChips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={c.clear}
                className="group inline-flex items-center gap-1.5 border border-[#D4AF37]/40 bg-[#16171B] px-3 py-1 text-[11px] tracking-wider text-white transition hover:border-red-400/80 hover:text-red-300"
              >
                <span>{c.label}</span>
                <X className="h-3 w-3 text-[#E5C158] group-hover:text-red-400" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setFilters({ page: 1, pageSize: 12, sort: 'newest' })
                setParams({})
              }}
              className="text-[10px] uppercase tracking-[0.18em] text-[#E5C158] hover:underline ms-2"
            >
              {isAr ? 'مسح الكل' : 'Clear all'}
            </button>
          </div>
        )}

        {/* Catalog Grid with Sidebar */}
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block sticky top-28 self-start border border-white/10 bg-[#121316] p-5">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-display text-xs uppercase tracking-[0.2em] text-[#E5C158]">
                {isAr ? 'تصفية المنتجات' : 'REFINE SELECTION'}
              </span>
            </div>
            <FilterSidebar filters={filters} onChange={setFilters} />
          </aside>

          <div>
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <Spinner />
                <p className="mt-4 font-display text-xs uppercase tracking-[0.25em] text-[#E5C158]">
                  {isAr ? 'جارٍ تحميل المجموعة…' : 'Loading Valoir Collection…'}
                </p>
              </div>
            )}

            {isError && (
              <div className="border border-white/10 bg-[#121316] p-10 text-center">
                <EmptyState
                  title={t.common?.error || (isAr ? 'تعذر تحميل المنتجات' : 'Unable to load products')}
                  hint={t.common?.retry || (isAr ? 'يرجى إعادة المحاولة' : 'Please retry')}
                />
                <Button
                  variant="outline"
                  className="mt-4 border-[#D4AF37]/50 text-[#E5C158]"
                  onClick={() => refetch()}
                >
                  {t.common?.retry || 'Retry'}
                </Button>
              </div>
            )}

            {data && data.items.length === 0 && (
              <div className="border border-white/10 bg-[#121316] p-12 text-center">
                <p className="font-display text-xl text-white">
                  {isAr ? 'لا توجد قطع مطابقة للبحث' : 'No pieces match your selection'}
                </p>
                <p className="mt-2 text-xs text-white/60">
                  {isAr ? 'جرب تغيير خيارات التصفية أو الفئة' : 'Try clearing filters to explore all creations.'}
                </p>
                <Button
                  className="mt-6 border border-[#D4AF37] bg-[#D4AF37] text-black text-xs uppercase tracking-widest font-medium hover:bg-[#E5C158]"
                  onClick={() => {
                    setFilters({ page: 1, pageSize: 12, sort: 'newest' })
                    setParams({})
                  }}
                >
                  {isAr ? 'عرض كل القطع' : 'EXPLORE ALL PIECES'}
                </Button>
              </div>
            )}

            {data && data.items.length > 0 && (
              <div className="grid grid-cols-2 gap-3.5 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
                {data.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {/* Pagination matching Gold & Elegance */}
            {data && data.totalPages > 1 && (
              <div className="mt-14 flex items-center justify-center gap-3 border-t border-white/10 pt-8">
                <button
                  type="button"
                  disabled={filters.page === 1}
                  onClick={() => {
                    setFilters((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="inline-flex items-center gap-1.5 border border-white/20 bg-[#121316] px-4 py-2 text-xs uppercase tracking-widest text-white transition hover:border-[#D4AF37] hover:text-[#E5C158] disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                  <span>{isAr ? 'السابق' : 'PREV'}</span>
                </button>

                <div className="border border-[#D4AF37]/40 bg-[#16171B] px-4 py-2 font-display text-xs tracking-[0.2em] text-[#E5C158]">
                  {data.page} / {data.totalPages}
                </div>

                <button
                  type="button"
                  disabled={data.page >= data.totalPages}
                  onClick={() => {
                    setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="inline-flex items-center gap-1.5 border border-white/20 bg-[#121316] px-4 py-2 text-xs uppercase tracking-widest text-white transition hover:border-[#D4AF37] hover:text-[#E5C158] disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span>{isAr ? 'التالي' : 'NEXT'}</span>
                  <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileFilters(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto border-t border-[#D4AF37]/40 bg-[#121316] p-6 text-white">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-display text-sm uppercase tracking-widest text-[#E5C158]">
                {t.shop?.filters || (isAr ? 'تصفية المنتجات' : 'FILTERS')}
              </span>
              <button
                type="button"
                onClick={() => setMobileFilters(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebar filters={filters} onChange={(f) => setFilters(f)} />
            <Button
              className="mt-6 w-full border border-[#D4AF37] bg-[#D4AF37] text-black text-xs uppercase tracking-widest font-medium hover:bg-[#E5C158]"
              onClick={() => setMobileFilters(false)}
            >
              {t.shop?.apply || (isAr ? 'تطبيق الفلاتر' : 'APPLY FILTERS')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
