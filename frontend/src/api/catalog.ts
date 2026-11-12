/**
 * Public catalog — prefers live GET /api/v1/catalog/*.
 * Demo fixtures are only used when the API is unreachable (dev offline).
 * Empty published catalog from API is treated as real empty (not replaced by demo).
 */
import { api } from './client'
import type { ProductFilters, ProductListItem, PagedResult } from '@/types'
import axios from 'axios'

const DEMO: ProductListItem[] = [
  { id: 'd1', boutiqueId: 'b1', title: 'Silk Evening Cape', slug: 'silk-evening-cape', basePrice: 2400, status: 'Published', isFeatured: true, createdAt: new Date().toISOString(), brand: 'Maison Lumen', rating: 4.8 },
  { id: 'd2', boutiqueId: 'b2', title: 'Hand-set Emerald Ring', slug: 'emerald-ring', basePrice: 8900, status: 'Published', isFeatured: true, createdAt: new Date().toISOString(), brand: 'Atelier Noor', rating: 4.9 },
  { id: 'd3', boutiqueId: 'b1', title: 'Cashmere Tailored Coat', slug: 'cashmere-coat', basePrice: 3200, status: 'Published', isFeatured: false, createdAt: new Date().toISOString(), brand: 'Maison Lumen', rating: 4.6 },
  { id: 'd4', boutiqueId: 'b3', title: 'Ceramic Vase — Limited', slug: 'ceramic-vase', basePrice: 680, status: 'Published', isFeatured: true, createdAt: new Date().toISOString(), brand: 'Studio Harmonia', rating: 4.7 },
  { id: 'd5', boutiqueId: 'b2', title: 'Pearl Drop Earrings', slug: 'pearl-earrings', basePrice: 1450, status: 'Published', isFeatured: false, createdAt: new Date().toISOString(), brand: 'Atelier Noor', rating: 4.5 },
  { id: 'd6', boutiqueId: 'b3', title: 'Leather Weekender', slug: 'leather-weekender', basePrice: 1100, status: 'Published', isFeatured: false, createdAt: new Date().toISOString(), brand: 'Studio Harmonia', rating: 4.4 },
]

function filterDemo(f: ProductFilters = {}): PagedResult<ProductListItem> {
  let items = [...DEMO]
  if (f.search) {
    const s = f.search.toLowerCase()
    items = items.filter((p) => p.title.toLowerCase().includes(s) || p.brand?.toLowerCase().includes(s))
  }
  if (f.brand) items = items.filter((p) => p.brand === f.brand)
  if (f.featuredOnly) items = items.filter((p) => p.isFeatured)
  if (f.minPrice != null) items = items.filter((p) => p.basePrice >= f.minPrice!)
  if (f.maxPrice != null) items = items.filter((p) => p.basePrice <= f.maxPrice!)
  if (f.rating != null) items = items.filter((p) => (p.rating ?? 0) >= f.rating!)
  if (f.sort === 'price_asc') items.sort((a, b) => a.basePrice - b.basePrice)
  if (f.sort === 'price_desc') items.sort((a, b) => b.basePrice - a.basePrice)
  if (f.sort === 'featured') items.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
  const page = f.page ?? 1
  const pageSize = f.pageSize ?? 12
  const totalCount = items.length
  const slice = items.slice((page - 1) * pageSize, page * pageSize)
  return { items: slice, page, pageSize, totalCount, totalPages: Math.ceil(totalCount / pageSize) || 1 }
}

type ApiPaged<T> = { items: T[]; page: number; pageSize: number; totalCount: number; totalPages?: number }

export const catalogApi = {
  async list(filters: ProductFilters = {}): Promise<PagedResult<ProductListItem> & { source: 'api' | 'demo' }> {
    try {
      const { data } = await api.get<ApiPaged<{
        id: string
        boutiqueId: string
        boutiqueName: string
        boutiqueSlug: string
        title: string
        slug: string
        basePrice: number
        isFeatured: boolean
        createdAt: string
        availableStock: number
      }>>('/catalog/products', {
        params: {
          search: filters.search,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          featuredOnly: filters.featuredOnly,
          sort: filters.sort ?? 'newest',
          page: filters.page ?? 1,
          pageSize: filters.pageSize ?? 12,
          boutiqueSlug: filters.seller,
        },
      })
      const items: ProductListItem[] = data.items.map((p) => ({
        id: p.id,
        boutiqueId: p.boutiqueId,
        title: p.title,
        slug: p.slug,
        basePrice: p.basePrice,
        status: 'Published',
        isFeatured: p.isFeatured,
        createdAt: p.createdAt,
        brand: p.boutiqueName,
      }))
const totalPages = (data.totalPages ?? Math.ceil(data.totalCount / data.pageSize)) || 1
      return { items, page: data.page, pageSize: data.pageSize, totalCount: data.totalCount, totalPages, source: 'api' }
    } catch (err) {
      // Network / API down only — not empty results
      if (axios.isAxiosError(err) && err.response) {
        // 4xx/5xx with body: surface empty from API rather than demo when server responded
        if (err.response.status < 500) {
          return { items: [], page: 1, pageSize: 12, totalCount: 0, totalPages: 1, source: 'api' }
        }
      }
      return { ...filterDemo(filters), source: 'demo' }
    }
  },

async getBySlug(slug: string): Promise<(ProductListItem & { description?: string; variantId?: string }) | null> {
    try {
      const { data } = await api.get<{
        id: string
        boutiqueId: string
        boutiqueName: string
        title: string
        slug: string
        description?: string
        basePrice: number
        isFeatured: boolean
        createdAt: string
        variants?: { id: string }[]
      }>(`/catalog/products/${encodeURIComponent(slug)}`)
      return {
        id: data.id,
        boutiqueId: data.boutiqueId,
        title: data.title,
        slug: data.slug,
        basePrice: data.basePrice,
        status: 'Published',
        isFeatured: data.isFeatured,
        createdAt: data.createdAt,
        brand: data.boutiqueName,
        description: data.description,
        variantId: (data as { variants?: { id: string }[] }).variants?.[0]?.id,
      }
    } catch {
      const all = filterDemo({ pageSize: 100 })
      const p = all.items.find((x) => x.slug === slug || x.id === slug)
      if (!p) return null
      return {
        ...p,
        description:
          'An exclusive piece from our curated network of independent ateliers. Crafted with exceptional materials and finished by hand.',
      }
    }
  },

  brands: () => ['Maison Lumen', 'Atelier Noor', 'Studio Harmonia'],
  categories: () => ['Fashion', 'Jewelry', 'Home', 'Accessories'],
}
