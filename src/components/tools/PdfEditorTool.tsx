/**
 * AI PDF Studio — the embedded tool.
 *
 * D2: a working editor. Open a PDF (pdf.js, on-device), add text, whiteout,
 * highlights, images and drawn signatures as overlay elements, move/resize
 * them, undo, and export with pdf-lib — all without any upload.
 */
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { toast } from 'sonner'
import {
  ChevronLeft, ChevronRight, Download, FileEdit, Minus, Plus, Loader2, Undo2, Trash2, Copy,
  Type, Eraser, Highlighter, Image as ImageIcon, PenLine, MousePointer2, TextCursorInput, Sparkles, Maximize,
} from 'lucide-react'
import { useToolGate } from '@/hooks/useToolGate'
import PdfAiPanel, { type DocLine } from './PdfAiPanel'
import { cn } from '@/utils/cn'
import {
  buildEditedPdf, buildLineReplacements, extractTextItems, formatBytes, groupSameStyleBlock, loadDoc, registerEmbeddedFonts, renderPage,
  sampleTextColors, styleForLine, FONT_CSS, type LoadedDoc, type PdfTextItem, type PageEdits, type PdfElement,
} from '@/utils/pdfEngine'

/** CSS font stack for an element. pdf.js registers every used (embedded) font in
 * document.fonts under its loadedName (e.g. "g_d0_f1"), so we ALWAYS list that
 * first — the browser then renders with the exact font from the PDF even when it
 * isn't installed on the machine. The real family name (when known) and the
 * closest standard family follow as fallbacks. */
const fontStack = (el: Pick<PdfElement, 'cssFont' | 'realFamily' | 'family'>) => {
  const parts: string[] = []
  if (el.cssFont) parts.push(`'${el.cssFont}'`)
  if (el.realFamily) parts.push(`'${el.realFamily}'`)
  parts.push(FONT_CSS[el.family || 'helv'])
  return parts.join(', ')
}

const MAX_MB = 200

type Mode = 'select' | 'edittext' | 'text' | 'whiteout' | 'highlight' | 'image' | 'signature'

const MODES: { key: Mode; label: string; Icon: typeof Type }[] = [
  { key: 'select', label: 'Select', Icon: MousePointer2 },
  { key: 'edittext', label: 'Edit existing text', Icon: TextCursorInput },
  { key: 'text', label: 'Text', Icon: Type },
  { key: 'whiteout', label: 'Cover', Icon: Eraser },
  { key: 'highlight', label: 'Highlight', Icon: Highlighter },
  { key: 'image', label: 'Image', Icon: ImageIcon },
  { key: 'signature', label: 'Sign', Icon: PenLine },
]

const TEXT_COLORS = ['#111111', '#6D28D9', '#DC2626', '#1D4ED8', '#15803D']
const HL_COLORS = ['#FFE066', '#A7F3D0', '#BFDBFE', '#FBCFE8']

let uid = 0
const newId = () => `el-${Date.now()}-${uid++}`

