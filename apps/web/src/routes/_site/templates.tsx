import { Link, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Search } from 'lucide-react'
import { OCCASIONS, PRODUCTS, getProduct, templatesFor } from '@printai/core'
import { DesignThumb } from '@/components/DesignThumb'
import { templatePreview } from '@/lib/previews'

const searchSchema = z.object({
  product: z.string().optional(),
  occasion: z.string().optional(),
  q: z.string().optional(),
})

export const Route = createFileRoute('/_site/templates')({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: 'Templates — Matbaa' }] }),
  component: TemplatesPage,
})

function TemplatesPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const list = templatesFor({ productSlug: search.product, occasion: search.occasion, query: search.q })
  const setSearch = (patch: Partial<typeof search>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })

  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <p className="kicker mb-2">Templates</p>
      <h1 className="text-4xl md:text-5xl">Start from an idea</h1>
      <p className="mt-2 max-w-xl text-ink-soft">Every template is fully editable: names, dates, fonts, colours, ornaments. Or start blank from any product.</p>

      <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <label className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="field pl-9"
            placeholder="Search: mariage, tahour, kraft, arabic…"
            defaultValue={search.q ?? ''}
            onChange={(e) => setSearch({ q: e.target.value || undefined })}
          />
        </label>
        <select className="field" value={search.product ?? ''} onChange={(e) => setSearch({ product: e.target.value || undefined })}>
          <option value="">All products</option>
          {PRODUCTS.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>
        <select className="field" value={search.occasion ?? ''} onChange={(e) => setSearch({ occasion: e.target.value || undefined })}>
          <option value="">All occasions</option>
          {Object.entries(OCCASIONS).map(([id, o]) => (
            <option key={id} value={id}>{o.emoji} {o.label}</option>
          ))}
        </select>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {search.product && (
          <Link to="/editor/new" search={{ product: search.product }} className="paper-card flex aspect-[4/5] flex-col items-center justify-center gap-2 border-dashed no-underline text-ink-soft transition hover:-translate-y-0.5">
            <span className="font-display text-5xl">+</span>
            <span className="text-sm">Blank {getProduct(search.product)?.name.toLowerCase()}</span>
          </Link>
        )}
        {list.map((t) => (
          <Link key={t.id} to="/editor/new" search={{ template: t.id }} className="paper-card group flex flex-col overflow-hidden no-underline transition hover:-translate-y-0.5">
            <div className="aspect-[4/5] p-4">
              <DesignThumb doc={templatePreview(t)} className="h-full w-full" />
            </div>
            <div className="flex items-center justify-between border-t border-line px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-muted">
                  {getProduct(t.productSlug)?.name} · {OCCASIONS[t.occasion]?.label}
                </p>
              </div>
              <span className="font-mono text-[0.6rem] uppercase text-muted">{t.lang}</span>
            </div>
          </Link>
        ))}
        {!list.length && <p className="col-span-full py-12 text-center text-muted">Nothing matches. Try another word or start blank.</p>}
      </div>
    </main>
  )
}
