/**
 * Built-in templates — the "start from an idea" gallery.
 * Each template builds a document for a given product size, so the same
 * design adapts to A6 / 5x7 / square etc.
 */
import { createDocument, ellipse, line, rect, side, text } from './document.ts'
import { getProductOrThrow, getSize } from './products.ts'
import type { DesignDocument, DesignElement, DesignSide } from './types.ts'

export interface Template {
  id: string
  name: string
  productSlug: string
  sizeId?: string
  occasion: string
  tags: string[]
  lang: 'fr' | 'ar' | 'en' | 'bi'
  garmentColor?: string
  build: (w: number, h: number) => DesignSide[]
}

// ---- helpers -------------------------------------------------------------

const INK = '#1a1714'
const VERMILLION = '#b5382a'
const GOLD = '#c9a24d'
const CREAM = '#f7f2e8'

function frame(w: number, h: number, inset: number, stroke: string, strokeWidth = 0.4, radius = 0): DesignElement {
  return rect({ x: inset, y: inset, width: w - inset * 2, height: h - inset * 2, stroke, strokeWidth, cornerRadius: radius, name: 'Frame', locked: true })
}

function doubleFrame(w: number, h: number, inset: number, stroke: string): DesignElement[] {
  return [frame(w, h, inset, stroke, 0.7), frame(w, h, inset + 1.6, stroke, 0.25)]
}

function ornament(x: number, y: number, w: number, glyph: string, fill: string, size = 18, font = 'Fraunces'): DesignElement {
  return text({ x, y, width: w, text: glyph, fontFamily: font, fontSize: size, fill, align: 'center', name: 'Ornament' })
}

function rule(x: number, y: number, w: number, stroke: string, sw = 0.35): DesignElement {
  return line({ x, y, width: w, stroke, strokeWidth: sw, name: 'Rule' })
}

const cx = (w: number, elW: number) => (w - elW) / 2

// ---- business cards --------------------------------------------------------

const bcLetterpress: Template = {
  id: 'bc-letterpress',
  name: 'Letterpress minimal',
  productSlug: 'business-card',
  occasion: 'business',
  tags: ['minimal', 'serif', 'classic'],
  lang: 'fr',
  build: (w, h) => [
    side('Front', CREAM, [
      rule(8, h / 2 + 4, w - 16, VERMILLION, 0.5),
      text({ x: 8, y: h / 2 - 14, width: w - 16, text: 'Amina Ben Salah', fontFamily: 'Fraunces', fontSize: 15, fontWeight: 500, align: 'left', fill: INK }),
      text({ x: 8, y: h / 2 - 6, width: w - 16, text: 'Architecte d’intérieur', fontFamily: 'IBM Plex Mono', fontSize: 6.5, align: 'left', fill: '#6b6259', letterSpacing: 0.08, uppercase: true }),
      text({ x: 8, y: h / 2 + 7, width: w - 16, text: '+216 22 123 456\namina@atelier.tn · atelier.tn', fontFamily: 'IBM Plex Mono', fontSize: 6, align: 'left', fill: INK, lineHeight: 1.5 }),
    ]),
    side('Back', INK, [
      text({ x: 8, y: h / 2 - 9, width: w - 16, text: 'ATELIER', fontFamily: 'Cinzel', fontSize: 22, fontWeight: 700, fill: CREAM, letterSpacing: 0.3 }),
      ornament(cx(w, 30), h / 2 + 4, 30, '❦', GOLD, 12),
    ]),
  ],
}

const bcArtisan: Template = {
  id: 'bc-artisan',
  name: 'Artisan stamp',
  productSlug: 'business-card',
  occasion: 'business',
  tags: ['kraft', 'stamp', 'artisan'],
  lang: 'fr',
  build: (w, h) => [
    side('Front', '#d9c3a0', [
      ...doubleFrame(w, h, 4, '#5a3d24'),
      ellipse({ x: cx(w, 30), y: 6, width: 30, height: 30, fill: 'transparent', stroke: '#5a3d24', strokeWidth: 0.9, name: 'Seal' }),
      text({ x: cx(w, 30), y: 14, width: 30, text: 'DAR\nZITOUN', fontFamily: 'Rye', fontSize: 8, fill: '#5a3d24', lineHeight: 1.1 }),
      text({ x: 6, y: h - 16, width: w - 12, text: 'Huile d’olive · Sfax', fontFamily: 'Fraunces', fontSize: 8, fontStyle: 'italic', fill: '#5a3d24' }),
      text({ x: 6, y: h - 10, width: w - 12, text: 'darzitoun.tn · +216 74 000 000', fontFamily: 'IBM Plex Mono', fontSize: 5.5, fill: '#5a3d24' }),
    ]),
    side('Back', '#5a3d24', [
      text({ x: 6, y: h / 2 - 8, width: w - 12, text: 'Pressée à froid depuis 1952', fontFamily: 'Fraunces', fontSize: 11, fontStyle: 'italic', fill: '#d9c3a0' }),
      rule(w / 2 - 12, h / 2 + 6, 24, '#d9c3a0', 0.4),
    ]),
  ],
}

const bcMono: Template = {
  id: 'bc-mono',
  name: 'Modern mono',
  productSlug: 'business-card',
  occasion: 'business',
  tags: ['modern', 'mono', 'grid'],
  lang: 'en',
  build: (w, h) => [
    side('Front', '#ffffff', [
      rect({ x: 0, y: 0, width: 6, height: h, fill: INK, locked: true, name: 'Bar' }),
      text({ x: 12, y: 8, width: w - 18, text: 'YASSINE TRABELSI', fontFamily: 'Montserrat', fontSize: 9, fontWeight: 700, align: 'left', fill: INK, letterSpacing: 0.12 }),
      text({ x: 12, y: 14, width: w - 18, text: 'Product designer', fontFamily: 'IBM Plex Mono', fontSize: 6, align: 'left', fill: '#6b6259' }),
      text({ x: 12, y: h - 20, width: w - 18, text: 'T  +216 55 000 111\nE  hi@yassine.design\nW  yassine.design', fontFamily: 'IBM Plex Mono', fontSize: 5.5, align: 'left', fill: INK, lineHeight: 1.6 }),
    ]),
    side('Back', INK, [
      text({ x: 8, y: h / 2 - 10, width: w - 16, text: 'Y/T', fontFamily: 'Montserrat', fontSize: 30, fontWeight: 900, fill: '#ffffff', align: 'left' }),
    ]),
  ],
}