export function PdfEditorTool({ simple = false }: { simple?: boolean }) {
  const { gate } = useToolGate('pdf')
  const [doc, setDoc] = useState<LoadedDoc | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(1)
  /** Auto-fit: keep the WHOLE page visible at all times (disabled by manual zoom). */
  const [fitMode, setFitMode] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [mode, setMode] = useState<Mode>('select')
  const [edits, setEdits] = useState<PageEdits>({})
  const [history, setHistory] = useState<PageEdits[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [sigOpen, setSigOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  /** Text line the user clicked for the AI assistant (see onCanvasClick). */
  const [aiPick, setAiPick] = useState<DocLine | null>(null)
  /** True while the AI asked the user to click a text line (click in ANY mode picks it). */
  const [aiNeedsSel, setAiNeedsSel] = useState(false)
  /** Bbox (PDF points) to blink on the page: after the user clicks a line for the
   *  AI ("pick", blue) and after the AI applies an edit ("applied", green). */
  const [aiFlash, setAiFlash] = useState<{ page: number; x: number; y: number; w: number; h: number; kind?: 'pick' | 'applied' } | null>(null)
  useEffect(() => {
    if (!aiFlash) return
    const t = setTimeout(() => setAiFlash(null), 2600)
    return () => clearTimeout(t)
  }, [aiFlash])
  const [textColor, setTextColor] = useState(TEXT_COLORS[0])
  const [hlColor, setHlColor] = useState(HL_COLORS[0])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const imgInputRef = useRef<HTMLInputElement>(null)

  const openFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast.error('Please choose a PDF file')
        return
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        toast.error(`PDF is larger than ${MAX_MB} MB`)
        return
      }
      if (!gate()) return
      setLoading(true)
      try {
        const loaded = await loadDoc(file)
        setDoc(loaded)
        editsRef.current = {}
        docLinesRef.current = null
        setEdits({})
        setHistory([])
        setSelected(null)
        setPage(1)
        setFitMode(true)
        setMode('select')
        toast.success(`${loaded.name} — ${loaded.pages.length} pages`)
      } catch {
        toast.error('Could not open this PDF (it may be password-protected or corrupted)')
      } finally {
        setLoading(false)
      }
    },
    [gate],
  )

  // Render the active page whenever doc/page/zoom changes.
  useEffect(() => {
    if (!doc || !canvasRef.current) return
    let alive = true
    const base = doc.pages[page - 1]?.width ?? 612
    renderPage(doc, page, canvasRef.current, Math.round(base * zoom)).catch(() => {
      if (alive) toast.error('Page render failed')
    })
    return () => {
      alive = false
    }
  }, [doc, page, zoom])

  /** Authoritative, synchronously-updated store. React `edits` mirrors it for
   * rendering only — the ref is the single source of truth for every mutation
   * and for Save, so the last keystroke/commit can never be lost to a
   * stale-state race. NOTE: never re-assign this from state during render. */
  const editsRef = useRef<PageEdits>({})
  const pushHistory = () => setHistory((h) => [...h.slice(-49), editsRef.current])
  const commitHistory = pushHistory
  /** Apply a mutation synchronously to the ref AND schedule a re-render. */
  const applyEdits = (mut: (cur: PageEdits) => PageEdits) => {
    const next = mut(editsRef.current)
    editsRef.current = next
    setEdits(next)
  }

  const addElement = (el: Omit<PdfElement, 'id'>) => {
    const full: PdfElement = { id: newId(), ...el }
    applyEdits((cur) => {
      pushHistory()
      return { ...cur, [page]: [...(cur[page] ?? []), full] }
    })
    setSelected(full.id)
  }

  const updateEl = (id: string, patch: Partial<PdfElement>) =>
    applyEdits((cur) => {
      // ids are unique document-wide — find which page holds this element and
      // patch it there, so editing works no matter which page is open.
      const target = Object.keys(cur).find((p) => (cur[p as unknown as number] ?? []).some((e: PdfElement) => e.id === id))
      if (!target) return cur
      return { ...cur, [target as unknown as number]: (cur[target as unknown as number] ?? []).map((e: PdfElement) => (e.id === id ? { ...e, ...patch } : e)) }
    })

  const removeEl = (id: string) => {
    applyEdits((cur) => {
      pushHistory()
      return { ...cur, [page]: (cur[page] ?? []).filter((e) => e.id !== id) }
    })
    setSelected(null)
  }

  const duplicateEl = (id: string) => {
    const el = (editsRef.current[page] ?? []).find((e) => e.id === id)
    if (el) addElement({ ...el, x: el.x + 16, y: el.y + 16 })
  }

  /** Original document text lines (for the AI panel) — cached per document.
   *  Each line carries its bbox (PDF pts, origin top-left) so the AI can
   *  highlight / cover / delete it by region, not just rewrite its text. */
  const docLinesRef = useRef<DocLine[] | null>(null)
  const getDocLines = useCallback(async (): Promise<DocLine[]> => {
    if (!doc) return []
    if (docLinesRef.current) return docLinesRef.current
    const out: DocLine[] = []
    for (let p = 1; p <= doc.pages.length; p++) {
      try {
        const items = await extractTextItems(doc, p)
        items.forEach((it, i) => {
          const text = it.text.replace(/\s+/g, ' ').trim()
          if (text) out.push({ page: p, id: `o${p}_${i}`, text, x: it.x, y: it.y, w: it.w, h: it.h })
        })
      } catch { /* unreadable page — skip */ }
    }
    docLinesRef.current = out
    return out
  }, [doc])

  /** AI-driven replacement of ORIGINAL PDF text — the same "Edit existing text"
   *  mechanics (whiteout + styled text element), matched by text instead of a
   *  canvas click. `fontOverride` (pt) restyles the replacement. Returns true
   *  when the replacement was applied. */
  const aiReplaceText = useCallback(async (targetPage: number, findText: string, next: string, fontOverride?: number): Promise<boolean> => {
    // The document text changes — cached line ids/bboxes become stale.
    docLinesRef.current = null
    if (!doc) return false
    if (!next.trim()) return false // never blank out a line
    try {
      const items = await extractTextItems(doc, targetPage)
      if (!items.length) return false
      const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()
      const want = norm(findText)
      let hit = items.find((it) => norm(it.text) === want)
      if (!hit) hit = items.find((it) => norm(it.text).includes(want) || want.includes(norm(it.text)))
      if (!hit) return false
      const group = groupSameStyleBlock(items, hit)
      const bx = Math.min(...group.map((l) => l.x))
      const by = Math.min(...group.map((l) => l.y))
      const br = Math.max(...group.map((l) => l.x + l.w))
      const bb = Math.max(...group.map((l) => l.y + l.h))
      // If this line already has an applied edit (a text element placed exactly
      // over the original), update its text instead of stacking another whiteout.
      const prev = (editsRef.current[targetPage] ?? []).find(
        (e) => e.kind === 'text' && Math.abs(e.x - bx) < 3 && Math.abs(e.y - by) < 3,
      )
      if (prev) {
        applyEdits((cur) => {
          pushHistory()
          const els = cur[targetPage] ?? []
          return { ...cur, [targetPage]: els.map((e) => (e.id === prev.id ? { ...e, text: next, ...(fontOverride ? { fontSize: fontOverride } : {}) } : e)) }
        })
        setSelected(prev.id)
        return true
      }
      registerEmbeddedFonts()
      const canvas = canvasRef.current
      let colors = { color: '#111111', bg: '#ffffff' }
      try { if (canvas) colors = sampleTextColors(canvas, { x: bx, y: by, w: br - bx, h: bb - by }, doc.pages[targetPage - 1]?.width ?? 612) } catch { /* defaults */ }
      const st = group[0]
      const fontSize = fontOverride && fontOverride > 2 && fontOverride < 200 ? fontOverride : st.fontSize
      const ratio = st.fontSize > 0 ? Math.max(0.4, Math.min(3, fontSize / st.fontSize)) : 1
      const lineHeight = (group.length > 1 ? group[1].y - group[0].y : 0) * (group.length > 1 ? ratio : 1) || undefined
      const wid = newId()
      const tid = newId()
      applyEdits((cur) => {
        pushHistory()
        const els = cur[targetPage] ?? []
        return {
          ...cur,
          [targetPage]: [
            ...els,
            { id: wid, kind: 'whiteout' as const, x: bx - 1, y: by - 1, w: br - bx + 2, h: bb - by + 2, bg: colors.bg },
            {
              id: tid, kind: 'text' as const, x: bx, y: by, w: (br - bx) * ratio, h: (bb - by) * ratio,
              text: next, fontSize, color: colors.color,
              bold: st.bold, italic: st.italic, family: st.family, cssFont: st.cssFont, realFamily: st.realFamily,
              ...(lineHeight ? { lineHeight } : {}),
              ...(group.length > 1 ? { lineStyles: group.map((l, i) => ({ bold: l.bold, italic: l.italic, x: i === 0 ? 0 : l.x - bx, fontSize: fontOverride ? l.fontSize * ratio : l.fontSize })) } : {}),
            },
          ],
        }
      })
      setSelected(tid)
      return true
    } catch {
      return false
    }
  }, [doc])


  /** AI-driven region effect on an ORIGINAL text area (by bbox, PDF pts):
   *  highlight → marker element over it; cover/delete → opaque whiteout box in
   *  the page background colour (visually removes the content). Returns true
   *  when applied. */
  const aiApplyRegion = useCallback(async (
    targetPage: number,
    action: 'highlight' | 'cover' | 'delete',
    region: { x: number; y: number; w: number; h: number },
  ): Promise<boolean> => {
    if (!doc) return false
    let bg = '#ffffff'
    // Sample the page background so a cover blends in (canvas holds the open page).
    if (action !== 'highlight' && targetPage === page) {
      try { if (canvasRef.current) bg = sampleTextColors(canvasRef.current, region, doc.pages[targetPage - 1]?.width ?? 612).bg } catch { /* white */ }
    }
    const el: Omit<PdfElement, 'id'> = action === 'highlight'
      ? { kind: 'highlight', x: region.x - 1, y: region.y - 1, w: region.w + 2, h: region.h + 2, color: HL_COLORS[0] }
      : { kind: 'whiteout', x: region.x, y: region.y, w: region.w, h: region.h, bg }
    applyEdits((cur) => {
      pushHistory()
      return { ...cur, [targetPage]: [...(cur[targetPage] ?? []), { id: newId(), ...el }] }
    })
    if (page !== targetPage) setPage(targetPage)
    return true
  }, [doc, page])

  /** AI-driven removal of a user-added element (any page). */
  const aiDeleteEl = useCallback((id: string) => {
    applyEdits((cur) => {
      const next: PageEdits = {}
      let touched = false
      for (const k of Object.keys(cur)) {
        const p = k as unknown as number
        const kept = (cur[p] ?? []).filter((e: PdfElement) => e.id !== id)
        if (kept.length !== (cur[p] ?? []).length) touched = true
        next[p] = kept
      }
      if (!touched) return cur
      pushHistory()
      return next
    })
    setSelected(null)
  }, [])

  const undo = () => {
    setHistory((h) => {
      if (!h.length) return h
      const prev = h[h.length - 1]
      editsRef.current = prev
      setEdits(prev)
      setSelected(null)
      return h.slice(0, -1)
    })
  }

  const savePdf = async () => {
    if (!doc) return
    // Flush an in-progress text edit synchronously so the very last change is
    // never dropped (the editor may still hold focus when Save is clicked).
    if (editingId) finishLineEdit()
    const cur = editsRef.current
    const total = Object.values(cur).reduce((a, els) => a + els.length, 0)
    if (!total) {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(doc.file)
      a.download = doc.name
      a.click()
      URL.revokeObjectURL(a.href)
      return
    }
    setSaving(true)
    try {
      const blob = await buildEditedPdf(doc, cur)
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = doc.name.replace(/\.pdf$/i, '') + '-edited.pdf'
      a.click()
      URL.revokeObjectURL(a.href)
      toast.success(`Saved with ${total} edit${total === 1 ? '' : 's'}`)
    } catch {
      toast.error('Export failed — please try again')
    } finally {
      setSaving(false)
    }
  }

  /** Pending "edit existing text" session — source lines for the commit diff. */
  const pendingEditRef = useRef<{ textElId: string; whiteoutId: string; origLines: PdfTextItem[]; origText: string; lineHeight?: number } | null>(null)

  /**
   * Commit an "edit existing text" session: final per-line diff replaces only
   * the changed lines; no change at all → the page is left exactly as it was.
   */
  const finishLineEdit = useCallback(() => {
    setEditingId(null)
    const pend = pendingEditRef.current
    if (!pend) return
    pendingEditRef.current = null
    // Synchronous commit straight into the authoritative ref, so a save right
    // after (blur+click in one tick) cannot read a stale page.
    applyEdits((cur) => {
      const els = cur[page] ?? []
      const textEl = els.find((e) => e.id === pend.textElId)
      const rest = els.filter((e) => e.id !== pend.textElId && e.id !== pend.whiteoutId)
      const newText = textEl?.text ?? pend.origText
      if (newText === pend.origText) return { ...cur, [page]: rest }
      const canvas = canvasRef.current
      const pagePtW = doc?.pages[page - 1]?.width ?? 612
      const rep = buildLineReplacements(pend.origLines, newText, {
        makeId: newId,
        lineHeight: pend.lineHeight,
        sample: canvas ? (rect) => sampleTextColors(canvas, rect, pagePtW) : undefined,
        color: textEl?.color,
      })
      return { ...cur, [page]: [...rest, ...rep] }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, doc])

  /** Edit existing text at a canvas point (CSS px → PDF points). */
  const editTextAt = (px: number, py: number, pagePtW: number) => {
    if (!doc) return
    const s = pagePtW / (canvasRef.current?.clientWidth || pagePtW)
    const x = px * s
    const y = py * s
    void (async () => {
      try {
        const items = await extractTextItems(doc, page)
        if (!items.length) {
          toast.error('This page has no selectable text — it is probably a scan (image)')
          return
        }
        const pad = 4
        const hit = items.find((it) => x >= it.x - pad && x <= it.x + it.w + pad && y >= it.y - pad && y <= it.y + it.h + pad)
        if (!hit) {
          toast.info('No text found there — click directly on a line of text')
          return
        }
        // Expand the clicked line to its contiguous same-paragraph block: lines
        // that are simply this text wrapping to more rows (same font/size/weight,
        // same left edge, normal line spacing). Distinct rows — list items, indents,
        // different-size text — stay separate and are never merged.
        const group = groupSameStyleBlock(items, hit)
        // union bbox of the group
        const bx = Math.min(...group.map((l) => l.x))
        const by = Math.min(...group.map((l) => l.y))
        const br = Math.max(...group.map((l) => l.x + l.w))
        const bb = Math.max(...group.map((l) => l.y + l.h))
        const srcText = group.map((l) => l.text).join('\n')
        const isGroup = group.length > 1
        // Make the original embedded fonts usable as CSS FontFaces so the
        // editor renders with the real typeface.
        registerEmbeddedFonts()
        const wid = newId()
        const tid = newId()
        const canvas = canvasRef.current
        const colorsRect = { x: bx, y: by, w: br - bx, h: bb - by }
        let colors = { color: '#111111', bg: '#ffffff' }
        try {
          if (canvas) colors = sampleTextColors(canvas, colorsRect, doc.pages[page - 1]?.width ?? 612)
        } catch { /* keep defaults */ }
        // lineHeight from the group's measured spacing (px→pt)
        const lineHeight = group.length > 1 ? group[1].y - group[0].y : undefined
        pendingEditRef.current = { textElId: tid, whiteoutId: wid, origLines: group, origText: srcText, lineHeight }
        const st = group[0]
        applyEdits((cur) => {
          pushHistory()
          const els = cur[page] ?? []
          return {
            ...cur,
            [page]: [
              ...els,
              { id: wid, kind: 'whiteout' as const, x: bx - 1, y: by - 1, w: br - bx + 2, h: bb - by + 2, bg: colors.bg },
              {
                id: tid, kind: 'text' as const, x: bx, y: by, w: br - bx, h: bb - by,
                text: srcText, fontSize: st.fontSize, color: colors.color,
                bold: st.bold, italic: st.italic, family: st.family, cssFont: st.cssFont, realFamily: st.realFamily,
                ...(lineHeight ? { lineHeight } : {}),
                ...(isGroup ? { lineStyles: group.map((l, i) => ({ bold: l.bold, italic: l.italic, x: i === 0 ? 0 : l.x - bx, fontSize: l.fontSize })) } : {}),
              },
            ],
          }
        })
        setMode('select')
        setSelected(tid)
        setEditingId(tid)
        toast.success(isGroup ? 'Editing this paragraph block — press Enter/Escape when done' : 'Editing this line — press Enter/Escape when done')
      } catch {
        toast.error('Could not read text from this page')
      }
    })()
  }

  /** Canvas click in CSS px → PDF points, then run the active tool. */
  const onCanvasClick = (px: number, py: number, pagePtW: number) => {
    if (!doc) return
    const canvas = canvasRef.current
    const s = pagePtW / (canvas?.clientWidth || pagePtW)
    const x = px * s
    const y = py * s
    // With the AI chat open, clicking on original text hands that exact line to
    // the assistant — resolving a pending "which text?" request immediately.
    if (aiOpen && (mode === 'select' || aiNeedsSel)) {
      void (async () => {
        try {
          const items = await extractTextItems(doc, page)
          const pad = 4
          const hit = items.findIndex((it) => x >= it.x - pad && x <= it.x + it.w + pad && y >= it.y - pad && y <= it.y + it.h + pad)
          if (hit < 0) {
            toast.info('Nema teksta na tom mjestu — kliknite direktno na red teksta')
            return
          }
          const it = items[hit]
          toast.info(`✓ AI je primio klik: "${(it.text || '').slice(0, 60)}"`)
          setAiPick({ page, id: `o${page}_${hit}`, text: it.text.replace(/\s+/g, ' ').trim(), x: it.x, y: it.y, w: it.w, h: it.h })
          setAiFlash({ page, x: it.x, y: it.y, w: it.w, h: it.h, kind: 'pick' })
        } catch (err) {
          toast.error('Ne mogu da pročitam tekst na ovoj stranici — pokušaj na drugoj ili ručno')
        }
      })()
      return
    }
    if (mode === 'edittext') {
      editTextAt(px, py, pagePtW)
    } else if (mode === 'text') {
      const text = window.prompt('Text to add:')
      if (text && text.trim()) addElement({ kind: 'text', x, y, w: 220, h: 24, text: text.trim(), fontSize: 14, color: textColor })
      setMode('select')
    } else if (mode === 'whiteout') {
      addElement({ kind: 'whiteout', x: x - 60, y: y - 12, w: 120, h: 24 })
      setMode('select')
    } else if (mode === 'highlight') {
      addElement({ kind: 'highlight', x: x - 60, y: y - 10, w: 120, h: 20, color: hlColor })
      setMode('select')
    } else if (mode === 'image') {
      imgInputRef.current?.click()
      setMode('select')
    } else if (mode === 'signature') {
      setSigOpen(true)
      setMode('select')
    }
  }

  const onImagePicked = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file (PNG/JPG)')
      return
    }
    const reader = new FileReader()
    reader.onload = () => addElement({ kind: 'image', x: 60, y: 60, w: 200, h: 150, dataUrl: String(reader.result) })
    reader.readAsDataURL(file)
  }

  const onSignature = (dataUrl: string) => {
    setSigOpen(false)
    addElement({ kind: 'signature', x: 60, y: 60, w: 180, h: 72, dataUrl })
  }

  const selEl = selected ? (edits[page] ?? []).find((e) => e.id === selected) ?? null : null

  return (
    <div
      className={cn(
        'overflow-hidden rounded-3xl border border-[#E8E0D6] bg-white/80 shadow-[0_24px_80px_-40px_rgba(33,26,20,0.35)] backdrop-blur-xl',
        'dark:border-white/10 dark:bg-ink-950/70',
        simple && 'shadow-none',
      )}
    >
      {!doc ? (
        <EmptyState loading={loading} dragOver={dragOver} setDragOver={setDragOver} onPick={() => inputRef.current?.click()} onDropFile={openFile} />
      ) : (
        <div className="flex min-w-0 items-start">
          <div className="min-w-0 flex-1">
            <Viewer
          doc={doc}
          page={page}
          setPage={setPage}
          zoom={zoom}
          setZoom={setZoom}
          canvasRef={canvasRef}
          mode={mode}
          setMode={setMode}
          aiOpen={aiOpen}
          onToggleAi={() => setAiOpen((v) => !v)}
          aiPick={aiPick}
          aiNeedsSel={aiNeedsSel}
          aiFlash={aiFlash}
          fitMode={fitMode}
          setFitMode={setFitMode}
          edits={edits}
          selected={selected}
          setSelected={setSelected}
          textColor={textColor}
          setTextColor={setTextColor}
          hlColor={hlColor}
          setHlColor={setHlColor}
          canUndo={history.length > 0}
          onUndo={undo}
          onRemove={removeEl}
          onDuplicate={duplicateEl}
          onUpdate={updateEl}
          onCommitHistory={commitHistory}
          onCanvasClick={onCanvasClick}
          onEditText={editTextAt}
          editingId={editingId}
          onStartEdit={setEditingId}
          onEndEdit={finishLineEdit}
          onDropFile={openFile}
          onSave={savePdf}
          saving={saving}
          />
          </div>
          {aiOpen && (
            <PdfAiPanel
              doc={doc}
              selectedEl={selEl}
              allElements={Object.values(edits).flat()}
        getDocLines={getDocLines}
        onAiEditOriginal={aiReplaceText}
              onAiRegion={aiApplyRegion}
              onDelete={aiDeleteEl}
              pickedLine={aiPick}
              onPickConsumed={() => setAiPick(null)}
              onNeedSelection={setAiNeedsSel}
              onFlash={setAiFlash}
              onUpdate={updateEl}
              onClose={() => setAiOpen(false)}
            />
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void openFile(f)
          e.target.value = ''
        }}
      />
      <input
        ref={imgInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onImagePicked(f)
          e.target.value = ''
        }}
      />
      {sigOpen && <SignaturePad onCancel={() => setSigOpen(false)} onDone={onSignature} />}
    </div>
  )
}

