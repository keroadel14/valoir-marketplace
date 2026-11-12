import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { buyerApi } from '@/api/buyer'
import { useI18n } from '@/i18n'
import { Spinner } from '@/components/ui/Spinner'
import { getErrorMessage } from '@/api/client'

export function OrdersPage() {
  const { t } = useI18n()
  const { data, isLoading, error } = useQuery({
    queryKey: ['buyer-orders'],
    queryFn: () => buyerApi.listOrders({ page: 1 }),
  })

  if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>
  if (error) return <p className="text-sm text-red-600">{getErrorMessage(error)}</p>

  const items = data?.items ?? []
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl">{t.buyer.orders}</h2>
      {items.length === 0 && <p className="text-sm text-[var(--muted)]">No orders yet.</p>}
      <ul className="divide-y divide-[var(--border)]">
        {items.map((o: { id: string; orderNumber: string; totalAmount: number; status: string; createdAt: string }) => (
          <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
            <div>
              <p className="font-medium">{o.orderNumber}</p>
              <p className="text-[var(--muted)]">{new Date(o.createdAt).toLocaleString()} · {o.status}</p>
            </div>
            <div className="flex items-center gap-4">
              <span>${Number(o.totalAmount).toLocaleString()}</span>
              <Link className="text-champagne" to={`/account/orders/${o.id}`}>Details</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
