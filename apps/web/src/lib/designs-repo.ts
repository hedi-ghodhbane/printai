/**
 * Design storage. Local IndexedDB is always the working copy (so guests and
 * offline edits just work). When a user is signed in and Supabase is
 * configured, designs are mirrored to the `designs` table.
 */
import { createStore, del, get, keys, set } from 'idb-keyval'
import type { DesignDocument, DesignRecord } from '@printai/core'
import { isBrowser } from './env'
import { getSupabase } from './supabase'
import { getGuestId } from './guest'

const store = isBrowser ? createStore('matbaa-designs', 'designs') : undefined

type Row = {
  id: string
  owner_id: string | null
  guest_id: string | null
  product_slug: string
  title: string
  document: DesignDocument
  thumbnail: string | null
  created_at: string
  updated_at: string
}

const fromRow = (r: Row): DesignRecord => ({
  id: r.id,
  ownerId: r.owner_id,
  guestId: r.guest_id,
  productSlug: r.product_slug,
  title: r.title,
  document: r.document,
  thumbnail: r.thumbnail,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

const toRow = (d: DesignRecord): Row => ({
  id: d.id,
  owner_id: d.ownerId,
  guest_id: d.guestId,
  product_slug: d.productSlug,
  title: d.title,
  document: d.document,
  thumbnail: d.thumbnail ?? null,
  created_at: d.createdAt,
  updated_at: d.updatedAt,
})

async function currentUserId(): Promise<string | null> {
  const sb = getSupabase()
  if (!sb) return null
  const { data } = await sb.auth.getSession()
  return data.session?.user.id ?? null
}

export async function listDesigns(): Promise<DesignRecord[]> {
  if (!store) return []
  const local: DesignRecord[] = []
  for (const k of await keys(store)) {
    const rec = await get<DesignRecord>(k, store)
    if (rec) local.push(rec)
  }
  const userId = await currentUserId()
  const sb = getSupabase()
  if (sb && userId) {
    const { data } = await sb.from('designs').select('*').eq('owner_id', userId).order('updated_at', { ascending: false })
    if (data) {
      for (const row of data as Row[]) {
        const rec = fromRow(row)
        const existing = local.find((d) => d.id === rec.id)
        if (!existing || existing.updatedAt < rec.updatedAt) {
          await set(rec.id, rec, store)
          if (existing) Object.assign(existing, rec)
          else local.push(rec)
        }
      }
    }
  }
  return local.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export async function getDesign(id: string): Promise<DesignRecord | null> {
  if (!store) return null
  const local = await get<DesignRecord>(id, store)
  if (local) return local
  const sb = getSupabase()
  if (sb) {
    const { data } = await sb.from('designs').select('*').eq('id', id).maybeSingle()
    if (data) {
      const rec = fromRow(data as Row)
      await set(rec.id, rec, store)
      return rec
    }
  }
  return null
}

export async function saveDesign(document: DesignDocument, thumbnail?: string | null): Promise<DesignRecord> {
  const userId = await currentUserId()
  const existing = store ? await get<DesignRecord>(document.id, store) : undefined
  const now = new Date().toISOString()
  const rec: DesignRecord = {
    id: document.id,
    ownerId: userId ?? existing?.ownerId ?? null,
    guestId: existing?.guestId ?? getGuestId(),
    productSlug: document.productSlug,
    title: document.title,
    document: { ...document, updatedAt: now },
    thumbnail: thumbnail ?? existing?.thumbnail ?? null,
    createdAt: existing?.createdAt ?? document.createdAt ?? now,
    updatedAt: now,
  }
  if (store) await set(rec.id, rec, store)
  const sb = getSupabase()
  if (sb && userId) {
    await sb.from('designs').upsert(toRow(rec))
  }
  return rec
}

export async function deleteDesign(id: string): Promise<void> {
  if (store) await del(id, store)
  const sb = getSupabase()
  const userId = await currentUserId()
  if (sb && userId) await sb.from('designs').delete().eq('id', id).eq('owner_id', userId)
}

/** After sign-in: claim every local guest design for the new user. */
export async function syncLocalDesignsToRemote(userId: string): Promise<number> {
  const sb = getSupabase()
  if (!sb || !store) return 0
  let n = 0
  for (const k of await keys(store)) {
    const rec = await get<DesignRecord>(k, store)
    if (!rec || rec.ownerId) continue
    const claimed = { ...rec, ownerId: userId }
    await set(rec.id, claimed, store)
    const { error } = await sb.from('designs').upsert(toRow(claimed))
    if (!error) n++
  }
  return n
}
