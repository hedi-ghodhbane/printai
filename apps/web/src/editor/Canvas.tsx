import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Group, Layer, Rect, Stage, Transformer } from 'react-konva'
import Konva from 'konva'
import { PT_TO_MM, getProduct, isArabic, type TextElement } from '@printai/core'
import { useEditor } from './store'
import { SideContent, konvaFontStyle } from './SideRenderer'
import { useDocumentFonts } from './assets'
import { MOCKUPS } from '@/components/Mockup'

/** 96 dpi: at zoom 1 the design is life-size on a typical screen. */
export const PX_PER_MM = 96 / 25.4

export function Canvas() {
  const doc = useEditor((s) => s.doc)
  const sideIndex = useEditor((s) => s.sideIndex)
  const selectedId = useEditor((s) => s.selectedId)
  const editingTextId = useEditor((s) => s.editingTextId)
  const zoom = useEditor((s) => s.zoom)
  const select = useEditor((s) => s.select)
  const setZoom = useEditor((s) => s.setZoom)
  const setEditingText = useEditor((s) => s.setEditingText)
  const updateElement = useEditor((s) => s.updateElement)
  const checkpoint = useEditor((s) => s.checkpoint)

  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const layerRef = useRef<Konva.Layer>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const nodes = useRef(new Map<string, Konva.Node>())
  const [size, setSize] = useState({ w: 800, h: 600 })
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const fontTick = useDocumentFonts(doc)

  // fit to container
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  const side = doc?.sides[sideIndex]
  const product = doc ? getProduct(doc.productSlug) : undefined
  const scale = PX_PER_MM * zoom

  // initial "fit" zoom
  const fitted = useRef<string | null>(null)
  useEffect(() => {
    if (!doc || fitted.current === doc.id || size.w < 50) return
    const pad = 80
    // textile: fit the whole garment, paper: fit the sheet
    const spec = product?.mockup ? MOCKUPS[product.mockup] : null
    const fitW = spec ? spec.garmentWidthMm : doc.width
    const fitH = spec ? spec.garmentWidthMm * spec.aspect : doc.height
    const z = Math.min((size.w - pad) / (fitW * PX_PER_MM), (size.h - pad) / (fitH * PX_PER_MM), 3)
    setZoom(Math.max(0.1, z))
    setPan({ x: 0, y: 0 })
    fitted.current = doc.id
  }, [doc, size, setZoom, product])

  // keep the transformer attached to the selection
  useEffect(() => {
    const tr = trRef.current
    if (!tr) return
    const node = selectedId ? nodes.current.get(selectedId) : undefined
    const el = side?.elements.find((e) => e.id === selectedId)
    tr.nodes(node && el && !el.locked && editingTextId !== selectedId ? [node] : [])
    tr.getLayer()?.batchDraw()
  }, [selectedId, side, editingTextId, fontTick, sideIndex])

  useEffect(() => {
    layerRef.current?.batchDraw()
  }, [fontTick])

  const origin = useMemo(() => {
    if (!doc) return { x: 0, y: 0 }
    return { x: size.w / 2 - (doc.width * scale) / 2 + pan.x, y: size.h / 2 - (doc.height * scale) / 2 + pan.y }
  }, [doc, size, scale, pan])

  const onWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()
      if (e.evt.ctrlKey || e.evt.metaKey) {
        const dir = e.evt.deltaY > 0 ? -1 : 1
        setZoom(zoom * (dir > 0 ? 1.1 : 1 / 1.1))
      } else {
        setPan((p) => ({ x: p.x - e.evt.deltaX, y: p.y - e.evt.deltaY }))
      }
    },
    [zoom, setZoom],
  )

  const handlers = useMemo(
    () => ({
      onSelect: (id: string) => select(id),
      onDragStart: () => checkpoint(),
      onDragEnd: (id: string, x: number, y: number) => updateElement(id, { x, y }, { transient: true }),
      onDblClick: (id: string) => {
        const el = side?.elements.find((e) => e.id === id)
        if (el?.type === 'text' && !el.locked) {
          select(id)
          setEditingText(id)
        }
      },
      registerNode: (id: string, node: Konva.Node | null) => {
        if (node) nodes.current.set(id, node)
        else nodes.current.delete(id)
      },
    }),
    [select, checkpoint, updateElement, setEditingText, side],
  )

  const onTransformEnd = () => {
    const node = selectedId ? nodes.current.get(selectedId) : undefined
    const el = side?.elements.find((e) => e.id === selectedId)
    if (!node || !el) return
    const sx = node.scaleX()
    const sy = node.scaleY()
    node.scaleX(1)
    node.scaleY(1)
    const rotation = node.rotation()
    if (el.type === 'ellipse') {
      const w = Math.max(1, el.width * sx)
      const h = Math.max(1, el.height * sy)
      updateElement(el.id, { x: node.x() - w / 2, y: node.y() - h / 2, width: w, height: h, rotation }, { transient: true })
      return
    }
    if (el.type === 'text') {
      const uniform = Math.abs(sx - sy) < 0.01
      updateElement(
        el.id,
        {
          x: node.x(),
          y: node.y(),
          width: Math.max(2, el.width * sx),
          fontSize: uniform ? Math.max(3, Math.round(el.fontSize * sx * 10) / 10) : el.fontSize,
          rotation,
        },
        { transient: true },
      )
      return
    }
    updateElement(el.id, { x: node.x(), y: node.y(), width: Math.max(0.5, el.width * sx), height: Math.max(el.type === 'line' ? 0 : 0.5, el.height * sy), rotation }, { transient: true })
  }

  if (!doc || !side) return <div ref={containerRef} className="h-full w-full" />

  const editingEl = editingTextId ? (side.elements.find((e) => e.id === editingTextId) as TextElement | undefined) : undefined
  const garment = product?.mockup ? { kind: product.mockup, color: doc.garmentColor ?? '#f5f3ee' } : null

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-paper-2" style={{ backgroundImage: 'radial-gradient(rgba(26,23,20,0.12) 0.6px, transparent 0.6px)', backgroundSize: '18px 18px' }}>
      <Stage
        ref={stageRef}
        width={size.w}
        height={size.h}
        onWheel={onWheel}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage() || e.target.name() === 'backdrop') select(null)
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage() || e.target.name() === 'backdrop') select(null)
        }}
      >
        <Layer ref={layerRef}>
          <Group x={origin.x} y={origin.y} scaleX={scale} scaleY={scale}>
            {/* paper shadow + bleed */}
            {!garment && (
              <Rect
                name="backdrop"
                x={-doc.bleed}
                y={-doc.bleed}
                width={doc.width + doc.bleed * 2}
                height={doc.height + doc.bleed * 2}
                fill={side.background === 'transparent' ? '#ffffff' : side.background}
                shadowColor="rgba(26,23,20,0.5)"
                shadowBlur={12 / scale}
                shadowOffsetY={4 / scale}
                shadowOpacity={0.5}
              />
            )}
            <SideContent side={side} width={doc.width} height={doc.height} bleed={doc.bleed} interactive handlers={handlers} editingId={editingTextId} garment={garment} />
            {/* trim + safe area guides */}
            {doc.bleed > 0 && (
              <Rect x={0} y={0} width={doc.width} height={doc.height} stroke="rgba(181,56,42,0.7)" strokeWidth={1 / scale} dash={[4 / scale, 3 / scale]} listening={false} />
            )}
            {garment && <Rect x={0} y={0} width={doc.width} height={doc.height} stroke="rgba(26,23,20,0.35)" strokeWidth={1 / scale} dash={[4 / scale, 3 / scale]} listening={false} />}
            <Rect x={3} y={3} width={doc.width - 6} height={doc.height - 6} stroke="rgba(26,23,20,0.12)" strokeWidth={1 / scale} dash={[2 / scale, 2 / scale]} listening={false} />
          </Group>
          <Transformer
            ref={trRef}
            rotateEnabled
            keepRatio
            enabledAnchors={
              (() => {
                const el = side.elements.find((e) => e.id === selectedId)
                if (el?.type === 'line') return ['middle-left', 'middle-right']
                if (el?.type === 'text') return ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']
                return undefined
              })()
            }
            anchorSize={9}
            anchorCornerRadius={2}
            anchorStroke="#1a1714"
            anchorFill="#f4efe6"
            borderStroke="#b5382a"
            borderDash={[4, 3]}
            rotateAnchorOffset={24}
            boundBoxFunc={(_old, box) => (box.width < 3 || box.height < 0 ? _old : box)}
            onTransformStart={() => checkpoint()}
            onTransformEnd={onTransformEnd}
          />
        </Layer>
      </Stage>
      {editingEl && (
        <TextEditorOverlay
          key={editingEl.id}
          el={editingEl}
          scale={scale}
          origin={origin}
          onDone={(text) => {
            if (text !== editingEl.text) updateElement(editingEl.id, { text })
            setEditingText(null)
          }}
        />
      )}
      <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-muted">
        {doc.width} × {doc.height} mm {doc.bleed ? `· bleed ${doc.bleed} mm` : ''} · ctrl+scroll to zoom
      </div>
    </div>
  )
}

