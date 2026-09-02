import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { createDocument, documentFromTemplate, getProduct, getTemplate } from '@printai/core'
import { saveDesign } from '@/lib/designs-repo'

const search = z.object({
  template: z.string().optional(),
  product: z.string().optional(),
  size: z.string().optional(),
})

export const Route = createFileRoute('/editor/new')({
  validateSearch: search,
  component: NewDesign,
})

function NewDesign() {
  const { template, product, size } = Route.useSearch()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const t = template ? getTemplate(template) : undefined
        const p = getProduct(product ?? t?.productSlug ?? 'invitation')
        if (!p) throw new Error('Unknown product')
        const doc = t ? documentFromTemplate(t, { sizeId: size }) : createDocument({ product: p, sizeId: size })
        await saveDesign(doc)
        if (!cancelled) void navigate({ to: '/editor/$designId', params: { designId: doc.id }, replace: true })
      } catch (e) {
        setError((e as Error).message)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [template, product, size, navigate])
  return (
    <main className="grid min-h-screen place-items-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{error ?? 'Setting the type…'}</p>
    </main>
  )
}