const bcFloral: Template = {
  id: 'bc-floral',
  name: 'Rosewater',
  productSlug: 'business-card',
  occasion: 'business',
  tags: ['script', 'feminine', 'beauty'],
  lang: 'fr',
  build: (w, h) => [
    side('Front', '#faf3ee', [
      ellipse({ x: -20, y: h - 30, width: 60, height: 60, fill: '#e8c1c5', opacity: 0.7, name: 'Blob' }),
      ellipse({ x: w - 25, y: -20, width: 45, height: 45, fill: '#e8c1c5', opacity: 0.5, name: 'Blob' }),
      text({ x: 6, y: h / 2 - 12, width: w - 12, text: 'Nour Beauty', fontFamily: 'Great Vibes', fontSize: 24, fill: '#b56576' }),
      text({ x: 6, y: h / 2 + 4, width: w - 12, text: 'Institut · Onglerie · Henné', fontFamily: 'Montserrat', fontSize: 6, fill: '#6d597a', letterSpacing: 0.15, uppercase: true }),
    ]),
    side('Back', '#faf3ee', [
      text({ x: 6, y: 10, width: w - 12, text: 'Nour Beauty', fontFamily: 'Great Vibes', fontSize: 14, fill: '#b56576' }),
      text({ x: 6, y: 24, width: w - 12, text: 'Rue de Marseille, La Marsa\n+216 29 345 678\n@nour.beauty', fontFamily: 'Montserrat', fontSize: 6, fill: '#355070', lineHeight: 1.6 }),
    ]),
  ],
}

// ---- invitations -----------------------------------------------------------

const invWeddingClassic: Template = {
  id: 'inv-wedding-classic',
  name: 'Classic French wedding',
  productSlug: 'invitation',
  occasion: 'wedding',
  tags: ['classic', 'serif', 'cream'],
  lang: 'fr',
  build: (w, h) => [
    side('Front', CREAM, [
      ...doubleFrame(w, h, 6, INK),
      ornament(cx(w, 40), 14, 40, '❦', GOLD, 16),
      text({ x: 10, y: 26, width: w - 20, text: 'Sarra & Mehdi', fontFamily: 'Pinyon Script', fontSize: 30, fill: INK }),
      rule(w / 2 - 15, 46, 30, GOLD, 0.4),
      text({ x: 12, y: 50, width: w - 24, text: 'ont le plaisir de vous convier\nà la célébration de leur mariage', fontFamily: 'Cormorant Garamond', fontSize: 11, fontStyle: 'italic', fill: INK, lineHeight: 1.35 }),
      text({ x: 12, y: h * 0.55, width: w - 24, text: 'Samedi 12 juillet 2026', fontFamily: 'Cinzel', fontSize: 11, fill: INK, letterSpacing: 0.1 }),
      text({ x: 12, y: h * 0.55 + 8, width: w - 24, text: 'à dix-neuf heures', fontFamily: 'Cormorant Garamond', fontSize: 10, fontStyle: 'italic', fill: '#6b6259' }),
      text({ x: 12, y: h * 0.72, width: w - 24, text: 'Dar El Marsa\nLa Marsa, Tunis', fontFamily: 'Cormorant Garamond', fontSize: 10, fill: INK, lineHeight: 1.4 }),
      ornament(cx(w, 40), h - 22, 40, '❧', GOLD, 14),
    ]),
    side('Back', CREAM, [
      ...doubleFrame(w, h, 6, INK),
      text({ x: 12, y: h * 0.3, width: w - 24, text: 'Réponse souhaitée\navant le 20 juin', fontFamily: 'Cormorant Garamond', fontSize: 11, fontStyle: 'italic', fill: INK, lineHeight: 1.4 }),
      text({ x: 12, y: h * 0.5, width: w - 24, text: '+216 22 000 000', fontFamily: 'Cinzel', fontSize: 9, fill: INK }),
      ornament(cx(w, 40), h * 0.62, 40, '✦', GOLD, 10),
    ]),
  ],
}

const invWeddingSidiBou: Template = {
  id: 'inv-wedding-sidibou',
  name: 'Sidi Bou Saïd',
  productSlug: 'invitation',
  occasion: 'wedding',
  tags: ['blue', 'mediterranean', 'modern'],
  lang: 'fr',
  build: (w, h) => [
    side('Front', '#f8f5ef', [
      rect({ x: 0, y: 0, width: w, height: h * 0.32, fill: '#1f4e79', locked: true, name: 'Header' }),
      text({ x: 8, y: h * 0.08, width: w - 16, text: 'Ines\n&\nSami', fontFamily: 'Playfair Display', fontSize: 20, fontStyle: 'italic', fill: '#f8f5ef', lineHeight: 1.05 }),
      ...[0, 1, 2, 3, 4, 5, 6].map((i) =>
        ellipse({ x: 4 + i * ((w - 8) / 7) + (w - 8) / 14 - 2, y: h * 0.32 - 2, width: 4, height: 4, fill: '#e4b04a', name: 'Dot' }),
      ),
      text({ x: 10, y: h * 0.42, width: w - 20, text: 'se marient', fontFamily: 'Cormorant Garamond', fontSize: 13, fontStyle: 'italic', fill: '#1f4e79' }),
      text({ x: 10, y: h * 0.52, width: w - 20, text: '20 · 09 · 2026', fontFamily: 'Montserrat', fontSize: 14, fontWeight: 700, fill: '#1f4e79', letterSpacing: 0.15 }),
      text({ x: 10, y: h * 0.64, width: w - 20, text: 'Villa Bleue, Sidi Bou Saïd\nà partir de 18h', fontFamily: 'Montserrat', fontSize: 8, fill: '#2c2c2c', lineHeight: 1.5 }),
      rect({ x: 0, y: h - 6, width: w, height: 6, fill: '#e4b04a', locked: true, name: 'Footer' }),
    ]),
    side('Back', '#1f4e79', [
      text({ x: 10, y: h * 0.4, width: w - 20, text: 'Merci de confirmer\navant le 1er septembre', fontFamily: 'Cormorant Garamond', fontSize: 12, fontStyle: 'italic', fill: '#f8f5ef', lineHeight: 1.4 }),
      text({ x: 10, y: h * 0.56, width: w - 20, text: 'ines.sami@mariage.tn', fontFamily: 'Montserrat', fontSize: 8, fill: '#e4b04a' }),
    ]),
  ],
}

