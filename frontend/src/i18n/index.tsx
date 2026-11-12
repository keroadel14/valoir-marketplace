import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { en, type Dict } from './en'
import { ar } from './ar'

type Lang = 'en' | 'ar'

const dicts: Record<Lang, Dict> = { en, ar }

type I18nCtx = {
  lang: Lang
  dir: 'ltr' | 'rtl'
  t: Dict
  setLang: (l: Lang) => void
  tr: (template: string, vars?: Record<string, string | number>) => string
}

const Ctx = createContext<I18nCtx | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('valoir_lang')
    return saved === 'ar' ? 'ar' : 'en'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('valoir_lang', l)
  }

// بعد
const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang, dir])

  const tr = (template: string, vars?: Record<string, string | number>) => {
    if (!vars) return template
    return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{{${k}}}`, String(v)), template)
  }

  const value = useMemo(() => ({ lang, dir, t: dicts[lang], setLang, tr }), [lang, dir])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useI18n outside provider')
  return v
}
