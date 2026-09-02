/**
 * Product catalog. Everything a customer can print, with physical sizes,
 * print options and pricing tiers (TND). Textile products describe a print
 * area on top of a garment mockup.
 */

export type ProductKind = 'paper' | 'textile'

export type ProductCategory =
  | 'business'
  | 'invitations'
  | 'greetings'
  | 'certificates'
  | 'marketing'
  | 'apparel'
  | 'bags'

export interface ProductSize {
  id: string
  label: string
  /** trim size in mm */
  width: number
  height: number
}

export interface ProductOptionValue {
  id: string
  label: string
  /** multiplier on unit price, 1 = no change */
  priceFactor?: number
  /** flat surcharge per unit in TND */
  surcharge?: number
}

export interface ProductOptionGroup {
  id: string
  label: string
  values: ProductOptionValue[]
  defaultValue: string
}

export interface PriceTier {
  minQty: number
  /** TND per unit */
  unitPrice: number
}

export type Mockup = 'tshirt' | 'tote' | 'sachet'

export interface Product {
  slug: string
  name: string
  nameFr: string
  nameAr: string
  tagline: string
  description: string
  category: ProductCategory
  kind: ProductKind
  sizes: ProductSize[]
  sides: 1 | 2
  bleed: number
  minQty: number
  qtySteps: number[]
  options: ProductOptionGroup[]
  tiers: PriceTier[]
  /** flat one-off cost per order (plates, setup) */
  setupFee: number
  mockup?: Mockup
  garmentColors?: { id: string; label: string; hex: string }[]
  /** default document background for a fresh design */
  defaultBackground: string
  /** occasions this product is typically used for (for template browsing) */
  occasions: string[]
}

export const OCCASIONS: Record<string, { label: string; labelFr: string; emoji: string }> = {
  wedding: { label: 'Wedding', labelFr: 'Mariage', emoji: '💍' },
  engagement: { label: 'Engagement', labelFr: 'Fiançailles', emoji: '💐' },
  tahour: { label: 'Tahour / Circumcision', labelFr: 'Tahour', emoji: '🕊️' },
  graduation: { label: 'Graduation', labelFr: 'Remise de diplôme', emoji: '🎓' },
  birthday: { label: 'Birthday', labelFr: 'Anniversaire', emoji: '🎂' },
  aqiqa: { label: 'Newborn / Aqiqa', labelFr: 'Naissance', emoji: '🍼' },
  eid: { label: 'Eid & Ramadan', labelFr: 'Aïd & Ramadan', emoji: '🌙' },
  business: { label: 'Business', labelFr: 'Professionnel', emoji: '💼' },
  event: { label: 'Events', labelFr: 'Événements', emoji: '🎉' },
  thanks: { label: 'Thank you', labelFr: 'Remerciement', emoji: '🙏' },
  bachelorette: { label: 'Henna night', labelFr: 'Soirée henné', emoji: '✨' },
}

const paperStock: ProductOptionGroup = {
  id: 'stock',
  label: 'Paper',
  defaultValue: 'matte-300',
  values: [
    { id: 'matte-300', label: 'Matte 300g' },
    { id: 'glossy-300', label: 'Glossy 300g' },
    { id: 'cotton-350', label: 'Cotton textured 350g', priceFactor: 1.35 },
    { id: 'kraft-300', label: 'Kraft 300g', priceFactor: 1.15 },
  ],
}

const finish: ProductOptionGroup = {
  id: 'finish',
  label: 'Finish',
  defaultValue: 'none',
  values: [
    { id: 'none', label: 'None' },
    { id: 'soft-touch', label: 'Soft-touch lamination', priceFactor: 1.2 },
    { id: 'gold-foil', label: 'Gold foil accents', priceFactor: 1.6 },
    { id: 'rounded', label: 'Rounded corners', surcharge: 0.05 },
  ],
}

const printMethod: ProductOptionGroup = {
  id: 'method',
  label: 'Print method',
  defaultValue: 'dtf',
  values: [
    { id: 'dtf', label: 'DTF (full colour)' },
    { id: 'vinyl', label: 'Flex vinyl (1 colour)', priceFactor: 0.85 },
    { id: 'screen', label: 'Screen print (from 30 pcs)', priceFactor: 0.7 },
  ],
}

const teeSize: ProductOptionGroup = {
  id: 'size',
  label: 'Garment size',
  defaultValue: 'M',
  values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => ({ id: s, label: s })),
}