const invWeddingArabic: Template = {
  id: 'inv-wedding-arabic',
  name: 'Calligraphy wedding',
  productSlug: 'invitation',
  occasion: 'wedding',
  tags: ['arabic', 'gold', 'burgundy'],
  lang: 'bi',
  build: (w, h) => [
    side('Front', '#5c1f1f', [
      ...doubleFrame(w, h, 5, GOLD),
      text({ x: 10, y: 14, width: w - 20, text: 'بسم الله الرحمن الرحيم', fontFamily: 'Aref Ruqaa', fontSize: 12, fill: GOLD }),
      text({ x: 10, y: 30, width: w - 20, text: 'يتشرف آل بن صالح وآل الجزيري\nبدعوتكم لحضور حفل زفاف', fontFamily: 'Amiri', fontSize: 11, fill: '#f7e7c6', lineHeight: 1.6 }),
      text({ x: 10, y: h * 0.42, width: w - 20, text: 'أميرة و خالد', fontFamily: 'Aref Ruqaa', fontSize: 26, fill: GOLD }),
      ornament(cx(w, 40), h * 0.58, 40, '✦ ✦ ✦', GOLD, 8),
      text({ x: 10, y: h * 0.66, width: w - 20, text: 'السبت 18 جويلية 2026 · على الساعة الثامنة مساءً\nقاعة الأفراح النجمة، سوسة', fontFamily: 'Cairo', fontSize: 8, fill: '#f7e7c6', lineHeight: 1.6 }),
      text({ x: 10, y: h * 0.84, width: w - 20, text: 'Samedi 18 juillet 2026 · 20h · Salle Ennajma, Sousse', fontFamily: 'Cormorant Garamond', fontSize: 7.5, fontStyle: 'italic', fill: GOLD }),
    ]),
    side('Back', '#f7e7c6', [
      ...doubleFrame(w, h, 5, '#5c1f1f'),
      text({ x: 10, y: h * 0.4, width: w - 20, text: 'حضوركم يشرفنا', fontFamily: 'Aref Ruqaa', fontSize: 16, fill: '#5c1f1f' }),
      text({ x: 10, y: h * 0.55, width: w - 20, text: '+216 98 765 432', fontFamily: 'Cairo', fontSize: 8, fill: '#3b2412' }),
    ]),
  ],
}

const invTahourPrince: Template = {
  id: 'inv-tahour-prince',
  name: 'Little prince tahour',
  productSlug: 'invitation',
  occasion: 'tahour',
  tags: ['kids', 'blue', 'crescent'],
  lang: 'bi',
  build: (w, h) => [
    side('Front', '#a9c7dd', [
      rect({ x: 5, y: 5, width: w - 10, height: h - 10, fill: '#f8f5ef', cornerRadius: 3, name: 'Card' }),
      text({ x: 10, y: 12, width: w - 20, text: '☽', fontFamily: 'Fraunces', fontSize: 34, fill: '#e4b04a' }),
      text({ x: 10, y: 12, width: w - 20, text: '✦     ✦\n   ✦', fontFamily: 'Fraunces', fontSize: 8, fill: '#1f4e79', lineHeight: 1.5 }),
      text({ x: 10, y: h * 0.28, width: w - 20, text: 'طهور', fontFamily: 'Reem Kufi', fontSize: 20, fill: '#1f4e79' }),
      text({ x: 10, y: h * 0.4, width: w - 20, text: 'Youssef', fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 700, fill: '#1f4e79' }),
      text({ x: 10, y: h * 0.54, width: w - 20, text: 'Nous avons la joie de vous inviter\nà la cérémonie de tahour de notre fils', fontFamily: 'Lora', fontSize: 8.5, fontStyle: 'italic', fill: '#2c2c2c', lineHeight: 1.5 }),
      text({ x: 10, y: h * 0.7, width: w - 20, text: 'Dimanche 5 octobre 2026 · 13h', fontFamily: 'Montserrat', fontSize: 9, fontWeight: 700, fill: '#1f4e79' }),
      text({ x: 10, y: h * 0.78, width: w - 20, text: 'Chez la famille Gharbi · Hammamet', fontFamily: 'Lora', fontSize: 8, fill: '#2c2c2c' }),
      ornament(cx(w, 40), h - 20, 40, '✦ ☽ ✦', '#e4b04a', 9),
    ]),
    side('Back', '#a9c7dd', [
      text({ x: 10, y: h * 0.4, width: w - 20, text: 'بارك الله فيه', fontFamily: 'Amiri', fontSize: 16, fill: '#1f4e79' }),
      text({ x: 10, y: h * 0.55, width: w - 20, text: 'Confirmation : +216 20 111 222', fontFamily: 'Montserrat', fontSize: 8, fill: '#1f4e79' }),
    ]),
  ],
}

const invGraduation: Template = {
  id: 'inv-graduation',
  name: 'Graduation ceremony',
  productSlug: 'invitation',
  occasion: 'graduation',
  tags: ['formal', 'laurel', 'black'],
  lang: 'fr',
  build: (w, h) => [
    side('Front', '#f4efe6', [
      frame(w, h, 5, INK, 1.2),
      text({ x: 10, y: 12, width: w - 20, text: 'PROMOTION 2026', fontFamily: 'Cinzel', fontSize: 9, fill: VERMILLION, letterSpacing: 0.25 }),
      rule(w / 2 - 10, 22, 20, INK, 0.4),
      text({ x: 10, y: 28, width: w - 20, text: 'Cérémonie de\nremise des diplômes', fontFamily: 'Fraunces', fontSize: 17, fontWeight: 700, fill: INK, lineHeight: 1.1 }),
      text({ x: 10, y: h * 0.42, width: w - 20, text: 'Faculté de Médecine de Tunis', fontFamily: 'Cormorant Garamond', fontSize: 11, fontStyle: 'italic', fill: INK }),
      text({ x: 10, y: h * 0.55, width: w - 20, text: 'Dr. Salma Karoui', fontFamily: 'Pinyon Script', fontSize: 22, fill: VERMILLION }),
      text({ x: 10, y: h * 0.7, width: w - 20, text: 'vous invite à célébrer avec elle\nle vendredi 3 juillet 2026 à 18h\nHôtel Laico, Tunis', fontFamily: 'Cormorant Garamond', fontSize: 9.5, fill: INK, lineHeight: 1.45 }),
      ornament(cx(w, 40), h - 18, 40, '⁂', INK, 10),
    ]),
    side('Back', INK, [
      text({ x: 10, y: h * 0.42, width: w - 20, text: 'Per aspera ad astra', fontFamily: 'Cinzel', fontSize: 11, fill: GOLD, letterSpacing: 0.15 }),
    ]),
  ],
}

