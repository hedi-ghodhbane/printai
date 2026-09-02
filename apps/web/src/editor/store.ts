import { create } from 'zustand'
import {
  type DesignDocument,
  type DesignElement,
  type DesignSide,
  uid,
} from '@printai/core'

const HISTORY_LIMIT = 60

interface EditorState {
  doc: DesignDocument | null
  sideIndex: number
  selectedId: string | null
  editingTextId: string | null
  zoom: number
  past: DesignDocument[]
  future: DesignDocument[]
  dirty: boolean
  saveState: 'idle' | 'saving' | 'saved' | 'error'
  /** the tool panel open on the left */
  panel: 'templates' | 'text' | 'shapes' | 'images' | 'ideas' | 'layers' | null

  load: (doc: DesignDocument) => void
  setPanel: (p: EditorState['panel']) => void
  select: (id: string | null) => void
  setEditingText: (id: string | null) => void
  setSide: (i: number) => void
  setZoom: (z: number) => void
  setSaveState: (s: EditorState['saveState']) => void
  markSaved: () => void

  /** Replace the document (history-tracked). */
  setDoc: (updater: (doc: DesignDocument) => DesignDocument, opts?: { transient?: boolean }) => void
  updateElement: (id: string, patch: Partial<DesignElement>, opts?: { transient?: boolean }) => void
  addElement: (el: DesignElement, opts?: { select?: boolean }) => void
  removeElement: (id: string) => void
  duplicateElement: (id: string) => void
  moveLayer: (id: string, dir: 'up' | 'down' | 'top' | 'bottom') => void
  updateSide: (patch: Partial<DesignSide>) => void
  /** Push the current doc onto history (used before a transient drag/transform). */
  checkpoint: () => void
  undo: () => void
  redo: () => void
}

export const useEditor = create<EditorState>((set, get) => ({
  doc: null,
  sideIndex: 0,
  selectedId: null,
  editingTextId: null,
  zoom: 1,
  past: [],
  future: [],
  dirty: false,
  saveState: 'idle',
  panel: null,

  load: (doc) => set({ doc, sideIndex: 0, selectedId: null, editingTextId: null, past: [], future: [], dirty: false, saveState: 'idle' }),
  setPanel: (panel) => set((s) => ({ panel: s.panel === panel ? null : panel })),
  select: (selectedId) => set({ selectedId, editingTextId: null }),
  setEditingText: (editingTextId) => set({ editingTextId }),
  setSide: (sideIndex) => set({ sideIndex, selectedId: null, editingTextId: null }),
  setZoom: (zoom) => set({ zoom: Math.min(8, Math.max(0.1, zoom)) }),
  setSaveState: (saveState) => set({ saveState }),
  markSaved: () => set({ dirty: false, saveState: 'saved' }),

  checkpoint: () => {
    const { doc, past } = get()
    if (!doc) return
    set({ past: [...past.slice(-HISTORY_LIMIT + 1), doc], future: [] })
  },

  setDoc: (updater, opts) => {
    const { doc, past } = get()
    if (!doc) return
    const next = { ...updater(doc), updatedAt: new Date().toISOString() }
    set({
      doc: next,
      dirty: true,
      saveState: 'idle',
      ...(opts?.transient ? {} : { past: [...past.slice(-HISTORY_LIMIT + 1), doc], future: [] }),
    })
  },

  updateElement: (id, patch, opts) => {
    get().setDoc(
      (doc) => ({
        ...doc,
        sides: doc.sides.map((s, i) =>
          i !== get().sideIndex ? s : { ...s, elements: s.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as DesignElement) : e)) },
        ),
      }),
      opts,
    )
  },

  addElement: (el, opts) => {
    get().setDoc((doc) => ({
      ...doc,
      sides: doc.sides.map((s, i) => (i !== get().sideIndex ? s : { ...s, elements: [...s.elements, el] })),
    }))
    if (opts?.select !== false) set({ selectedId: el.id })
  },

  removeElement: (id) => {
    get().setDoc((doc) => ({
      ...doc,
      sides: doc.sides.map((s, i) => (i !== get().sideIndex ? s : { ...s, elements: s.elements.filter((e) => e.id !== id) })),
    }))
    if (get().selectedId === id) set({ selectedId: null, editingTextId: null })
  },

  duplicateElement: (id) => {
    const side = get().doc?.sides[get().sideIndex]
    const el = side?.elements.find((e) => e.id === id)
    if (!el) return
    const copy = { ...structuredClone(el), id: uid(), x: el.x + 4, y: el.y + 4, locked: false }
    get().addElement(copy)
  },

  moveLayer: (id, dir) => {
    get().setDoc((doc) => ({
      ...doc,
      sides: doc.sides.map((s, i) => {
        if (i !== get().sideIndex) return s
        const els = [...s.elements]
        const idx = els.findIndex((e) => e.id === id)
        if (idx < 0) return s
        const [el] = els.splice(idx, 1)
        const target = dir === 'top' ? els.length : dir === 'bottom' ? 0 : dir === 'up' ? Math.min(els.length, idx + 1) : Math.max(0, idx - 1)
        els.splice(target, 0, el!)
        return { ...s, elements: els }
      }),
    }))
  },

  updateSide: (patch) => {
    get().setDoc((doc) => ({
      ...doc,
      sides: doc.sides.map((s, i) => (i !== get().sideIndex ? s : { ...s, ...patch })),
    }))
  },

  undo: () => {
    const { past, doc, future } = get()
    if (!doc || !past.length) return
    const prev = past[past.length - 1]!
    set({ doc: prev, past: past.slice(0, -1), future: [doc, ...future], dirty: true, saveState: 'idle', selectedId: null, editingTextId: null })
  },
  redo: () => {
    const { past, doc, future } = get()
    if (!doc || !future.length) return
    const next = future[0]!
    set({ doc: next, past: [...past, doc], future: future.slice(1), dirty: true, saveState: 'idle', selectedId: null, editingTextId: null })
  },
}))

export const selectCurrentSide = (s: EditorState) => s.doc?.sides[s.sideIndex] ?? null
export const selectSelected = (s: EditorState) => s.doc?.sides[s.sideIndex]?.elements.find((e) => e.id === s.selectedId) ?? null