/* ——— Empty state ——— */

function EmptyState({
  loading,
  dragOver,
  setDragOver,
  onPick,
  onDropFile,
}: {
  loading: boolean
  dragOver: boolean
  setDragOver: (v: boolean) => void
  onPick: () => void
  onDropFile: (f: File) => void
}) {
  const busy = loading
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const f = e.dataTransfer.files?.[0]
        if (f) onDropFile(f)
      }}
      className={cn(
        'flex flex-col items-center px-6 py-12 text-center transition-colors sm:py-16',
        dragOver ? 'bg-accent-purple/[0.06]' : '',
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-blue/10 ring-1 ring-accent-purple/25">
        {busy ? (
          <Loader2 className="h-6 w-6 animate-spin text-accent-purple" />
        ) : (
          <FileEdit className="h-6 w-6 text-accent-purple" />
        )}
      </span>
      <h3 className="mt-5 font-serif text-2xl text-[#211A14] dark:text-white">Edit & chat with PDFs</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-default-500 dark:text-white/60">
        Drop a PDF to open it in the studio — then edit it or use AI to summarize, translate and proofread the document.
      </p>
      <div className="mt-6 w-full max-w-lg">
        <button
          type="button"
          onClick={onPick}
          disabled={busy}
          className="w-full rounded-full bg-[#211A14] px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-60 dark:bg-white dark:text-ink-950"
        >
          {loading ? 'Opening…' : 'Upload PDF'}
        </button>
      </div>
      <p className="mt-4 text-xs text-faint">PDF up to {MAX_MB} MB · everything runs on your device</p>
    </div>
  )
}