const invBirthday: Template = {
  id: 'inv-birthday',
  name: 'Confetti birthday',
  productSlug: 'invitation',
  occasion: 'birthday',
  tags: ['kids', 'playful', 'colour'],
  lang: 'fr',
  build: (w, h) => {
    const confetti: DesignElement[] = []
    const colors = ['#2a3fb0', '#f2c14e', '#e0592a', '#7aa6c2']
    for (let i = 0; i < 18; i++) {
      const x = (i * 37) % (w - 6)
      const y = (i * 53) % (h - 6)
      confetti.push(ellipse({ x, y, width: 3 + (i % 3), height: 3 + (i % 3), fill: colors[i % colors.length]!, name: 'Confetti', opacity: 0.9 }))
    }
    return [
      side('Front', '#f7f4ec', [
        ...confetti,
        text({ x: 10, y: h * 0.18, width: w - 20, text: '7', fontFamily: 'Abril Fatface', fontSize: 70, fill: '#e0592a' }),
        text({ x: 10, y: h * 0.5, width: w - 20, text: 'Lina fête ses 7 ans !', fontFamily: 'Poppins', fontSize: 13, fontWeight: 800, fill: '#2a3fb0' }),
        text({ x: 10, y: h * 0.62, width: w - 20, text: 'Samedi 14 mars · 15h\nParc de loisirs Hannibal, Ariana', fontFamily: 'Poppins', fontSize: 8, fill: '#1c1c1c', lineHeight: 1.5 }),
        text({ x: 10, y: h * 0.8, width: w - 20, text: 'Viens jouer avec nous 🎈', fontFamily: 'Dancing Script', fontSize: 12, fill: '#2a3fb0' }),
      ]),
      side('Back', '#2a3fb0', [
        text({ x: 10, y: h * 0.4, width: w - 20, text: 'Réponse avant le 10 mars\nMaman de Lina · +216 21 000 000', fontFamily: 'Poppins', fontSize: 8, fill: '#f7f4ec', lineHeight: 1.6 }),
      ]),
    ]
  },
}

const invHenna: Template = {
  id: 'inv-henna',
  name: 'Henna night',
  productSlug: 'invitation',
  occasion: 'bachelorette',
  tags: ['henna', 'gold', 'pattern'],
  lang: 'bi',
  build: (w, h) => [
    side('Front', '#3b2412', [
      ...doubleFrame(w, h, 5, '#d4a017'),
      text({ x: 10, y: 12, width: w - 20, text: '✿ ❀ ✿ ❀ ✿', fontFamily: 'Fraunces', fontSize: 10, fill: '#d4a017' }),
      text({ x: 10, y: h * 0.2, width: w - 20, text: 'ليلة الحناء', fontFamily: 'Aref Ruqaa', fontSize: 24, fill: '#d4a017' }),
      text({ x: 10, y: h * 0.36, width: w - 20, text: 'Soirée henné de', fontFamily: 'Cormorant Garamond', fontSize: 11, fontStyle: 'italic', fill: '#f7e7c6' }),
      text({ x: 10, y: h * 0.44, width: w - 20, text: 'Mariem', fontFamily: 'Great Vibes', fontSize: 34, fill: '#f7e7c6' }),
      text({ x: 10, y: h * 0.66, width: w - 20, text: 'Jeudi 9 juillet 2026 · 21h\nMaison familiale, Kairouan', fontFamily: 'Cormorant Garamond', fontSize: 10, fill: '#f7e7c6', lineHeight: 1.5 }),
      text({ x: 10, y: h - 22, width: w - 20, text: '✿ ❀ ✿ ❀ ✿', fontFamily: 'Fraunces', fontSize: 10, fill: '#d4a017' }),
    ]),
    side('Back', '#f7e7c6', [
      text({ x: 10, y: h * 0.42, width: w - 20, text: 'Dress code : caftan & couleurs chaudes', fontFamily: 'Cormorant Garamond', fontSize: 10, fontStyle: 'italic', fill: '#3b2412' }),
    ]),
  ],
}

const invAqiqa: Template = {
  id: 'inv-aqiqa',
  name: 'Welcome baby',
  productSlug: 'invitation',
  occasion: 'aqiqa',
  tags: ['baby', 'soft', 'pastel'],
  lang: 'bi',
  build: (w, h) => [
    side('Front', '#faf3ee', [
      ellipse({ x: cx(w, w * 0.7), y: h * 0.08, width: w * 0.7, height: w * 0.7, fill: '#e8c1c5', opacity: 0.6, name: 'Circle' }),
      text({ x: 10, y: h * 0.2, width: w - 20, text: 'أهلاً بالمولودة', fontFamily: 'Reem Kufi', fontSize: 14, fill: '#b56576' }),
      text({ x: 10, y: h * 0.3, width: w - 20, text: 'Maryam', fontFamily: 'Parisienne', fontSize: 36, fill: '#6d597a' }),
      text({ x: 10, y: h * 0.56, width: w - 20, text: 'Née le 2 mai 2026 · 3,4 kg\nVenez la rencontrer le dimanche 24 mai à 14h', fontFamily: 'Lora', fontSize: 8.5, fill: '#355070', lineHeight: 1.6 }),
      ornament(cx(w, 40), h * 0.78, 40, '❀', '#b56576', 14),
    ]),
    side('Back', '#e8c1c5', [
      text({ x: 10, y: h * 0.44, width: w - 20, text: 'Famille Ayari · Sfax', fontFamily: 'Lora', fontSize: 9, fill: '#6d597a' }),
    ]),
  ],
}

// ---- greeting cards --------------------------------------------------------

const gcEid: Template = {
  id: 'gc-eid',
  name: 'Eid Mubarak',
  productSlug: 'greeting-card',
  occasion: 'eid',
  tags: ['eid', 'green', 'gold'],
  lang: 'bi',
  build: (w, h) => [
    side('Front', '#0f6b5c', [
      frame(w, h, 5, '#e7d7a8', 0.5),
      text({ x: 10, y: h * 0.12, width: w - 20, text: '☽', fontFamily: 'Fraunces', fontSize: 40, fill: '#e7d7a8' }),
      text({ x: 10, y: h * 0.42, width: w - 20, text: 'عيد مبارك', fontFamily: 'Aref Ruqaa', fontSize: 26, fill: '#e7d7a8' }),
      text({ x: 10, y: h * 0.6, width: w - 20, text: 'Eid Mubarak', fontFamily: 'Cinzel', fontSize: 11, fill: '#f5efe0', letterSpacing: 0.2 }),
      text({ x: 10, y: h * 0.72, width: w - 20, text: 'كل عام وأنتم بخير', fontFamily: 'Amiri', fontSize: 11, fill: '#f5efe0' }),
    ]),
    side('Back', '#f5efe0', [
      text({ x: 10, y: h * 0.42, width: w - 20, text: 'Avec toute notre affection,\nla famille Mansour', fontFamily: 'Cormorant Garamond', fontSize: 11, fontStyle: 'italic', fill: '#0f6b5c', lineHeight: 1.5 }),
    ]),
  ],
}

