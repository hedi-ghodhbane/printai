import { AlignCenter, AlignLeft, AlignRight, ArrowDownToLine, ArrowUpToLine, Bold, Copy, Italic, Trash2 } from 'lucide-react'
import { FONTS, FONT_CATEGORY_LABELS, getProduct, getSize, type DesignElement, type FontWeight, type TextElement } from '@printai/core'
import { useEditor, selectSelected } from '../store'
import { ColorField } from './ColorField'

export function PropertiesPanel() {
  const el = useEditor(selectSelected)
  return (
    <div className="panel scroll-thin w-full shrink-0 overflow-y-auto border-l border-r-0 md:w-72">
      {el ? <ElementProps el={el} /> : <SideProps />}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <span className="label">{label}</span>
      {children}
    </div>
  )
}

function Num({ value, onChange, step = 1, min, max, suffix }: { value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; suffix?: string }) {
  return (
    <div className="relative">
      <input type="number" className="field field-sm pr-8 font-mono" value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0} step={step} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))} />
      {suffix && <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[0.6rem] text-muted">{suffix}</span>}
    </div>
  )
}

function SideProps() {
  const doc = useEditor((s) => s.doc)!
  const sideIndex = useEditor((s) => s.sideIndex)
  const updateSide = useEditor((s) => s.updateSide)
  const setDoc = useEditor((s) => s.setDoc)
  const checkpoint = useEditor((s) => s.checkpoint)
  const product = getProduct(doc.productSlug)!
  const side = doc.sides[sideIndex]!
  return (
    <div className="p-3">
      <p className="panel-title px-0">{product.name} · {side.name}</p>
      <Row label="Title">
        <input className="field field-sm" value={doc.title} onFocus={checkpoint} onChange={(e) => setDoc((d) => ({ ...d, title: e.target.value }), { transient: true })} />
      </Row>
      <Row label="Size">
        <select
          className="field field-sm"
          value={doc.sizeId}
          onChange={(e) => {
            const size = getSize(product, e.target.value)
            setDoc((d) => ({ ...d, sizeId: size.id, width: size.width, height: size.height }))
          }}
        >
          {product.sizes.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </Row>
      {product.kind === 'paper' ? (
        <Row label="Paper colour">
          <ColorField value={side.background} onChange={(background) => updateSide({ background })} />
        </Row>
      ) : (
        <Row label="Garment colour">
          <div className="flex flex-wrap gap-1">
            {product.garmentColors?.map((c) => (
              <button key={c.id} className="swatch" style={{ background: c.hex }} data-active={doc.garmentColor === c.hex} title={c.label} onClick={() => setDoc((d) => ({ ...d, garmentColor: c.hex }))} />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">The garment is a preview: only the dashed print area is sent to the printer.</p>
        </Row>
      )}
      <p className="mt-6 text-xs text-muted">Select an element to edit it. Double-click text to type. Hold ctrl and scroll to zoom.</p>
    </div>
  )
}

function ElementProps({ el }: { el: DesignElement }) {
  const update = useEditor((s) => s.updateElement)
  const remove = useEditor((s) => s.removeElement)
  const duplicate = useEditor((s) => s.duplicateElement)
  const moveLayer = useEditor((s) => s.moveLayer)
  const doc = useEditor((s) => s.doc)!
  const u = (patch: Partial<DesignElement>, transient = false) => update(el.id, patch, { transient })
  return (
    <div className="p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="panel-title px-0 py-0">{el.type}</p>
        <div className="flex gap-0.5">
          <button className="btn btn-ghost btn-icon" title="Duplicate (ctrl+D)" onClick={() => duplicate(el.id)}><Copy size={14} /></button>
          <button className="btn btn-ghost btn-icon" title="Bring to front" onClick={() => moveLayer(el.id, 'top')}><ArrowUpToLine size={14} /></button>
          <button className="btn btn-ghost btn-icon" title="Send to back" onClick={() => moveLayer(el.id, 'bottom')}><ArrowDownToLine size={14} /></button>
          <button className="btn btn-ghost btn-icon text-vermillion" title="Delete" onClick={() => remove(el.id)}><Trash2 size={14} /></button>
        </div>
      </div>

      {el.type === 'text' && <TextProps el={el} />}

      {(el.type === 'rect' || el.type === 'ellipse') && (
        <>
          <Row label="Fill"><ColorField value={el.fill} onChange={(fill) => u({ fill })} allowTransparent /></Row>
          <Row label="Stroke"><ColorField value={el.stroke} onChange={(stroke) => u({ stroke })} allowTransparent /></Row>
          <div className="grid grid-cols-2 gap-2">
            <Row label="Stroke width"><Num value={el.strokeWidth} step={0.1} min={0} onChange={(strokeWidth) => u({ strokeWidth })} suffix="mm" /></Row>
            {el.type === 'rect' && <Row label="Corner"><Num value={el.cornerRadius} step={0.5} min={0} onChange={(cornerRadius) => u({ cornerRadius })} suffix="mm" /></Row>}
          </div>
        </>
      )}

      {el.type === 'line' && (
        <>
          <Row label="Stroke"><ColorField value={el.stroke} onChange={(stroke) => u({ stroke })} /></Row>
          <div className="grid grid-cols-2 gap-2">
            <Row label="Width"><Num value={el.strokeWidth} step={0.1} min={0.1} onChange={(strokeWidth) => u({ strokeWidth })} suffix="mm" /></Row>
            <Row label="Dash">
              <select className="field field-sm" value={el.dash ? 'dashed' : 'solid'} onChange={(e) => u({ dash: e.target.value === 'dashed' ? [1.5, 1.5] : undefined })}>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
              </select>
            </Row>
          </div>
        </>
      )}

      {el.type === 'image' && (
        <div className="grid grid-cols-2 gap-2">
          <Row label="Fit">
            <select className="field field-sm" value={el.fit} onChange={(e) => u({ fit: e.target.value as 'cover' | 'contain' })}>
              <option value="cover">Cover (crop)</option>
              <option value="contain">Contain</option>
            </select>
          </Row>
          <Row label="Corner"><Num value={el.cornerRadius} step={0.5} min={0} onChange={(cornerRadius) => u({ cornerRadius })} suffix="mm" /></Row>
        </div>
      )}

      <p className="panel-title px-0 mt-2">Position & size</p>
      <div className="grid grid-cols-2 gap-2">
        <Row label="X"><Num value={el.x} step={0.5} onChange={(x) => u({ x })} suffix="mm" /></Row>
        <Row label="Y"><Num value={el.y} step={0.5} onChange={(y) => u({ y })} suffix="mm" /></Row>
        <Row label="Width"><Num value={el.width} step={0.5} min={0.5} onChange={(width) => u({ width })} suffix="mm" /></Row>
        {el.type !== 'text' && el.type !== 'line' && <Row label="Height"><Num value={el.height} step={0.5} min={0.5} onChange={(height) => u({ height })} suffix="mm" /></Row>}
        <Row label="Rotation"><Num value={el.rotation} step={1} onChange={(rotation) => u({ rotation })} suffix="°" /></Row>
        <Row label="Opacity">
          <input type="range" min={0} max={1} step={0.05} value={el.opacity} onChange={(e) => u({ opacity: Number(e.target.value) }, true)} className="w-full accent-ink" />
        </Row>
      </div>
      <div className="flex flex-wrap gap-1">
        <button className="btn btn-outline btn-sm" onClick={() => u({ x: (doc.width - el.width) / 2 })}>Centre ↔</button>
        <button className="btn btn-outline btn-sm" onClick={() => u({ y: (doc.height - el.height) / 2 })}>Centre ↕</button>
        <button className="btn btn-outline btn-sm" onClick={() => u({ locked: !el.locked })}>{el.locked ? 'Unlock' : 'Lock'}</button>
      </div>
    </div>
  )
}

function TextProps({ el }: { el: TextElement }) {
  const update = useEditor((s) => s.updateElement)
  const checkpoint = useEditor((s) => s.checkpoint)
  const u = (patch: Partial<TextElement>, transient = false) => update(el.id, patch, { transient })
  const face = FONTS.find((f) => f.family === el.fontFamily)
  const weights = face?.weights ?? [400, 700]
  const cats = [...new Set(FONTS.map((f) => f.category))]
  return (
    <>
      <Row label="Text">
        <textarea className="field field-sm" rows={3} value={el.text} dir="auto" onFocus={checkpoint} onChange={(e) => u({ text: e.target.value }, true)} />
      </Row>
      <Row label="Font">
        <select className="field field-sm" value={el.fontFamily} style={{ fontFamily: el.fontFamily }} onChange={(e) => {
          const f = FONTS.find((x) => x.family === e.target.value)
          const w = f && !f.weights.includes(el.fontWeight) ? (f.weights[0] as FontWeight) : el.fontWeight
          u({ fontFamily: e.target.value, fontWeight: w, fontStyle: f?.italic ? el.fontStyle : 'normal' })
        }}>
          {cats.map((c) => (
            <optgroup key={c} label={FONT_CATEGORY_LABELS[c]}>
              {FONTS.filter((f) => f.category === c).map((f) => (
                <option key={f.family} value={f.family} style={{ fontFamily: f.family }}>{f.family}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </Row>
      <div className="grid grid-cols-2 gap-2">
        <Row label="Size"><Num value={el.fontSize} step={1} min={3} onChange={(fontSize) => u({ fontSize })} suffix="pt" /></Row>
        <Row label="Weight">
          <select className="field field-sm" value={el.fontWeight} onChange={(e) => u({ fontWeight: Number(e.target.value) as FontWeight })}>
            {weights.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </Row>
      </div>
      <div className="mb-3 flex gap-1">
        <button className={`btn btn-sm ${el.fontWeight >= 700 ? 'btn-ink' : 'btn-outline'}`} title="Bold" onClick={() => u({ fontWeight: el.fontWeight >= 700 ? (weights.includes(400) ? 400 : (weights[0] as FontWeight)) : (weights.find((w) => w >= 700) as FontWeight | undefined) ?? el.fontWeight })}><Bold size={13} /></button>
        <button className={`btn btn-sm ${el.fontStyle === 'italic' ? 'btn-ink' : 'btn-outline'}`} title="Italic" disabled={!face?.italic} onClick={() => u({ fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic' })}><Italic size={13} /></button>
        <button className={`btn btn-sm ${el.uppercase ? 'btn-ink' : 'btn-outline'}`} title="Uppercase" onClick={() => u({ uppercase: !el.uppercase })}>AA</button>
        <span className="flex-1" />
        {(['left', 'center', 'right'] as const).map((a) => (
          <button key={a} className={`btn btn-sm ${el.align === a ? 'btn-ink' : 'btn-outline'}`} onClick={() => u({ align: a })}>
            {a === 'left' ? <AlignLeft size={13} /> : a === 'center' ? <AlignCenter size={13} /> : <AlignRight size={13} />}
          </button>
        ))}
      </div>
      <Row label="Colour"><ColorField value={el.fill} onChange={(fill) => u({ fill })} /></Row>
      <div className="grid grid-cols-2 gap-2">
        <Row label="Line height"><Num value={el.lineHeight} step={0.05} min={0.5} max={3} onChange={(lineHeight) => u({ lineHeight })} /></Row>
        <Row label="Tracking"><Num value={el.letterSpacing} step={0.01} min={-0.1} max={1} onChange={(letterSpacing) => u({ letterSpacing })} suffix="em" /></Row>
      </div>
    </>
  )
}
