import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { useCart } from '@/stores/cart'
import { useAuth } from '@/stores/auth'
import { buyerApi, type Address } from '@/api/buyer'
import { getErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function CheckoutPage() {
  const { t } = useI18n()
  const { items, subtotal, clear } = useCart()
  const user = useAuth((s) => s.user)
  const nav = useNavigate()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressId, setAddressId] = useState<string>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  useEffect(() => {
    if (!user) return
    buyerApi.listAddresses().then(setAddresses).catch(() => setAddresses([]))
  }, [user])

  if (!user) {
    return (
      <div className="container-lux py-16 text-center">
        <p className="mb-4">Sign in to checkout.</p>
        <Link to="/login" className="text-champagne">{t.nav.login}</Link>
      </div>
    )
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const lines = items
        .filter((i) => i.variantId)
        .map((i) => ({ variantId: i.variantId!, quantity: i.quantity }))
      if (lines.length === 0) {
        setError('Cart lines require a product variant id from the catalog API. Add items from a live product detail page.')
        return
      }
      const res = await buyerApi.createOrder({
        shippingAddressId: addressId || undefined,
        lines,
        shippingAmount: 0,
      })
      setResult(`Order ${res.orderNumber} created · total $${res.totalAmount} · PI ${res.paymentIntentId ?? 'n/a'}`)
      clear()
      nav(`/account/orders`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-lux max-w-2xl py-12">
      <h1 className="section-title mb-6">Checkout</h1>
      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <p className="text-sm text-[var(--muted)]">
          Server calculates totals and reserves inventory (10 min). Payment uses Stripe test/mock PaymentIntent — not a simulated success without provider confirmation.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {result && <p className="text-sm text-green-700">{result}</p>}
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider">Shipping address</label>
          <select className="input" value={addressId} onChange={(e) => setAddressId(e.target.value)}>
            <option value="">— Select —</option>
            {addresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}: {a.line1}, {a.city}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--muted)]">Manage addresses under Account.</p>
        </div>
        <p className="text-sm">
          {t.cart.subtotal} (client estimate): ${subtotal().toLocaleString()} — final total from API.
        </p>
        <Button type="submit" className="w-full" disabled={loading || items.length === 0}>
          Place order
        </Button>
        <Link to="/cart" className="block text-center text-sm text-champagne">{t.common.back}</Link>
      </form>
    </div>
  )
}