const gcThanks: Template = {
  id: 'gc-thanks',
  name: 'Merci',
  productSlug: 'greeting-card',
  occasion: 'thanks',
  tags: ['thank you', 'script', 'minimal'],
  lang: 'fr',
  build: (w, h) => [
    side('Front', '#faf3ee', [
      text({ x: 8, y: h * 0.32, width: w - 16, text: 'Merci', fontFamily: 'Pinyon Script', fontSize: 40, fill: '#b56576' }),
      rule(w / 2 - 12, h * 0.6, 24, '#b56576', 0.4),
      text({ x: 8, y: h * 0.64, width: w - 16, text: 'du fond du cœur', fontFamily: 'Cormorant Garamond', fontSize: 11, fontStyle: 'italic', fill: '#6d597a' }),
    ]),
    side('Back', '#faf3ee', [
      text({ x: 8, y: 10, width: w - 16, text: 'Votre présence et votre générosité\nont rendu ce jour inoubliable.', fontFamily: 'Cormorant Garamond', fontSize: 10, fill: '#355070', lineHeight: 1.5 }),
      text({ x: 8, y: h - 20, width: w - 16, text: 'Sarra & Mehdi', fontFamily: 'Pinyon Script', fontSize: 16, fill: '#b56576' }),
    ]),
  ],
}

const gcPlace: Template = {
  id: 'gc-place',
  name: 'Place card',
  productSlug: 'greeting-card',
  sizeId: 'a7',
  occasion: 'wedding',
  tags: ['table', 'wedding', 'name'],
  lang: 'fr',
  build: (w, h) => [
    side('Front', CREAM, [
      ...doubleFrame(w, h, 4, GOLD),
      text({ x: 6, y: h * 0.3, width: w - 12, text: 'Table 4', fontFamily: 'Cinzel', fontSize: 8, fill: '#6b6259', letterSpacing: 0.2 }),
      text({ x: 6, y: h * 0.42, width: w - 12, text: 'Mme Leila Hamdi', fontFamily: 'Pinyon Script', fontSize: 16, fill: INK }),
    ]),
    side('Back', CREAM, []),
  ],
}

// ---- certificates ----------------------------------------------------------

const certClassic: Template = {
  id: 'cert-classic',
  name: 'Classic certificate',
  productSlug: 'certificate',
  occasion: 'graduation',
  tags: ['formal', 'seal', 'attestation'],
  lang: 'fr',
  build: (w, h) => [
    side('Front', '#fdf9f0', [
      frame(w, h, 8, INK, 1.5),
      frame(w, h, 11, GOLD, 0.5),
      text({ x: 20, y: 22, width: w - 40, text: 'CERTIFICAT', fontFamily: 'Cinzel', fontSize: 30, fontWeight: 700, fill: INK, letterSpacing: 0.3 }),
      text({ x: 20, y: 38, width: w - 40, text: 'DE RÉUSSITE', fontFamily: 'Cinzel', fontSize: 12, fill: VERMILLION, letterSpacing: 0.35 }),
      ornament(cx(w, 60), 48, 60, '❦', GOLD, 16),
      text({ x: 20, y: 62, width: w - 40, text: 'Décerné à', fontFamily: 'Cormorant Garamond', fontSize: 13, fontStyle: 'italic', fill: '#6b6259' }),
      text({ x: 20, y: 72, width: w - 40, text: 'Ahmed Ben Youssef', fontFamily: 'Pinyon Script', fontSize: 40, fill: INK }),
      rule(w * 0.25, 98, w * 0.5, INK, 0.4),
      text({ x: 30, y: 104, width: w - 60, text: 'pour avoir complété avec succès la formation\n« Développement web avancé » — 120 heures', fontFamily: 'Cormorant Garamond', fontSize: 12, fill: INK, lineHeight: 1.45 }),
      text({ x: 30, y: 128, width: w - 60, text: 'Tunis, le 30 juin 2026', fontFamily: 'Cormorant Garamond', fontSize: 11, fontStyle: 'italic', fill: '#6b6259' }),
      rule(30, h - 40, 60, INK, 0.4),
      text({ x: 30, y: h - 37, width: 60, text: 'Le directeur', fontFamily: 'IBM Plex Mono', fontSize: 6.5, fill: '#6b6259', letterSpacing: 0.1, uppercase: true }),
      rule(w - 90, h - 40, 60, INK, 0.4),
      text({ x: w - 90, y: h - 37, width: 60, text: 'Le formateur', fontFamily: 'IBM Plex Mono', fontSize: 6.5, fill: '#6b6259', letterSpacing: 0.1, uppercase: true }),
      ellipse({ x: w / 2 - 14, y: h - 52, width: 28, height: 28, fill: 'transparent', stroke: VERMILLION, strokeWidth: 0.8, name: 'Seal' }),
      ellipse({ x: w / 2 - 11, y: h - 49, width: 22, height: 22, fill: 'transparent', stroke: VERMILLION, strokeWidth: 0.3, name: 'Seal inner' }),
      text({ x: w / 2 - 14, y: h - 42, width: 28, text: 'SCEAU', fontFamily: 'Cinzel', fontSize: 6, fill: VERMILLION, letterSpacing: 0.15 }),
    ]),
  ],
}

