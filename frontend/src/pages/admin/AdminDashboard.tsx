import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api/admin'
import { useI18n } from '@/i18n'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { getErrorMessage } from '@/api/client'

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  )
}

export function AdminOverviewPage() {
  const { t } = useI18n()
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => adminApi.metrics(),
    retry: 1,
  })
  if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>
  if (error) {
    return (
      <div className="card space-y-2 p-6 text-sm">
        <p className="font-medium">{t.common.error}</p>
        <p className="text-[var(--muted)]">{getErrorMessage(error)}</p>
        <p className="text-xs text-[var(--muted)]">Requires Admin/SuperAdmin JWT and running API.</p>
      </div>
    )
  }
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label={t.admin.gmv} value={`$${(data?.gmv ?? 0).toLocaleString()}`} />
        <Metric label={t.admin.commission} value={`$${(data?.netCommission ?? 0).toLocaleString()}`} />
        <Metric label={t.nav.orders} value={data?.totalOrders ?? 0} />
        <Metric label={t.admin.pending} value={data?.boutiquesPending ?? 0} />
      </div>
      {data?.topBoutiques?.length ? (
        <div className="card p-6">
          <h3 className="mb-4 font-medium">Top boutiques</h3>
          <ul className="space-y-2 text-sm">
            {data.topBoutiques.map((b) => (
              <li key={b.boutiqueId} className="flex justify-between">
                <span>{b.storeName}</span>
                <span className="text-[var(--muted)]">${b.gmv.toLocaleString()} · {b.orderCount} orders</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export function AdminBoutiquesPage() {
  const { t } = useI18n()
  const [status, setStatus] = useState<string | undefined>('Pending')
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-boutiques', status],
    queryFn: () => adminApi.boutiques({ status, page: 1, pageSize: 20 }),
    retry: 1,
  })

  const act = async (id: string, action: 'approve' | 'suspend') => {
    if (action === 'approve') await adminApi.approveBoutique(id)
    else await adminApi.suspendBoutique(id, 'Admin suspension')
    refetch()
  }

  if (isLoading) return <Spinner />
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['Pending', 'Approved', 'Suspended', undefined].map((s) => (
          <button
            key={String(s)}
            type="button"
            className={`rounded-sm px-3 py-1 text-xs ${status === s ? 'bg-charcoal text-ivory dark:bg-champagne dark:text-charcoal' : 'border border-[var(--border)]'}`}
            onClick={() => setStatus(s)}
          >
            {s ?? 'All'}
          </button>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-start text-xs uppercase tracking-wider text-[var(--muted)]">
              <th className="p-3 text-start">Store</th>
              <th className="p-3 text-start">Status</th>
              <th className="p-3 text-start">Commission</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((b) => (
              <tr key={b.id} className="border-b border-[var(--border)]">
                <td className="p-3">
                  <div className="font-medium">{b.storeName}</div>
                  <div className="text-xs text-[var(--muted)]">{b.slug}</div>
                </td>
                <td className="p-3">{b.status}</td>
                <td className="p-3">{(b.commissionRate * 100).toFixed(1)}%</td>
                <td className="p-3 text-end space-x-2">
                  {b.status === 'Pending' && (
                    <Button size="sm" onClick={() => act(b.id, 'approve')}>{t.admin.approve}</Button>
                  )}
                  {b.status === 'Approved' && (
                    <Button size="sm" variant="outline" onClick={() => act(b.id, 'suspend')}>{t.admin.suspend}</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.items?.length && <p className="p-6 text-sm text-[var(--muted)]">No boutiques</p>}
      </div>
    </div>
  )
}

export function AdminProductsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminApi.products({ page: 1, pageSize: 20 }),
    retry: 1,
  })
  if (isLoading) return <Spinner />
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted)]">
            <th className="p-3 text-start">Title</th>
            <th className="p-3 text-start">Price</th>
            <th className="p-3 text-start">Status</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {data?.items?.map((p) => (
            <tr key={p.id} className="border-b border-[var(--border)]">
              <td className="p-3">{p.title}</td>
              <td className="p-3">${p.basePrice.toLocaleString()}</td>
              <td className="p-3">{p.status}{p.isFeatured ? ' · Featured' : ''}</td>
              <td className="p-3 text-end">
                <Button size="sm" variant="outline" onClick={() => adminApi.featureProduct(p.id, !p.isFeatured).then(() => refetch())}>
                  Feature
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div className="card p-6 text-sm text-[var(--muted)]">
      <h2 className="mb-2 font-display text-2xl text-[var(--text)]">{title}</h2>
      Connected to backend list endpoints when authenticated. Expand detail views as needed.
    </div>
  )
}
