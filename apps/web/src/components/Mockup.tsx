/**
 * Garment mockups, described as path data so both the SVG preview and the
 * Konva canvas draw the same shape. Each mockup knows the physical width of
 * the garment and where the print area sits, so any print size lands at the
 * right scale.
 */
import type { Mockup as MockupKind } from '@printai/core'

type Tone = 'base' | 'darker' | 'darkest' | 'lighter' | 'none'

export interface MockupShape {
  d: string
  fill?: Tone
  stroke?: Tone
  strokeWidth?: number
  dash?: number[]
}

export interface MockupSpec {
  /** physical width of the garment as drawn (mm) */
  garmentWidthMm: number
  /** height / width of the drawing */
  aspect: number
  /** top edge of the print area, fraction of garment height */
  printTop: number
  /** horizontal centre of the print area, fraction of garment width */
  printCenterX: number
  shapes: MockupShape[]
}

export const MOCKUP_UNITS: Record<MockupKind, { w: number; h: number }> = {
  tshirt: { w: 100, h: 110 },
  tote: { w: 100, h: 135 },
  sachet: { w: 100, h: 145 },
}

export const MOCKUPS: Record<MockupKind, MockupSpec> = {
  tshirt: {
    garmentWidthMm: 560,
    aspect: 1.1,
    printTop: 0.27,
    printCenterX: 0.5,
    shapes: [
      { d: 'M34 8 L46 3 Q50 12 54 3 L66 8 L82 15 L94 28 L80 40 L74 34 L74 106 Q50 110 26 106 L26 34 L20 40 L6 28 L18 15 Z', fill: 'base', stroke: 'darker', strokeWidth: 0.6 },
      { d: 'M46 3 Q50 12 54 3 Q50 9 46 3 Z', fill: 'darker' },
      { d: 'M26 34 L26 106 M74 34 L74 106', fill: 'none', stroke: 'darker', strokeWidth: 0.4 },
    ],
  },
  tote: {
    garmentWidthMm: 380,
    aspect: 1.35,
    printTop: 0.42,
    printCenterX: 0.5,
    shapes: [
      { d: 'M30 32 Q30 4 50 4 Q70 4 70 32', fill: 'none', stroke: 'darkest', strokeWidth: 4 },
      { d: 'M30 32 Q30 10 50 10 Q70 10 70 32', fill: 'none', stroke: 'base', strokeWidth: 2 },
      { d: 'M8 32 L92 32 L92 130 L8 130 Z', fill: 'base', stroke: 'darker', strokeWidth: 0.6 },
      { d: 'M8 32 L92 32', fill: 'none', stroke: 'darker', strokeWidth: 0.5 },
    ],
  },
  sachet: {
    garmentWidthMm: 130,
    aspect: 1.45,
    printTop: 0.38,
    printCenterX: 0.5,
    shapes: [
      { d: 'M18 30 Q14 60 12 100 Q12 140 50 142 Q88 140 88 100 Q86 60 82 30 Z', fill: 'base', stroke: 'darker', strokeWidth: 0.6 },
      { d: 'M18 30 Q50 22 82 30 Q50 38 18 30 Z', fill: 'darker', stroke: 'darker', strokeWidth: 0.5 },
      { d: 'M22 12 Q50 4 78 12 L82 30 Q50 22 18 30 Z', fill: 'lighter', stroke: 'darker', strokeWidth: 0.5 },
      { d: 'M18 24 Q50 30 82 24', fill: 'none', stroke: 'darkest', strokeWidth: 1.2, dash: [2, 1.5] },
      { d: 'M46 24 q-6 8 -3 14 M54 24 q6 8 3 14', fill: 'none', stroke: 'darkest', strokeWidth: 1.1 },
    ],
  },
}

export function shade(hex: string, tone: Tone) {
  const amt = tone === 'darker' ? -25 : tone === 'darkest' ? -55 : tone === 'lighter' ? 8 : 0
  if (!amt) return hex
  const n = parseInt(hex.replace('#', ''), 16)
  const c = (v: number) => Math.max(0, Math.min(255, v + amt))
  return `#${((c(n >> 16) << 16) | (c((n >> 8) & 0xff) << 8) | c(n & 0xff)).toString(16).padStart(6, '0')}`
}

export function GarmentSvg({ kind, color, style }: { kind: MockupKind; color: string; style?: React.CSSProperties }) {
  const u = MOCKUP_UNITS[kind]
  return (
    <svg viewBox={`0 0 ${u.w} ${u.h}`} preserveAspectRatio="none" style={style} xmlns="http://www.w3.org/2000/svg">
      {MOCKUPS[kind].shapes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          fill={s.fill === 'none' || !s.fill ? 'none' : shade(color, s.fill)}
          stroke={s.stroke ? shade(color, s.stroke) : 'none'}
          strokeWidth={s.strokeWidth ?? 0}
          strokeDasharray={s.dash?.join(' ')}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

export function MockupFrame({
  kind,
  color,
  printWidthMm,
  printHeightMm,
  children,
  className,
  showArea = false,
}: {
  kind: MockupKind
  color: string
  printWidthMm: number
  printHeightMm: number
  children: React.ReactNode
  className?: string
  showArea?: boolean
}) {
  const spec = MOCKUPS[kind]
  const wFrac = printWidthMm / spec.garmentWidthMm
  const hFrac = printHeightMm / (spec.garmentWidthMm * spec.aspect)
  return (
    <div className={className} style={{ position: 'relative', aspectRatio: `1 / ${spec.aspect}` }}>
      <GarmentSvg kind={kind} color={color} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          left: `${(spec.printCenterX - wFrac / 2) * 100}%`,
          top: `${spec.printTop * 100}%`,
          width: `${wFrac * 100}%`,
          height: `${hFrac * 100}%`,
          outline: showArea ? '1px dashed rgba(26,23,20,0.35)' : undefined,
        }}
      >
        {children}
      </div>
    </div>
  )
}
