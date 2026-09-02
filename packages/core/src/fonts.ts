/** Curated Google Fonts, grouped so the picker feels like a type case. */
export interface FontFace {
  family: string
  category: 'display' | 'serif' | 'sans' | 'script' | 'arabic' | 'mono'
  weights: number[]
  italic?: boolean
  /** hint for the font picker */
  sample?: string
}

export const FONTS: FontFace[] = [
  { family: 'Fraunces', category: 'serif', weights: [400, 500, 700, 900], italic: true },
  { family: 'Playfair Display', category: 'serif', weights: [400, 700, 900], italic: true },
  { family: 'Cormorant Garamond', category: 'serif', weights: [400, 500, 700], italic: true },
  { family: 'Libre Baskerville', category: 'serif', weights: [400, 700], italic: true },
  { family: 'Lora', category: 'serif', weights: [400, 700], italic: true },
  { family: 'Cinzel', category: 'display', weights: [400, 700, 900] },
  { family: 'Bebas Neue', category: 'display', weights: [400] },
  { family: 'Abril Fatface', category: 'display', weights: [400] },
  { family: 'Rye', category: 'display', weights: [400] },
  { family: 'Alfa Slab One', category: 'display', weights: [400] },
  { family: 'Montserrat', category: 'sans', weights: [400, 500, 700, 900] },
  { family: 'Inter', category: 'sans', weights: [400, 500, 700] },
  { family: 'Oswald', category: 'sans', weights: [400, 700] },
  { family: 'Poppins', category: 'sans', weights: [400, 600, 800] },
  { family: 'Great Vibes', category: 'script', weights: [400] },
  { family: 'Pinyon Script', category: 'script', weights: [400] },
  { family: 'Dancing Script', category: 'script', weights: [400, 700] },
  { family: 'Parisienne', category: 'script', weights: [400] },
  { family: 'Amiri', category: 'arabic', weights: [400, 700], italic: true, sample: 'مبروك' },
  { family: 'Aref Ruqaa', category: 'arabic', weights: [400, 700], sample: 'بسم الله' },
  { family: 'Reem Kufi', category: 'arabic', weights: [400, 700], sample: 'تهانينا' },
  { family: 'Cairo', category: 'arabic', weights: [400, 700, 900], sample: 'دعوة' },
  { family: 'Tajawal', category: 'arabic', weights: [400, 700], sample: 'حفل' },
  { family: 'Lateef', category: 'arabic', weights: [400, 700], sample: 'طهور' },
  { family: 'IBM Plex Mono', category: 'mono', weights: [400, 600] },
]

export const FONT_CATEGORY_LABELS: Record<FontFace['category'], string> = {
  display: 'Display',
  serif: 'Serif',
  sans: 'Sans',
  script: 'Script',
  arabic: 'Arabic',
  mono: 'Mono',
}

/** Build a single Google Fonts stylesheet URL for every curated face. */
export function googleFontsUrl(faces: FontFace[] = FONTS) {
  const families = faces.map((f) => {
    const w = f.weights
    const spec = f.italic
      ? `ital,wght@${[...w.map((x) => `0,${x}`), ...w.map((x) => `1,${x}`)].join(';')}`
      : `wght@${w.join(';')}`
    return `family=${encodeURIComponent(f.family).replace(/%20/g, '+')}:${spec}`
  })
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`
}

export function isArabic(text: string) {
  return /[؀-ۿ]/.test(text)
}
