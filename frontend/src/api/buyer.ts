import { api } from './client'

export interface Address {
  id: string
  label: string
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  stateOrRegion?: string
  postalCode: string
  countryCode: string
  isDefault: boolean
}

export interface CreateOrderPayload {
  shippingAddressId?: string
  lines: { variantId: string; quantity: number }[]
  shippingAmount: number
}

export interface CreateOrderResult {
  orderId: string
  orderNumber: string
  totalAmount: number
  paymentIntentId?: string
  clientSecret?: string
  expiresAt?: string
}

export const buyerApi = {
  listAddresses: () => api.get<Address[]>('/buyer/addresses').then((r) => r.data),
  createAddress: (body: Omit<Address, 'id'>) =>
    api.post<{ id: string }>('/buyer/addresses', body).then((r) => r.data),
  deleteAddress: (id: string) => api.delete(`/buyer/addresses/${id}`),
  setDefaultAddress: (id: string) => api.post(`/buyer/addresses/${id}/default`),
  listOrders: (params?: { status?: string; page?: number }) =>
    api.get('/buyer/orders', { params }).then((r) => r.data),
  getOrder: (id: string) => api.get(`/buyer/orders/${id}`).then((r) => r.data),
  createOrder: (body: CreateOrderPayload) =>
    api.post<CreateOrderResult>('/buyer/orders', body).then((r) => r.data),
}
