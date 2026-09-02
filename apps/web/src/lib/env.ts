export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'http://localhost:3000'
export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
export const isBrowser = typeof window !== 'undefined'
