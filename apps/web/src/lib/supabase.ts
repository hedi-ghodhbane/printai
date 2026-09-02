import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isBrowser, supabaseEnabled } from './env'

let client: SupabaseClient | null = null

/** Browser Supabase client (cookie-based session so server functions can read it later). */
export function getSupabase(): SupabaseClient | null {
  if (!isBrowser || !supabaseEnabled) return null
  if (!client) client = createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  return client
}
