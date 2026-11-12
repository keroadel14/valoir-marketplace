import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useI18n } from '@/i18n'
import { catalogApi } from '@/api/catalog'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ArrowRight, Sparkles } from 'lucide-react'

export function HomePage() {
  const { t, lang } = useI18n()
  const isAr = lang === 'ar'

  const { data, isLoading } = useQuery({
    queryKey: ['home-featured'],
    queryFn: () => catalogApi.list({ featuredOnly: true, pageSize: 8 }),
  })
  const { data: newest } = useQuery({
    queryKey: ['home-new'],
    queryFn: () => catalogApi.list({ sort: 'newest', pageSize: 8 }),
  })

  return (
    <div className="space-y-0">
      {/* Vespera Style Editorial Hero Section */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="container-lux grid min-h-[82vh] items-center gap-12 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-[#B89768] dark:text-[#E5C158]">
              <Sparkles className="h-3 w-3" />
              <span>{isAr ? 'مجموعة فالوار الحصرية ٢٠٢٦' : 'VALOIR · THE 2026 EDIT'}</span>
            </div>

            <h1 className="font-display text-5xl leading-[1.08] tracking-tight md:text-7xl lg:text-8xl">
              {isAr ? 'فن الفخامة الهادئة.' : 'THE ART OF QUIET LUXURY.'}
            </h1>

            <p className="max-w-xl text-base text-[var(--muted)] leading-relaxed md:text-lg font-light">
              {isAr
                ? 'قطع استثنائية وبوتيكات مستقلة مختارة بعناية لأصحاب الذوق الرفيع. حرفية أصيلة، خامات خالدة، وتصميم لا يحده زمن.'
                : 'Discover rare finds and timeless pieces, meticulously sourced from independent European ateliers for the discerning collector.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link to="/shop">
                <Button className="btn-primary">
                  {isAr ? 'استكشف التشكيلة' : 'EXPLORE THE EDIT'}
                </Button>
              </Link>
              <Link to="/register/seller">
                <Button variant="outline" className="btn-outline">
                  {isAr ? 'انضم كبائع مستقل' : 'OPEN AN ATELIER'}
                </Button>
              </Link>
            </div>

            {/* Quiet Luxury Pillars */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-[var(--border)] text-xs text-[var(--muted)]">
              <div>
                <p className="font-medium text-[var(--text)] uppercase tracking-wider">{isAr ? 'أصالة معتمدة' : 'Verified Provenance'}</p>
                <p className="mt-1 text-[11px]">{isAr ? 'فحص دقيق لكل قطعة' : 'Hand-inspected ateliers'}</p>
              </div>
              <div>
                <p className="font-medium text-[var(--text)] uppercase tracking-wider">{isAr ? 'شحن عالمي خاص' : 'White Glove'}</p>
                <p className="mt-1 text-[11px]">{isAr ? 'توصيل آمن ومؤمن' : 'Express insured courier'}</p>
              </div>
              <div>
                <p className="font-medium text-[var(--text)] uppercase tracking-wider">{isAr ? 'خدمة مخصصة' : 'Private Concierge'}</p>
                <p className="mt-1 text-[11px]">{isAr ? 'استشارات على مدار الساعة' : 'Bespoke client care'}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] overflow-hidden rounded-none border border-[var(--border)] shadow-2xl dark:border-[#2E2B25]">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop"
                alt="Quiet Luxury Editorial"
                className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-6 start-6 end-6 text-white">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#E5C158]">{isAr ? 'موسم ٢٠٢٦' : 'EDITORIAL SS26'}</p>
                <p className="font-display text-xl md:text-2xl mt-1">{isAr ? 'حرير وكشمير طبيعي نقي' : 'Pure Silk & Unspun Cashmere'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection Grid */}
      <section className="container-lux py-24">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#B89768] dark:text-[#D4AF37]">
              {isAr ? 'مختارات الموسم' : 'CURATED HIGHLIGHTS'}
            </p>
            <h2 className="section-title mt-2 font-display text-4xl md:text-5xl">
              {isAr ? 'قطع مختارة بعناية' : 'Featured Pieces'}
            </h2>
          </div>
          <Link
            to="/shop?featured=1"
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B89768] hover:text-[var(--text)] dark:text-[#D4AF37]"
          >
            <span>{isAr ? 'مشاهدة المجموعة الكاملة' : 'VIEW ALL PIECES'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-2 md:grid-cols-4">
            {data?.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Editorial Banner - Gold & Elegance */}
      <section className="border-y border-[var(--border)] bg-[#141619] py-24 text-white">
        <div className="container-lux grid gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
              {isAr ? 'ذهب وأناقة مطلقة' : 'GOLD & ELEGANCE'}
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-normal leading-tight text-[#F5F3EF]">
              {isAr ? 'حرفية لا تفقد بريقها أبدًا.' : 'Crafted for those who value permanence.'}
            </h2>
            <p className="text-sm text-[#8E8A83] leading-relaxed max-w-lg font-light">
              {isAr
                ? 'كل تفصيلة في فالوار تمر بمعايير تدقيق صارمة من خامات الحرير والكشمير والذهب عيار ١٨ إلى الجلود الإيطالية المدبوغة يدوياً.'
                : 'Every item across our curated boutiques honors timeless European craftsmanship, precious metals, and hand-finished leathers designed to endure generations.'}
            </p>
            <div className="pt-2">
              <Link to="/shop">
                <Button className="border border-[#D4AF37] bg-transparent text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black">
                  {isAr ? 'اكتشف الدار' : 'DISCOVER THE MAISON'}
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="aspect-[16/10] overflow-hidden border border-[#2E2B25]">
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop"
                alt="Haute Joaillerie"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Grid */}
      <section className="container-lux py-24">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#B89768] dark:text-[#D4AF37]">
              {isAr ? 'أحدث الإصدارات' : 'LATEST DROPS'}
            </p>
            <h2 className="section-title mt-2 font-display text-4xl md:text-5xl">
              {isAr ? 'وصل حديثًا' : 'New Arrivals'}
            </h2>
          </div>
          <Link
            to="/shop?sort=newest"
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B89768] hover:text-[var(--text)] dark:text-[#D4AF37]"
          >
            <span>{isAr ? 'عرض الكل' : 'VIEW COLLECTION'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-2 md:grid-cols-4">
          {newest?.items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* The Private List / Newsletter */}
      <section className="border-t border-[var(--border)] bg-[var(--surface)] py-24 text-center">
        <div className="container-lux max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[#B89768] dark:text-[#D4AF37]">
            {isAr ? 'القائمة الخاصة' : 'THE PRIVATE LIST'}
          </p>
          <h2 className="font-display text-4xl md:text-5xl mt-3">
            {isAr ? 'انضم إلى مجتمع الذواقة' : 'Join the Private Circle'}
          </h2>
          <p className="mx-auto mt-4 text-sm text-[var(--muted)] leading-relaxed font-light">
            {isAr
              ? 'احصل على دعوات حصرية لعروض البوتيكات الخاصة، وإصدارات المجوهرات المحدودة، والتقارير التحريرية الموسمية.'
              : 'Receive private invitations to confidential drops, trunk shows, and editorial stories from independent houses.'}
          </p>
          <form className="mx-auto mt-8 flex max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              className="input text-center md:text-start"
              type="email"
              required
              placeholder={isAr ? 'بريدك الإلكتروني…' : 'Enter your email address…'}
            />
            <Button type="submit" className="btn-primary whitespace-nowrap">
              {isAr ? 'اشتراك' : 'SUBSCRIBE'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
