import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

function applyTheme(t: Theme) {
  document.documentElement.classList.toggle('dark', t === 'dark')
}

const initial = ((): Theme => {
  const s = localStorage.getItem('valoir_theme') as Theme | null
  if (s === 'light' || s === 'dark') return s
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
})()

applyTheme(initial)

export const useTheme = create<ThemeState>((set, get) => ({
  theme: initial,
  setTheme: (t) => {
    localStorage.setItem('valoir_theme', t)
    applyTheme(t)
    set({ theme: t })
  },
  toggle: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
}))
