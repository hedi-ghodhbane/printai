import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { SITE_URL, supabaseEnabled } from './env'
import { getSupabase } from './supabase'
import { getGuestId } from './guest'
import { syncLocalDesignsToRemote } from './designs-repo'

export interface AppUser {
  id: string
  email: string | null
  name: string | null
  avatarUrl: string | null
}

interface AuthState {
  user: AppUser | null
  guestId: string
  loading: boolean
  enabled: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

function toUser(session: Session | null): AppUser | null {
  if (!session?.user) return null
  const u = session.user
  const meta = (u.user_metadata ?? {}) as Record<string, string | undefined>
  return {
    id: u.id,
    email: u.email ?? null,
    name: meta.full_name ?? meta.name ?? null,
    avatarUrl: meta.avatar_url ?? meta.picture ?? null,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [guestId, setGuestId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setGuestId(getGuestId())
    const sb = getSupabase()
    if (!sb) {
      setLoading(false)
      return
    }
    let unsub = () => {}
    sb.auth.getSession().then(({ data }) => {
      setUser(toUser(data.session))
      setLoading(false)
    })
    const { data } = sb.auth.onAuthStateChange((event, session) => {
      const next = toUser(session)
      setUser(next)
      if (event === 'SIGNED_IN' && next) void syncLocalDesignsToRemote(next.id)
    })
    unsub = () => data.subscription.unsubscribe()
    return () => unsub()
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user,
      guestId,
      loading,
      enabled: supabaseEnabled,
      async signInWithGoogle() {
        const sb = getSupabase()
        if (!sb) throw new Error('Supabase is not configured')
        const next = typeof window !== 'undefined' ? window.location.pathname : '/'
        await sb.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}` },
        })
      },
      async signOut() {
        await getSupabase()?.auth.signOut()
        setUser(null)
      },
    }),
    [user, guestId, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
