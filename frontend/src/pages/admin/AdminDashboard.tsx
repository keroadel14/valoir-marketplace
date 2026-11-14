import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api/admin'
import { api, getErrorMessage } from '@/api/client'
import { useI18n } from '@/i18n'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { useState, useMemo } from 'react'

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  )
}

// ── Overview ─────────────────────────────────────────────────────────────
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

// ── Boutiques ────────────────────────────────────────────────────────────
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

// ── Products ─────────────────────────────────────────────────────────────
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

// ── Orders ───────────────────────────────────────────────────────────────
interface AdminOrderItem {
  id: string
  orderNumber: string
  buyerId: string
  totalAmount: number
  status: string
  createdAt: string
  paidAt?: string | null
  vendorOrderCount?: number
}

export function AdminOrdersPage() {
  const [status, setStatus] = useState<string>('All')
  const [search, setSearch] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-orders', status],
    queryFn: async () => {
      const res = await adminApi.orders(status === 'All' ? {} : { status })
      return res as { items: AdminOrderItem[]; totalCount: number }
    },
    retry: 1,
  })

  const orders = useMemo(() => {
    const list = data?.items || []
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter((o) =>
      o.orderNumber?.toLowerCase().includes(q) ||
      o.buyerId?.toLowerCase().includes(q)
    )
  }, [data, search])

  const getStatusBadge = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'paid':
      case 'completed':
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      case 'pending':
      case 'processing':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      case 'cancelled':
      case 'refunded':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      default:
        return 'bg-[var(--muted)]/10 text-[var(--muted)] border-[var(--border)]'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium text-[var(--text)]">Platform Orders</h2>
          <p className="text-xs text-[var(--muted)]">Inspect all multi-vendor customer orders and payments across VALOIR</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={`rounded px-3 py-1 text-xs transition-colors ${
                status === st
                  ? 'bg-charcoal text-ivory dark:bg-champagne dark:text-charcoal font-medium'
                  : 'border border-[var(--border)] text-[var(--muted)] hover:border-champagne'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by Order # or Buyer ID…"
          className="max-w-xs rounded border border-[var(--border)] bg-transparent px-3 py-1.5 text-xs focus:border-champagne focus:outline-none"
        />
        {data?.totalCount != null && (
          <span className="text-xs text-[var(--muted)]">{data.totalCount} total orders</span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <div className="card p-6 text-sm text-[var(--muted)]">
          <p className="font-medium text-[var(--text)]">Unable to load orders</p>
          <p className="mt-1 text-xs">{getErrorMessage(error)}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-sm text-[var(--muted)]">
          No orders found matching this filter.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--muted)]">
                <th className="p-3 text-start">Order #</th>
                <th className="p-3 text-start">Buyer</th>
                <th className="p-3 text-start">Date</th>
                <th className="p-3 text-start">Boutiques</th>
                <th className="p-3 text-start">Total</th>
                <th className="p-3 text-start">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/5">
                  <td className="p-3 font-mono font-medium text-champagne">{o.orderNumber || o.id.slice(0, 8)}</td>
                  <td className="p-3 font-mono text-xs text-[var(--muted)]">{o.buyerId?.slice(0, 8)}…</td>
                  <td className="p-3 text-xs text-[var(--muted)]">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3 text-xs">{o.vendorOrderCount ?? 1} boutique(s)</td>
                  <td className="p-3 font-medium text-[var(--text)]">
                    ${(o.totalAmount ?? 0).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold uppercase ${getStatusBadge(o.status)}`}>
                      {o.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Users ────────────────────────────────────────────────────────────────
interface AdminUserItem {
  id: string
  email: string
  fullName?: string | null
  roles: string[]
  accountStatus: string
  createdAt: string
}

export function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<string>('All')
  const [search, setSearch] = useState('')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: async () => {
      const res = await adminApi.users(roleFilter === 'All' ? {} : { role: roleFilter })
      return res as { items: AdminUserItem[]; totalCount: number }
    },
    retry: 1,
  })

  const users = useMemo(() => {
    const list = data?.items || []
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter((u) =>
      u.email?.toLowerCase().includes(q) ||
      u.fullName?.toLowerCase().includes(q)
    )
  }, [data, search])

  const toggleUserStatus = async (user: AdminUserItem) => {
    const isSuspended = user.accountStatus?.toLowerCase() === 'suspended'
    try {
      if (isSuspended) {
        await api.post(`/admin/users/${user.id}/reactivate`)
      } else {
        await api.post(`/admin/users/${user.id}/suspend`, { reason: 'Suspended by admin' })
      }
      refetch()
    } catch (err) {
      alert(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium text-[var(--text)]">Platform Users</h2>
          <p className="text-xs text-[var(--muted)]">Manage registered buyers, boutique owners, and platform administrators</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Buyer', 'Vendor', 'Admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded px-3 py-1 text-xs transition-colors ${
                roleFilter === r
                  ? 'bg-charcoal text-ivory dark:bg-champagne dark:text-charcoal font-medium'
                  : 'border border-[var(--border)] text-[var(--muted)] hover:border-champagne'
              }`}
            >
              {r === 'All' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name…"
          className="max-w-xs rounded border border-[var(--border)] bg-transparent px-3 py-1.5 text-xs focus:border-champagne focus:outline-none"
        />
        {data?.totalCount != null && (
          <span className="text-xs text-[var(--muted)]">{data.totalCount} accounts</span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <div className="card p-6 text-sm text-[var(--muted)]">
          <p className="font-medium text-[var(--text)]">Unable to load users</p>
          <p className="mt-1 text-xs">{getErrorMessage(error)}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="card p-12 text-center text-sm text-[var(--muted)]">
          No users found.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--muted)]">
                <th className="p-3 text-start">User / Email</th>
                <th className="p-3 text-start">Role(s)</th>
                <th className="p-3 text-start">Joined</th>
                <th className="p-3 text-start">Status</th>
                <th className="p-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSuspended = u.accountStatus?.toLowerCase() === 'suspended'
                return (
                  <tr key={u.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/5">
                    <td className="p-3">
                      <div className="font-medium text-[var(--text)]">{u.fullName || 'Anonymous User'}</div>
                      <div className="font-mono text-xs text-[var(--muted)]">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map((role) => (
                          <span
                            key={role}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                              role === 'SuperAdmin' || role === 'Admin'
                                ? 'bg-champagne/15 text-champagne'
                                : role === 'Vendor'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-[var(--muted)]/10 text-[var(--muted)]'
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-xs text-[var(--muted)]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          isSuspended
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {u.accountStatus || 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-end">
                      <Button
                        size="sm"
                        variant={isSuspended ? 'primary' : 'outline'}
                        onClick={() => toggleUserStatus(u)}
                      >
                        {isSuspended ? 'Reactivate' : 'Suspend'}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Disputes ─────────────────────────────────────────────────────────────
interface AdminDisputeItem {
  id: string
  vendorOrderId: string
  boutiqueId: string
  buyerId: string
  reason: string
  status: string
  createdAt: string
}

export function AdminDisputesPage() {
  const [status, setStatus] = useState<string>('All')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-disputes', status],
    queryFn: async () => {
      const res = await adminApi.disputes(status === 'All' ? {} : { status })
      return res as { items: AdminDisputeItem[]; totalCount: number }
    },
    retry: 1,
  })

  const disputes = data?.items || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium text-[var(--text)]">Disputes & Claims</h2>
          <p className="text-xs text-[var(--muted)]">Escrow resolution center for order refunds, returns, and merchant claims</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Open', 'UnderReview', 'Resolved', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={`rounded px-3 py-1 text-xs transition-colors ${
                status === st
                  ? 'bg-charcoal text-ivory dark:bg-champagne dark:text-charcoal font-medium'
                  : 'border border-[var(--border)] text-[var(--muted)] hover:border-champagne'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <div className="card p-6 text-sm text-[var(--muted)]">
          <p className="font-medium text-[var(--text)]">Unable to load disputes</p>
          <p className="mt-1 text-xs">{getErrorMessage(error)}</p>
        </div>
      ) : disputes.length === 0 ? (
        <div className="card p-12 text-center text-sm text-[var(--muted)]">
          No disputes recorded on the platform. All transactions in good standing.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--muted)]">
                <th className="p-3 text-start">Dispute ID</th>
                <th className="p-3 text-start">Vendor Order</th>
                <th className="p-3 text-start">Reason</th>
                <th className="p-3 text-start">Date</th>
                <th className="p-3 text-start">Status</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id} className="border-b border-[var(--border)]">
                  <td className="p-3 font-mono text-xs font-medium text-champagne">{d.id.slice(0, 8)}…</td>
                  <td className="p-3 font-mono text-xs text-[var(--muted)]">{d.vendorOrderId?.slice(0, 8)}…</td>
                  <td className="p-3 text-xs max-w-xs truncate">{d.reason}</td>
                  <td className="p-3 text-xs text-[var(--muted)]">
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3">
                    <span className="inline-block rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Audit Log ────────────────────────────────────────────────────────────
interface AdminAuditItem {
  id: string
  adminUserId: string
  action: string
  targetType?: string | null
  targetId?: string | null
  reason?: string | null
  ipAddress?: string | null
  occurredAt: string
}

export function AdminAuditPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-audit-log'],
    queryFn: async () => {
      const res = await adminApi.audit({ page: 1, pageSize: 50 })
      return res as { items: AdminAuditItem[]; totalCount: number }
    },
    retry: 1,
  })

  const logs = data?.items || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-medium text-[var(--text)]">System Audit Log</h2>
        <p className="text-xs text-[var(--muted)]">Immutable security trail of administrative interventions, approvals, and overrides</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <div className="card p-6 text-sm text-[var(--muted)]">
          <p className="font-medium text-[var(--text)]">Unable to load audit trail</p>
          <p className="mt-1 text-xs">{getErrorMessage(error)}</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center text-sm text-[var(--muted)]">
          No administrative actions recorded in this period.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--muted)]">
                <th className="p-3 text-start">Timestamp</th>
                <th className="p-3 text-start">Admin User</th>
                <th className="p-3 text-start">Action</th>
                <th className="p-3 text-start">Target</th>
                <th className="p-3 text-start">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/5">
                  <td className="p-3 text-xs text-[var(--muted)] whitespace-nowrap">
                    {log.occurredAt ? new Date(log.occurredAt).toLocaleString() : '—'}
                  </td>
                  <td className="p-3 font-mono text-xs text-[var(--muted)]">{log.adminUserId?.slice(0, 8)}…</td>
                  <td className="p-3">
                    <span className="inline-block rounded bg-champagne/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-champagne">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-[var(--muted)]">
                    {log.targetType ? `${log.targetType} (${log.targetId?.slice(0, 8)}…)` : '—'}
                  </td>
                  <td className="p-3 font-mono text-xs text-[var(--muted)]">
                    {log.ipAddress || 'Internal'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
