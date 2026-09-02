import type { DesignAssistant, DesignBrief, DesignSuggestion } from './ai.ts'

/**
 * Static idea bank used by the editor's "Ideas" panel today, and as the
 * fallback provider before the model-backed assistant lands.
 */
const IDEAS: Record<string, DesignSuggestion[]> = {
  wedding: [
    { id: 'w1', title: 'Classic French', description: 'Serif, cream stock, a thin double rule. Names in script.', templateId: 'inv-wedding-classic', paletteId: 'letterpress', copy: { headline: 'Sarra & Mehdi', subline: 'ont le plaisir de vous convier à leur mariage', body: 'Samedi 12 juillet 2026 · 19h · Dar El Marsa' } },
    { id: 'w2', title: 'Sidi Bou blue', description: 'White and cobalt with a zellige-inspired border.', templateId: 'inv-wedding-sidibou', paletteId: 'sidi-bou' },
    { id: 'w3', title: 'Arabic calligraphy', description: 'Bilingual: Arabic headline, French details.', templateId: 'inv-wedding-arabic', paletteId: 'henna', copy: { headline: 'بسم الله الرحمن الرحيم', subline: 'يتشرف آل بن صالح بدعوتكم لحضور حفل زفاف' } },
  ],
  tahour: [
    { id: 't1', title: 'Little prince', description: 'Sky blue, crescent and stars, the boy\'s name in Arabic and French.', templateId: 'inv-tahour-prince', paletteId: 'nursery', copy: { headline: 'طهور يوسف', subline: 'Tahour de Youssef', body: 'Dimanche 5 octobre 2026 · 13h' } },
    { id: 't2', title: 'Crew tees', description: 'Matching kids tees for the cousins: "Team Youssef".', templateId: 'tee-tahour-team', paletteId: 'nursery' },
    { id: 't3', title: 'Favour sachets', description: 'Pouches for dragées with a crescent and the date.', templateId: 'sachet-tahour', paletteId: 'sidi-bou' },
  ],
  graduation: [
    { id: 'g1', title: 'Class of 2026', description: 'Bold varsity type on black tees for the whole promo.', templateId: 'tee-grad-class', paletteId: 'ink' },
    { id: 'g2', title: 'Ceremony invitation', description: 'Formal certificate-style invitation with laurel ornaments.', templateId: 'inv-graduation', paletteId: 'letterpress' },
    { id: 'g3', title: 'Attestation', description: 'A4 certificate with seal and signature lines.', templateId: 'cert-classic', paletteId: 'letterpress' },
  ],
  business: [
    { id: 'b1', title: 'Letterpress minimal', description: 'Name set small, lots of paper, one vermillion rule.', templateId: 'bc-letterpress', paletteId: 'letterpress' },
    { id: 'b2', title: 'Artisan kraft', description: 'Kraft stock look with a stamp-style logo.', templateId: 'bc-artisan', paletteId: 'sahara' },
    { id: 'b3', title: 'Modern mono', description: 'Monospaced labels, grid, generous margins.', templateId: 'bc-mono', paletteId: 'ink' },
  ],
  birthday: [
    { id: 'bd1', title: 'Confetti', description: 'Playful dots, big number, the guest of honour\'s name.', templateId: 'inv-birthday', paletteId: 'majorelle' },
    { id: 'bd2', title: 'Birthday tee', description: 'A tee with the age and the name for the party.', templateId: 'tee-birthday', paletteId: 'nursery' },
  ],
  eid: [
    { id: 'e1', title: 'Eid Mubarak', description: 'Crescent, lantern and gold on deep green.', templateId: 'gc-eid', paletteId: 'medina' },
  ],
  thanks: [
    { id: 'th1', title: 'Merci', description: 'A simple thank-you card with a script headline.', templateId: 'gc-thanks', paletteId: 'rosewater' },
  ],
  bachelorette: [
    { id: 'hn1', title: 'Henna night', description: 'Burgundy and gold tees for the bride\'s squad.', templateId: 'tee-henna', paletteId: 'henna' },
  ],
  event: [
    { id: 'ev1', title: 'Shop tote', description: 'A tote with a hand-drawn feel wordmark.', templateId: 'tote-shop', paletteId: 'olive' },
    { id: 'ev2', title: 'Launch flyer', description: 'Poster-style flyer with a big date.', templateId: 'flyer-launch', paletteId: 'majorelle' },
  ],
}

export const staticAssistant: DesignAssistant = {
  async suggest(brief: DesignBrief): Promise<DesignSuggestion[]> {
    const pool = brief.occasion ? IDEAS[brief.occasion] ?? [] : Object.values(IDEAS).flat()
    const words = brief.prompt.toLowerCase().split(/\s+/).filter(Boolean)
    if (!words.length) return pool.slice(0, 6)
    const scored = pool
      .map((s) => ({ s, score: words.filter((w) => `${s.title} ${s.description}`.toLowerCase().includes(w)).length }))
      .sort((a, b) => b.score - a.score)
    return scored.map((x) => x.s).slice(0, 6)
  },
}

export function ideasFor(occasion: string) {
  return IDEAS[occasion] ?? []
}
