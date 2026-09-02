import type {
  DesignDocument,
  DesignElement,
  DesignSide,
  EllipseElement,
  ImageElement,
  LineElement,
  RectElement,
  TextElement,
} from './types.ts'
import { getProductOrThrow, getSize, type Product } from './products.ts'

export function uid(prefix = 'el'): string {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}_${rnd}`
}

const base = (x: number, y: number, width: number, height: number) => ({
  id: uid(),
  x,
  y,
  width,
  height,
  rotation: 0,
  opacity: 1,
})

export type TextInit = Partial<Omit<TextElement, 'type' | 'id'>> & {
  x: number
  y: number
  width: number
  text: string
}

export function text(init: TextInit): TextElement {
  const fontSize = init.fontSize ?? 12
  const lineHeight = init.lineHeight ?? 1.2
  const lines = init.text.split('\n').length
  const height = init.height ?? fontSize * 0.352778 * lineHeight * lines + 1
  return {
    ...base(init.x, init.y, init.width, height),
    type: 'text',
    text: init.text,
    fontFamily: init.fontFamily ?? 'Fraunces',
    fontSize,
    fontWeight: init.fontWeight ?? 400,
    fontStyle: init.fontStyle ?? 'normal',
    fill: init.fill ?? '#1a1714',
    align: init.align ?? 'center',
    lineHeight,
    letterSpacing: init.letterSpacing ?? 0,
    uppercase: init.uppercase,
    name: init.name,
    rotation: init.rotation ?? 0,
    opacity: init.opacity ?? 1,
    locked: init.locked,
  }
}

export function rect(init: Partial<Omit<RectElement, 'type' | 'id'>> & { x: number; y: number; width: number; height: number }): RectElement {
  return {
    ...base(init.x, init.y, init.width, init.height),
    type: 'rect',
    fill: init.fill ?? 'transparent',
    stroke: init.stroke ?? 'transparent',
    strokeWidth: init.strokeWidth ?? 0,
    cornerRadius: init.cornerRadius ?? 0,
    name: init.name,
    rotation: init.rotation ?? 0,
    opacity: init.opacity ?? 1,
    locked: init.locked,
  }
}

export function ellipse(init: Partial<Omit<EllipseElement, 'type' | 'id'>> & { x: number; y: number; width: number; height: number }): EllipseElement {
  return {
    ...base(init.x, init.y, init.width, init.height),
    type: 'ellipse',
    fill: init.fill ?? '#1a1714',
    stroke: init.stroke ?? 'transparent',
    strokeWidth: init.strokeWidth ?? 0,
    name: init.name,
    rotation: init.rotation ?? 0,
    opacity: init.opacity ?? 1,
    locked: init.locked,
  }
}

export function line(init: Partial<Omit<LineElement, 'type' | 'id'>> & { x: number; y: number; width: number }): LineElement {
  return {
    ...base(init.x, init.y, init.width, init.height ?? 0),
    type: 'line',
    stroke: init.stroke ?? '#1a1714',
    strokeWidth: init.strokeWidth ?? 0.3,
    dash: init.dash,
    name: init.name,
    rotation: init.rotation ?? 0,
    opacity: init.opacity ?? 1,
    locked: init.locked,
  }
}

export function image(init: Partial<Omit<ImageElement, 'type' | 'id'>> & { x: number; y: number; width: number; height: number; src: string }): ImageElement {
  return {
    ...base(init.x, init.y, init.width, init.height),
    type: 'image',
    src: init.src,
    fit: init.fit ?? 'cover',
    cornerRadius: init.cornerRadius ?? 0,
    name: init.name,
    rotation: init.rotation ?? 0,
    opacity: init.opacity ?? 1,
    locked: init.locked,
  }
}

export function side(name: string, background: string, elements: DesignElement[] = []): DesignSide {
  return { id: uid('side'), name, background, elements }
}

export interface CreateDocumentInput {
  product: Product | string
  sizeId?: string
  title?: string
  sides?: DesignSide[]
  garmentColor?: string
  templateId?: string
}

export function createDocument(input: CreateDocumentInput): DesignDocument {
  const product = typeof input.product === 'string' ? getProductOrThrow(input.product) : input.product
  const size = getSize(product, input.sizeId ?? product.sizes[0]!.id)
  const now = new Date().toISOString()
  const sideNames = product.sides === 2 ? ['Front', 'Back'] : ['Front']
  const sides =
    input.sides ??
    sideNames.map((n) => side(n, product.defaultBackground))
  return {
    version: 1,
    id: uid('dsg'),
    title: input.title ?? `Untitled ${product.name.toLowerCase()}`,
    productSlug: product.slug,
    sizeId: size.id,
    width: size.width,
    height: size.height,
    bleed: product.bleed,
    sides,
    garmentColor: input.garmentColor ?? product.garmentColors?.[0]?.hex,
    templateId: input.templateId,
    createdAt: now,
    updatedAt: now,
  }
}

/** Deep clone with fresh ids — used when instantiating a template. */
export function cloneDocumentWithNewIds(doc: DesignDocument, overrides: Partial<DesignDocument> = {}): DesignDocument {
  const now = new Date().toISOString()
  return {
    ...structuredClone(doc),
    id: uid('dsg'),
    sides: doc.sides.map((s) => ({
      ...structuredClone(s),
      id: uid('side'),
      elements: s.elements.map((e) => ({ ...structuredClone(e), id: uid() })),
    })),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/** Fonts referenced by a document (for preloading). */
export function fontsInDocument(doc: DesignDocument): string[] {
  const set = new Set<string>()
  for (const s of doc.sides) for (const e of s.elements) if (e.type === 'text') set.add(e.fontFamily)
  return [...set]
}

export function elementLabel(e: DesignElement): string {
  if (e.name) return e.name
  switch (e.type) {
    case 'text':
      return e.text.split('\n')[0]!.slice(0, 24) || 'Text'
    case 'rect':
      return 'Rectangle'
    case 'ellipse':
      return 'Ellipse'
    case 'line':
      return 'Line'
    case 'image':
      return 'Image'
  }
}
