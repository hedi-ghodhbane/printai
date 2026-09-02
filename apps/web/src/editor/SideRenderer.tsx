/**
 * Konva rendering of one side. Units are millimetres; the parent group
 * applies the px/mm scale. Used by the interactive canvas and by export.
 */
import { Ellipse, Group, Image as KImage, Line, Path, Rect, Text } from 'react-konva'
import type Konva from 'konva'
import { PT_TO_MM, isArabic, type DesignElement, type DesignSide, type ImageElement, type TextElement } from '@printai/core'
import { useImage } from './assets'
import { MOCKUPS, MOCKUP_UNITS, shade } from '@/components/Mockup'
import type { Mockup as MockupKind } from '@printai/core'

export function konvaFontStyle(el: TextElement) {
  return `${el.fontStyle === 'italic' ? 'italic ' : ''}${el.fontWeight}`
}

export interface ElementHandlers {
  onSelect?: (id: string) => void
  onDragStart?: (id: string) => void
  onDragEnd?: (id: string, x: number, y: number) => void
  onDblClick?: (id: string) => void
  registerNode?: (id: string, node: Konva.Node | null) => void
}

function ImageNode({ el, common }: { el: ImageElement; common: Record<string, unknown> }) {
  const img = useImage(el.src)
  if (!img) return <Rect {...common} width={el.width} height={el.height} fill="rgba(0,0,0,0.05)" stroke="rgba(0,0,0,0.2)" strokeWidth={0.2} dash={[1, 1]} />
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  let crop: { x: number; y: number; width: number; height: number } | undefined
  if (el.fit === 'cover') {
    const target = el.width / el.height
    const src = iw / ih
    if (src > target) {
      const cw = ih * target
      crop = { x: (iw - cw) / 2, y: 0, width: cw, height: ih }
    } else {
      const ch = iw / target
      crop = { x: 0, y: (ih - ch) / 2, width: iw, height: ch }
    }
    return <KImage {...common} image={img} width={el.width} height={el.height} crop={crop} cornerRadius={el.cornerRadius} />
  }
  // contain: letterbox inside the box
  const scale = Math.min(el.width / iw, el.height / ih)
  const w = iw * scale
  const h = ih * scale
  return (
    <Group {...common} width={el.width} height={el.height}>
      <KImage image={img} x={(el.width - w) / 2} y={(el.height - h) / 2} width={w} height={h} cornerRadius={el.cornerRadius} listening={false} />
      <Rect width={el.width} height={el.height} fill="transparent" />
    </Group>
  )
}

export function ElementNode({ el, interactive, handlers, hidden }: { el: DesignElement; interactive: boolean; handlers?: ElementHandlers; hidden?: boolean }) {
  const common = {
    id: el.id,
    name: 'element',
    x: el.x,
    y: el.y,
    rotation: el.rotation,
    opacity: hidden ? 0 : el.opacity,
    draggable: interactive && !el.locked,
    listening: interactive,
    onClick: () => handlers?.onSelect?.(el.id),
    onTap: () => handlers?.onSelect?.(el.id),
    onDragStart: () => handlers?.onDragStart?.(el.id),
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handlers?.onDragEnd?.(el.id, e.target.x(), e.target.y()),
    onDblClick: () => handlers?.onDblClick?.(el.id),
    onDblTap: () => handlers?.onDblClick?.(el.id),
    ref: (node: Konva.Node | null) => handlers?.registerNode?.(el.id, node),
  }
  switch (el.type) {
    case 'rect':
      return <Rect {...common} width={el.width} height={el.height} fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth} cornerRadius={el.cornerRadius} strokeScaleEnabled={false} />
    case 'ellipse':
      return (
        <Ellipse
          {...common}
          x={el.x + el.width / 2}
          y={el.y + el.height / 2}
          offsetX={0}
          radiusX={el.width / 2}
          radiusY={el.height / 2}
          fill={el.fill}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
          onDragEnd={(e) => handlers?.onDragEnd?.(el.id, e.target.x() - el.width / 2, e.target.y() - el.height / 2)}
        />
      )
    case 'line':
      return <Line {...common} points={[0, 0, el.width, el.height]} stroke={el.stroke} strokeWidth={el.strokeWidth} dash={el.dash} hitStrokeWidth={4} lineCap="round" />
    case 'image':
      return <ImageNode el={el} common={common} />
    case 'text': {
      const fontMm = el.fontSize * PT_TO_MM
      return (
        <Text
          {...common}
          width={el.width}
          text={el.uppercase ? el.text.toUpperCase() : el.text}
          fontFamily={el.fontFamily}
          fontSize={fontMm}
          fontStyle={konvaFontStyle(el)}
          fill={el.fill}
          align={el.align}
          lineHeight={el.lineHeight}
          letterSpacing={el.letterSpacing * fontMm}
          direction={isArabic(el.text) ? 'rtl' : 'ltr'}
          wrap="word"
        />
      )
    }
  }
}

/** The garment behind a textile print area, in mm relative to the print area origin. */
export function GarmentNode({ kind, color, printWidth, printHeight }: { kind: MockupKind; color: string; printWidth: number; printHeight: number }) {
  const spec = MOCKUPS[kind]
  const unit = spec.garmentWidthMm / MOCKUP_UNITS[kind].w // mm per viewBox unit
  const garmentH = spec.garmentWidthMm * spec.aspect
  const x = -(spec.printCenterX * spec.garmentWidthMm - printWidth / 2)
  const y = -spec.printTop * garmentH
  void printHeight
  return (
    <Group x={x} y={y} scaleX={unit} scaleY={unit} listening={false}>
      {spec.shapes.map((s, i) => (
        <Path
          key={i}
          data={s.d}
          fill={s.fill === 'none' ? undefined : shade(color, s.fill ?? 'base')}
          stroke={s.stroke ? shade(color, s.stroke) : undefined}
          strokeWidth={s.strokeWidth ?? 0}
          dash={s.dash}
          lineCap="round"
          lineJoin="round"
        />
      ))}
    </Group>
  )
}


export function SideContent({
  side,
  width,
  height,
  bleed,
  interactive,
  handlers,
  editingId,
  garment,
}: {
  side: DesignSide
  width: number
  height: number
  bleed: number
  interactive: boolean
  handlers?: ElementHandlers
  editingId?: string | null
  garment?: { kind: MockupKind; color: string } | null
}) {
  const bg = side.background
  return (
    <>
      {garment && <GarmentNode kind={garment.kind} color={garment.color} printWidth={width} printHeight={height} />}
      {bg !== 'transparent' && <Rect x={-bleed} y={-bleed} width={width + bleed * 2} height={height + bleed * 2} fill={bg} listening={false} />}
      {side.elements.map((el) => (
        <ElementNode key={el.id} el={el} interactive={interactive} handlers={handlers} hidden={editingId === el.id} />
      ))}
    </>
  )
}
