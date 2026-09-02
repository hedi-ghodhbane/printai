import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { getCookies } from '@tanstack/react-start/server'

const url = process.env.VITE_SUPABASE_URL
const anon = process.env.VITE_SUPABASE_ANON_KEY
const service = process.env.SUPABASE_SERVICE_ROLE_KEY

export const serverSupabaseEnabled = Boolean(url && service)

/** Service-role client: bypasses RLS. Server-only. */
export function adminClient(): SupabaseClient | null {
  if (!url || !service) return null
  return createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } })
}

/** Resolve the signed-in user (if any) from the request cookies. */
export async function currentUserFromRequest(): Promise<{ id: string; email: string | null } | null> {
  if (!url || !anon) return null
  const cookies = getCookies()
  const sb = createServerClient(url, anon, {
    cookies: {
      getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
      setAll: () => {},
    },
  })
  const { data } = await sb.auth.getUser()
  return data.user ? { id: data.user.id, email: data.user.email ?? null } : null
}
