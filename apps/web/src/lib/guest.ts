import { nanoid } from 'nanoid'
import { isBrowser } from './env'

export const GUEST_COOKIE = 'matbaa_guest'
const ONE_YEAR = 60 * 60 * 24 * 365

/** Stable anonymous id stored in a cookie so guests keep their designs & orders. */
export function getGuestId(): string {
  if (!isBrowser) return ''
  const existing = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${GUEST_COOKIE}=`))
  if (existing) return decodeURIComponent(existing.split('=')[1]!)
  const id = `g_${nanoid(16)}`
  document.cookie = `${GUEST_COOKIE}=${encodeURIComponent(id)}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax`
  return id
}

export function parseGuestId(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${GUEST_COOKIE}=([^;]+)`))
  return m ? decodeURIComponent(m[1]!) : null
}
