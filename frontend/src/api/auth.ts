import { api } from './client'
import type { AuthResponse } from '@/types'

export const authApi = {
  registerBuyer: (body: {
    email: string
    password: string
    fullName: string
    acceptTerms: boolean
    acceptPrivacyPolicy: boolean
    preferredLanguage?: string
  }) => api.post<AuthResponse>('/auth/register-buyer', body).then((r) => r.data),

  registerVendor: (body: {
    email: string
    password: string
    fullName: string
    storeName: string
    slug: string
    tradeLicenseOrVatId?: string
    acceptTerms: boolean
    acceptPrivacyPolicy: boolean
    acceptVendorAgreement: boolean
    preferredLanguage?: string
  }) => api.post<AuthResponse>('/auth/register-vendor', body).then((r) => r.data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),

  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
}