const certModern: Template = {
  id: 'cert-modern',
  name: 'Modern award',
  productSlug: 'certificate',
  occasion: 'business',
  tags: ['modern', 'award', 'employee'],
  lang: 'en',
  build: (w, h) => [
    side('Front', '#ffffff', [
      rect({ x: 0, y: 0, width: 22, height: h, fill: '#1f4e79', locked: true, name: 'Bar' }),
      rect({ x: 22, y: 0, width: 4, height: h, fill: '#e4b04a', locked: true, name: 'Accent' }),
      text({ x: 40, y: 26, width: w - 60, text: 'EMPLOYEE OF THE YEAR', fontFamily: 'Montserrat', fontSize: 10, fontWeight: 700, fill: '#1f4e79', align: 'left', letterSpacing: 0.3 }),
      text({ x: 40, y: 40, width: w - 60, text: 'Certificate of Excellence', fontFamily: 'Playfair Display', fontSize: 30, fontWeight: 700, fill: '#1c1c1c', align: 'left' }),
      text({ x: 40, y: 68, width: w - 60, text: 'presented to', fontFamily: 'Montserrat', fontSize: 9, fill: '#6b6259', align: 'left' }),
      text({ x: 40, y: 78, width: w - 60, text: 'Rania Sassi', fontFamily: 'Playfair Display', fontSize: 34, fontStyle: 'italic', fill: '#1f4e79', align: 'left' }),
      text({ x: 40, y: 104, width: w - 70, text: 'in recognition of outstanding dedication, leadership and results\nacross the 2025 fiscal year.', fontFamily: 'Montserrat', fontSize: 9, fill: '#1c1c1c', align: 'left', lineHeight: 1.5 }),
      rule(40, h - 40, 60, '#1c1c1c', 0.4),
      text({ x: 40, y: h - 37, width: 60, text: 'CEO', fontFamily: 'Montserrat', fontSize: 6.5, fill: '#6b6259', align: 'left', letterSpacing: 0.15 }),
      rule(120, h - 40, 60, '#1c1c1c', 0.4),
      text({ x: 120, y: h - 37, width: 60, text: 'DATE', fontFamily: 'Montserrat', fontSize: 6.5, fill: '#6b6259', align: 'left', letterSpacing: 0.15 }),
    ]),
  ],
}

// ---- flyer -----------------------------------------------------------------

const flyerLaunch: Template = {
  id: 'flyer-launch',
  name: 'Launch poster',
  productSlug: 'flyer',
  sizeId: 'a5',
  occasion: 'event',
  tags: ['poster', 'bold', 'event'],
  lang: 'fr',
  build: (w, h) => [
    side('Front', '#f7f4ec', [
      rect({ x: 8, y: 8, width: w - 16, height: h * 0.45, fill: '#2a3fb0', name: 'Block' }),
      text({ x: 14, y: 16, width: w - 28, text: 'OUVERTURE', fontFamily: 'Bebas Neue', fontSize: 60, fill: '#f7f4ec', align: 'left', lineHeight: 0.9 }),
      text({ x: 14, y: 42, width: w - 28, text: 'nouvelle boutique', fontFamily: 'Fraunces', fontSize: 18, fontStyle: 'italic', fill: '#f2c14e', align: 'left' }),
      text({ x: 14, y: h * 0.45 - 22, width: w - 28, text: 'Avenue Habib Bourguiba, Tunis', fontFamily: 'Montserrat', fontSize: 9, fill: '#f7f4ec', align: 'left' }),
      text({ x: 14, y: h * 0.52, width: w - 28, text: '14', fontFamily: 'Bebas Neue', fontSize: 120, fill: '#e0592a', align: 'left', lineHeight: 0.85 }),
      text({ x: 14, y: h * 0.52 + 44, width: w - 28, text: 'SEPTEMBRE 2026', fontFamily: 'Bebas Neue', fontSize: 22, fill: '#1c1c1c', align: 'left', letterSpacing: 0.05 }),
      text({ x: 14, y: h - 42, width: w - 28, text: '-20% sur tout le magasin\nle jour de l’ouverture', fontFamily: 'Montserrat', fontSize: 10, fontWeight: 700, fill: '#2a3fb0', align: 'left', lineHeight: 1.4 }),
      text({ x: 14, y: h - 18, width: w - 28, text: '@laboutique.tn · 71 000 000', fontFamily: 'IBM Plex Mono', fontSize: 7, fill: '#1c1c1c', align: 'left' }),
    ]),
    side('Back', '#2a3fb0', []),
  ],
}

// ---- stickers --------------------------------------------------------------

const stickerJar: Template = {
  id: 'sticker-jar',
  name: 'Jar label',
  productSlug: 'sticker',
  sizeId: 'r50',
  occasion: 'business',
  tags: ['round', 'label', 'food'],
  lang: 'fr',
  build: (w, h) => [
    side('Front', '#e8e2c8', [
      ellipse({ x: 2, y: 2, width: w - 4, height: h - 4, fill: 'transparent', stroke: '#4a5a3a', strokeWidth: 0.6, name: 'Ring' }),
      text({ x: 6, y: h * 0.28, width: w - 12, text: 'Harissa', fontFamily: 'Rye', fontSize: 13, fill: '#4a5a3a' }),
      text({ x: 6, y: h * 0.52, width: w - 12, text: 'maison', fontFamily: 'Fraunces', fontSize: 9, fontStyle: 'italic', fill: '#8a9a5b' }),
      text({ x: 6, y: h * 0.7, width: w - 12, text: 'NABEUL · 2026', fontFamily: 'IBM Plex Mono', fontSize: 5, fill: '#4a5a3a', letterSpacing: 0.15 }),
    ]),
  ],
}

// ---- apparel ----------------------------------------------------------------

const teeGradClass: Template = {
  id: 'tee-grad-class',
  name: 'Class of 2026',
  productSlug: 'tshirt',
  sizeId: 'a4',
  occasion: 'graduation',
  tags: ['varsity', 'bold', 'promo'],
  lang: 'en',
  garmentColor: '#1c1b1a',
  build: (w, h) => [
    side('Front', 'transparent', [
      text({ x: 10, y: h * 0.18, width: w - 20, text: 'CLASS OF', fontFamily: 'Bebas Neue', fontSize: 48, fill: '#ffffff', letterSpacing: 0.1 }),
      text({ x: 10, y: h * 0.3, width: w - 20, text: '2026', fontFamily: 'Alfa Slab One', fontSize: 110, fill: '#e4b04a', lineHeight: 1 }),
      rule(w * 0.2, h * 0.62, w * 0.6, '#ffffff', 1.2),
      text({ x: 10, y: h * 0.65, width: w - 20, text: 'ENIT · GÉNIE CIVIL', fontFamily: 'Oswald', fontSize: 22, fill: '#ffffff', letterSpacing: 0.15 }),
    ]),
    side('Back', 'transparent', [
      text({ x: 10, y: h * 0.15, width: w - 20, text: 'BEN AMOR', fontFamily: 'Bebas Neue', fontSize: 60, fill: '#ffffff', letterSpacing: 0.08 }),
      text({ x: 10, y: h * 0.32, width: w - 20, text: '26', fontFamily: 'Alfa Slab One', fontSize: 180, fill: '#e4b04a', lineHeight: 1 }),
    ]),
  ],
}

