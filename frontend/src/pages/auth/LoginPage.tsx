import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { authApi } from '@/api/auth'
import { getErrorMessage } from '@/api/client'
import { useAuth } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginPage() {
  const { t } = useI18n()
  const setAuth = useAuth((s) => s.setAuth)
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      setAuth(res)
      if (res.roles.includes('Admin') || res.roles.includes('SuperAdmin')) nav('/admin')
      else if (res.roles.includes('Vendor')) nav('/seller')
      else nav('/account')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-lux flex min-h-[70vh] items-center justify-center py-16">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4 p-8">
        <h1 className="font-display text-3xl">{t.auth.login}</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider">{t.auth.email}</label>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider">{t.auth.password}</label>
          <Input type="password" required minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{t.auth.login}</Button>
        <p className="text-center text-sm text-[var(--muted)]">
          {t.auth.noAccount} <Link className="text-champagne" to="/register">{t.nav.register}</Link>
          {' · '}
          <Link className="text-champagne" to="/register/seller">{t.nav.sellerLogin}</Link>
        </p>
      </form>
    </div>
  )
}
