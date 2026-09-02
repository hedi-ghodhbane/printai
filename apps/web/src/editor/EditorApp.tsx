import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Download, Minus, Plus, Printer, Redo2, Save, Undo2 } from 'lucide-react'
import { getProduct, type DesignDocument } from '@printai/core'
import { useEditor } from './store'
import { Canvas } from './Canvas'
import { ToolPanel, ToolRail } from './panels/ToolsPanel'
import { PropertiesPanel } from './panels/PropertiesPanel'
import { renderSidePng, downloadDataUrl } from './export'
import { saveDesign } from '@/lib/designs-repo'

export function EditorApp({ initial }: { initial: DesignDocument }) {
  const load = useEditor((s) => s.load)
  const doc = useEditor((s) => s.doc)
  const dirty = useEditor((s) => s.dirty)
  const saveState = useEditor((s) => s.saveState)
  const setSaveState = useEditor((s) => s.setSaveState)
  const markSaved = useEditor((s) => s.markSaved)
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    load(initial)
  }, [initial, load])

  // autosave
  const timer = useRef<number | null>(null)
  useEffect(() => {
    if (!doc || !dirty) return
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(async () => {
      setSaveState('saving')
      try {
        await saveDesign(doc)
        markSaved()
      } catch {
        setSaveState('error')
      }
    }, 800)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [doc, dirty, setSaveState, markSaved])

  const saveNow = useCallback(async () => {
    const d = useEditor.getState().doc
    if (!d) return
    setSaveState('saving')
    await saveDesign(d)
    markSaved()
  }, [setSaveState, markSaved])

  useKeyboardShortcuts()

  if (!doc) return null
  const product = getProduct(doc.productSlug)

  return (
    <div className="flex h-screen flex-col bg-paper">
      <TopBar
        saveState={saveState}
        onSave={saveNow}
        onExport={async () => {
          setExporting(true)
          try {
            const state = useEditor.getState()
            const png = await renderSidePng(state.doc!, state.sideIndex, 300)
            downloadDataUrl(png, `${doc.title.replace(/[^\w-]+/g, '-') || 'design'}-${doc.sides[state.sideIndex]!.name.toLowerCase()}-300dpi.png`)
          } finally {
            setExporting(false)
          }
        }}
        exporting={exporting}
        onOrder={async () => {
          await saveNow()
          void navigate({ to: '/checkout/$designId', params: { designId: doc.id } })
        }}
        productName={product?.name ?? ''}
      />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="flex min-h-0 md:contents">
          <ToolRail />
          <ToolPanel />
        </div>
        <div className="relative min-h-[45vh] flex-1 md:min-h-0">
          <Canvas />
          <ZoomControls />
        </div>
        <div className="max-h-[40vh] md:max-h-none md:h-auto flex">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  )
}

function TopBar({ saveState, onSave, onExport, exporting, onOrder, productName }: { saveState: string; onSave: () => void; onExport: () => void; exporting: boolean; onOrder: () => void; productName: string }) {
  const doc = useEditor((s) => s.doc)!
  const sideIndex = useEditor((s) => s.sideIndex)
  const setSide = useEditor((s) => s.setSide)
  const undo = useEditor((s) => s.undo)
  const redo = useEditor((s) => s.redo)
  const past = useEditor((s) => s.past.length)
  const future = useEditor((s) => s.future.length)
  const setDoc = useEditor((s) => s.setDoc)
  const checkpoint = useEditor((s) => s.checkpoint)
  return (
    <div className="flex items-center gap-2 border-b border-line bg-paper px-3 py-2">
      <Link to="/designs" className="btn btn-ghost btn-sm" title="My designs"><ArrowLeft size={16} /></Link>
      <div className="hidden min-w-0 sm:block">
        <input className="w-56 truncate border-0 bg-transparent font-display text-base outline-none focus:underline" value={doc.title} onFocus={checkpoint} onChange={(e) => setDoc((d) => ({ ...d, title: e.target.value }), { transient: true })} />
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-muted">{productName} · {doc.width}×{doc.height} mm</p>
      </div>
      <div className="mx-auto flex items-center gap-1 rounded-sm border border-line p-0.5">
        {doc.sides.map((s, i) => (
          <button key={s.id} className={`btn btn-sm ${i === sideIndex ? 'btn-ink' : 'btn-ghost'}`} onClick={() => setSide(i)}>{s.name}</button>
        ))}
      </div>
      <button className="btn btn-ghost btn-icon" onClick={undo} disabled={!past} title="Undo (ctrl+Z)"><Undo2 size={16} /></button>
      <button className="btn btn-ghost btn-icon" onClick={redo} disabled={!future} title="Redo (ctrl+shift+Z)"><Redo2 size={16} /></button>
      <span className="hidden w-16 text-right font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted sm:block">
        {saveState === 'saving' ? 'saving…' : saveState === 'saved' ? 'saved' : saveState === 'error' ? 'not saved' : ''}
      </span>
      <button className="btn btn-ghost btn-sm" onClick={onSave} title="Save"><Save size={15} /><span className="hidden lg:inline">Save</span></button>
      <button className="btn btn-outline btn-sm" onClick={onExport} disabled={exporting} title="Download this side as a 300 dpi PNG"><Download size={15} /><span className="hidden lg:inline">{exporting ? 'Rendering…' : 'PNG'}</span></button>
      <button className="btn btn-vermillion btn-sm" onClick={onOrder}><Printer size={15} /> Order prints</button>
    </div>
  )
}

function ZoomControls() {
  const zoom = useEditor((s) => s.zoom)
  const setZoom = useEditor((s) => s.setZoom)
  return (
    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-sm border border-line bg-paper p-0.5 shadow-card">
      <button className="btn btn-ghost btn-icon" onClick={() => setZoom(zoom / 1.2)}><Minus size={14} /></button>
      <button className="w-14 font-mono text-xs" onClick={() => setZoom(1)} title="Actual size">{Math.round(zoom * 100)}%</button>
      <button className="btn btn-ghost btn-icon" onClick={() => setZoom(zoom * 1.2)}><Plus size={14} /></button>
    </div>
  )
}

function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useEditor.getState()
      const target = e.target as HTMLElement | null
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      if (typing) return
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        e.shiftKey ? s.redo() : s.undo()
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        s.redo()
      } else if (mod && e.key.toLowerCase() === 'd' && s.selectedId) {
        e.preventDefault()
        s.duplicateElement(s.selectedId)
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && s.selectedId) {
        e.preventDefault()
        s.removeElement(s.selectedId)
      } else if (e.key === 'Escape') {
        s.select(null)
      } else if (e.key.startsWith('Arrow') && s.selectedId) {
        e.preventDefault()
        const step = e.shiftKey ? 5 : 1
        const el = s.doc?.sides[s.sideIndex]?.elements.find((x) => x.id === s.selectedId)
        if (!el || el.locked) return
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
        s.updateElement(el.id, { x: el.x + dx, y: el.y + dy })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