const teeTahourTeam: Template = {
  id: 'tee-tahour-team',
  name: 'Team Youssef',
  productSlug: 'kids-tshirt',
  sizeId: 'a4',
  occasion: 'tahour',
  tags: ['kids', 'crew', 'crescent'],
  lang: 'bi',
  garmentColor: '#a9c7dd',
  build: (w, h) => [
    side('Front', 'transparent', [
      text({ x: 10, y: h * 0.1, width: w - 20, text: '☽', fontFamily: 'Fraunces', fontSize: 90, fill: '#f3e2a0' }),
      text({ x: 10, y: h * 0.42, width: w - 20, text: 'TEAM', fontFamily: 'Poppins', fontSize: 36, fontWeight: 800, fill: '#1f2a44', letterSpacing: 0.2 }),
      text({ x: 10, y: h * 0.56, width: w - 20, text: 'Youssef', fontFamily: 'Dancing Script', fontSize: 60, fontWeight: 700, fill: '#1f2a44' }),
      text({ x: 10, y: h * 0.8, width: w - 20, text: 'طهور · 05.10.2026', fontFamily: 'Cairo', fontSize: 18, fontWeight: 700, fill: '#1f2a44' }),
    ]),
    side('Back', 'transparent', [
      text({ x: 10, y: h * 0.3, width: w - 20, text: 'COUSIN', fontFamily: 'Poppins', fontSize: 40, fontWeight: 800, fill: '#1f2a44', letterSpacing: 0.15 }),
      text({ x: 10, y: h * 0.45, width: w - 20, text: '01', fontFamily: 'Poppins', fontSize: 110, fontWeight: 800, fill: '#f3e2a0' }),
    ]),
  ],
}

const teeHenna: Template = {
  id: 'tee-henna',
  name: 'Bride squad',
  productSlug: 'tshirt',
  sizeId: 'a4',
  occasion: 'bachelorette',
  tags: ['henna', 'squad', 'gold'],
  lang: 'bi',
  garmentColor: '#6b1f2a',
  build: (w, h) => [
    side('Front', 'transparent', [
      text({ x: 10, y: h * 0.12, width: w - 20, text: '✿ ❀ ✿', fontFamily: 'Fraunces', fontSize: 30, fill: '#d4a017' }),
      text({ x: 10, y: h * 0.3, width: w - 20, text: 'Bride', fontFamily: 'Great Vibes', fontSize: 90, fill: '#f7e7c6' }),
      text({ x: 10, y: h * 0.58, width: w - 20, text: 'SQUAD', fontFamily: 'Cinzel', fontSize: 44, fontWeight: 700, fill: '#d4a017', letterSpacing: 0.3 }),
      text({ x: 10, y: h * 0.78, width: w - 20, text: 'ليلة الحناء · 2026', fontFamily: 'Cairo', fontSize: 16, fill: '#f7e7c6' }),
    ]),
    side('Back', 'transparent', [
      text({ x: 10, y: h * 0.38, width: w - 20, text: 'Mariem', fontFamily: 'Great Vibes', fontSize: 80, fill: '#d4a017' }),
    ]),
  ],
}

const teeBirthday: Template = {
  id: 'tee-birthday',
  name: 'Birthday boy',
  productSlug: 'kids-tshirt',
  sizeId: 'a4',
  occasion: 'birthday',
  tags: ['kids', 'number', 'fun'],
  lang: 'fr',
  garmentColor: '#f3e2a0',
  build: (w, h) => [
    side('Front', 'transparent', [
      ellipse({ x: cx(w, w * 0.8), y: h * 0.12, width: w * 0.8, height: w * 0.8, fill: '#e0592a', name: 'Circle' }),
      text({ x: 10, y: h * 0.17, width: w - 20, text: '5', fontFamily: 'Alfa Slab One', fontSize: 180, fill: '#f7f4ec', lineHeight: 1 }),
      text({ x: 10, y: h * 0.72, width: w - 20, text: "C'EST MON\nANNIVERSAIRE", fontFamily: 'Poppins', fontSize: 22, fontWeight: 800, fill: '#2a3fb0', lineHeight: 1.1 }),
    ]),
    side('Back', 'transparent', [
      text({ x: 10, y: h * 0.4, width: w - 20, text: 'Adam', fontFamily: 'Poppins', fontSize: 56, fontWeight: 800, fill: '#2a3fb0' }),
    ]),
  ],
}

const teeWordmark: Template = {
  id: 'tee-wordmark',
  name: 'Simple wordmark',
  productSlug: 'tshirt',
  sizeId: 'pocket',
  occasion: 'business',
  tags: ['staff', 'logo', 'minimal'],
  lang: 'en',
  garmentColor: '#f5f3ee',
  build: (w, h) => [
    side('Front', 'transparent', [
      text({ x: 5, y: h * 0.3, width: w - 10, text: 'CAFÉ\nBLEU', fontFamily: 'Montserrat', fontSize: 30, fontWeight: 900, fill: '#1f2a44', lineHeight: 1, align: 'left' }),
      rule(5, h * 0.62, 30, '#1f2a44', 1),
      text({ x: 5, y: h * 0.66, width: w - 10, text: 'STAFF', fontFamily: 'IBM Plex Mono', fontSize: 12, fill: '#1f2a44', align: 'left', letterSpacing: 0.3 }),
    ]),
    side('Back', 'transparent', []),
  ],
}

// ---- bags & sachets ----------------------------------------------------------

const toteShop: Template = {
  id: 'tote-shop',
  name: 'Shop tote',
  productSlug: 'tote-bag',
  occasion: 'event',
  tags: ['shop', 'wordmark', 'olive'],
  lang: 'fr',
  garmentColor: '#e8dcc2',
  build: (w, h) => [
    side('Front', 'transparent', [
      text({ x: 10, y: h * 0.12, width: w - 20, text: 'Librairie', fontFamily: 'Fraunces', fontSize: 60, fontStyle: 'italic', fill: '#4a5a3a' }),
      text({ x: 10, y: h * 0.3, width: w - 20, text: 'AL KITAB', fontFamily: 'Cinzel', fontSize: 62, fontWeight: 700, fill: '#2e2e2e', letterSpacing: 0.12 }),
      rule(w * 0.15, h * 0.55, w * 0.7, '#4a5a3a', 1.2),
      text({ x: 10, y: h * 0.6, width: w - 20, text: 'depuis 1967 · Tunis', fontFamily: 'IBM Plex Mono', fontSize: 16, fill: '#2e2e2e', letterSpacing: 0.15 }),
      text({ x: 10, y: h * 0.74, width: w - 20, text: '❦', fontFamily: 'Fraunces', fontSize: 40, fill: '#4a5a3a' }),
    ]),
  ],
}

