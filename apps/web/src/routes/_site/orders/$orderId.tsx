import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { formatTnd, getProduct, getSize, type OrderRecord } from '@printai/core'
import { getOrder } from '@/lib/orders-repo'
import { STATUS_LABELS, STATUS_ORDER, StatusStamp } from '@/components/StatusStamp'

export const Route = createFileRoute('/_site/orders/$orderId')({
  head: () => ({ meta: [{ title: 'Order — Matbaa' }] }),
  component: OrderPage,
})

function OrderPage() {
  const { orderId } = Route.useParams()
  const [order, setOrder] = useState<OrderRecord | null | undefined>(undefined)
  useEffect(() => {
    getOrder(orderId).then(setOrder)
  }, [orderId])
  if (order === undefined) return <main className="mx-auto max-w-6xl px-5 py-14 font-mono text-xs uppercase tracking-[0.2em] text-muted">Loading…</main>
  if (!order)
    return (
      <main className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="text-3xl">Order not found on this device.</h1>
        <Link to="/orders" className="btn btn-outline mt-6">All orders</Link>
      </main>
    )
  const product = getProduct(order.productSlug)!
  const size = getSize(product, order.sizeId)
  const stepIndex = STATUS_ORDER.indexOf(order.status)
  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <p className="kicker mb-2">Order {order.id}</p>
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-4xl">Thank you, {order.shipping.fullName.split(' ')[0]}.</h1>
        <StatusStamp status={order.status} />
      </div>
      <p className="mt-2 text-ink-soft">We'll call {order.shipping.phone} to confirm before sending it to the press.</p>

      <ol className="mt-10 grid gap-2 sm:grid-cols-5">
        {STATUS_ORDER.map((s, i) => (
          <li key={s} className={`border-t-2 pt-2 font-mono text-[0.62rem] uppercase tracking-[0.15em] ${i <= stepIndex ? 'border-ink text-ink' : 'border-line text-muted'}`}>
            {String(i + 1).padStart(2, '0')} · {STATUS_LABELS[s]}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section className="paper-card p-5">
          <p className="label">Items</p>
          <p className="font-semibold">{product.name} · {size.label}</p>
          <ul className="mt-1 text-sm text-ink-soft">
            {product.options.map((g) => (
              <li key={g.id}>{g.label}: {g.values.find((v) => v.id === order.options[g.id])?.label ?? order.options[g.id]}</li>
            ))}
            <li>Quantity: {order.quantity}</li>
          </ul>
          <dl className="mt-4 space-y-1 border-t border-line pt-3 font-mono text-xs">
            <div className="flex justify-between"><dt>Unit</dt><dd>{formatTnd(order.unitPrice)}</dd></div>
            <div className="flex justify-between border-t border-ink pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatTnd(order.total)}</dd></div>
          </dl>
        </section>
        <section className="paper-card p-5">
          <p className="label">Delivery</p>
          <p className="text-sm">{order.shipping.fullName}<br />{order.shipping.addressLine}<br />{order.shipping.city}, {order.shipping.governorate}<br />{order.shipping.phone}</p>
          {order.shipping.notes && <p className="mt-2 text-xs text-muted">“{order.shipping.notes}”</p>}
          <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-muted">Placed {new Date(order.createdAt).toLocaleString()}</p>
        </section>
      </div>

      {order.printFileUrls.some((u) => u.startsWith('data:')) && (
        <section className="mt-8">
          <p className="label">Print files</p>
          <div className="flex flex-wrap gap-3">
            {order.printFileUrls.filter((u) => u.startsWith('data:')).map((u, i) => (
              <img key={i} src={u} alt={`Side ${i + 1}`} className="paper-card max-h-48 p-2" />
            ))}
          </div>
        </section>
      )}
      <Link to="/orders" className="btn btn-ghost mt-8">← All orders</Link>
    </main>
  )
}
