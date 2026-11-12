import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse, Role } from '@/types'

interface AuthState {
  user: AuthResponse | null
  setAuth: (a: AuthResponse | null) => void
  logout: () => void
  hasRole: (...roles: Role[]) => boolean
  isAuthenticated: () => boolean
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setAuth: (user) => set({ user }),
      logout: () => set({ user: null }),
      hasRole: (...roles) => {
        const u = get().user
        if (!u) return false
        return roles.some((r) => u.roles.includes(r))
      },
      isAuthenticated: () => !!get().user?.accessToken,
    }),
    { name: 'valoir_auth' },
  ),
)
