import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { CATEGORIES, OCCASIONS, defaultOptions, formatTnd, getProduct, quote, templatesFor } from '@printai/core'
import { DesignThumb } from '@/components/DesignThumb'
import { templatePreview } from '@/lib/previews'

export const Route = createFileRoute('/_site/products/$slug')({
  loader: ({ params }) => {
    const product = getProduct(params.slug)
    if (!product) throw notFound()
    return { slug: product.slug }
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${getProduct(loaderData?.slug ?? '')?.name ?? 'Product'} — Matbaa` }] }),
  component: ProductPage,
})

function ProductPage() {
  const { slug } = Route.useLoaderData()
  const product = getProduct(slug)!
  const [qty, setQty] = useState(product.qtySteps[1] ?? product.minQty)
  const [opts, setOpts] = useState<Record<string, string>>(defaultOptions(product))
  const [sizeId, setSizeId] = useState(product.sizes[0]!.id)
  const q = quote({ product, quantity: qty, options: opts })
  const templates = templatesFor({ productSlug: product.slug })

  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <p className="kicker mb-2">{CATEGORIES[product.category].label}</p>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <h1 className="text-4xl md:text-5xl">{product.name}</h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-muted">{product.nameFr} · {product.nameAr}</p>
          <p className="mt-4 max-w-2xl text-ink-soft">{product.description}</p>

          <div className="mt-8 flex flex-wrap gap-2">
            {product.occasions.map((o) => (
              <Link key={o} to="/templates" search={{ product: product.slug, occasion: o }} className="btn btn-outline btn-sm">
                {OCCASIONS[o]?.emoji} {OCCASIONS[o]?.label}
              </Link>
            ))}
          </div>

          <h2 className="mt-12 text-2xl">Templates for {product.name.toLowerCase()}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <Link key={t.id} to="/editor/new" search={{ template: t.id, size: sizeId }} className="paper-card overflow-hidden no-underline transition hover:-translate-y-0.5">
                <div className="aspect-[4/5] p-4">
                  <DesignThumb doc={templatePreview(t)} className="h-full w-full" />
                </div>
                <p className="border-t border-line px-4 py-2 text-sm font-semibold">{t.name}</p>
              </Link>
            ))}
            <Link to="/editor/new" search={{ product: product.slug, size: sizeId }} className="paper-card flex aspect-[4/5] flex-col items-center justify-center gap-2 border-dashed no-underline text-ink-soft transition hover:-translate-y-0.5 sm:aspect-auto">
              <span className="font-display text-4xl">+</span>
              <span className="text-sm">Blank {product.name.toLowerCase().replace(/s$/, '')}</span>
            </Link>
          </div>
        </div>

        <aside className="paper-card h-fit p-5 lg:sticky lg:top-20">
          <p className="label">Instant quote</p>
          <label className="mt-3 block">
            <span className="label">Size</span>
            <select className="field" value={sizeId} onChange={(e) => setSizeId(e.target.value)}>
              {product.sizes.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
          {product.options.map((g) => (
            <label key={g.id} className="mt-3 block">
              <span className="label">{g.label}</span>
              <select className="field" value={opts[g.id]} onChange={(e) => setOpts({ ...opts, [g.id]: e.target.value })}>
                {g.values.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
            </label>
          ))}
          <label className="mt-3 block">
            <span className="label">Quantity</span>
            <div className="flex flex-wrap gap-1">
              {product.qtySteps.map((n) => (
                <button key={n} type="button" onClick={() => setQty(n)} className={`btn btn-sm ${qty === n ? 'btn-ink' : 'btn-outline'}`}>{n}</button>
              ))}
            </div>
          </label>
          <dl className="mt-5 space-y-1 border-t border-line pt-4 font-mono text-xs">
            <div className="flex justify-between"><dt>Unit</dt><dd>{formatTnd(q.unitPrice)}</dd></div>
            <div className="flex justify-between"><dt>{q.quantity} × unit</dt><dd>{formatTnd(q.subtotal)}</dd></div>
            {q.setupFee > 0 && <div className="flex justify-between"><dt>Setup</dt><dd>{formatTnd(q.setupFee)}</dd></div>}
            <div className="flex justify-between"><dt>Delivery</dt><dd>{q.shipping ? formatTnd(q.shipping) : 'free'}</dd></div>
            <div className="flex justify-between border-t border-ink pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatTnd(q.total)}</dd></div>
          </dl>
          <Link to="/editor/new" search={{ product: product.slug, size: sizeId }} className="btn btn-vermillion mt-5 w-full">
            Design this <ArrowRight size={16} />
          </Link>
        </aside>
      </div>
    </main>
  )
}
