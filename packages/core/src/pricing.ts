import type { Product } from './products.ts'

export interface QuoteInput {
  product: Product
  quantity: number
  options: Record<string, string>
  governorate?: string
}

export interface Quote {
  quantity: number
  unitPrice: number
  subtotal: number
  setupFee: number
  shipping: number
  total: number
  currency: 'TND'
}

/** Flat shipping across Tunisia, free above a threshold. */
export const SHIPPING_FLAT = 8
export const FREE_SHIPPING_FROM = 150

export function tierFor(product: Product, quantity: number) {
  let tier = product.tiers[0]!
  for (const t of product.tiers) if (quantity >= t.minQty) tier = t
  return tier
}

export function quote({ product, quantity, options }: QuoteInput): Quote {
  const qty = Math.max(product.minQty, Math.round(quantity) || product.minQty)
  let unit = tierFor(product, qty).unitPrice
  let surcharge = 0
  for (const group of product.options) {
    const value = group.values.find((v) => v.id === options[group.id]) ?? group.values.find((v) => v.id === group.defaultValue)
    if (!value) continue
    if (value.priceFactor) unit *= value.priceFactor
    if (value.surcharge) surcharge += value.surcharge
  }
  unit = round3(unit + surcharge)
  const subtotal = round3(unit * qty)
  const setupFee = product.setupFee
  const shipping = subtotal + setupFee >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FLAT
  return {
    quantity: qty,
    unitPrice: unit,
    subtotal,
    setupFee,
    shipping,
    total: round3(subtotal + setupFee + shipping),
    currency: 'TND',
  }
}

export function formatTnd(amount: number) {
  return `${amount.toFixed(3).replace(/\.?0+$/, (m) => (m.startsWith('.') ? '' : m))} TND`
}

function round3(n: number) {
  return Math.round(n * 1000) / 1000
}

export const GOVERNORATES = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte', 'Béja', 'Jendouba',
  'Le Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine',
  'Sidi Bouzid', 'Gabès', 'Médenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kébili',
]