const kidsTeeSize: ProductOptionGroup = {
  id: 'size',
  label: 'Garment size',
  defaultValue: '6y',
  values: [
    { id: '2y', label: '2 years' },
    { id: '4y', label: '4 years' },
    { id: '6y', label: '6 years' },
    { id: '8y', label: '8 years' },
    { id: '10y', label: '10 years' },
    { id: '12y', label: '12 years' },
  ],
}

export const PRODUCTS: Product[] = [
  {
    slug: 'business-card',
    name: 'Business cards',
    nameFr: 'Cartes de visite',
    nameAr: 'بطاقات عمل',
    tagline: 'The 90×55 that opens doors.',
    description:
      'Double-sided cards on heavy stock. Matte, glossy, cotton or kraft, with optional gold foil and rounded corners.',
    category: 'business',
    kind: 'paper',
    sizes: [
      { id: 'eu', label: '90 × 55 mm (standard)', width: 90, height: 55 },
      { id: 'us', label: '89 × 51 mm (US)', width: 89, height: 51 },
      { id: 'square', label: '65 × 65 mm (square)', width: 65, height: 65 },
    ],
    sides: 2,
    bleed: 3,
    minQty: 100,
    qtySteps: [100, 250, 500, 1000],
    options: [paperStock, finish],
    tiers: [
      { minQty: 100, unitPrice: 0.28 },
      { minQty: 250, unitPrice: 0.2 },
      { minQty: 500, unitPrice: 0.15 },
      { minQty: 1000, unitPrice: 0.11 },
    ],
    setupFee: 5,
    defaultBackground: '#f7f2e8',
    occasions: ['business'],
  },
  {
    slug: 'invitation',
    name: 'Invitations',
    nameFr: 'Faire-part & invitations',
    nameAr: 'بطاقات دعوة',
    tagline: 'Weddings, tahour, graduations — printed like it matters.',
    description:
      'Flat invitation cards, one or two sides, on cotton or matte stock. Envelopes available on request.',
    category: 'invitations',
    kind: 'paper',
    sizes: [
      { id: 'a6', label: 'A6 — 105 × 148 mm', width: 105, height: 148 },
      { id: '5x7', label: '5 × 7 in — 127 × 178 mm', width: 127, height: 178 },
      { id: 'square', label: 'Square — 148 × 148 mm', width: 148, height: 148 },
      { id: 'dl', label: 'DL — 99 × 210 mm', width: 99, height: 210 },
    ],
    sides: 2,
    bleed: 3,
    minQty: 25,
    qtySteps: [25, 50, 100, 200, 500],
    options: [paperStock, finish],
    tiers: [
      { minQty: 25, unitPrice: 1.9 },
      { minQty: 50, unitPrice: 1.5 },
      { minQty: 100, unitPrice: 1.1 },
      { minQty: 200, unitPrice: 0.85 },
      { minQty: 500, unitPrice: 0.6 },
    ],
    setupFee: 8,
    defaultBackground: '#fbf7ef',
    occasions: ['wedding', 'engagement', 'tahour', 'graduation', 'birthday', 'aqiqa', 'bachelorette', 'event'],
  },
  {
    slug: 'greeting-card',
    name: 'Greeting & thank-you cards',
    nameFr: 'Cartes de vœux & remerciements',
    nameAr: 'بطاقات تهنئة',
    tagline: 'Eid, thank-you notes, and every mabrouk in between.',
    description: 'Flat cards for greetings, thank-you notes and place cards.',
    category: 'greetings',
    kind: 'paper',
    sizes: [
      { id: 'a6', label: 'A6 — 105 × 148 mm', width: 105, height: 148 },
      { id: 'a7', label: 'A7 — 74 × 105 mm', width: 74, height: 105 },
      { id: 'square', label: 'Square — 120 × 120 mm', width: 120, height: 120 },
    ],
    sides: 2,
    bleed: 3,
    minQty: 25,
    qtySteps: [25, 50, 100, 200],
    options: [paperStock, finish],
    tiers: [
      { minQty: 25, unitPrice: 1.4 },
      { minQty: 50, unitPrice: 1.1 },
      { minQty: 100, unitPrice: 0.8 },
      { minQty: 200, unitPrice: 0.6 },
    ],
    setupFee: 5,
    defaultBackground: '#fbf7ef',
    occasions: ['eid', 'thanks', 'birthday', 'aqiqa'],
  },
  {
    slug: 'certificate',
    name: 'Certificates & diplomas',
    nameFr: 'Certificats & diplômes',
    nameAr: 'شهادات',
    tagline: 'Framed-worthy, on 250g parchment.',
    description: 'Certificates of achievement, training attestations, awards. Printed on parchment or cotton.',
    category: 'certificates',
    kind: 'paper',
    sizes: [
      { id: 'a4l', label: 'A4 landscape — 297 × 210 mm', width: 297, height: 210 },
      { id: 'a4p', label: 'A4 portrait — 210 × 297 mm', width: 210, height: 297 },
      { id: 'a5l', label: 'A5 landscape — 210 × 148 mm', width: 210, height: 148 },
    ],
    sides: 1,
    bleed: 3,
    minQty: 1,
    qtySteps: [1, 5, 10, 25, 50, 100],
    options: [
      {
        id: 'stock',
        label: 'Paper',
        defaultValue: 'parchment-250',
        values: [
          { id: 'parchment-250', label: 'Parchment 250g' },
          { id: 'cotton-300', label: 'Cotton 300g', priceFactor: 1.2 },
          { id: 'matte-250', label: 'Matte 250g', priceFactor: 0.9 },
        ],
      },
      finish,
    ],
    tiers: [
      { minQty: 1, unitPrice: 6 },
      { minQty: 5, unitPrice: 4.5 },
      { minQty: 10, unitPrice: 3.5 },
      { minQty: 25, unitPrice: 2.6 },
      { minQty: 50, unitPrice: 2 },
      { minQty: 100, unitPrice: 1.5 },
    ],
    setupFee: 0,
    defaultBackground: '#fdf9f0',
    occasions: ['graduation', 'business', 'event'],
  },
  {
    slug: 'flyer',
    name: 'Flyers & posters',
    nameFr: 'Flyers & affiches',
    nameAr: 'منشورات',
    tagline: 'A5 to A3, for the shop, the show, the launch.',
    description: 'Single or double-sided flyers on 170g, posters on 200g.',
    category: 'marketing',
    kind: 'paper',
    sizes: [
      { id: 'a6', label: 'A6 — 105 × 148 mm', width: 105, height: 148 },
      { id: 'a5', label: 'A5 — 148 × 210 mm', width: 148, height: 210 },
      { id: 'a4', label: 'A4 — 210 × 297 mm', width: 210, height: 297 },
      { id: 'a3', label: 'A3 — 297 × 420 mm', width: 297, height: 420 },
    ],
    sides: 2,
    bleed: 3,
    minQty: 50,
    qtySteps: [50, 100, 250, 500, 1000],
    options: [
      {
        id: 'stock',
        label: 'Paper',
        defaultValue: 'glossy-170',
        values: [
          { id: 'glossy-170', label: 'Glossy 170g' },
          { id: 'matte-170', label: 'Matte 170g' },
          { id: 'recycled-150', label: 'Recycled 150g', priceFactor: 1.1 },
        ],
      },
    ],
    tiers: [
      { minQty: 50, unitPrice: 0.9 },
      { minQty: 100, unitPrice: 0.6 },
      { minQty: 250, unitPrice: 0.4 },
      { minQty: 500, unitPrice: 0.28 },
      { minQty: 1000, unitPrice: 0.19 },
    ],
    setupFee: 5,
    defaultBackground: '#ffffff',
    occasions: ['business', 'event'],
  },
  {
    slug: 'sticker',
    name: 'Stickers & labels',
    nameFr: 'Stickers & étiquettes',
    nameAr: 'ملصقات',
    tagline: 'Round, square, or die-cut. Jars, boxes, laptops.',
    description: 'Vinyl stickers and paper labels for packaging and branding.',
    category: 'marketing',
    kind: 'paper',
    sizes: [
      { id: 'r50', label: 'Round — 50 mm', width: 50, height: 50 },
      { id: 'sq60', label: 'Square — 60 mm', width: 60, height: 60 },
      { id: 'rect', label: 'Label — 80 × 50 mm', width: 80, height: 50 },
    ],
    sides: 1,
    bleed: 2,
    minQty: 50,
    qtySteps: [50, 100, 250, 500],
    options: [
      {
        id: 'material',
        label: 'Material',
        defaultValue: 'vinyl',
        values: [
          { id: 'vinyl', label: 'White vinyl' },
          { id: 'paper', label: 'Matte paper', priceFactor: 0.8 },
          { id: 'kraft', label: 'Kraft', priceFactor: 0.9 },
          { id: 'clear', label: 'Transparent', priceFactor: 1.2 },
        ],
      },
    ],
    tiers: [
      { minQty: 50, unitPrice: 0.45 },
      { minQty: 100, unitPrice: 0.32 },
      { minQty: 250, unitPrice: 0.22 },
      { minQty: 500, unitPrice: 0.15 },
    ],
    setupFee: 3,
    defaultBackground: '#ffffff',
    occasions: ['business', 'wedding', 'aqiqa', 'birthday'],
  },
  {
    slug: 'tshirt',
    name: 'T-shirts',
    nameFr: 'T-shirts',
    nameAr: 'تيشرت',
    tagline: 'Graduation squads, tahour crews, bachelorette nights.',
    description:
      '100% cotton 180g tees, printed front (and back on request). DTF full-colour, vinyl, or screen print for larger runs.',
    category: 'apparel',
    kind: 'textile',
    sizes: [
      { id: 'a4', label: 'Chest print — 210 × 297 mm', width: 210, height: 297 },
      { id: 'a3', label: 'Large print — 297 × 400 mm', width: 297, height: 400 },
      { id: 'pocket', label: 'Pocket print — 100 × 100 mm', width: 100, height: 100 },
    ],
    sides: 2,
    bleed: 0,
    minQty: 1,
    qtySteps: [1, 5, 10, 20, 30, 50, 100],
    options: [teeSize, printMethod],
    tiers: [
      { minQty: 1, unitPrice: 32 },
      { minQty: 5, unitPrice: 27 },
      { minQty: 10, unitPrice: 24 },
      { minQty: 20, unitPrice: 21 },
      { minQty: 30, unitPrice: 19 },
      { minQty: 50, unitPrice: 17 },
      { minQty: 100, unitPrice: 15 },
    ],
    setupFee: 0,
    mockup: 'tshirt',
    garmentColors: [
      { id: 'white', label: 'White', hex: '#f5f3ee' },
      { id: 'black', label: 'Black', hex: '#1c1b1a' },
      { id: 'navy', label: 'Navy', hex: '#1f2a44' },
      { id: 'sand', label: 'Sand', hex: '#d9c9a8' },
      { id: 'olive', label: 'Olive', hex: '#5b6644' },
      { id: 'burgundy', label: 'Burgundy', hex: '#6b1f2a' },
      { id: 'sky', label: 'Sky', hex: '#a9c7dd' },
      { id: 'rose', label: 'Rose', hex: '#e7b9c2' },
    ],
    defaultBackground: 'transparent',
    occasions: ['graduation', 'tahour', 'bachelorette', 'birthday', 'event', 'business'],
  },
  {
    slug: 'kids-tshirt',
    name: 'Kids T-shirts',
    nameFr: 'T-shirts enfant',
    nameAr: 'تيشرت أطفال',
    tagline: 'For the tahour, the birthday, the first day of school.',
    description: 'Soft cotton kids tees, 2 to 12 years. Full-colour DTF print.',
    category: 'apparel',
    kind: 'textile',
    sizes: [
      { id: 'a4', label: 'Chest print — 180 × 240 mm', width: 180, height: 240 },
      { id: 'pocket', label: 'Small print — 90 × 90 mm', width: 90, height: 90 },
    ],
    sides: 2,
    bleed: 0,
    minQty: 1,
    qtySteps: [1, 5, 10, 20, 30],
    options: [kidsTeeSize, printMethod],
    tiers: [
      { minQty: 1, unitPrice: 26 },
      { minQty: 5, unitPrice: 22 },
      { minQty: 10, unitPrice: 19 },
      { minQty: 20, unitPrice: 17 },
      { minQty: 30, unitPrice: 15 },
    ],
    setupFee: 0,
    mockup: 'tshirt',
    garmentColors: [
      { id: 'white', label: 'White', hex: '#f5f3ee' },
      { id: 'sky', label: 'Sky', hex: '#a9c7dd' },
      { id: 'rose', label: 'Rose', hex: '#e7b9c2' },
      { id: 'mint', label: 'Mint', hex: '#bfe0cf' },
      { id: 'butter', label: 'Butter', hex: '#f3e2a0' },
      { id: 'navy', label: 'Navy', hex: '#1f2a44' },
    ],
    defaultBackground: 'transparent',
    occasions: ['tahour', 'birthday', 'aqiqa'],
  },
  {
    slug: 'tote-bag',
    name: 'Tote bags',
    nameFr: 'Tote bags',
    nameAr: 'حقائب قماش',
    tagline: 'Cotton totes for weddings, shops and souvenirs.',
    description: 'Natural 220g cotton tote, 38 × 42 cm, long handles. One-side print.',
    category: 'bags',
    kind: 'textile',
    sizes: [{ id: 'std', label: 'Print area — 250 × 300 mm', width: 250, height: 300 }],
    sides: 1,
    bleed: 0,
    minQty: 1,
    qtySteps: [1, 10, 25, 50, 100, 200],
    options: [
      printMethod,
      {
        id: 'fabric',
        label: 'Fabric',
        defaultValue: 'natural',
        values: [
          { id: 'natural', label: 'Natural cotton' },
          { id: 'black', label: 'Black cotton', priceFactor: 1.1 },
          { id: 'canvas', label: 'Heavy canvas 320g', priceFactor: 1.4 },
        ],
      },
    ],
    tiers: [
      { minQty: 1, unitPrice: 24 },
      { minQty: 10, unitPrice: 18 },
      { minQty: 25, unitPrice: 15 },
      { minQty: 50, unitPrice: 12.5 },
      { minQty: 100, unitPrice: 10.5 },
      { minQty: 200, unitPrice: 9 },
    ],
    setupFee: 0,
    mockup: 'tote',
    garmentColors: [
      { id: 'natural', label: 'Natural', hex: '#e8dcc2' },
      { id: 'black', label: 'Black', hex: '#1c1b1a' },
      { id: 'olive', label: 'Olive', hex: '#5b6644' },
    ],
    defaultBackground: 'transparent',
    occasions: ['wedding', 'business', 'event', 'graduation'],
  },
  {
    slug: 'sachet',
    name: 'Gift sachets',
    nameFr: 'Sachets & pochons',
    nameAr: 'أكياس هدايا',
    tagline: 'Little cotton pouches for dragées, henna and favours.',
    description: 'Small drawstring cotton pouches printed with a name, date or motif. Perfect for tahour and wedding favours.',
    category: 'bags',
    kind: 'textile',
    sizes: [
      { id: 'small', label: 'Small — 80 × 110 mm print', width: 80, height: 110 },
      { id: 'medium', label: 'Medium — 110 × 150 mm print', width: 110, height: 150 },
    ],
    sides: 1,
    bleed: 0,
    minQty: 25,
    qtySteps: [25, 50, 100, 200, 500],
    options: [
      {
        id: 'method',
        label: 'Print method',
        defaultValue: 'dtf',
        values: [
          { id: 'dtf', label: 'DTF (full colour)' },
          { id: 'screen', label: 'Screen print (1 colour)', priceFactor: 0.75 },
        ],
      },
      {
        id: 'fabric',
        label: 'Fabric',
        defaultValue: 'cotton',
        values: [
          { id: 'cotton', label: 'Natural cotton' },
          { id: 'organza', label: 'Organza', priceFactor: 1.2 },
          { id: 'linen', label: 'Linen', priceFactor: 1.5 },
        ],
      },
    ],
    tiers: [
      { minQty: 25, unitPrice: 3.2 },
      { minQty: 50, unitPrice: 2.7 },
      { minQty: 100, unitPrice: 2.2 },
      { minQty: 200, unitPrice: 1.8 },
      { minQty: 500, unitPrice: 1.4 },
    ],
    setupFee: 10,
    mockup: 'sachet',
    garmentColors: [
      { id: 'natural', label: 'Natural', hex: '#efe6d3' },
      { id: 'white', label: 'White', hex: '#f8f6f1' },
      { id: 'blush', label: 'Blush', hex: '#f1d4d4' },
      { id: 'sage', label: 'Sage', hex: '#c9d6c1' },
      { id: 'navy', label: 'Navy', hex: '#26304a' },
    ],
    defaultBackground: 'transparent',
    occasions: ['tahour', 'wedding', 'aqiqa', 'eid', 'bachelorette'],
  },
]

export const CATEGORIES: Record<ProductCategory, { label: string; blurb: string }> = {
  business: { label: 'Business', blurb: 'Cards that get kept.' },
  invitations: { label: 'Invitations', blurb: 'For the big days.' },
  greetings: { label: 'Greetings', blurb: 'Small cards, big gestures.' },
  certificates: { label: 'Certificates', blurb: 'Worth framing.' },
  marketing: { label: 'Marketing', blurb: 'Flyers, posters, labels.' },
  apparel: { label: 'Apparel', blurb: 'Tees for the whole crew.' },
  bags: { label: 'Bags & sachets', blurb: 'Totes and favour pouches.' },
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}

export function getProductOrThrow(slug: string): Product {
  const p = getProduct(slug)
  if (!p) throw new Error(`Unknown product: ${slug}`)
  return p
}

export function getSize(product: Product, sizeId: string): ProductSize {
  return product.sizes.find((s) => s.id === sizeId) ?? product.sizes[0]!
}

export function defaultOptions(product: Product): Record<string, string> {
  return Object.fromEntries(product.options.map((g) => [g.id, g.defaultValue]))
}
