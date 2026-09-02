import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { GOVERNORATES, defaultOptions, formatTnd, getProduct, getSize, quote, type DesignRecord, type ShippingAddress } from '@printai/core'
import { getDesign } from '@/lib/designs-repo'
import { rememberOrderLocally } from '@/lib/orders-repo'
import { placeOrder } from '@/server/orders'
import { useAuth } from '@/lib/auth'
import { SectionHeading } from '@/components/Ornament'

export const Route = createFileRoute('/_site/checkout/$designId')({
  head: () => ({ meta: [{ title: 'Order prints — Matbaa' }] }),
  component: CheckoutPage,
})

type PrintFile = { sideIndex: number; name: string; dataUrl: string }

function CheckoutPage() {
  const { designId } = Route.useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const place = useServerFn(placeOrder)
  const [design, setDesign] = useState<DesignRecord | null | undefined>(undefined)
  const [files, setFiles] = useState<PrintFile[] | null>(null)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [qty, setQty] = useState<number>(0)
  const [opts, setOpts] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ship, setShip] = useState<ShippingAddress>({ fullName: '', phone: '', email: '', addressLine: '', city: '', governorate: 'Tunis', postalCode: '', notes: '' })

  useEffect(() => {
    getDesign(designId).then((d) => {
      setDesign(d)
      if (d) {
        const p = getProduct(d.productSlug)!
        setQty(p.qtySteps[1] ?? p.minQty)
        setOpts(defaultOptions(p))
      }
    })
  }, [designId])

  useEffect(() => {
    if (!design) return
    let alive = true
    import('@/editor/export')
      .then(({ renderPrintFiles }) => renderPrintFiles(design.document, 300))
      .then((f) => alive && setFiles(f))
      .catch((e) => alive && setRenderError((e as Error).message))
    return () => {
      alive = false
    }
  }, [design])

  useEffect(() => {
    if (user?.email) setShip((s) => ({ ...s, email: s.email || user.email || '', fullName: s.fullName || user.name || '' }))
  }, [user])

  if (design === undefined) return <main className="mx-auto max-w-6xl px-5 py-14 font-mono text-xs uppercase tracking-[0.2em] text-muted">Loading…</main>
  if (design === null)
    return (
      <main className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="text-3xl">Design not found on this device.</h1>
        <Link to="/designs" className="btn btn-outline mt-6">My designs</Link>
      </main>
    )

  const product = getProduct(design.productSlug)!
  const size = getSize(product, design.document.sizeId)
  const q = quote({ product, quantity: qty, options: opts })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files) return
    setBusy(true)
    setError(null)
    try {
      const result = await place({
        data: {
          designId: design.id,
          designTitle: design.title,
          productSlug: product.slug,
          sizeId: size.id,
          quantity: q.quantity,
          options: opts,
          shipping: { ...ship, email: ship.email || '' },
          printFiles: files.map((f) => f.dataUrl),
        },
      })
      // keep a copy locally so guests can track it; strip heavy data URLs if they were stored remotely
      await rememberOrderLocally({ ...result.order, printFileUrls: result.persisted ? result.order.printFileUrls : files.map((f) => f.dataUrl) })
      void navigate({ to: '/orders/$orderId', params: { orderId: result.order.id } })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <SectionHeading kicker="Checkout" title={`Order “${design.title}”`} sub={`${product.name} · ${size.label}`} />
      <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <section>
            <h2 className="mb-3 text-xl">Print proof</h2>
            {renderError && <p className="text-sm text-vermillion">Could not render: {renderError}</p>}
            {!files && !renderError && <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Rendering print files at 300 dpi…</p>}
            <div className="flex flex-wrap gap-4">
              {files?.map((f) => (
                <figure key={f.sideIndex} className="paper-card p-3">
                  <div className="flex max-h-72 items-center justify-center rounded-sm" style={product.kind === 'textile' ? { background: design.document.garmentColor ?? '#f5f3ee', padding: 12 } : undefined}>
                    <img src={f.dataUrl} alt={f.name} className="max-h-72 max-w-xs" style={{ boxShadow: '0 4px 16px -6px rgba(26,23,20,0.4)' }} />
                  </div>
                  <figcaption className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-muted">
                    {f.name} · {design.document.width + design.document.bleed * 2}×{design.document.height + design.document.bleed * 2} mm incl. bleed · 300 dpi
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">The red dashed line in the editor is the trim. Anything outside it is cut away; keep text inside the inner safe margin.</p>
            <Link to="/editor/$designId" params={{ designId: design.id }} className="btn btn-ghost btn-sm mt-2">← Back to the editor</Link>
          </section>

          <section>
            <h2 className="mb-3 text-xl">Print options</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {product.options.map((g) => (
                <label key={g.id}>
                  <span className="label">{g.label}</span>
                  <select className="field" value={opts[g.id]} onChange={(e) => setOpts({ ...opts, [g.id]: e.target.value })}>
                    {g.values.map((v) => (
                      <option key={v.id} value={v.id}>{v.label}</option>
                    ))}
                  </select>
                </label>
              ))}
              <label>
                <span className="label">Quantity (min. {product.minQty})</span>
                <div className="flex flex-wrap gap-1">
                  {product.qtySteps.map((n) => (
                    <button key={n} type="button" onClick={() => setQty(n)} className={`btn btn-sm ${qty === n ? 'btn-ink' : 'btn-outline'}`}>{n}</button>
                  ))}
                  <input type="number" className="field field-sm w-24 font-mono" min={product.minQty} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
                </div>
              </label>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl">Delivery</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="label">Full name</span><input required className="field" value={ship.fullName} onChange={(e) => setShip({ ...ship, fullName: e.target.value })} /></label>
              <label><span className="label">Phone</span><input required className="field" placeholder="+216 …" value={ship.phone} onChange={(e) => setShip({ ...ship, phone: e.target.value })} /></label>
              <label className="sm:col-span-2"><span className="label">Email (order updates)</span><input type="email" className="field" value={ship.email} onChange={(e) => setShip({ ...ship, email: e.target.value })} /></label>
              <label className="sm:col-span-2"><span className="label">Address</span><input required className="field" value={ship.addressLine} onChange={(e) => setShip({ ...ship, addressLine: e.target.value })} /></label>
              <label><span className="label">City</span><input required className="field" value={ship.city} onChange={(e) => setShip({ ...ship, city: e.target.value })} /></label>
              <label>
                <span className="label">Governorate</span>
                <select className="field" value={ship.governorate} onChange={(e) => setShip({ ...ship, governorate: e.target.value })}>
                  {GOVERNORATES.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </label>
              <label className="sm:col-span-2"><span className="label">Notes for the printer</span><textarea className="field" rows={2} value={ship.notes} onChange={(e) => setShip({ ...ship, notes: e.target.value })} /></label>
            </div>
          </section>
        </div>

        <aside className="paper-card h-fit p-5 lg:sticky lg:top-20">
          <p className="label">Summary</p>
          <dl className="mt-3 space-y-1 font-mono text-xs">
            <div className="flex justify-between"><dt>{product.name}</dt><dd>{size.label.split('—')[0]}</dd></div>
            <div className="flex justify-between"><dt>Unit</dt><dd>{formatTnd(q.unitPrice)}</dd></div>
            <div className="flex justify-between"><dt>{q.quantity} × unit</dt><dd>{formatTnd(q.subtotal)}</dd></div>
            {q.setupFee > 0 && <div className="flex justify-between"><dt>Setup</dt><dd>{formatTnd(q.setupFee)}</dd></div>}
            <div className="flex justify-between"><dt>Delivery</dt><dd>{q.shipping ? formatTnd(q.shipping) : 'free'}</dd></div>
            <div className="flex justify-between border-t border-ink pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatTnd(q.total)}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-muted">Payment on delivery or by bank transfer. We confirm by phone before printing.</p>
          {error && <p className="mt-3 text-sm text-vermillion">{error}</p>}
          <button type="submit" className="btn btn-vermillion mt-5 w-full" disabled={busy || !files}>
            {busy ? 'Sending to the press…' : 'Place order'}
          </button>
        </aside>
      </form>
    </main>
  )
}
