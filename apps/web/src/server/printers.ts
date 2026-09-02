/**
 * Third-party print partner integration.
 *
 * Orders are received here, then handed to a `PrintProvider`. Today the only
 * provider is `manual`: the order sits in `received` until the shop hands it
 * to the printer (via the Supabase dashboard or a future admin page). A real
 * API-backed provider only needs to implement `submit`.
 */
import type { OrderRecord } from '@printai/core'

export interface PrintProvider {
  id: string
  submit(order: OrderRecord): Promise<{ printerRef: string; status: OrderRecord['status'] }>
}

export const manualProvider: PrintProvider = {
  id: 'manual',
  async submit(order) {
    // Nothing to call yet: the shop forwards the print files by hand.
    return { printerRef: `manual:${order.id}`, status: 'received' }
  },
}

export function getPrintProvider(): PrintProvider {
  return manualProvider
}
