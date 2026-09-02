import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { formatTnd, getProduct, type OrderRecord } from '@printai/core'
import { SectionHeading } from '@/components/Ornament'
import { listOrders } from '@/lib/orders-repo'
import { useAuth } from '@/lib/auth'
import { StatusStamp } from '@/components/StatusStamp'

export const Route = createFileRoute('/_site/orders/')({
  head: () => ({ meta: [{ title: 'Orders — Matbaa' }] }),
  component: OrdersPage,
})

function OrdersPage() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState<OrderRecord[] | null>(null)
  useEffect(() => {
    if (loading) return
    listOrders().then(setOrders)
  }, [user, loading])
  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <SectionHeading kicker="Orders" title="Your orders" sub="From received to delivered." />
      {orders === null ? (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="paper-card p-10 text-center">
          <p className="font-display text-2xl">No orders yet.</p>
          <Link to="/designs" className="btn btn-ink mt-4">Order a design</Link>
        </div>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {orders.map((o) => (
            <li key={o.id}>
              <Link to="/orders/$orderId" params={{ orderId: o.id }} className="flex flex-wrap items-center gap-4 py-4 no-underline hover:bg-paper-2/60">
                <span className="font-mono text-xs text-muted">{o.id}</span>
                <span className="font-semibold">{getProduct(o.productSlug)?.name}</span>
                <span className="text-sm text-ink-soft">× {o.quantity}</span>
                <span className="ml-auto font-mono text-sm">{formatTnd(o.total)}</span>
                <StatusStamp status={o.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
