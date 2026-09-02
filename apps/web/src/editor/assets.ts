/**
 * Font and image readiness for the canvas. Konva draws with whatever the
 * browser has at draw time, so we wait for web fonts and cache images.
 */
import { useEffect, useState } from 'react'
import { FONTS, fontsInDocument, type DesignDocument } from '@printai/core'

const imageCache = new Map<string, HTMLImageElement>()
const loadedFonts = new Set<string>()

export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src)
  if (cached) return Promise.resolve(cached)
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (!src.startsWith('data:')) img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }
    img.onerror = () => reject(new Error(`Image failed: ${src.slice(0, 60)}`))
    img.src = src
  })
}

export function useImage(src: string): HTMLImageElement | undefined {
  const [img, setImg] = useState<HTMLImageElement | undefined>(() => imageCache.get(src))
  useEffect(() => {
    let alive = true
    const cached = imageCache.get(src)
    if (cached) {
      setImg(cached)
      return
    }
    loadImage(src).then((i) => alive && setImg(i)).catch(() => {})
    return () => {
      alive = false
    }
  }, [src])
  return img
}

export async function loadFonts(families: string[]): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return
  const jobs: Promise<unknown>[] = []
  for (const family of families) {
    const face = FONTS.find((f) => f.family === family)
    const weights = face?.weights ?? [400]
    for (const w of weights) {
      for (const style of face?.italic ? ['normal', 'italic'] : ['normal']) {
        const key = `${style} ${w} 16px "${family}"`
        if (loadedFonts.has(key)) continue
        jobs.push(
          document.fonts.load(key).then(() => loadedFonts.add(key)).catch(() => {}),
        )
      }
    }
  }
  await Promise.all(jobs)
}

/** Re-render trigger: resolves once the document's fonts are usable. */
export function useDocumentFonts(doc: DesignDocument | null): number {
  const [tick, setTick] = useState(0)
  const families = doc ? fontsInDocument(doc).sort().join('|') : ''
  useEffect(() => {
    if (!families) return
    let alive = true
    loadFonts(families.split('|')).then(() => alive && setTick((t) => t + 1))
    return () => {
      alive = false
    }
  }, [families])
  return tick
}

export async function prepareDocumentAssets(doc: DesignDocument) {
  await loadFonts(fontsInDocument(doc))
  const srcs = new Set<string>()
  for (const s of doc.sides) for (const e of s.elements) if (e.type === 'image') srcs.add(e.src)
  await Promise.all([...srcs].map((s) => loadImage(s).catch(() => undefined)))
}

/** Downscale an uploaded file to a data URL the document can carry. */
export async function fileToDataUrl(file: File, maxPx = 2400): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
    if (scale === 1 && file.size < 1.5e6) {
      return await new Promise<string>((res) => {
        const r = new FileReader()
        r.onload = () => res(r.result as string)
        r.readAsDataURL(file)
      })
    }
    const c = document.createElement('canvas')
    c.width = Math.round(img.width * scale)
    c.height = Math.round(img.height * scale)
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
    const isPng = file.type === 'image/png' || file.type === 'image/svg+xml'
    return c.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.9)
  } finally {
    URL.revokeObjectURL(url)
  }
}
