/**
 * Print-ready export. Renders a side on an off-screen Konva stage at 1 unit =
 * 1 mm and rasterises with a pixelRatio that yields the requested DPI.
 */
import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Group, Layer, Stage } from 'react-konva'
import Konva from 'konva'
import { MM_PER_INCH, getProduct, type DesignDocument } from '@printai/core'
import { SideContent } from './SideRenderer'
import { prepareDocumentAssets } from './assets'

function ExportStage({ doc, sideIndex, dpi, onReady }: { doc: DesignDocument; sideIndex: number; dpi: number; onReady: (dataUrl: string) => void }) {
  const ref = useRef<Konva.Stage>(null)
  const side = doc.sides[sideIndex]!
  const product = getProduct(doc.productSlug)
  const includeGarment = false
  const w = doc.width + doc.bleed * 2
  const h = doc.height + doc.bleed * 2
  useEffect(() => {
    // give Konva one frame to draw fonts/images that are already cached
    const id = requestAnimationFrame(() => {
      const stage = ref.current
      if (!stage) return
      stage.draw()
      onReady(stage.toDataURL({ pixelRatio: dpi / MM_PER_INCH, mimeType: 'image/png' }))
    })
    return () => cancelAnimationFrame(id)
  }, [doc, sideIndex, dpi, onReady])
  return (
    <Stage ref={ref} width={w} height={h}>
      <Layer>
        <Group x={doc.bleed} y={doc.bleed}>
          <SideContent
            side={side}
            width={doc.width}
            height={doc.height}
            bleed={doc.bleed}
            interactive={false}
            garment={includeGarment && product?.mockup ? { kind: product.mockup, color: doc.garmentColor ?? '#fff' } : null}
          />
        </Group>
      </Layer>
    </Stage>
  )
}

/** Render one side to a PNG data URL at the given DPI (300 for print). */
export async function renderSidePng(doc: DesignDocument, sideIndex: number, dpi = 300): Promise<string> {
  await prepareDocumentAssets(doc)
  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;left:-100000px;top:0;opacity:0;pointer-events:none;'
  document.body.appendChild(host)
  const root = createRoot(host)
  try {
    return await new Promise<string>((resolve) => {
      root.render(<ExportStage doc={doc} sideIndex={sideIndex} dpi={dpi} onReady={resolve} />)
    })
  } finally {
    root.unmount()
    host.remove()
  }
}

/** All sides that carry content (a blank back is skipped). */
export async function renderPrintFiles(doc: DesignDocument, dpi = 300): Promise<{ sideIndex: number; name: string; dataUrl: string }[]> {
  const out: { sideIndex: number; name: string; dataUrl: string }[] = []
  for (let i = 0; i < doc.sides.length; i++) {
    const s = doc.sides[i]!
    if (i > 0 && s.elements.length === 0) continue
    out.push({ sideIndex: i, name: s.name, dataUrl: await renderSidePng(doc, i, dpi) })
  }
  return out
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}
