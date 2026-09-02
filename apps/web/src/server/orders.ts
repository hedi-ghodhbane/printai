import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { getProductOrThrow, quote, type OrderRecord } from '@printai/core'
import { adminClient, currentUserFromRequest, serverSupabaseEnabled } from './supabase-admin'
import { getPrintProvider } from './printers'
import { GUEST_COOKIE } from '@/lib/guest'

const shippingSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(6).max(30),
  email: z.string().email().optional().or(z.literal('')),
  addressLine: z.string().min(3).max(240),
  city: z.string().min(2).max(80),
  governorate: z.string().min(2).max(40),
  postalCode: z.string().max(12).optional(),
  notes: z.string().max(500).optional(),
})

const placeOrderSchema = z.object({
  designId: z.string().min(1),
  designTitle: z.string().max(200),
  productSlug: z.string().min(1),
  sizeId: z.string().min(1),
  quantity: z.number().int().positive(),
  options: z.record(z.string(), z.string()),
  shipping: shippingSchema,
  /** data: URLs of print-ready PNGs, one per side */
  printFiles: z.array(z.string()).min(1).max(4),
})

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>

export interface PlaceOrderResult {
  order: OrderRecord
  /** false when Supabase is not configured: the client keeps a local copy only */
  persisted: boolean
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; mime: string } {
  const m = dataUrl.match(/^data:([^;]+);base64,(.*)$/)
  if (!m) throw new Error('Expected a base64 data URL')
  return { mime: m[1]!, bytes: Uint8Array.from(Buffer.from(m[2]!, 'base64')) }
}

export const placeOrder = createServerFn({ method: 'POST' })
  .validator((input: unknown) => placeOrderSchema.parse(input))
  .handler(async ({ data }): Promise<PlaceOrderResult> => {
    const product = getProductOrThrow(data.productSlug)
    const q = quote({ product, quantity: data.quantity, options: data.options })
    const user = await currentUserFromRequest()
    const guestId = user ? null : (getCookie(GUEST_COOKIE) ?? null)
    const now = new Date().toISOString()
    const id = `ord_${nanoid(12)}`

    let printFileUrls = data.printFiles
    let persisted = false
    const admin = adminClient()

    if (admin && serverSupabaseEnabled) {
      // Upload print-ready files to storage so the printer can fetch them.
      const urls: string[] = []
      for (let i = 0; i < data.printFiles.length; i++) {
        const { bytes, mime } = dataUrlToBytes(data.printFiles[i]!)
        const ext = mime.split('/')[1] ?? 'png'
        const path = `${id}/side-${i + 1}.${ext}`
        const { error } = await admin.storage.from('print-files').upload(path, bytes, { contentType: mime, upsert: true })
        if (error) throw new Error(`Upload failed: ${error.message}`)
        urls.push(path)
      }
      printFileUrls = urls
    }

    let order: OrderRecord = {
      id,
      designId: data.designId,
      ownerId: user?.id ?? null,
      guestId,
      productSlug: product.slug,
      sizeId: data.sizeId,
      quantity: q.quantity,
      options: data.options,
      unitPrice: q.unitPrice,
      total: q.total,
      currency: 'TND',
      shipping: { ...data.shipping, email: data.shipping.email || user?.email || undefined },
      status: 'received',
      printFileUrls,
      printerRef: null,
      createdAt: now,
      updatedAt: now,
    }

    const handoff = await getPrintProvider().submit(order)
    order = { ...order, printerRef: handoff.printerRef, status: handoff.status }

    if (admin && serverSupabaseEnabled) {
      const { error } = await admin.from('orders').insert({
        id: order.id,
        design_id: order.designId,
        owner_id: order.ownerId,
        guest_id: order.guestId,
        product_slug: order.productSlug,
        size_id: order.sizeId,
        quantity: order.quantity,
        options: order.options,
        unit_price: order.unitPrice,
        total: order.total,
        currency: order.currency,
        shipping: order.shipping,
        status: order.status,
        print_file_urls: order.printFileUrls,
        printer_ref: order.printerRef,
        design_title: data.designTitle,
        created_at: order.createdAt,
        updated_at: order.updatedAt,
      })
      if (error) throw new Error(`Could not save order: ${error.message}`)
      persisted = true
    }

    return { order, persisted }
  })
