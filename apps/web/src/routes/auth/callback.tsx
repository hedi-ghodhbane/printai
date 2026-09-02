import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { getSupabase } from '@/lib/supabase'

export const Route = createFileRoute('/auth/callback')({
  validateSearch: z.object({ code: z.string().optional(), next: z.string().optional(), error_description: z.string().optional() }),
  component: Callback,
})

function Callback() {
  const { code, next, error_description } = Route.useSearch()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(error_description ?? null)
  useEffect(() => {
    const sb = getSupabase()
    if (!sb || !code) return
    sb.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setError(error.message)
      else void navigate({ to: (next && next.startsWith('/') ? next : '/designs') as '/', replace: true })
    })
  }, [code, next, navigate])
  return (
    <main className="grid min-h-screen place-items-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{error ?? 'Signing you in…'}</p>
    </main>
  )
}
