import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  Sparkles,
  Truck
} from 'lucide-react'
import { useI18n } from '@/i18n'
import { catalogApi } from '@/api/catalog'
import { useCart } from '@/stores/cart'
import { useWishlist } from '@/stores/wishlist'
import { Spinner } from '@/components/ui/Spinner'
import { getProductDisplay } from '@/utils/productImages'

interface AccordionItemProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function AccordionItem({ title, isOpen, onToggle, children }: AccordionItemProps) {
  return (
    <div className="border-b border-neutral-800/80 py-4 transition">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-start text-xs tracking-[0.2em] uppercase font-medium text-neutral-300 hover:text-[#d4af37] transition"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-[#d4af37]" /> : <ChevronDown className="h-4 w-4 text-neutral-500" />}
      </button>
      {isOpen && <div className="mt-3 text-xs leading-relaxed text-neutral-400 space-y-2">{children}</div>}
    </div>
  )
}

export function ProductPage() {
  const { slug = '' } = useParams()
  const { t, lang } = useI18n()
  const [qty, setQty] = useState(1)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('Anthracite')
  const [activeTab, setActiveTab] = useState<'desc' | 'materials' | 'details' | 'shipping' | null>('desc')
  const [copied, setCopied] = useState(false)

  const add = useCart((s) => s.add)
  const { toggle, has } = useWishlist()

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => catalogApi.getBySlug(slug),
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#0a0a0c]">
        <Spinner />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-24 text-center text-neutral-400">
        <p className="font-serif text-2xl text-neutral-200 mb-4">{t.shop.noResults}</p>
        <Link to="/shop" className="text-xs uppercase tracking-widest text-[#d4af37] hover:underline">
          {t.common.back}
        </Link>
      </div>
    )
  }

  const display = getProductDisplay({
    id: data.id,
    slug: data.slug,
    title: data.title,
    brand: data.brand,
    description: data.description,
  })

  const sizes = ['XS', 'S', 'M', 'L', 'XL']
  const colors = [
    { name: 'Anthracite', hex: '#26262a' },
    { name: 'Warm Ivory', hex: '#e8e2d8' },
    { name: 'Champagne', hex: '#c5a059' },
  ]

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 py-8 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-8 flex items-center justify-between border-b border-neutral-900 pb-4 text-xs tracking-wider text-neutral-500 uppercase">
          <Link to="/shop" className="inline-flex items-center gap-2 hover:text-[#d4af37] transition">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{lang === 'ar' ? 'العودة للمتجر والقطع المختارة' : 'Back to Collection'}</span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 hover:text-white transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copied ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'مشاركة' : 'Share')}</span>
            </button>
          </div>
        </div>

        {/* Editorial Split Screen (Brunello Cucinelli Layout) */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
          {/* Left: Full Portrait Artwork */}
          <div className="lg:col-span-7 space-y-4">
            <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-md bg-neutral-900 shadow-2xl border border-neutral-800/80">
              <img
                src={display.imageUrl}
                alt={display.title}
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute top-4 start-4 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 border border-neutral-800 text-[10px] tracking-widest uppercase text-neutral-300">
                <Sparkles className="h-3 w-3 text-[#d4af37]" />
                <span>{lang === 'ar' ? 'حرفية يدوية معتمدة' : 'Atelier Certified'}</span>
              </div>
            </div>
          </div>

          {/* Right: Bespoke Luxury Dossier */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            {/* Brand Header */}
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#d4af37]">
                {display.brand || 'VALOIR ATELIER'}
              </p>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide text-white leading-tight">
                {display.title}
              </h1>
              <p className="mt-3 text-2xl font-light text-neutral-100 tracking-wide">
                ${data.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="border-t border-neutral-800/80 pt-4">
              {/* Color Selection */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs tracking-wider uppercase">
                  <span className="text-neutral-400">{lang === 'ar' ? 'اللون' : 'Color'}:</span>
                  <span className="text-neutral-200 font-medium">{selectedColor}</span>
                </div>
                <div className="flex items-center gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`h-7 w-7 rounded-full border transition flex items-center justify-center ${
                        selectedColor === c.name ? 'border-[#d4af37] scale-110 shadow-lg' : 'border-neutral-700 opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                      aria-label={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs tracking-wider uppercase">
                  <span className="text-neutral-400">{lang === 'ar' ? 'المقاس' : 'Size'}:</span>
                  <span className="text-neutral-500 text-[11px] underline cursor-pointer hover:text-[#d4af37]">
                    {lang === 'ar' ? 'دليل المقاسات' : 'Size Guide'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`py-2 text-xs tracking-widest uppercase transition rounded border ${
                        selectedSize === s
                          ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37] font-semibold'
                          : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="mt-8 flex items-center gap-3">
                <div className="flex items-center border border-neutral-800 rounded bg-neutral-900/80 px-2 py-2">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-1 text-neutral-400 hover:text-white transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-medium text-white">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(Math.min(10, qty + 1))}
                    className="p-1 text-neutral-400 hover:text-white transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    add({
                      productId: data.id,
                      title: display.title,
                      price: data.basePrice,
                      quantity: qty,
                      boutiqueId: data.boutiqueId,
                      variantId: (data as { variantId?: string }).variantId,
                    })
                  }
                  className="flex-1 bg-[#d4af37] text-black font-semibold text-xs tracking-[0.2em] uppercase py-3.5 px-6 rounded hover:bg-[#e5c358] transition shadow-lg text-center"
                >
                  {t.product.addToCart}
                </button>

                <button
                  type="button"
                  onClick={() => toggle({ productId: data.id, title: display.title, price: data.basePrice })}
                  className={`p-3.5 border rounded transition ${
                    has(data.id)
                      ? 'border-red-500 bg-red-500/10 text-red-500'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                  aria-label="Add to Wishlist"
                >
                  <Heart className={`h-4 w-4 ${has(data.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Complimentary Courier Notice */}
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-neutral-400 text-center">
                <Truck className="h-3.5 w-3.5 text-[#d4af37]" />
                <span>
                  {lang === 'ar'
                    ? 'شحن مجاني سريع مع إمكانية الإرجاع خلال 30 يوماً'
                    : '* Complimentary express delivery & 30 days to return'}
                </span>
              </div>

              {/* Brunello Cucinelli Accordion Specifications */}
              <div className="mt-8 border-t border-neutral-800/80">
                <AccordionItem
                  title={lang === 'ar' ? 'الوصف والتصميم' : 'DESCRIPTION'}
                  isOpen={activeTab === 'desc'}
                  onToggle={() => setActiveTab(activeTab === 'desc' ? null : 'desc')}
                >
                  <p>{display.description}</p>
                </AccordionItem>

                <AccordionItem
                  title={lang === 'ar' ? 'المواد والعناية' : 'MATERIALS & CARE'}
                  isOpen={activeTab === 'materials'}
                  onToggle={() => setActiveTab(activeTab === 'materials' ? null : 'materials')}
                >
                  <p>
                    {lang === 'ar'
                      ? 'صُنعت هذه القطعة يدوياً باستخدام حرير التوت الفاخر والصوف البكر الإيطالي منتقى بعناية. يُغسل يدوياً بالماء البارد فقط بدون مبيضات، ويُجفف مفروداً على سطح أفقي، أو تنظيف جاف دقيق.'
                      : 'Created in northern ateliers with respect for artisan dignity and natural equilibrium. Hand wash only cold, do not bleach. Dry garment on a horizontal surface, do not tumble dry. Low temperature iron or delicate dry clean.'}
                  </p>
                </AccordionItem>

                <AccordionItem
                  title={lang === 'ar' ? 'تفاصيل الحرفية' : 'DETAILS'}
                  isOpen={activeTab === 'details'}
                  onToggle={() => setActiveTab(activeTab === 'details' ? null : 'details')}
                >
                  <ul className="list-disc list-inside space-y-1 text-neutral-400">
                    <li>{lang === 'ar' ? 'إصدار محدود بحياكة يدوية ميكرو' : 'Limited edition handcrafted micro-stitching'}</li>
                    <li>{lang === 'ar' ? 'أزرار طبيعية من صدف الماربل النادر' : 'Genuine natural horn & mother-of-pearl hardware'}</li>
                    <li>{lang === 'ar' ? 'شهادة منشأ موثقة من البوتيك المصمم' : 'Certified certificate of atelier provenance included'}</li>
                  </ul>
                </AccordionItem>

                <AccordionItem
                  title={lang === 'ar' ? 'الشحن والإرجاع الفاخر' : 'SHIPPING AND RETURNS'}
                  isOpen={activeTab === 'shipping'}
                  onToggle={() => setActiveTab(activeTab === 'shipping' ? null : 'shipping')}
                >
                  <div className="flex items-start gap-2.5 pt-1">
                    <ShieldCheck className="h-4 w-4 text-[#d4af37] shrink-0 mt-0.5" />
                    <p>
                      {lang === 'ar'
                        ? 'تُشحن كل قطعة في صندوق فاخر مقاوم للصدمات مع كود تتبع خاص وتأمين كامل وضمان استرداد فوري خلال 30 يوماً.'
                        : 'Shipped in custom Valoir insured security packaging. Signature required upon courier delivery. Complimentary white-glove returns within 30 calendar days.'}
                    </p>
                  </div>
                </AccordionItem>
              </div>
            </div>
          </div>
        </div>

        {/* Complete the Look Section (Brunello Cucinelli Curated Pairings) */}
        <div className="mt-24 border-t border-neutral-800/80 pt-16">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]">
              {lang === 'ar' ? 'تناغم كوتور' : 'CURATED PAIRINGS'}
            </p>
            <h2 className="mt-2 font-display text-2xl lg:text-3xl text-white font-normal tracking-wider">
              {lang === 'ar' ? 'أكمل المظهر' : 'COMPLETE THE LOOK'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: lang === 'ar' ? 'بليزر صوف كشمير أحادي' : 'Cashmere Monili Blazer',
                brand: display.brand || 'Brunello Cucinelli',
                price: 2450,
                img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
              },
              {
                title: lang === 'ar' ? 'حزام جلد العجل اللامع' : 'Glossy Calfskin Belt',
                brand: display.brand || 'Brunello Cucinelli',
                price: 780,
                img: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
              },
              {
                title: lang === 'ar' ? 'بنطال حرير بليسيه واسع' : 'Pleated Silk Trousers',
                brand: display.brand || 'Brunello Cucinelli',
                price: 1350,
                img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
              },
              {
                title: lang === 'ar' ? 'حذاء لوفر جلد فينيسي' : 'Venetian Leather Loafers',
                brand: display.brand || 'Brunello Cucinelli',
                price: 1120,
                img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
              },
            ].map((item, idx) => (
              <div key={idx} className="group block border border-neutral-900 bg-neutral-950/60 p-3 rounded transition hover:border-neutral-800">
                <div className="aspect-[3/4] overflow-hidden rounded bg-neutral-900 mb-3">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-[#d4af37]">{item.brand}</p>
                <p className="text-xs text-neutral-200 font-medium truncate mt-1">{item.title}</p>
                <p className="text-xs text-neutral-400 mt-1 font-light">${item.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