function TextEditorOverlay({ el, scale, origin, onDone }: { el: TextElement; scale: number; origin: { x: number; y: number }; onDone: (text: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const t = ref.current
    if (!t) return
    t.focus()
    t.select()
  }, [])
  const fontPx = el.fontSize * PT_TO_MM * scale
  return (
    <textarea
      ref={ref}
      defaultValue={el.text}
      dir={isArabic(el.text) ? 'rtl' : 'ltr'}
      onBlur={(e) => onDone(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
          e.preventDefault()
          onDone((e.target as HTMLTextAreaElement).value)
        }
        e.stopPropagation()
      }}
      style={{
        position: 'absolute',
        left: origin.x + el.x * scale,
        top: origin.y + el.y * scale,
        width: el.width * scale,
        minHeight: fontPx * el.lineHeight,
        transform: `rotate(${el.rotation}deg)`,
        transformOrigin: 'top left',
        fontFamily: `'${el.fontFamily}', serif`,
        fontSize: fontPx,
        fontWeight: el.fontWeight,
        fontStyle: el.fontStyle,
        lineHeight: el.lineHeight,
        letterSpacing: `${el.letterSpacing}em`,
        textAlign: el.align,
        color: el.fill,
        textTransform: el.uppercase ? 'uppercase' : undefined,
        background: 'rgba(255,255,255,0.35)',
        outline: '1.5px solid #b5382a',
        border: 0,
        padding: 0,
        margin: 0,
        resize: 'none',
        overflow: 'hidden',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
      rows={Math.max(1, el.text.split('\n').length)}
      onInput={(e) => {
        const t = e.currentTarget
        t.style.height = 'auto'
        t.style.height = `${t.scrollHeight}px`
      }}
    />
  )
}

/** Text style string reused by the overlay; exported for tests. */
export { konvaFontStyle }
