import { documentFromTemplate, type DesignDocument, type Template } from '@printai/core'

const cache = new Map<string, DesignDocument>()

/** Build (and memoise) a preview document for a template. */
export function templatePreview(t: Template): DesignDocument {
  let d = cache.get(t.id)
  if (!d) {
    d = documentFromTemplate(t)
    cache.set(t.id, d)
  }
  return d
}
