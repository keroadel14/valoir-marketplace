import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { authApi } from '@/api/auth'
import { getErrorMessage } from '@/api/client'
import { useAuth } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function RegisterSellerPage() {
  const { t, lang } = useI18n()
  const setAuth = useAuth((s) => s.setAuth)
  const nav = useNavigate()
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', storeName: '', slug: '',
    tradeLicenseOrVatId: '', acceptTerms: false, acceptPrivacyPolicy: false, acceptVendorAgreement: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.registerVendor({ ...form, preferredLanguage: lang })
      setAuth(res)
      nav('/seller')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-lux flex justify-center py-16">
      <form onSubmit={onSubmit} className="card w-full max-w-lg space-y-4 p-8">
        <h1 className="font-display text-3xl">{t.auth.sellerRegister}</h1>
        <p className="text-sm text-[var(--muted)]">Boutique status starts as Pending until admin approval.</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Input placeholder={t.auth.fullName} required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <Input type="email" placeholder={t.auth.email} required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input type="password" placeholder={t.auth.password} required minLength={12} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Input placeholder={t.auth.storeName} required value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
        <Input placeholder={t.auth.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <Input placeholder="VAT / Trade license (optional)" value={form.tradeLicenseOrVatId} onChange={(e) => setForm({ ...form, tradeLicenseOrVatId: e.target.value })} />
        <label className="flex gap-2 text-sm"><input type="checkbox" required checked={form.acceptTerms} onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })} />{t.auth.acceptTerms}</label>
        <label className="flex gap-2 text-sm"><input type="checkbox" required checked={form.acceptPrivacyPolicy} onChange={(e) => setForm({ ...form, acceptPrivacyPolicy: e.target.checked })} />{t.auth.acceptPrivacy}</label>
        <label className="flex gap-2 text-sm"><input type="checkbox" required checked={form.acceptVendorAgreement} onChange={(e) => setForm({ ...form, acceptVendorAgreement: e.target.checked })} />{t.auth.acceptVendor}</label>
        <Button type="submit" className="w-full" disabled={loading}>{t.nav.register}</Button>
        <p className="text-center text-sm"><Link to="/login" className="text-champagne">{t.auth.hasAccount}</Link></p>
      </form>
    </div>
  )
}
