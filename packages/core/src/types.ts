/**
 * Design document model.
 *
 * Units: all geometry is in millimetres (mm) so a document maps 1:1 to the
 * physical print. Font sizes are in points (pt), as designers expect.
 * 1pt = 0.3527mm.
 */

export const PT_TO_MM = 0.352778
export const MM_PER_INCH = 25.4

export type ElementType = 'text' | 'rect' | 'ellipse' | 'line' | 'image'

export interface ElementBase {
  id: string
  type: ElementType
  name?: string
  /** top-left position in mm, relative to the side's top-left (bleed excluded) */
  x: number
  y: number
  width: number
  height: number
  /** degrees, clockwise */
  rotation: number
  opacity: number
  locked?: boolean
}

export type TextAlign = 'left' | 'center' | 'right'
export type FontWeight = 400 | 500 | 600 | 700 | 800 | 900
export type FontStyle = 'normal' | 'italic'

export interface TextElement extends ElementBase {
  type: 'text'
  text: string
  fontFamily: string
  /** points */
  fontSize: number
  fontWeight: FontWeight
  fontStyle: FontStyle
  fill: string
  align: TextAlign
  /** multiplier, e.g. 1.2 */
  lineHeight: number
  /** em fraction, e.g. 0.05 */
  letterSpacing: number
  uppercase?: boolean
}

export interface RectElement extends ElementBase {
  type: 'rect'
  fill: string
  stroke: string
  /** mm */
  strokeWidth: number
  /** mm */
  cornerRadius: number
}

export interface EllipseElement extends ElementBase {
  type: 'ellipse'
  fill: string
  stroke: string
  strokeWidth: number
}

export interface LineElement extends ElementBase {
  type: 'line'
  stroke: string
  strokeWidth: number
  dash?: number[]
}

export interface ImageElement extends ElementBase {
  type: 'image'
  /** data URL or https URL */
  src: string
  fit: 'cover' | 'contain'
  cornerRadius: number
}

export type DesignElement =
  | TextElement
  | RectElement
  | EllipseElement
  | LineElement
  | ImageElement

export interface DesignSide {
  id: string
  name: string
  /** CSS colour. For textile products this is the ink surface; garment colour lives on the document. */
  background: string
  elements: DesignElement[]
}

export interface DesignDocument {
  version: 1
  id: string
  title: string
  productSlug: string
  sizeId: string
  /** trim size in mm */
  width: number
  height: number
  /** extra mm on each edge that the printer trims away */
  bleed: number
  sides: DesignSide[]
  /** for apparel/bags: colour of the garment behind the print */
  garmentColor?: string
  /** template this design was started from, if any */
  templateId?: string
  createdAt: string
  updatedAt: string
}

/** A stored design plus who owns it. */
export interface DesignRecord {
  id: string
  ownerId: string | null
  guestId: string | null
  productSlug: string
  title: string
  document: DesignDocument
  thumbnail?: string | null
  createdAt: string
  updatedAt: string
}

export type OrderStatus =
  | 'received'
  | 'sent_to_printer'
  | 'printing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface ShippingAddress {
  fullName: string
  phone: string
  email?: string
  addressLine: string
  city: string
  governorate: string
  postalCode?: string
  notes?: string
}

export interface OrderRecord {
  id: string
  designId: string
  ownerId: string | null
  guestId: string | null
  productSlug: string
  sizeId: string
  quantity: number
  /** option group id -> chosen value id */
  options: Record<string, string>
  /** millimes-free price in TND */
  unitPrice: number
  total: number
  currency: 'TND'
  shipping: ShippingAddress
  status: OrderStatus
  printFileUrls: string[]
  /** id at the third-party printer once handed off */
  printerRef?: string | null
  createdAt: string
  updatedAt: string
}
