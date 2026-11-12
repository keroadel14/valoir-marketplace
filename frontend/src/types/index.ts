export type Role = 'Buyer' | 'Vendor' | 'Admin' | 'SuperAdmin'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  refreshTokenExpiresAt: string
  userId: string
  email: string
  fullName: string
  roles: string[]
  boutiqueId?: string | null
  boutiqueStatus?: string | null
}

export interface ProductListItem {
  id: string
  boutiqueId: string
  title: string
  slug: string
  basePrice: number
  status: string
  isFeatured: boolean
  createdAt: string
  imageUrl?: string
  brand?: string
  rating?: number
}

export interface BoutiqueListItem {
  id: string
  storeName: string
  slug: string
  status: string
  commissionRate: number
  payoutHoldEnabled: boolean
  ownerEmail?: string | null
  createdAt: string
  approvedAt?: string | null
}

export interface PlatformMetrics {
  gmv: number
  refundTotal: number
  netCommission: number
  totalOrders: number
  pendingPayoutEscrowCount: number
  pendingPayoutEscrowAmount: number
  boutiquesPending: number
  boutiquesApproved: number
  boutiquesSuspended: number
  openDisputes: number
  topBoutiques: { boutiqueId: string; storeName: string; gmv: number; orderCount: number }[]
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface CartItem {
  productId: string
  variantId?: string
  title: string
  price: number
  quantity: number
  imageUrl?: string
  boutiqueId?: string
  boutiqueName?: string
  maxQty?: number
}

export interface ProductFilters {
  search?: string
  category?: string
  brand?: string
  seller?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  availability?: 'in_stock' | 'all'
  featuredOnly?: boolean
  page?: number
  pageSize?: number
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'featured'
}
