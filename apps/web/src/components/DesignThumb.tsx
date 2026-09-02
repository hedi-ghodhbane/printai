import { getProduct, type DesignDocument } from '@printai/core'
import { DocumentSvg } from './DesignSvg'
import { MockupFrame } from './Mockup'

/** A product-aware preview: paper on a desk, or a print on a garment. */
export function DesignThumb({ doc, sideIndex = 0, className }: { doc: DesignDocument; sideIndex?: number; className?: string }) {
  const product = getProduct(doc.productSlug)
  if (product?.mockup) {
    return (
      <div className={`flex items-center justify-center ${className ?? ''}`}>
        <MockupFrame kind={product.mockup} color={doc.garmentColor ?? '#f5f3ee'} printWidthMm={doc.width} printHeightMm={doc.height} className="h-full max-h-full" >
          <DocumentSvg doc={doc} sideIndex={sideIndex} style={{ width: '100%', height: '100%', display: 'block' }} />
        </MockupFrame>
      </div>
    )
  }
  return (
    <div className={`flex items-center justify-center ${className ?? ''}`}>
      <DocumentSvg
        doc={doc}
        sideIndex={sideIndex}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: `${doc.width} / ${doc.height}`,
          boxShadow: '0 1px 2px rgba(26,23,20,0.15), 0 12px 24px -12px rgba(26,23,20,0.45)',
          borderRadius: product?.slug === 'sticker' ? '50%' : 2,
        }}
      />
    </div>
  )
}
