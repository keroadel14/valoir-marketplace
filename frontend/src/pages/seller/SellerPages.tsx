import { FormEvent, useState } from 'react'
import { useAuth } from '@/stores/auth'
import { useI18n } from '@/i18n'
import { Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Plus, Package, CheckCircle2, AlertCircle } from 'lucide-react'

interface SellerProduct {
  id: string
  title: string
  slug: string
  basePrice: number
  status: string
  isFeatured: boolean
  createdAt: string
}

export function SellerOverview() {
  const { t, lang } = useI18n()
  const user = useAuth((s) => s.user)
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h2 className="font-display text-2xl text-white">{t.seller.overview}</h2>
          <p className="text-xs text-neutral-400 mt-1">
            {lang === 'ar' ? 'إدارة البوتيك والمنتجات الخاصة بك' : 'Manage your boutique catalogue & sales'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-neutral-400">
            {lang === 'ar' ? 'حالة البوتيك:' : 'Boutique Status:'}
          </span>
          <span className="rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 px-3 py-1 text-xs font-semibold text-[#d4af37]">
            {user.boutiqueStatus ?? 'Active'}
          </span>
        </div>
      </div>

      <SellerProductsPage />
    </div>
  )
}

export function SellerProductsPage() {
  const { lang } = useI18n()
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
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
    queryFn: () => api.get('/seller/products?pageSize=30').then((r) => r.data),
    retry: 1,
  })

  // Create Product Mutation
  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post('/seller/products', payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller-products'] })
      setShowModal(false)
      setMsg({ type: 'success', text: lang === 'ar' ? 'تم إنشاء المنتج بنجاح!' : 'Product created successfully!' })
      // Reset form
      setTitle('')
      setSlug('')
      setBasePrice('')
      setSku('')
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
      sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
      stockQuantity: parseInt(stockQuantity, 10) || 1,
      colorName: colorName || undefined,
      size: size || undefined,
      publish,
    })
  }

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-[#d4af37]" />
          <h3 className="font-display text-xl text-white">
            {lang === 'ar' ? 'قائمة منتجاتك' : 'Your Products'}
          </h3>
        </div>
        <Button
          onClick={() => { setMsg(null); setShowModal(true); }}
          className="bg-[#d4af37] hover:bg-[#e5c358] text-black font-semibold flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>{lang === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}</span>
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

      {/* Products Table */}
      {isLoading ? (
        <div className="py-12 flex justify-center"><Spinner /></div>
      ) : data?.items?.length ? (
        <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-[#0e0e11]">
          <table className="w-full text-xs text-start">
            <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider">
              <tr>
                <th className="p-3 text-start">Product</th>
                <th className="p-3 text-start">Price</th>
                <th className="p-3 text-start">Status</th>
                <th className="p-3 text-start">Slug</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {data.items.map((item: SellerProduct) => (
                <tr key={item.id} className="hover:bg-neutral-800/30">
                  <td className="p-3 font-medium text-white">{item.title}</td>
                  <td className="p-3 text-[#d4af37] font-semibold">${item.basePrice.toLocaleString()}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-[11px] text-neutral-300">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-neutral-500 font-mono text-[11px]">{item.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-dashed border-neutral-800 rounded-2xl p-12 text-center space-y-3 bg-[#0e0e11]/50">
          <Package className="h-8 w-8 text-neutral-600 mx-auto" />
          <p className="text-sm text-neutral-300 font-medium">
            {lang === 'ar' ? 'لم تقم بإضافة منتجات بعد' : 'No products added yet'}
          </p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {lang === 'ar' ? 'ابدأ بإضافة منتجك الأول ليكون متاحاً للشراء في المتجر.' : 'Click Add New Product above to list your first item.'}
          </p>
        </div>
      )}

      {/* Add Product Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="border border-neutral-800 bg-[#0e0e11] w-full max-w-xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-display text-xl text-white">
                {lang === 'ar' ? 'إضافة منتج فاخر جديد' : 'Add New Luxury Product'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  {lang === 'ar' ? 'عنوان المنتج *' : 'Product Title *'}
                </label>
                <Input
                  required
                  placeholder="e.g. Silk Tailored Evening Tuxedo"
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
                    placeholder="silk-tailored-tuxedo"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    className="bg-neutral-900 border-neutral-800 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    {lang === 'ar' ? 'السعر ($) *' : 'Price ($) *'}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="1250.00"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="bg-neutral-900 border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    {lang === 'ar' ? 'كود المخزون (SKU) *' : 'SKU *'}
                  </label>
                  <Input
                    required
                    placeholder="VAL-TX-001"
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
                    placeholder="Midnight Black"
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
                    placeholder="EU 50 / L"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="bg-neutral-900 border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  {lang === 'ar' ? 'وصف المنتج' : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tailored from Italian mulberry silk and fine virgin wool..."
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-xs text-white placeholder-neutral-500 focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={publish}
                  onChange={(e) => setPublish(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-[#d4af37]"
                />
                <span className="text-xs text-neutral-300">
                  {lang === 'ar' ? 'نشر المنتج فوراً في الكتالوج' : 'Publish immediately to live catalog'}
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
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
                    ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...')
                    : (lang === 'ar' ? 'حفظ ونشر المنتج' : 'Save Product')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
