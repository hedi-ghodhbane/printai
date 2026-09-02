import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowDown, ArrowUp, Eye, Image as ImageIcon, Layers, Lightbulb, LayoutTemplate, Lock, Shapes, Type, Unlock } from 'lucide-react'
import {
  FONTS,
  OCCASIONS,
  documentFromTemplate,
  elementLabel,
  ellipse,
  getProduct,
  ideasFor,
  image,
  line,
  rect,
  templatesFor,
  text,
  type DesignDocument,
} from '@printai/core'
import { useEditor } from '../store'
import { fileToDataUrl, loadImage } from '../assets'
import { DesignThumb } from '@/components/DesignThumb'
import { templatePreview } from '@/lib/previews'

const TOOLS = [
  { id: 'templates', label: 'Ideas', icon: LayoutTemplate },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'shapes', label: 'Shapes', icon: Shapes },
  { id: 'images', label: 'Photos', icon: ImageIcon },
  { id: 'ideas', label: 'Assist', icon: Lightbulb },
  { id: 'layers', label: 'Layers', icon: Layers },
] as const

export function ToolRail() {
  const panel = useEditor((s) => s.panel)
  const setPanel = useEditor((s) => s.setPanel)
  return (
    <div className="panel flex w-16 shrink-0 flex-col items-stretch gap-0.5 p-1.5">
      {TOOLS.map((t) => (
        <button key={t.id} className="tool-btn" data-active={panel === t.id} onClick={() => setPanel(t.id)} title={t.label}>
          <t.icon size={18} />
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function ToolPanel() {
  const panel = useEditor((s) => s.panel)
  if (!panel) return null
  return (
    <div className="panel scroll-thin w-72 shrink-0 overflow-y-auto">
      {panel === 'templates' && <TemplatesPanel />}
      {panel === 'text' && <TextPanel />}
      {panel === 'shapes' && <ShapesPanel />}
      {panel === 'images' && <ImagesPanel />}
      {panel === 'ideas' && <IdeasPanel />}
      {panel === 'layers' && <LayersPanel />}
    </div>
  )
}

function TemplatesPanel() {
  const doc = useEditor((s) => s.doc)!
  const setDoc = useEditor((s) => s.setDoc)
  const product = getProduct(doc.productSlug)
  const list = templatesFor({ productSlug: doc.productSlug })
  const apply = (id: string) => {
    const t = list.find((x) => x.id === id)!
    const fresh = documentFromTemplate(t, { sizeId: doc.sizeId, title: doc.title })
    setDoc((d) => ({ ...d, sides: fresh.sides, garmentColor: fresh.garmentColor ?? d.garmentColor, templateId: t.id }))
  }
  return (
    <div className="p-3">
      <p className="panel-title px-0">Templates · {product?.name}</p>
      <p className="mb-3 text-xs text-muted">Applying a template replaces the current layout (undo is available).</p>
      <div className="grid grid-cols-2 gap-2">
        {list.map((t) => (
          <button key={t.id} className="paper-card overflow-hidden p-2 text-left transition hover:-translate-y-0.5" onClick={() => apply(t.id)}>
            <div className="aspect-[4/5]">
              <DesignThumb doc={templatePreview(t)} className="h-full w-full" />
            </div>
            <p className="mt-1 truncate text-xs font-semibold">{t.name}</p>
          </button>
        ))}
      </div>
      <Link to="/templates" search={{}} className="btn btn-ghost btn-sm mt-3 w-full">Browse all products →</Link>
    </div>
  )
}

function useAdd() {
  const add = useEditor((s) => s.addElement)
  const doc = useEditor((s) => s.doc)!
  return { add, doc }
}

function TextPanel() {
  const { add, doc } = useAdd()
  const cx = doc.width / 2
  const presets = [
    { label: 'Headline', text: 'Sarra & Mehdi', fontFamily: 'Fraunces', fontSize: Math.max(14, doc.width / 4), fontWeight: 500 as const },
    { label: 'Script', text: 'avec amour', fontFamily: 'Pinyon Script', fontSize: Math.max(14, doc.width / 4) },
    { label: 'Small caps', text: 'SAMEDI 12 JUILLET 2026', fontFamily: 'Cinzel', fontSize: Math.max(7, doc.width / 10), letterSpacing: 0.15 },
    { label: 'Body', text: 'Nous avons le plaisir de vous inviter…', fontFamily: 'Cormorant Garamond', fontSize: Math.max(8, doc.width / 9), fontStyle: 'italic' as const },
    { label: 'Arabic', text: 'بسم الله الرحمن الرحيم', fontFamily: 'Amiri', fontSize: Math.max(10, doc.width / 6) },
    { label: 'Bold', text: 'CLASS OF 2026', fontFamily: 'Bebas Neue', fontSize: Math.max(16, doc.width / 3) },
  ]
  const ornaments = ['❦', '❧', '✦', '⁂', '☽', '★', '✿', '❀', '♛', '⚜', '✧', '❖']
  return (
    <div className="p-3">
      <p className="panel-title px-0">Add text</p>
      <div className="space-y-2">
        {presets.map((p) => (
          <button
            key={p.label}
            className="paper-card w-full px-3 py-2 text-left hover:-translate-y-0.5"
            style={{ fontFamily: p.fontFamily }}
            onClick={() => add(text({ ...p, x: cx - doc.width * 0.4, y: doc.height / 2 - 5, width: doc.width * 0.8, fill: '#1a1714' }))}
          >
            <span className="block truncate text-base">{p.text}</span>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted" style={{ fontFamily: 'var(--font-mono)' }}>{p.label} · {p.fontFamily}</span>
          </button>
        ))}
      </div>
      <p className="panel-title px-0 mt-4">Ornaments</p>
      <div className="grid grid-cols-6 gap-1">
        {ornaments.map((o) => (
          <button key={o} className="paper-card aspect-square text-xl hover:-translate-y-0.5" style={{ fontFamily: 'Fraunces' }} onClick={() => add(text({ x: cx - 8, y: doc.height / 2 - 6, width: 16, text: o, fontFamily: 'Fraunces', fontSize: Math.max(12, doc.width / 6), fill: '#c9a24d', name: 'Ornament' }))}>
            {o}
          </button>
        ))}
      </div>
      <p className="panel-title px-0 mt-4">Type case</p>
      <div className="grid grid-cols-2 gap-1">
        {FONTS.map((f) => (
          <button
            key={f.family}
            className="truncate rounded-sm border border-line px-2 py-1 text-left text-sm hover:bg-paper-2"
            style={{ fontFamily: f.family }}
            onClick={() => add(text({ x: cx - doc.width * 0.35, y: doc.height / 2 - 5, width: doc.width * 0.7, text: f.sample ?? 'Your text', fontFamily: f.family, fontSize: Math.max(10, doc.width / 6) }))}
          >
            {f.sample ?? f.family}
          </button>
        ))}
      </div>
    </div>
  )
}

function ShapesPanel() {
  const { add, doc } = useAdd()
  const s = Math.min(doc.width, doc.height) * 0.3
  const cx = doc.width / 2
  const cy = doc.height / 2
  const items = [
    { label: 'Rectangle', make: () => rect({ x: cx - s / 2, y: cy - s / 2, width: s, height: s, fill: '#1a1714' }) },
    { label: 'Rounded', make: () => rect({ x: cx - s / 2, y: cy - s / 2, width: s, height: s, fill: '#b5382a', cornerRadius: s / 6 }) },
    { label: 'Frame', make: () => rect({ x: 4, y: 4, width: doc.width - 8, height: doc.height - 8, fill: 'transparent', stroke: '#1a1714', strokeWidth: 0.5, name: 'Frame' }) },
    { label: 'Double frame', make: () => rect({ x: 6, y: 6, width: doc.width - 12, height: doc.height - 12, fill: 'transparent', stroke: '#c9a24d', strokeWidth: 0.25, name: 'Inner frame' }) },
    { label: 'Circle', make: () => ellipse({ x: cx - s / 2, y: cy - s / 2, width: s, height: s, fill: '#c9a24d' }) },
    { label: 'Ring', make: () => ellipse({ x: cx - s / 2, y: cy - s / 2, width: s, height: s, fill: 'transparent', stroke: '#1a1714', strokeWidth: 0.6 }) },
    { label: 'Rule', make: () => line({ x: cx - s, y: cy, width: s * 2, stroke: '#1a1714', strokeWidth: 0.4 }) },
    { label: 'Dotted rule', make: () => line({ x: cx - s, y: cy, width: s * 2, stroke: '#b5382a', strokeWidth: 0.4, dash: [1, 1.5] }) },
    { label: 'Band', make: () => rect({ x: 0, y: 0, width: doc.width, height: doc.height * 0.25, fill: '#2f4858', name: 'Band' }) },
    { label: 'Side bar', make: () => rect({ x: 0, y: 0, width: doc.width * 0.08, height: doc.height, fill: '#1a1714', name: 'Bar' }) },
  ]
  return (
    <div className="p-3">
      <p className="panel-title px-0">Shapes & rules</p>
      <div className="grid grid-cols-2 gap-2">
        {items.map((it) => (
          <button key={it.label} className="paper-card px-3 py-3 text-left text-sm hover:-translate-y-0.5" onClick={() => add(it.make())}>
            {it.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ImagesPanel() {
  const { add, doc } = useAdd()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    try {
      for (const f of Array.from(files)) {
        const src = await fileToDataUrl(f)
        const img = await loadImage(src)
        const maxW = doc.width * 0.6
        const w = Math.min(maxW, doc.width * 0.6)
        const h = (w * img.height) / img.width
        add(image({ x: doc.width / 2 - w / 2, y: doc.height / 2 - h / 2, width: w, height: h, src, name: f.name }))
      }
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }
  return (
    <div className="p-3">
      <p className="panel-title px-0">Photos & logos</p>
      <label
        className="paper-card flex cursor-pointer flex-col items-center justify-center gap-2 border-dashed p-6 text-center text-sm text-ink-soft"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          void onFiles(e.dataTransfer.files)
        }}
      >
        <ImageIcon size={22} />
        {busy ? 'Preparing…' : 'Drop an image here or click to upload'}
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted">PNG · JPG · SVG · max 2400px kept</span>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => void onFiles(e.target.files)} />
      </label>
      <p className="mt-3 text-xs text-muted">Tip: for print, upload logos as PNG with transparent background and photos at the largest size you have.</p>
    </div>
  )
}

function IdeasPanel() {
  const doc = useEditor((s) => s.doc)!
  const setDoc = useEditor((s) => s.setDoc)
  const add = useEditor((s) => s.addElement)
  const product = getProduct(doc.productSlug)
  const [occasion, setOccasion] = useState(product?.occasions[0] ?? 'wedding')
  const [prompt, setPrompt] = useState('')
  const ideas = ideasFor(occasion)
  return (
    <div className="p-3">
      <p className="panel-title px-0">Assistant</p>
      <p className="mb-3 text-xs text-muted">Curated ideas today; a model-backed assistant that drafts copy and layouts from your brief is coming.</p>
      <select className="field field-sm" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
        {Object.entries(OCCASIONS).map(([id, o]) => (
          <option key={id} value={id}>{o.emoji} {o.label}</option>
        ))}
      </select>
      <textarea className="field field-sm mt-2" rows={2} placeholder="Describe it: « tahour de Youssef, 5 octobre, thème bleu ciel »" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <div className="mt-3 space-y-2">
        {ideas.map((idea) => (
          <div key={idea.id} className="paper-card p-3">
            <p className="text-sm font-semibold">{idea.title}</p>
            <p className="text-xs text-ink-soft">{idea.description}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {idea.templateId && templatesFor({ productSlug: doc.productSlug }).some((t) => t.id === idea.templateId) && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    const t = templatesFor({}).find((x) => x.id === idea.templateId)!
                    const fresh = documentFromTemplate(t, { sizeId: doc.sizeId, title: doc.title })
                    setDoc((d) => ({ ...d, sides: fresh.sides, garmentColor: fresh.garmentColor ?? d.garmentColor, templateId: t.id }))
                  }}
                >
                  Use layout
                </button>
              )}
              {idea.copy?.headline && (
                <button className="btn btn-ghost btn-sm" onClick={() => add(text({ x: doc.width * 0.1, y: doc.height * 0.4, width: doc.width * 0.8, text: idea.copy!.headline!, fontFamily: 'Fraunces', fontSize: Math.max(14, doc.width / 5) }))}>
                  + headline
                </button>
              )}
              {idea.copy?.body && (
                <button className="btn btn-ghost btn-sm" onClick={() => add(text({ x: doc.width * 0.1, y: doc.height * 0.6, width: doc.width * 0.8, text: idea.copy!.body!, fontFamily: 'Cormorant Garamond', fontSize: Math.max(8, doc.width / 10) }))}>
                  + details
                </button>
              )}
            </div>
          </div>
        ))}
        {!ideas.length && <p className="text-xs text-muted">No curated ideas for this occasion yet.</p>}
      </div>
    </div>
  )
}

function LayersPanel() {
  const doc = useEditor((s) => s.doc)!
  const sideIndex = useEditor((s) => s.sideIndex)
  const selectedId = useEditor((s) => s.selectedId)
  const select = useEditor((s) => s.select)
  const moveLayer = useEditor((s) => s.moveLayer)
  const updateElement = useEditor((s) => s.updateElement)
  const els = [...doc.sides[sideIndex]!.elements].reverse()
  return (
    <div className="p-3">
      <p className="panel-title px-0">Layers · {doc.sides[sideIndex]!.name}</p>
      <ul className="space-y-1">
        {els.map((el) => (
          <li key={el.id} className={`flex items-center gap-1 rounded-sm border px-2 py-1 text-xs ${selectedId === el.id ? 'border-ink bg-paper-2' : 'border-line'}`}>
            <button className="flex-1 truncate text-left" onClick={() => select(el.id)}>
              <span className="mr-1 font-mono text-[0.6rem] uppercase text-muted">{el.type}</span>
              {elementLabel(el)}
            </button>
            <button className="btn btn-ghost btn-icon" title="Bring forward" onClick={() => moveLayer(el.id, 'up')}><ArrowUp size={12} /></button>
            <button className="btn btn-ghost btn-icon" title="Send backward" onClick={() => moveLayer(el.id, 'down')}><ArrowDown size={12} /></button>
            <button className="btn btn-ghost btn-icon" title={el.locked ? 'Unlock' : 'Lock'} onClick={() => updateElement(el.id, { locked: !el.locked })}>
              {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
            <button className="btn btn-ghost btn-icon" title="Toggle visibility" onClick={() => updateElement(el.id, { opacity: el.opacity === 0 ? 1 : 0 })}><Eye size={12} className={el.opacity === 0 ? 'opacity-30' : ''} /></button>
          </li>
        ))}
        {!els.length && <li className="text-xs text-muted">Nothing on this side yet.</li>}
      </ul>
    </div>
  )
}

export type { DesignDocument }
