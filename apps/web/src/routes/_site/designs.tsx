import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { getProduct, type DesignRecord } from '@printai/core'
import { DesignThumb } from '@/components/DesignThumb'
import { SectionHeading } from '@/components/Ornament'
import { deleteDesign, listDesigns } from '@/lib/designs-repo'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/_site/designs')({
  head: () => ({ meta: [{ title: 'My designs — Matbaa' }] }),
  component: DesignsPage,
})

function DesignsPage() {
  const { user, enabled, signInWithGoogle, loading } = useAuth()
  const [items, setItems] = useState<DesignRecord[] | null>(null)
  useEffect(() => {
    if (loading) return
    listDesigns().then(setItems)
  }, [user, loading])
  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <SectionHeading kicker="Studio" title="My designs" sub={user ? `Synced to ${user.email}.` : 'Saved in this browser. Sign in with Google to keep them on every device.'} />
      {!user && enabled && (
        <button className="btn btn-outline mb-8" onClick={() => void signInWithGoogle()}>Sign in with Google to sync</button>
      )}
      {items === null ? (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <div className="paper-card p-10 text-center">
          <p className="font-display text-2xl">Nothing on the press yet.</p>
          <Link to="/templates" search={{}} className="btn btn-ink mt-4">Start from a template</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((d) => (
            <div key={d.id} className="paper-card group relative flex flex-col overflow-hidden">
              <Link to="/editor/$designId" params={{ designId: d.id }} className="aspect-[4/5] p-4">
                <DesignThumb doc={d.document} className="h-full w-full" />
              </Link>
              <div className="flex items-center justify-between border-t border-line px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{d.title}</p>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-muted">{getProduct(d.productSlug)?.name} · {new Date(d.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1">
                  <Link to="/checkout/$designId" params={{ designId: d.id }} className="btn btn-outline btn-sm">Order</Link>
                  <button
                    className="btn btn-ghost btn-icon text-vermillion"
                    title="Delete"
                    onClick={async () => {
                      if (!confirm(`Delete “${d.title}”?`)) return
                      await deleteDesign(d.id)
                      setItems((x) => x?.filter((y) => y.id !== d.id) ?? null)
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
