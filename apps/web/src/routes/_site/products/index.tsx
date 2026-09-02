import { Link, createFileRoute } from '@tanstack/react-router'
import { CATEGORIES, PRODUCTS, type ProductCategory } from '@printai/core'
import { SectionHeading } from '@/components/Ornament'

export const Route = createFileRoute('/_site/products/')({ component: ProductsPage })

function ProductsPage() {
  const cats = Object.keys(CATEGORIES) as ProductCategory[]
  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <SectionHeading kicker="Catalogue" title="Products & prices" sub="All prices in TND, excluding delivery (8 TND flat, free from 150 TND)." />
      {cats.map((c) => {
        const items = PRODUCTS.filter((p) => p.category === c)
        if (!items.length) return null
        return (
          <section key={c} className="mb-12">
            <div className="mb-4 flex items-baseline gap-3 border-b border-ink pb-2">
              <h2 className="text-2xl">{CATEGORIES[c].label}</h2>
              <span className="text-sm text-muted">{CATEGORIES[c].blurb}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((p) => (
                <Link key={p.slug} to="/products/$slug" params={{ slug: p.slug }} className="paper-card grid gap-4 p-5 no-underline transition hover:-translate-y-0.5 sm:grid-cols-[1fr_auto]">
                  <div>
                    <h3 className="text-xl">{p.name}</h3>
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-muted">{p.nameFr} · {p.nameAr}</p>
                    <p className="mt-2 text-sm text-ink-soft">{p.description}</p>
                  </div>
                  <div className="text-right font-mono text-xs text-ink-soft">
                    <p className="label">from</p>
                    <p className="text-2xl font-semibold text-ink">{p.tiers[p.tiers.length - 1]!.unitPrice.toFixed(3)}</p>
                    <p>TND / pc</p>
                    <p className="mt-2">min. {p.minQty}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </main>
  )
}