const toteWedding: Template = {
  id: 'tote-wedding',
  name: 'Wedding welcome tote',
  productSlug: 'tote-bag',
  occasion: 'wedding',
  tags: ['wedding', 'script', 'guests'],
  lang: 'fr',
  garmentColor: '#e8dcc2',
  build: (w, h) => [
    side('Front', 'transparent', [
      text({ x: 10, y: h * 0.15, width: w - 20, text: 'Sarra & Mehdi', fontFamily: 'Pinyon Script', fontSize: 64, fill: '#5c1f1f' }),
      text({ x: 10, y: h * 0.42, width: w - 20, text: '12 · 07 · 2026', fontFamily: 'Cinzel', fontSize: 26, fill: '#3b2412', letterSpacing: 0.2 }),
      text({ x: 10, y: h * 0.56, width: w - 20, text: 'Merci d’être là', fontFamily: 'Cormorant Garamond', fontSize: 28, fontStyle: 'italic', fill: '#5c1f1f' }),
      text({ x: 10, y: h * 0.7, width: w - 20, text: '❧', fontFamily: 'Fraunces', fontSize: 36, fill: '#c9a24d' }),
    ]),
  ],
}

const sachetTahour: Template = {
  id: 'sachet-tahour',
  name: 'Tahour favour',
  productSlug: 'sachet',
  occasion: 'tahour',
  tags: ['favour', 'crescent', 'dragées'],
  lang: 'bi',
  garmentColor: '#efe6d3',
  build: (w, h) => [
    side('Front', 'transparent', [
      text({ x: 5, y: h * 0.1, width: w - 10, text: '☽', fontFamily: 'Fraunces', fontSize: 40, fill: '#1f4e79' }),
      text({ x: 5, y: h * 0.4, width: w - 10, text: 'طهور', fontFamily: 'Reem Kufi', fontSize: 20, fill: '#1f4e79' }),
      text({ x: 5, y: h * 0.56, width: w - 10, text: 'Youssef', fontFamily: 'Playfair Display', fontSize: 20, fontStyle: 'italic', fill: '#1f4e79' }),
      text({ x: 5, y: h * 0.76, width: w - 10, text: '05 · 10 · 2026', fontFamily: 'IBM Plex Mono', fontSize: 8, fill: '#e4b04a', letterSpacing: 0.15 }),
    ]),
  ],
}

const sachetWedding: Template = {
  id: 'sachet-wedding',
  name: 'Wedding dragées',
  productSlug: 'sachet',
  occasion: 'wedding',
  tags: ['favour', 'monogram', 'gold'],
  lang: 'fr',
  garmentColor: '#f8f6f1',
  build: (w, h) => [
    side('Front', 'transparent', [
      ellipse({ x: cx(w, w * 0.7), y: h * 0.15, width: w * 0.7, height: w * 0.7, fill: 'transparent', stroke: GOLD, strokeWidth: 0.8, name: 'Ring' }),
      text({ x: 5, y: h * 0.15 + w * 0.15, width: w - 10, text: 'S & M', fontFamily: 'Cinzel', fontSize: 20, fill: '#5c1f1f', letterSpacing: 0.1 }),
      text({ x: 5, y: h * 0.7, width: w - 10, text: '12 juillet 2026', fontFamily: 'Cormorant Garamond', fontSize: 10, fontStyle: 'italic', fill: '#5c1f1f' }),
    ]),
  ],
}

const sachetEid: Template = {
  id: 'sachet-eid',
  name: 'Eidi pouch',
  productSlug: 'sachet',
  occasion: 'eid',
  tags: ['eid', 'kids', 'green'],
  lang: 'ar',
  garmentColor: '#c9d6c1',
  build: (w, h) => [
    side('Front', 'transparent', [
      text({ x: 5, y: h * 0.14, width: w - 10, text: '☽ ✦', fontFamily: 'Fraunces', fontSize: 22, fill: '#0f6b5c' }),
      text({ x: 5, y: h * 0.4, width: w - 10, text: 'عيدية', fontFamily: 'Aref Ruqaa', fontSize: 24, fill: '#0f6b5c' }),
      text({ x: 5, y: h * 0.66, width: w - 10, text: 'عيد سعيد', fontFamily: 'Cairo', fontSize: 10, fill: '#3b2412' }),
    ]),
  ],
}

export const TEMPLATES: Template[] = [
  bcLetterpress, bcArtisan, bcMono, bcFloral,
  invWeddingClassic, invWeddingSidiBou, invWeddingArabic, invTahourPrince, invGraduation, invBirthday, invHenna, invAqiqa,
  gcEid, gcThanks, gcPlace,
  certClassic, certModern,
  flyerLaunch, stickerJar,
  teeGradClass, teeTahourTeam, teeHenna, teeBirthday, teeWordmark,
  toteShop, toteWedding,
  sachetTahour, sachetWedding, sachetEid,
]

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

export function templatesFor(filter: { productSlug?: string; occasion?: string; query?: string } = {}): Template[] {
  const q = filter.query?.toLowerCase().trim()
  return TEMPLATES.filter((t) => {
    if (filter.productSlug && t.productSlug !== filter.productSlug) return false
    if (filter.occasion && t.occasion !== filter.occasion) return false
    if (q && !`${t.name} ${t.tags.join(' ')} ${t.occasion} ${t.productSlug}`.toLowerCase().includes(q)) return false
    return true
  })
}

/** Instantiate a template as a brand new, editable document. */
export function documentFromTemplate(template: Template, opts: { sizeId?: string; title?: string } = {}): DesignDocument {
  const product = getProductOrThrow(template.productSlug)
  const size = getSize(product, opts.sizeId ?? template.sizeId ?? product.sizes[0]!.id)
  const sides = template.build(size.width, size.height)
  return createDocument({
    product,
    sizeId: size.id,
    title: opts.title ?? template.name,
    sides,
    garmentColor: template.garmentColor ?? product.garmentColors?.[0]?.hex,
    templateId: template.id,
  })
}
