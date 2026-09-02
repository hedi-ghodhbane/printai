/**
 * AI assistant contract. The web app ships with a static "ideas" provider;
 * a model-backed provider can be plugged in later without touching the
 * editor. Keep this interface framework-free so mobile can share it.
 */
import type { DesignDocument } from './types.ts'

export interface DesignBrief {
  productSlug: string
  occasion?: string
  language?: 'fr' | 'ar' | 'en'
  /** free text from the customer, e.g. "tahour de Youssef, 12 octobre, thème bleu" */
  prompt: string
}

export interface DesignSuggestion {
  id: string
  title: string
  description: string
  /** a template to start from, if the assistant recommends one */
  templateId?: string
  /** proposed copy the user can drop onto the canvas */
  copy?: { headline?: string; subline?: string; body?: string }
  paletteId?: string
}

export interface DesignAssistant {
  suggest(brief: DesignBrief): Promise<DesignSuggestion[]>
  /** Rewrite / translate / polish a piece of text on the canvas. */
  rewriteText?(text: string, instruction: string): Promise<string>
  /** Full generation of a design document (future). */
  generate?(brief: DesignBrief): Promise<DesignDocument>
}
