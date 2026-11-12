import { api } from './client'
import type { BoutiqueListItem, PagedResult, PlatformMetrics, ProductListItem } from '@/types'

export const adminApi = {
  metrics: () => api.get<PlatformMetrics>('/admin/metrics').then((r) => r.data),
  boutiques: (params?: Record<string, unknown>) =>
    api.get<PagedResult<BoutiqueListItem>>('/admin/boutiques', { params }).then((r) => r.data),
  approveBoutique: (id: string, notes?: string) =>
    api.post(`/admin/boutiques/${id}/approve`, { notes }),
  suspendBoutique: (id: string, reason: string) =>
    api.post(`/admin/boutiques/${id}/suspend`, { reason }),
  products: (params?: Record<string, unknown>) =>
    api.get<PagedResult<ProductListItem>>('/admin/products', { params }).then((r) => r.data),
  featureProduct: (id: string, featured: boolean) =>
    api.post(`/admin/products/${id}/feature`, { featured }),
  unlistProduct: (id: string, reason: string) =>
    api.post(`/admin/products/${id}/unlist`, { reason }),
  orders: (params?: Record<string, unknown>) =>
    api.get('/admin/orders', { params }).then((r) => r.data),
  users: (params?: Record<string, unknown>) =>
    api.get('/admin/users', { params }).then((r) => r.data),
  audit: (params?: Record<string, unknown>) =>
    api.get('/admin/audit-log', { params }).then((r) => r.data),
  disputes: (params?: Record<string, unknown>) =>
    api.get('/admin/disputes', { params }).then((r) => r.data),
}
