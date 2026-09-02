import type { OrderStatus } from '@printai/core'

export const STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Received',
  sent_to_printer: 'At the press',
  printing: 'Printing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const STATUS_ORDER: OrderStatus[] = ['received', 'sent_to_printer', 'printing', 'shipped', 'delivered']

export function StatusStamp({ status }: { status: OrderStatus }) {
  const color = status === 'cancelled' ? 'text-muted' : status === 'delivered' ? 'text-sage' : 'text-vermillion'
  return <span className={`stamp ${color}`}>{STATUS_LABELS[status]}</span>
}