function Viewer({
  doc, page, setPage, zoom, setZoom, canvasRef,
  mode, setMode, edits, selected, setSelected,
  textColor, setTextColor, hlColor, setHlColor,
  canUndo, onUndo, onRemove, onDuplicate, onUpdate, onCommitHistory,
  onCanvasClick, onEditText, onDropFile, onSave, saving, editingId, onStartEdit, onEndEdit, aiOpen, onToggleAi, aiPick, aiNeedsSel, aiFlash, fitMode, setFitMode,
}: {
  doc: LoadedDoc
  page: number
  setPage: (fn: (p: number) => number) => void
  zoom: number
  setZoom: (fn: (z: number) => number) => void
  canvasRef: RefObject<HTMLCanvasElement>
  mode: Mode
  setMode: (m: Mode) => void
  edits: PageEdits
  selected: string | null
  setSelected: (id: string | null) => void
  textColor: string
  setTextColor: (c: string) => void
  hlColor: string
  setHlColor: (c: string) => void
  canUndo: boolean
  onUndo: () => void
  onRemove: (id: string) => void
  onDuplicate: (id: string) => void
  onUpdate: (id: string, patch: Partial<PdfElement>) => void
  onCommitHistory: () => void
  onCanvasClick: (px: number, py: number, pagePtW: number) => void
  onEditText: (px: number, py: number, pagePtW: number) => void
  editingId: string | null
  onStartEdit: (id: string) => void
  onEndEdit: () => void
  aiOpen: boolean
  onToggleAi: () => void
  aiPick: DocLine | null
  aiNeedsSel: boolean
  aiFlash: { page: number; x: number; y: number; w: number; h: number; kind?: 'pick' | 'applied' } | null
  fitMode: boolean
  setFitMode: (b: boolean) => void
  onDropFile: (f: File) => void
  onSave: () => void
  saving: boolean
}) {
  const pageEls = edits[page] ?? []
  const pagePtW = doc.pages[page - 1]?.width ?? 612
  const cssScale = (canvasRef.current?.clientWidth || 0) / pagePtW
  const contRef = useRef<HTMLDivElement>(null)

  // Auto-fit: whenever the doc/page changes (and fit mode is on), scale the zoom
  // so the ENTIRE page fits into the visible box — no scrolling needed.
  useEffect(() => {
    if (!fitMode) return
    const cont = contRef.current
    const pt = doc.pages[page - 1]
    if (!cont || !pt) return
    const z = Math.min((cont.clientWidth - 32) / pt.width, (window.innerHeight * 0.94 - 32) / pt.height)
    if (z > 0.05 && Math.abs(z - zoom) > 0.005) setZoom(() => z)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, page, fitMode])
  const selEl = pageEls.find((e) => e.id === selected)
  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E0D6] px-4 py-3 dark:border-white/10">
        <span className="mr-2 max-w-[180px] truncate text-sm font-bold text-[#211A14] dark:text-white" title={doc.name}>
          {doc.name}
        </span>
        <span className="rounded-full bg-[#211A14]/[0.05] px-2.5 py-1 text-xs font-semibold text-default-500 dark:bg-white/10 dark:text-white/60">
          {doc.pages.length} pages · {formatBytes(doc.size)}
        </span>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
          <div className="flex items-center gap-0.5 rounded-full border border-[#E8E0D6] p-1 dark:border-white/15">
            {MODES.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                title={label}
                aria-label={label}
                onClick={() => setMode(key)}
                className={cn(
                  'rounded-full p-2 transition-colors',
                  mode === key
                    ? 'bg-accent-purple text-white'
                    : 'text-default-500 hover:bg-[#211A14]/[0.05] dark:text-white/60 dark:hover:bg-white/10',
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          {mode === 'text' && (
            <div className="flex items-center gap-1 rounded-full border border-[#E8E0D6] p-1 dark:border-white/15">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Text color ${c}`}
                  onClick={() => setTextColor(c)}
                  className={cn('h-5 w-5 rounded-full border', textColor === c ? 'border-accent-purple ring-2 ring-accent-purple/40' : 'border-black/10')}
                  style={{ background: c }}
                />
              ))}
            </div>
          )}
          {mode === 'highlight' && (
            <div className="flex items-center gap-1 rounded-full border border-[#E8E0D6] p-1 dark:border-white/15">
              {HL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Highlight color ${c}`}
                  onClick={() => setHlColor(c)}
                  className={cn('h-5 w-5 rounded-full border', hlColor === c ? 'border-accent-purple ring-2 ring-accent-purple/40' : 'border-black/10')}
                  style={{ background: c }}
                />
              ))}
            </div>
          )}
          <button
            type="button"
            aria-label="AI Assistant"
            title="AI Assistant — chat, summarize, fix text"
            onClick={onToggleAi}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition-colors',
              aiOpen
                ? 'border-accent-purple bg-accent-purple text-white'
                : 'border-[#E8E0D6] text-default-500 hover:text-[#211A14] dark:border-white/15 dark:text-white/60 dark:hover:text-white',
            )}
          >
            <Sparkles className="h-4 w-4" />
            AI
          </button>
          <button
            type="button"
            aria-label="Undo"
            onClick={onUndo}
            disabled={!canUndo}
            className="rounded-full border border-[#E8E0D6] p-2 text-default-500 transition-colors hover:text-[#211A14] disabled:opacity-40 dark:border-white/15 dark:text-white/60 dark:hover:text-white"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-full bg-[#211A14] px-4 py-2 text-xs font-bold text-white transition-transform hover:scale-[1.03] disabled:opacity-60 dark:bg-white dark:text-ink-950"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
          <div className="flex items-center rounded-full border border-[#E8E0D6] dark:border-white/15">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 text-default-500 transition-colors hover:text-[#211A14] disabled:opacity-40 dark:text-white/60 dark:hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[64px] text-center text-xs font-bold text-[#211A14] dark:text-white">
              {page} / {doc.pages.length}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= doc.pages.length}
              onClick={() => setPage((p) => Math.min(doc.pages.length, p + 1))}
              className="p-2 text-default-500 transition-colors hover:text-[#211A14] disabled:opacity-40 dark:text-white/60 dark:hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center rounded-full border border-[#E8E0D6] dark:border-white/15">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => { setFitMode(false); setZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100)) }}
              className="p-2 text-default-500 transition-colors hover:text-[#211A14] dark:text-white/60 dark:hover:text-white"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[48px] text-center text-xs font-bold text-[#211A14] dark:text-white">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => { setFitMode(false); setZoom((z) => Math.min(3, Math.round((z + 0.25) * 100) / 100)) }}
              className="p-2 text-default-500 transition-colors hover:text-[#211A14] dark:text-white/60 dark:hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Fit whole page"
              title="Uklopi cijelu stranicu"
              onClick={() => setFitMode(true)}
              className={cn('p-2 transition-colors', fitMode ? 'text-accent-purple' : 'text-default-500 hover:text-[#211A14] dark:text-white/60 dark:hover:text-white')}
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hint bar */}
      <div className="border-b border-[#E8E0D6] bg-accent-purple/[0.04] px-4 py-2 text-center text-xs font-semibold text-default-500 dark:border-white/10 dark:text-white/60">
        {mode === 'select'
          ? 'Double-click any text to edit it — or pick a tool above to add text, highlights, images or a signature.'
          : mode === 'edittext'
            ? 'Click on a line of text in the document to edit it.'
            : 'Click on the page to place it.'}
      </div>

      {/* Page canvas + editable overlay */}
      <div
        ref={contRef}
        className="flex max-h-[94vh] items-start justify-center overflow-auto bg-[#F6F1E9] p-4 dark:bg-ink-900/60"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const f = e.dataTransfer.files?.[0]
          if (f) onDropFile(f)
        }}
      >
        <div
          className={cn(
            'relative',
            aiNeedsSel && 'rounded-lg ring-2 ring-blue-400 ring-offset-2 animate-pulse',
          )}
          style={{ width: 'fit-content' }}
        >
          <canvas
            ref={canvasRef}
            className={cn(
              'block rounded-lg bg-white shadow-[0_12px_40px_-16px_rgba(33,26,20,0.4)]',
              mode !== 'select' && 'cursor-crosshair',
            )}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              onCanvasClick(e.clientX - rect.left, e.clientY - rect.top, pagePtW)
            }}
            onDoubleClick={(e) => {
              // Quick path: double-click any existing text to edit it, no tool needed.
              const rect = e.currentTarget.getBoundingClientRect()
              onEditText(e.clientX - rect.left, e.clientY - rect.top, pagePtW)
            }}
          />
          {/* Overlay — never intercepts canvas clicks; elements opt back in */}
          <div className="pointer-events-none absolute inset-0">
            {pageEls.map((el) => (
              <ElementBox
                key={el.id}
                el={el}
                cssScale={cssScale}
                isSelected={el.id === selected}
                isEditing={el.id === editingId}
                onStartEdit={() => onStartEdit(el.id)}
                onEndEdit={onEndEdit}
                onSelect={() => setSelected(el.id)}
                onCommitHistory={onCommitHistory}
                onUpdate={onUpdate}
              />
            ))}
            {/* AI blinks: blue = line the user just clicked for the AI; green = line the AI just edited */}
            {aiPick && page === aiPick.page && aiPick.x !== undefined && aiPick.y !== undefined && aiPick.w && aiPick.h && (
              <div
                className="pointer-events-none absolute animate-pulse rounded-[3px] border-2 border-blue-500 bg-blue-500/10"
                style={{ left: aiPick.x * cssScale - 3, top: aiPick.y * cssScale - 3, width: aiPick.w * cssScale + 6, height: aiPick.h * cssScale + 6 }}
              />
            )}
            {aiFlash && page === aiFlash.page && aiFlash.x !== undefined && (
              <div
                className={cn(
                  'pointer-events-none absolute animate-pulse rounded-[3px] border-2',
                  aiFlash.kind === 'applied' ? 'border-emerald-500 bg-emerald-500/15' : 'border-blue-500 bg-blue-500/10',
                )}
                style={{ left: aiFlash.x * cssScale - 3, top: aiFlash.y * cssScale - 3, width: aiFlash.w * cssScale + 6, height: aiFlash.h * cssScale + 6 }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer: selected-element controls + page switcher dots */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-[#E8E0D6] px-4 py-3 dark:border-white/10">
        {selEl && (
          <div className="mr-3 flex items-center gap-1.5 rounded-full border border-accent-purple/30 bg-accent-purple/[0.06] px-2 py-1">
            <span className="px-1 text-xs font-bold capitalize text-accent-purple dark:text-accent-blue">{selEl.kind}</span>
            <button
              type="button"
              aria-label="Duplicate element"
              onClick={() => onDuplicate(selEl.id)}
              className="rounded-full p-1.5 text-default-500 transition-colors hover:text-[#211A14] dark:text-white/60 dark:hover:text-white"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Delete element"
              onClick={() => onRemove(selEl.id)}
              className="rounded-full p-1.5 text-default-500 transition-colors hover:text-red-600 dark:text-white/60"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {doc.pages.length <= 24 ? (
          doc.pages.map((p) => (
            <button
              key={p.num}
              type="button"
              onClick={() => setPage(() => p.num)}
              aria-label={`Page ${p.num}`}
              className={cn(
                'h-7 w-7 rounded-lg text-xs font-bold transition-colors',
                p.num === page
                  ? 'bg-accent-purple text-white'
                  : 'bg-[#211A14]/[0.05] text-default-500 hover:bg-[#211A14]/[0.09] dark:bg-white/10 dark:text-white/60',
              )}
            >
              {p.num}
            </button>
          ))
        ) : (
          <span className="text-xs font-semibold text-faint">
            Pages {page} of {doc.pages.length}
          </span>
        )}
      </div>
    </div>
  )
}

/* ——— Draggable / resizable overlay element ——— */

function ElementBox({
  el,
  cssScale,
  isSelected,
  isEditing,
  onStartEdit,
  onEndEdit,
  onSelect,
  onCommitHistory,
  onUpdate,
}: {
  el: PdfElement
  cssScale: number
  isSelected: boolean
  isEditing: boolean
  onStartEdit: () => void
  onEndEdit: () => void
  onSelect: () => void
  onCommitHistory: () => void
  onUpdate: (id: string, patch: Partial<PdfElement>) => void
}) {
  const taRef = useRef<HTMLTextAreaElement>(null)

  // Focus + select the text box so typing replaces the selected line.
  useEffect(() => {
    if (isEditing && taRef.current) {
      taRef.current.focus()
      taRef.current.select()
    }
  }, [isEditing])

  /** Pointer drag for move; corner handle drag for resize. */
  const startDrag = (e: React.PointerEvent, resize: boolean) => {
    e.stopPropagation()
    e.preventDefault()
    onSelect()
    const startX = e.clientX
    const startY = e.clientY
    const orig = { x: el.x, y: el.y, w: el.w, h: el.h }
    let committed = false
    const onMove = (ev: PointerEvent) => {
      if (!committed) {
        committed = true
        onCommitHistory()
      }
      const dx = (ev.clientX - startX) / (cssScale || 1)
      const dy = (ev.clientY - startY) / (cssScale || 1)
      if (resize) {
        if (el.kind === 'text') {
          // Resize = widen/narrow the box; the text re-wraps. Font size is a
          // separate control (A- / A+ on the selection toolbar).
          onUpdate(el.id, { w: Math.max(20, orig.w + dx) })
        } else {
          onUpdate(el.id, { w: Math.max(20, orig.w + dx), h: Math.max(10, orig.h + dy) })
        }
      } else onUpdate(el.id, { x: orig.x + dx, y: orig.y + dy })
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={(e) => {
        if (isEditing) { e.stopPropagation(); return }
        startDrag(e, false)
      }}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => {
        e.stopPropagation()
        if (el.kind === 'text') onStartEdit()
      }}
      onKeyDown={(e) => {
        if (isEditing) return
        if (e.key === 'ArrowLeft') onUpdate(el.id, { x: el.x - 2 })
        if (e.key === 'ArrowRight') onUpdate(el.id, { x: el.x + 2 })
        if (e.key === 'ArrowUp') onUpdate(el.id, { y: el.y - 2 })
        if (e.key === 'ArrowDown') onUpdate(el.id, { y: el.y + 2 })
      }}
      className={cn(
        'pointer-events-auto absolute cursor-move',
        isEditing
          ? 'ring-2 ring-accent-blue'
          : isSelected
            ? 'ring-2 ring-accent-purple'
            : 'hover:ring-1 hover:ring-accent-purple/40',
        el.kind === 'text' && !isEditing && 'outline-dashed outline-1 outline-transparent hover:outline-accent-purple/50',
      )}
      style={{
        left: el.x * cssScale,
        top: el.y * cssScale,
        width: Math.max(1, el.w * cssScale),
        ...(el.kind === 'text'
          ? { minHeight: Math.max(1, el.h * cssScale) }
          : { height: Math.max(1, el.h * cssScale) }),
      }}
    >
      {/* Editing a single line — a simple styled text box over just that line.
          `el` IS the clicked line, so its font/size/weight match the original.
          Whiteout underneath covers only this line; the rest of the page stays
          100% original. */}
      {el.kind === 'text' && isEditing && (
        <textarea
          ref={taRef}
          value={el.text}
          onChange={(e) => {
            const ta = e.currentTarget
            onUpdate(el.id, { text: ta.value })
            // after React paints the new value, grow the box to fit content
            requestAnimationFrame(() => {
              if (taRef.current) {
                const t = taRef.current
                t.style.height = 'auto'
                t.style.height = `${t.scrollHeight}px`
              }
            })
          }}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Escape') {
              e.preventDefault()
              e.currentTarget.blur()
            }
          }}
          onBlur={onEndEdit}
          className="absolute inset-0 z-20 h-full w-full resize-none overflow-auto whitespace-pre-wrap break-words border-none bg-transparent p-0 outline-none"
          style={{
            color: el.color,
            caretColor: '#7C3AED',
            fontSize: (el.fontSize || 14) * cssScale,
            lineHeight: 1.2,
            fontFamily: fontStack(el),
            fontWeight: el.bold ? 700 : 400,
            fontStyle: el.italic ? 'italic' : 'normal',
          }}
        />
      )}
      {el.kind === 'text' && !isEditing && (
        <span
          className="block w-full whitespace-pre-wrap break-words"
          style={{ color: el.color, fontSize: (el.fontSize || 14) * cssScale, lineHeight: 1.2, fontFamily: fontStack(el) }}
        >
          {(el.text ?? '').split('\n').map((ln, i) => {
            const st = styleForLine(el, i)
            return (
              <span
                key={i}
                className="block whitespace-pre-wrap"
                style={{
                  fontWeight: st.bold ? 700 : 400,
                  fontStyle: st.italic ? 'italic' : 'normal',
                  fontSize: st.fontSize ? st.fontSize * cssScale : undefined,
                  paddingLeft: (st.x || 0) * cssScale,
                }}
              >
                {ln || ' '}
              </span>
            )
          })}
        </span>
      )}
      {el.kind === 'whiteout' && <span className="block h-full w-full" style={{ background: el.bg || '#ffffff' }} />}
      {el.kind === 'highlight' && <span className="block h-full w-full opacity-35" style={{ background: el.color }} />}
      {(el.kind === 'image' || el.kind === 'signature') && el.dataUrl && (
        <img src={el.dataUrl} alt="" className="block h-full w-full object-contain" draggable={false} />
      )}
      {isSelected && el.kind === 'text' && !isEditing && (
        <span
          className="absolute -top-8 left-0 flex items-center gap-1 rounded-md border border-white/20 bg-zinc-900/95 px-1 py-0.5 shadow-md"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { label: 'A−', d: -1 },
            { label: 'A+', d: 1 },
          ].map(({ label, d }) => (
            <button
              key={label}
              className="h-6 w-6 rounded bg-transparent text-xs font-semibold text-white hover:bg-white/10"
              title={d > 0 ? 'Larger font' : 'Smaller font'}
              onClick={() => onUpdate(el.id, { fontSize: Math.max(4, Math.min(200, (el.fontSize || 14) + d)) })}
            >
              {label}
            </button>
          ))}
          <span className="px-1 text-[10px] text-white/60">{Math.round(el.fontSize || 14)}</span>
        </span>
      )}
      {isSelected && (
        <span
          onPointerDown={(e) => startDrag(e, true)}
          className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-accent-purple ${el.kind === 'text' ? 'cursor-ew-resize' : 'cursor-se-resize'}`}
        />
      )}
    </div>
  )
}

/* ——— Draw-a-signature pad ——— */

function SignaturePad({ onDone, onCancel }: { onDone: (dataUrl: string) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = e.currentTarget
    const r = c.getBoundingClientRect()
    return [(e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height)]
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-3xl border border-[#E8E0D6] bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-ink-950"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="font-serif text-xl text-[#211A14] dark:text-white">Draw your signature</h4>
        <canvas
          ref={canvasRef}
          width={560}
          height={220}
          className="mt-4 w-full cursor-crosshair touch-none rounded-2xl border border-[#E8E0D6] bg-[#F6F1E9] dark:border-white/15 dark:bg-white"
          onPointerDown={(e) => {
            drawing.current = true
            const ctx = canvasRef.current?.getContext('2d')
            if (!ctx) return
            const [x, y] = pos(e)
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineWidth = 2.5
            ctx.lineCap = 'round'
            ctx.strokeStyle = '#111111'
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return
            const ctx = canvasRef.current?.getContext('2d')
            if (!ctx) return
            const [x, y] = pos(e)
            ctx.lineTo(x, y)
            ctx.stroke()
          }}
          onPointerUp={() => {
            drawing.current = false
          }}
          onPointerLeave={() => {
            drawing.current = false
          }}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              const c = canvasRef.current
              const ctx = c?.getContext('2d')
              if (c && ctx) ctx.clearRect(0, 0, c.width, c.height)
            }}
            className="rounded-full border border-[#E8E0D6] px-4 py-2 text-xs font-bold text-[#211A14] transition-colors hover:bg-[#211A14]/[0.03] dark:border-white/15 dark:text-white"
          >
            Clear
          </button>
          <button type="button" onClick={onCancel} className="rounded-full px-4 py-2 text-xs font-bold text-default-500 dark:text-white/60">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const c = canvasRef.current
              const ctx = c?.getContext('2d')
              if (!c || !ctx) return
              // Trim transparent margins before placing.
              const data = ctx.getImageData(0, 0, c.width, c.height).data
              let minX = c.width, minY = c.height, maxX = 0, maxY = 0, found = false
              for (let y = 0; y < c.height; y++) {
                for (let x = 0; x < c.width; x++) {
                  if (data[(y * c.width + x) * 4 + 3] > 10) {
                    found = true
                    if (x < minX) minX = x
                    if (x > maxX) maxX = x
                    if (y < minY) minY = y
                    if (y > maxY) maxY = y
                  }
                }
              }
              if (!found) {
                onCancel()
                return
              }
              const pad = 8
              minX = Math.max(0, minX - pad)
              minY = Math.max(0, minY - pad)
              maxX = Math.min(c.width, maxX + pad)
              maxY = Math.min(c.height, maxY + pad)
              const out = document.createElement('canvas')
              out.width = maxX - minX
              out.height = maxY - minY
              out.getContext('2d')?.drawImage(c, minX, minY, out.width, out.height, 0, 0, out.width, out.height)
              onDone(out.toDataURL('image/png'))
            }}
            className="rounded-full bg-[#211A14] px-5 py-2 text-xs font-bold text-white transition-transform hover:scale-[1.03] dark:bg-white dark:text-ink-950"
          >
            Place signature
          </button>
        </div>
      </div>
    </div>
  )
}

export default PdfEditorTool