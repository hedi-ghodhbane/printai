import { ClientOnly, Link, createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useState } from 'react'
import type { DesignDocument } from '@printai/core'
import { getDesign } from '@/lib/designs-repo'

const EditorApp = lazy(() => import('@/editor/EditorApp').then((m) => ({ default: m.EditorApp })))

export const Route = createFileRoute('/editor/$designId')({
  head: () => ({ meta: [{ title: 'Editor — Matbaa' }] }),
  component: () => (
    <ClientOnly fallback={<Loading />}>
      <EditorLoader />
    </ClientOnly>
  ),
})

function Loading({ text = 'Inking the plates…' }: { text?: string }) {
  return (
    <main className="grid min-h-screen place-items-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{text}</p>
    </main>
  )
}

function EditorLoader() {
  const { designId } = Route.useParams()
  const [doc, setDoc] = useState<DesignDocument | null | undefined>(undefined)
  useEffect(() => {
    getDesign(designId).then((r) => setDoc(r?.document ?? null))
  }, [designId])
  if (doc === undefined) return <Loading />
  if (doc === null)
    return (
      <main className="grid min-h-screen place-items-center text-center">
        <div>
          <p className="kicker mb-2">Not found</p>
          <h1 className="text-3xl">This design isn't on this device.</h1>
          <p className="mt-2 text-ink-soft">Guest designs live in your browser. Sign in with Google to keep them everywhere.</p>
          <Link to="/templates" search={{}} className="btn btn-ink mt-6">Start a new one</Link>
        </div>
      </main>
    )
  return (
    <Suspense fallback={<Loading />}>
      <EditorApp initial={doc} />
    </Suspense>
  )
}
