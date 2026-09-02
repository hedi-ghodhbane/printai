/**
 * Lightweight SVG renderer for a design side. Used for thumbnails, galleries
 * and SSR-friendly previews. The editor itself renders with Konva; this
 * renderer approximates text wrapping so previews stay close to the canvas.
 */
import { PT_TO_MM, type DesignDocument, type DesignSide, type TextElement, isArabic } from '@printai/core'

function estimateCharWidth(el: TextElement, fontMm: number) {
  const f = el.fontFamily
  let k = 0.52
  if (/Script|Vibes|Parisienne|Pinyon/.test(f)) k = 0.38
  else if (/Bebas|Oswald/.test(f)) k = 0.4
  else if (/Alfa|Abril|Rye/.test(f)) k = 0.6
  else if (/Cinzel|Montserrat|Poppins/.test(f)) k = 0.6
  else if (/Mono/.test(f)) k = 0.6
  else if (isArabic(el.text)) k = 0.48
  return fontMm * k * (1 + el.letterSpacing)
}

export function wrapText(el: TextElement): string[] {
  const fontMm = el.fontSize * PT_TO_MM
  const cw = estimateCharWidth(el, fontMm)
  const maxChars = Math.max(1, Math.floor(el.width / cw))
  const out: string[] = []
  for (const raw of el.text.split('\n')) {
    const words = raw.split(' ')
    let cur = ''
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w
      if (next.length > maxChars && cur) {
        out.push(cur)
        cur = w
      } else cur = next
    }
    out.push(cur)
  }
  return out
}

export function SideSvg({
  side,
  width,
  height,
  className,
  style,
  background,
}: {
  side: DesignSide
  width: number
  height: number
  className?: string
  style?: React.CSSProperties
  background?: string
}) {
  const bg = background ?? side.background
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} style={style} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      {bg !== 'transparent' && <rect width={width} height={height} fill={bg} />}
      {side.elements.map((el, i) => {
        const cx = el.x + el.width / 2
        const cy = el.y + el.height / 2
        const transform = el.rotation ? `rotate(${el.rotation} ${cx} ${cy})` : undefined
        const common = { transform, opacity: el.opacity }
        switch (el.type) {
          case 'rect':
            return <rect key={i} x={el.x} y={el.y} width={el.width} height={el.height} rx={el.cornerRadius} fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth} {...common} />
          case 'ellipse':
            return <ellipse key={i} cx={cx} cy={cy} rx={el.width / 2} ry={el.height / 2} fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth} {...common} />
          case 'line':
            return <line key={i} x1={el.x} y1={el.y} x2={el.x + el.width} y2={el.y + el.height} stroke={el.stroke} strokeWidth={el.strokeWidth} strokeDasharray={el.dash?.join(' ')} {...common} />
          case 'image':
            return (
              <image key={i} href={el.src} x={el.x} y={el.y} width={el.width} height={el.height} preserveAspectRatio={el.fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'} {...common} />
            )
          case 'text': {
            const fontMm = el.fontSize * PT_TO_MM
            const lines = wrapText(el)
            const lh = fontMm * el.lineHeight
            const anchor = el.align === 'center' ? 'middle' : el.align === 'right' ? 'end' : 'start'
            const tx = el.align === 'center' ? el.x + el.width / 2 : el.align === 'right' ? el.x + el.width : el.x
            const rtl = isArabic(el.text)
            return (
              <text
                key={i}
                fontFamily={`'${el.fontFamily}', serif`}
                fontSize={fontMm}
                fontWeight={el.fontWeight}
                fontStyle={el.fontStyle}
                fill={el.fill}
                textAnchor={anchor}
                letterSpacing={el.letterSpacing ? `${el.letterSpacing}em` : undefined}
                direction={rtl ? 'rtl' : undefined}
                {...common}
              >
                {lines.map((ln, i) => (
                  <tspan key={i} x={tx} y={el.y + lh * i + (lh - fontMm) / 2 + fontMm * 0.8}>
                    {el.uppercase ? ln.toUpperCase() : ln}
                  </tspan>
                ))}
              </text>
            )
          }
        }
      })}
    </svg>
  )
}

export function DocumentSvg({ doc, sideIndex = 0, className, style }: { doc: DesignDocument; sideIndex?: number; className?: string; style?: React.CSSProperties }) {
  const side = doc.sides[sideIndex] ?? doc.sides[0]!
  return <SideSvg side={side} width={doc.width} height={doc.height} className={className} style={style} />
}
