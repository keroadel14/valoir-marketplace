import { FormEvent, useState } from 'react'
import { useAuth } from '@/stores/auth'
import { useI18n } from '@/i18n'
import { Navigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import {
  Package,
  Plus,
  CheckCircle2,
  AlertCircle,
  Truck,
  Clock,
  DollarSign,
  Search,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react'

// Types
interface SellerProduct {
  id: string
  title: string
  slug: string
  basePrice: number
  status: string
  isFeatured: boolean
  createdAt: string
  sku?: string
  stockQuantity?: number
}

interface SellerOrder {
  vendorOrderId: string
  orderId: string
  orderNumber: string
  subtotal: number
  status: string
  createdAt: string
  trackingNumber?: string | null
}

interface OrderItemDto {
  id: string
  productTitle: string
  sku?: string
  quantity: number
  unitPrice: number
}

interface SellerOrderDetail {
  vendorOrderId: string
  orderId: string
  orderNumber: string
  boutiqueId: string
  subtotal: number
  commissionAmount: number
  vendorNetPayout: number
  status: string
  trackingNumber?: string | null
  carrier?: string | null
  createdAt: string
  items: OrderItemDto[]
}

// ---------------------------------------------------------------------------
// 1. SELLER OVERVIEW (DASHBOARD)
// ---------------------------------------------------------------------------
export function SellerOverview() {
  const { lang } = useI18n()
  const user = useAuth((s) => s.user)
  if (!user) return <Navigate to="/login" replace />

  // Fetch products and orders summary
  const { data: productsData, isLoading: loadingProds } = useQuery({
    queryKey: ['seller-products-summary'],
    queryFn: () => api.get('/seller/products?pageSize=5').then((r) => r.data),
    retry: 1,
  })

  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ['seller-orders-summary'],
    queryFn: () => api.get('/seller/orders?pageSize=5').then((r) => r.data),
    retry: 1,
  })

  const totalRevenue = ordersData?.items?.reduce((acc: number, curr: SellerOrder) => acc + (curr.subtotal || 0), 0) || 0
  const totalOrders = ordersData?.totalCount ?? ordersData?.items?.length ?? 0
  const totalProducts = productsData?.totalCount ?? productsData?.items?.length ?? 0
  const pendingOrders = ordersData?.items?.filter((o: SellerOrder) => o.status === 'Pending' || o.status === 'Processing')?.length || 0

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37]">
              VALOIR Maison Portal
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-white">
            {lang === 'ar' ? 'لوحة تحكم البوتيك' : 'Boutique Overview'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {lang === 'ar'
              ? `مرحباً بك مجدداً، ${user.fullName || 'الشريك الفاخر'}. إليك ملخص مبيعاتك وقطعك الفاخرة.`
              : `Welcome back, ${user.fullName || 'Luxury Partner'}. Here is your maison performance snapshot.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-3.5 py-1.5">
            <ShieldCheck className="h-4 w-4 text-[#d4af37]" />
            <div className="text-start">
              <p className="text-[10px] uppercase tracking-wider text-neutral-400 leading-tight">
                {lang === 'ar' ? 'حالة البوتيك' : 'Status'}
              </p>
              <p className="text-xs font-semibold text-[#d4af37] leading-tight">
                {user.boutiqueStatus ?? 'Active Luxury Partner'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-neutral-800/90 bg-[#0e0e13]/70 p-5 space-y-2 hover:border-[#d4af37]/40 transition duration-300">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              {lang === 'ar' ? 'إجمالي المبيعات' : 'Gross Volume'}
            </span>
            <div className="p-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-display font-semibold text-white">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span>↑ 14.8%</span>
            <span className="text-neutral-500">{lang === 'ar' ? 'مقارنة بالشهر السابق' : 'vs last cycle'}</span>
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-neutral-800/90 bg-[#0e0e13]/70 p-5 space-y-2 hover:border-[#d4af37]/40 transition duration-300">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              {lang === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-display font-semibold text-white">
            {totalOrders}
          </div>
          <p className="text-[11px] text-neutral-400">
            {lang === 'ar' ? 'طلبات مكتملة وقيد التنفيذ' : 'Across all client bookings'}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-neutral-800/90 bg-[#0e0e13]/70 p-5 space-y-2 hover:border-[#d4af37]/40 transition duration-300">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              {lang === 'ar' ? 'القطع المعروضة' : 'Active Pieces'}
            </span>
            <div className="p-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-display font-semibold text-white">
            {totalProducts}
          </div>
          <p className="text-[11px] text-neutral-400">
            {lang === 'ar' ? 'معروضة للبيع الفاخر' : 'Live in VALOIR Catalogue'}
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-neutral-800/90 bg-[#0e0e13]/70 p-5 space-y-2 hover:border-[#d4af37]/40 transition duration-300">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              {lang === 'ar' ? 'بانتظار الشحن' : 'Pending Dispatch'}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-display font-semibold text-white">
            {pendingOrders}
          </div>
          <p className="text-[11px] text-amber-400/90">
            {lang === 'ar' ? 'يتطلب التجهيز والشحن' : 'Requires courier dispatch'}
          </p>
        </div>
      </div>

      {/* Two Column Grid for Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Preview */}
        <div className="rounded-2xl border border-neutral-800/90 bg-[#0e0e13]/70 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#d4af37]" />
              <h3 className="font-display text-base font-semibold text-white">
                {lang === 'ar' ? 'أحدث الطلبات' : 'Recent Client Orders'}
              </h3>
            </div>
            <Link
              to="/seller/orders"
              className="text-xs text-[#d4af37] hover:underline flex items-center gap-1"
            >
              <span>{lang === 'ar' ? 'عرض الكل' : 'View All'}</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {loadingOrders ? (
            <div className="py-8 flex justify-center"><Spinner /></div>
          ) : ordersData?.items?.length ? (
            <div className="space-y-3">
              {ordersData.items.slice(0, 4).map((order: SellerOrder) => (
                <div
                  key={order.vendorOrderId}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/60 hover:border-neutral-700 transition"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white font-mono">
                      {order.orderNumber}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-end space-y-1">
                    <p className="text-xs font-semibold text-[#d4af37]">
                      ${order.subtotal.toLocaleString()}
                    </p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      order.status === 'Shipped' || order.status === 'Delivered'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                        : order.status === 'Processing'
                        ? 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-neutral-500">
              {lang === 'ar' ? 'لا توجد طلبات بعد' : 'No orders recorded yet'}
            </div>
          )}
        </div>

        {/* Recent Products Preview */}
        <div className="rounded-2xl border border-neutral-800/90 bg-[#0e0e13]/70 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#d4af37]" />
              <h3 className="font-display text-base font-semibold text-white">
                {lang === 'ar' ? 'أحدث القطع في الكتالوج' : 'Latest Catalogue Pieces'}
              </h3>
            </div>
            <Link
              to="/seller/products"
              className="text-xs text-[#d4af37] hover:underline flex items-center gap-1"
            >
              <span>{lang === 'ar' ? 'إدارة المنتجات' : 'Manage'}</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {loadingProds ? (
            <div className="py-8 flex justify-center"><Spinner /></div>
          ) : productsData?.items?.length ? (
            <div className="space-y-3">
              {productsData.items.slice(0, 4).map((p: SellerProduct) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/60 hover:border-neutral-700 transition"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-semibold text-white truncate">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      {p.slug}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-xs font-semibold text-[#d4af37]">
                      ${p.basePrice.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-neutral-400">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-neutral-500">
              {lang === 'ar' ? 'لم تضف منتجات بعد' : 'No pieces listed yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 2. SELLER PRODUCTS PAGE (CATALOGUE & ADD MODAL)
// ---------------------------------------------------------------------------
export function SellerProductsPage() {
  const { lang } = useI18n()
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [sku, setSku] = useState('')
  const [stockQuantity, setStockQuantity] = useState('10')
  const [colorName, setColorName] = useState('')
  const [size, setSize] = useState('')
  const [description, setDescription] = useState('')
  const [publish, setPublish] = useState(true)

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val)
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setSlug(generated)
  }

  // Fetch Seller's Products
  const { data, isLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: () => api.get('/seller/products?pageSize=50').then((r) => r.data),
    retry: 1,
  })

  // Create Product Mutation
  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post('/seller/products', payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller-products'] })
      qc.invalidateQueries({ queryKey: ['seller-products-summary'] })
      setShowModal(false)
      setMsg({
        type: 'success',
        text: lang === 'ar' ? 'تم إضافة ونشر المنتج بنجاح في الكتالوج!' : 'Piece created & published successfully!',
      })
      // Reset form
      setTitle('')
      setSlug('')
      setBasePrice('')
      setSku('')
      setColorName('')
      setSize('')
      setDescription('')
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to create product'
      setMsg({ type: 'error', text: errMsg })
    },
  })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setMsg(null)
    createMutation.mutate({
      title,
      slug: slug || `prod-${Date.now()}`,
      basePrice: parseFloat(basePrice) || 0,
      description,
      sku: sku || `VAL-${Date.now().toString().slice(-6)}`,
      stockQuantity: parseInt(stockQuantity, 10) || 1,
      colorName: colorName || undefined,
      size: size || undefined,
      publish,
    })
  }

  // Filtered products by search term
  const filteredItems = (data?.items || []).filter((item: SellerProduct) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return item.title.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h2 className="font-display text-2xl text-white">
            {lang === 'ar' ? 'إدارة كتالوج المنتجات' : 'Catalogue & Inventory'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {lang === 'ar'
              ? 'أضف ونظّم القطع الفاخرة، حدد الأسعار والمخزون، وانشرها مباشرة.'
              : 'Add, organize, and monitor luxury items available to discerning clients worldwide.'}
          </p>
        </div>

        <Button
          onClick={() => { setMsg(null); setShowModal(true); }}
          className="bg-gradient-to-r from-[#d4af37] to-[#e5c358] hover:from-[#c39e2e] hover:to-[#d4af37] text-black font-semibold flex items-center gap-2 shadow-lg shadow-[#d4af37]/10"
        >
          <Plus className="h-4 w-4" />
          <span>{lang === 'ar' ? 'إضافة قطعة جديدة' : 'Add New Piece'}</span>
        </Button>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-xs border ${
          msg.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : 'bg-red-950/40 border-red-500/40 text-red-300'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'ar' ? 'ابحث عن منتج بالاسم أو الرمز...' : 'Search pieces by title or slug...'}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : filteredItems.length > 0 ? (
        <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-[#0e0e13]/80">
          <table className="w-full text-xs text-start">
            <thead className="bg-neutral-900/90 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 text-start font-medium">Piece</th>
                <th className="p-3.5 text-start font-medium">Price</th>
                <th className="p-3.5 text-start font-medium">Status</th>
                <th className="p-3.5 text-start font-medium">Slug</th>
                <th className="p-3.5 text-end font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredItems.map((item: SellerProduct) => (
                <tr key={item.id} className="hover:bg-neutral-800/30 transition">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-neutral-800 border border-neutral-700/50 flex items-center justify-center text-[#d4af37] shrink-0 font-display font-semibold">
                        V
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate max-w-xs sm:max-w-md">{item.title}</p>
                        <p className="text-[11px] text-neutral-500">Listed {new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-[#d4af37] font-semibold">
                    ${item.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3.5">
                    <span className="rounded-full bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] text-emerald-300 font-medium">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-neutral-400 font-mono text-[11px]">
                    {item.slug}
                  </td>
                  <td className="p-3.5 text-end">
                    <Link
                      to={`/product/${item.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-[#d4af37] transition"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-dashed border-neutral-800 rounded-2xl p-12 text-center space-y-3 bg-[#0e0e13]/40">
          <Package className="h-8 w-8 text-neutral-600 mx-auto" />
          <p className="text-sm text-neutral-300 font-medium">
            {lang === 'ar' ? 'لم تقم بإضافة منتجات بعد' : 'No luxury pieces found'}
          </p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {lang === 'ar'
              ? 'انقر على "إضافة قطعة جديدة" لإدراج أول منتج في الكتالوج الخاص ببوتيكك.'
              : 'Click "Add New Piece" above to curate your initial luxury collection.'}
          </p>
        </div>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="border border-neutral-800 bg-[#0e0e13] w-full max-w-xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                <h3 className="font-display text-xl text-white">
                  {lang === 'ar' ? 'إضافة قطعة فاخرة جديدة' : 'Curate New Luxury Piece'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white transition p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  {lang === 'ar' ? 'اسم القطعة *' : 'Piece Title *'}
                </label>
                <Input
                  required
                  placeholder="e.g. Silk Mulberry Tailored Evening Tuxedo"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="bg-neutral-900 border-neutral-800 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    {lang === 'ar' ? 'الرابط الفريد (Slug) *' : 'Slug *'}
                  </label>
                  <Input
                    required
                    pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                    placeholder="silk-evening-tuxedo"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    className="bg-neutral-900 border-neutral-800 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    {lang === 'ar' ? 'السعر ($) *' : 'Price ($ USD) *'}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="2450.00"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="bg-neutral-900 border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    {lang === 'ar' ? 'رمز المخزون (SKU) *' : 'SKU *'}
                  </label>
                  <Input
                    required
                    placeholder="VAL-TX-009"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="bg-neutral-900 border-neutral-800 text-white uppercase font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    {lang === 'ar' ? 'الكمية المتوفرة *' : 'Stock Quantity *'}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="bg-neutral-900 border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    {lang === 'ar' ? 'اللون (اختياري)' : 'Color (Optional)'}
                  </label>
                  <Input
                    placeholder="Midnight Black & Gold"
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    className="bg-neutral-900 border-neutral-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    {lang === 'ar' ? 'المقاس (اختياري)' : 'Size (Optional)'}
                  </label>
                  <Input
                    placeholder="EU 50 / Bespoke"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="bg-neutral-900 border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  {lang === 'ar' ? 'وصف القطعة والتفاصيل الفاخرة' : 'Description & Craftsmanship'}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Masterfully woven from pure Italian virgin wool and silk accents..."
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-xs text-white placeholder-neutral-500 focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={publish}
                  onChange={(e) => setPublish(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-[#d4af37] focus:ring-[#d4af37]"
                />
                <span className="text-xs text-neutral-300">
                  {lang === 'ar' ? 'نشر القطعة فوراً في الكتالوج المباشر' : 'Publish piece immediately to live catalogue'}
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="border-neutral-700 text-neutral-300 hover:text-white"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-[#d4af37] hover:bg-[#e5c358] text-black font-semibold"
                >
                  {createMutation.isPending
                    ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Curating...')
                    : (lang === 'ar' ? 'حفظ ونشر القطعة' : 'Curate & Save')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 3. SELLER ORDERS PAGE (ORDER FULFILLMENT & TRACKING)
// ---------------------------------------------------------------------------
export function SellerOrdersPage() {
  const { lang } = useI18n()
  const qc = useQueryClient()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [carrier, setCarrier] = useState('DHL Express Luxury')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch list of orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['seller-orders-list'],
    queryFn: () => api.get('/seller/orders?pageSize=30').then((r) => r.data),
    retry: 1,
  })

  // Fetch details for modal when an order is selected
  const { data: orderDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ['seller-order-detail', selectedOrderId],
    queryFn: () => api.get(`/seller/orders/${selectedOrderId}`).then((r) => r.data as SellerOrderDetail),
    enabled: !!selectedOrderId,
  })

  // Process Mutation
  const processMutation = useMutation({
    mutationFn: (id: string) => api.post(`/seller/orders/${id}/process`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller-orders-list'] })
      qc.invalidateQueries({ queryKey: ['seller-order-detail', selectedOrderId] })
      setActionMsg({
        type: 'success',
        text: lang === 'ar' ? 'تم تحويل حالة الطلب إلى قيد المعالجة والتجهيز.' : 'Order marked as processing in atelier.',
      })
    },
    onError: (err: any) => {
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to update order status',
      })
    },
  })

  // Ship Mutation
  const shipMutation = useMutation({
    mutationFn: ({ id, tracking, carr }: { id: string; tracking: string; carr: string }) =>
      api.post(`/seller/orders/${id}/ship`, { trackingNumber: tracking, carrier: carr }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller-orders-list'] })
      qc.invalidateQueries({ queryKey: ['seller-order-detail', selectedOrderId] })
      setActionMsg({
        type: 'success',
        text: lang === 'ar' ? 'تم تأكيد شحن الطلب وإرسال التتبع للمشتري.' : 'Order marked as shipped with tracking updated.',
      })
      setTrackingNumber('')
    },
    onError: (err: any) => {
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to ship order',
      })
    },
  })

  const handleShipSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!selectedOrderId || !trackingNumber.trim()) return
    setActionMsg(null)
    shipMutation.mutate({
      id: selectedOrderId,
      tracking: trackingNumber.trim(),
      carr: carrier.trim(),
    })
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-800 pb-5">
        <h2 className="font-display text-2xl text-white">
          {lang === 'ar' ? 'الطلبات والشحن الفاخر' : 'Orders & Dispatch'}
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          {lang === 'ar'
            ? 'تابع طلبات العملاء، قم بتجهيز المنتجات، وأدرج تفاصيل الشحن والتتبع.'
            : 'Fulfill bespoke orders, manage atelier processing, and provide verified tracking.'}
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : ordersData?.items?.length ? (
        <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-[#0e0e13]/80">
          <table className="w-full text-xs text-start">
            <thead className="bg-neutral-900/90 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 text-start font-medium">Order Number</th>
                <th className="p-3.5 text-start font-medium">Date</th>
                <th className="p-3.5 text-start font-medium">Subtotal</th>
                <th className="p-3.5 text-start font-medium">Status</th>
                <th className="p-3.5 text-start font-medium">Tracking</th>
                <th className="p-3.5 text-end font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {ordersData.items.map((order: SellerOrder) => (
                <tr key={order.vendorOrderId} className="hover:bg-neutral-800/30 transition">
                  <td className="p-3.5 font-mono font-semibold text-white">
                    {order.orderNumber}
                  </td>
                  <td className="p-3.5 text-neutral-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-[#d4af37] font-semibold">
                    ${order.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      order.status === 'Shipped' || order.status === 'Delivered'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                        : order.status === 'Processing'
                        ? 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-neutral-400 font-mono text-[11px]">
                    {order.trackingNumber || '—'}
                  </td>
                  <td className="p-3.5 text-end">
                    <Button
                      onClick={() => {
                        setActionMsg(null)
                        setSelectedOrderId(order.vendorOrderId)
                      }}
                      className="bg-neutral-800 hover:bg-[#d4af37] hover:text-black text-xs px-3 py-1.5 h-auto transition"
                    >
                      {lang === 'ar' ? 'إدارة الطلب' : 'Manage'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-dashed border-neutral-800 rounded-2xl p-12 text-center space-y-3 bg-[#0e0e13]/40">
          <Clock className="h-8 w-8 text-neutral-600 mx-auto" />
          <p className="text-sm text-neutral-300 font-medium">
            {lang === 'ar' ? 'لا توجد طلبات واردة حالياً' : 'No incoming orders yet'}
          </p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {lang === 'ar'
              ? 'عندما يقوم عميل بشراء أي قطعة من قطعك، ستظهر هنا تفاصيل الطلب والشحن.'
              : 'When patrons acquire pieces from your boutique, you will review and fulfill them here.'}
          </p>
        </div>
      )}

      {/* Order Fulfillment Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="border border-neutral-800 bg-[#0e0e13] w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#d4af37]" />
                <h3 className="font-display text-xl text-white">
                  {lang === 'ar' ? 'تفاصيل الطلب والتجهيز' : 'Order Fulfillment'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="text-neutral-400 hover:text-white transition p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {actionMsg && (
              <div className={`p-3 rounded-xl flex items-center gap-2 text-xs border ${
                actionMsg.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}>
                {actionMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{actionMsg.text}</span>
              </div>
            )}

            {loadingDetail ? (
              <div className="py-12 flex justify-center"><Spinner /></div>
            ) : orderDetail ? (
              <div className="space-y-6">
                {/* Order Summary Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Order ID</span>
                    <span className="font-mono text-white font-semibold">{orderDetail.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Date</span>
                    <span className="text-white">{new Date(orderDetail.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Status</span>
                    <span className="text-[#d4af37] font-semibold">{orderDetail.status}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Vendor Payout</span>
                    <span className="text-emerald-400 font-semibold">${orderDetail.vendorNetPayout?.toLocaleString() || orderDetail.subtotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {lang === 'ar' ? 'القطع المطلوبة' : 'Acquired Pieces'}
                  </h4>
                  <div className="divide-y divide-neutral-800 rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden">
                    {orderDetail.items?.map((item) => (
                      <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-medium text-white">{item.productTitle}</p>
                          <p className="text-[11px] text-neutral-500 font-mono">SKU: {item.sku || 'N/A'}</p>
                        </div>
                        <div className="text-end">
                          <p className="text-neutral-300">Qty: {item.quantity}</p>
                          <p className="font-semibold text-[#d4af37]">${item.unitPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="border-t border-neutral-800 pt-5 space-y-4">
                  {orderDetail.status === 'Pending' && (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {lang === 'ar' ? 'الطلب قيد الانتظار' : 'Order Ready for Atelier Processing'}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {lang === 'ar' ? 'انقر لبدء تحضير القطعة وتجهيزها للشحن.' : 'Signal that the piece is currently being prepared.'}
                        </p>
                      </div>
                      <Button
                        onClick={() => processMutation.mutate(selectedOrderId)}
                        disabled={processMutation.isPending}
                        className="bg-[#d4af37] hover:bg-[#e5c358] text-black font-semibold text-xs"
                      >
                        {processMutation.isPending ? 'Processing...' : 'Start Processing'}
                      </Button>
                    </div>
                  )}

                  {orderDetail.status === 'Processing' && (
                    <form onSubmit={handleShipSubmit} className="space-y-3 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                      <p className="text-xs font-semibold text-white">
                        {lang === 'ar' ? 'تأكيد الشحن الفاخر' : 'Dispatch & Courier Tracking'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-neutral-400 mb-1">Carrier</label>
                          <Input
                            required
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            placeholder="e.g. DHL Express Worldwide"
                            className="bg-neutral-950 border-neutral-800 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-neutral-400 mb-1">Tracking Number</label>
                          <Input
                            required
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="e.g. 7482910382"
                            className="bg-neutral-950 border-neutral-800 text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button
                          type="submit"
                          disabled={shipMutation.isPending}
                          className="bg-[#d4af37] hover:bg-[#e5c358] text-black font-semibold text-xs flex items-center gap-2"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          <span>{shipMutation.isPending ? 'Dispatching...' : 'Mark as Shipped'}</span>
                        </Button>
                      </div>
                    </form>
                  )}

                  {orderDetail.status === 'Shipped' && (
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-emerald-300">
                          {lang === 'ar' ? 'تم شحن هذا الطلب' : 'Dispatched to Client'}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          Carrier: <span className="text-white font-medium">{orderDetail.carrier || 'Bespoke Courier'}</span> • Tracking: <span className="font-mono text-[#d4af37]">{orderDetail.trackingNumber || 'Available'}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 4. SELLER STORE PROFILE PAGE
// ---------------------------------------------------------------------------
export function SellerStorePage() {
  const { lang } = useI18n()
  const user = useAuth((s) => s.user)
  const [boutiqueName, setBoutiqueName] = useState(user?.fullName ? `${user.fullName} Haute Horlogerie` : 'Maison Valoir')
  const [description, setDescription] = useState(
    'Purveyors of haute horlogerie, bespoke jewelry, and fine artisanal creations for private connoisseurs.'
  )
  const [saved, setSaved] = useState(false)

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-neutral-800 pb-5">
        <h2 className="font-display text-2xl text-white">
          {lang === 'ar' ? 'الملف التعريفي للبوتيك' : 'Maison Profile & Heritage'}
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          {lang === 'ar'
            ? 'تخصيص هوية المتجر، القصة الحرفية، وبيانات التواصل مع نخبة المشترين.'
            : 'Curate your boutique bio, artisanal pedigree, and concierge presentation.'}
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{lang === 'ar' ? 'تم حفظ التعديلات بنجاح.' : 'Boutique credentials updated successfully.'}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-neutral-800/90 bg-[#0e0e13]/70 p-6">
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">
            {lang === 'ar' ? 'اسم البوتيك / الدار' : 'Boutique / Maison Name'}
          </label>
          <Input
            value={boutiqueName}
            onChange={(e) => setBoutiqueName(e.target.value)}
            className="bg-neutral-900 border-neutral-800 text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">
            {lang === 'ar' ? 'نبذة عن الدار والحرفية' : 'Artisanal Story & Heritage'}
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-xs text-white focus:border-[#d4af37] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs space-y-1">
            <span className="text-neutral-500 uppercase tracking-wider text-[10px]">Tier Status</span>
            <p className="font-semibold text-[#d4af37] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Certified Luxury Partner</span>
            </p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs space-y-1">
            <span className="text-neutral-500 uppercase tracking-wider text-[10px]">Standard Commission</span>
            <p className="font-semibold text-white">15.0% Net Settlement</p>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-800 flex justify-end">
          <Button
            type="submit"
            className="bg-[#d4af37] hover:bg-[#e5c358] text-black font-semibold text-xs"
          >
            {lang === 'ar' ? 'حفظ البيانات' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
