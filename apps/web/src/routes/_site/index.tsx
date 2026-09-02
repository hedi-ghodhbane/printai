import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Sparkles } from 'lucide-react'
import { CATEGORIES, OCCASIONS, PRODUCTS, TEMPLATES } from '@printai/core'
import { DesignThumb } from '@/components/DesignThumb'
import { Ornament, SectionHeading } from '@/components/Ornament'
import { templatePreview } from '@/lib/previews'

export const Route = createFileRoute('/_site/')({ component: Home })

const FEATURED = ['inv-wedding-classic', 'tee-grad-class', 'bc-letterpress', 'inv-tahour-prince', 'sachet-tahour', 'cert-classic', 'tote-shop', 'gc-eid']

function Home() {
  const featured = FEATURED.map((id) => TEMPLATES.find((t) => t.id === id)!).filter(Boolean)
  return (
    <main>
      {/* hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
          <div className="rise">
            <p className="kicker mb-4">Custom printing · Tunisia</p>
            <h1 className="text-5xl leading-[1.02] md:text-7xl">
              Printed like it <em className="font-light italic text-vermillion">matters.</em>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ink-soft">
              Business cards, wedding and tahour invitations, certificates, t-shirts for the graduation crew, tote bags and favour sachets.
              Start from a ready-made idea, make it yours in minutes, and we handle the press.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/templates" search={{}} className="btn btn-ink">
                Browse ideas <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="btn btn-outline">
                See products & prices
              </Link>
            </div>
            <p className="mt-6 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">No account needed · Google sign-in to sync · Delivery across Tunisia</p>
          </div>
          <div className="relative grid grid-cols-2 gap-4 rise" style={{ animationDelay: '120ms' }}>
            {featured.slice(0, 4).map((t, i) => (
              <Link
                key={t.id}
                to="/editor/new"
                search={{ template: t.id }}
                className="paper-card group aspect-[4/5] overflow-hidden p-3 transition hover:-translate-y-1"
                style={{ transform: `rotate(${[-2, 1.5, 1, -1.5][i]}deg)` }}
              >
                <DesignThumb doc={templatePreview(t)} className="h-full w-full" />
              </Link>
            ))}
            <span className="stamp absolute -right-3 top-3 bg-paper text-vermillion">fresh off the press</span>
          </div>
        </div>
      </section>

      {/* products */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading kicker="The catalogue" title="What we print" sub="Paper and textile, small runs welcome. Prices in TND, quantity discounts built in." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((p) => (
            <Link key={p.slug} to="/products/$slug" params={{ slug: p.slug }} className="paper-card group flex flex-col p-5 no-underline transition hover:-translate-y-0.5">
              <p className="kicker mb-2 text-muted">{CATEGORIES[p.category].label}</p>
              <h3 className="text-xl">{p.name}</h3>
              <p className="mt-1 text-sm text-ink-soft">{p.tagline}</p>
              <p className="mt-auto pt-4 font-mono text-xs text-ink-soft">
                from <span className="font-semibold text-ink">{p.tiers[p.tiers.length - 1]!.unitPrice.toFixed(3)} TND</span> / pc
              </p>
            </Link>
          ))}
        </div>
      </section>

      <Ornament className="mx-auto max-w-6xl px-5" />

      {/* occasions */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading kicker="Occasions" title="Every mabrouk deserves paper" sub="Templates grouped by the moments we print for most." />
        <div className="flex flex-wrap gap-2">
          {Object.entries(OCCASIONS).map(([id, o]) => (
            <Link key={id} to="/templates" search={{ occasion: id }} className="btn btn-outline">
              <span>{o.emoji}</span> {o.label}
            </Link>
          ))}
        </div>
      </section>

      {/* featured templates */}
      <section className="border-y border-line bg-paper-2/60">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <SectionHeading kicker="Start from an idea" title="Ready-made, ready to change" sub="Pick a template, swap the names and dates, choose your paper. Every text, colour and ornament stays editable." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((t) => (
              <Link key={t.id} to="/editor/new" search={{ template: t.id }} className="paper-card group flex flex-col overflow-hidden no-underline transition hover:-translate-y-0.5">
                <div className="aspect-[4/5] p-4">
                  <DesignThumb doc={templatePreview(t)} className="h-full w-full" />
                </div>
                <div className="border-t border-line px-4 py-3">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-muted">{OCCASIONS[t.occasion]?.label}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/templates" search={{}} className="btn btn-ink">All templates <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading kicker="How it works" title="From idea to doorstep" />
        <ol className="grid gap-6 md:grid-cols-3">
          {[
            ['01', 'Design', 'Start from a template or a blank sheet. Add text in Arabic or French, your photos, your colours.'],
            ['02', 'We print', 'We prepare print-ready files at 300 dpi and hand them to our partner presses: offset for paper, DTF and screen for textile.'],
            ['03', 'Delivered', 'Shipped anywhere in Tunisia. Track the order from received to delivered.'],
          ].map(([n, t, d]) => (
            <li key={n} className="paper-card p-6">
              <p className="font-display text-4xl text-vermillion">{n}</p>
              <h3 className="mt-2 text-xl">{t}</h3>
              <p className="mt-2 text-sm text-ink-soft">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* AI teaser */}
      <section className="mx-auto max-w-6xl px-5 pb-8">
        <div className="paper-card flex flex-col items-start gap-4 border-dashed p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="kicker mb-1"><Sparkles size={12} className="mr-1 inline" /> Coming soon</p>
            <h3 className="text-2xl">Tell us about the occasion, get three designs back.</h3>
            <p className="mt-1 text-sm text-ink-soft">The assistant will draft copy, pick a palette and suggest a layout. Today, the Ideas panel in the editor gives you a curated head start.</p>
          </div>
          <Link to="/templates" search={{}} className="btn btn-outline">Try the editor</Link>
        </div>
      </section>
    </main>
  )
}
