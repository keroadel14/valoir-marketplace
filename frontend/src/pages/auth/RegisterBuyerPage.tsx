import { FormEvent, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { authApi } from '@/api/auth'
import { getErrorMessage } from '@/api/client'
import { useAuth } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Check, X } from 'lucide-react'

export function RegisterBuyerPage() {
  const { t, lang } = useI18n()
  const setAuth = useAuth((s) => s.setAuth)
  const nav = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    acceptTerms: false,
    acceptPrivacyPolicy: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Real-time password validation rules matching Backend Identity
  const rules = useMemo(() => {
    const p = form.password
    return [
      { id: 'len', label: lang === 'ar' ? '12 حرفاً على الأقل' : 'At least 12 characters', valid: p.length >= 12 },
      { id: 'upper', label: lang === 'ar' ? 'حرف كبير واحد على الأقل (A-Z)' : 'One uppercase letter (A-Z)', valid: /[A-Z]/.test(p) },
      { id: 'num', label: lang === 'ar' ? 'رقم واحد على الأقل (0-9)' : 'One number (0-9)', valid: /[0-9]/.test(p) },
      { id: 'special', label: lang === 'ar' ? 'رمز خاص واحد على الأقل (!@#$%^&*)' : 'One special character (!@#$%^&*)', valid: /[^a-zA-Z0-9]/.test(p) },
    ]
  }, [form.password, lang])

  const isPasswordValid = rules.every((r) => r.valid)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid) {
      setError(lang === 'ar' ? 'يرجى استيفاء جميع شروط كلمة المرور الموضحة أدناه.' : 'Please satisfy all password requirements below.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await authApi.registerBuyer({ ...form, preferredLanguage: lang })
      setAuth(res)
      nav('/account')
    } catch (err: any) {
      const rawMsg = getErrorMessage(err)
      // Format backend identity error nicely
      if (rawMsg.includes('Passwords must') || rawMsg.includes('password')) {
        setError(lang === 'ar' ? 'كلمة المرور لا تحقق شروط الأمان المطلوبة، يرجى التأكد من استيفاء جميع الشروط المذكورة.' : 'Password does not meet security requirements. Please check all requirements.')
      } else {
        setError(rawMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-lux flex justify-center py-16 px-4">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-5 p-8 border border-neutral-800 bg-[#0e0e11] rounded-2xl shadow-xl">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl text-white">{t.auth.buyerRegister}</h1>
          <p className="text-xs text-neutral-400">
            {lang === 'ar' ? 'أنشئ حسابك الخاص لاقتناء المنتجات الفاخرة' : 'Create an account to shop curated luxury'}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-950/50 border border-red-500/40 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Input
            placeholder={t.auth.fullName}
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="bg-neutral-900/80 border-neutral-800 text-white"
          />

          <Input
            type="email"
            placeholder={t.auth.email}
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-neutral-900/80 border-neutral-800 text-white"
          />

          <div>
            <Input
              type="password"
              placeholder={t.auth.password}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bg-neutral-900/80 border-neutral-800 text-white"
            />

            {/* Live Password Checklist */}
            <div className="mt-3 rounded-lg border border-neutral-800/80 bg-neutral-950/60 p-3 space-y-1.5">
              <p className="text-[11px] font-medium text-neutral-400">
                {lang === 'ar' ? 'شروط كلمة المرور:' : 'Password Requirements:'}
              </p>
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-2 text-xs">
                  {rule.valid ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                  )}
                  <span className={rule.valid ? 'text-emerald-300 font-medium' : 'text-neutral-400'}>
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-1 text-xs text-neutral-300">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={form.acceptTerms}
              onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
              className="mt-0.5 rounded border-neutral-700 bg-neutral-900 text-[#d4af37]"
            />
            <span>{t.auth.acceptTerms}</span>
          </label>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={form.acceptPrivacyPolicy}
              onChange={(e) => setForm({ ...form, acceptPrivacyPolicy: e.target.checked })}
              className="mt-0.5 rounded border-neutral-700 bg-neutral-900 text-[#d4af37]"
            />
            <span>{t.auth.acceptPrivacy}</span>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#d4af37] hover:bg-[#e5c358] text-black font-semibold py-2.5"
          disabled={loading || !isPasswordValid}
        >
          {loading ? (lang === 'ar' ? 'جارٍ التسجيل...' : 'Registering...') : t.nav.register}
        </Button>

        <p className="text-center text-xs text-neutral-400">
          <Link to="/login" className="text-[#d4af37] hover:underline">
            {t.auth.hasAccount}
          </Link>
        </p>
      </form>
    </div>
  )
}
