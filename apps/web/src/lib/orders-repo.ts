import { createStore, get, keys, set } from 'idb-keyval'
import type { OrderRecord } from '@printai/core'
import { isBrowser } from './env'
import { getSupabase } from './supabase'

const store = isBrowser ? createStore('matbaa-orders', 'orders') : undefined

type Row = {
  id: string
  design_id: string
  owner_id: string | null
  guest_id: string | null
  product_slug: string
  size_id: string
  quantity: number
  options: Record<string, string>
  unit_price: number
  total: number
  currency: 'TND'
  shipping: OrderRecord['shipping']
  status: OrderRecord['status']
  print_file_urls: string[]
  printer_ref: string | null
  created_at: string
  updated_at: string
}

export const orderFromRow = (r: Row): OrderRecord => ({
  id: r.id,
  designId: r.design_id,
  ownerId: r.owner_id,
  guestId: r.guest_id,
  productSlug: r.product_slug,
  sizeId: r.size_id,
  quantity: r.quantity,
  options: r.options,
  unitPrice: r.unit_price,
  total: r.total,
  currency: r.currency,
  shipping: r.shipping,
  status: r.status,
  printFileUrls: r.print_file_urls,
  printerRef: r.printer_ref,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

export async function rememberOrderLocally(order: OrderRecord) {
  if (store) await set(order.id, order, store)
}

export async function listOrders(): Promise<OrderRecord[]> {
  const out: OrderRecord[] = []
  if (store) {
    for (const k of await keys(store)) {
      const o = await get<OrderRecord>(k, store)
      if (o) out.push(o)
    }
  }
  const sb = getSupabase()
  if (sb) {
    const { data: s } = await sb.auth.getSession()
    const uid = s.session?.user.id
    if (uid) {
      const { data } = await sb.from('orders').select('*').eq('owner_id', uid)
      for (const row of (data ?? []) as Row[]) {
        const o = orderFromRow(row)
        const i = out.findIndex((x) => x.id === o.id)
        if (i >= 0) out[i] = o
        else out.push(o)
        if (store) await set(o.id, o, store)
      }
    }
  }
  return out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export async function getOrder(id: string): Promise<OrderRecord | null> {
  if (store) {
    const local = await get<OrderRecord>(id, store)
    if (local) return local
  }
  const sb = getSupabase()
  if (sb) {
    const { data } = await sb.from('orders').select('*').eq('id', id).maybeSingle()
    if (data) return orderFromRow(data as Row)
  }
  return null
}
