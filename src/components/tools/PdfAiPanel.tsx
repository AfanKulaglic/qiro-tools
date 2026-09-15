/**
 * AI PDF Studio — AI side panel: chat with the document, summarize,
 * and AI text repair with diff review. Only extracted text is sent.
 */
import { useEffect, useRef, useState } from 'react'
import { Sparkles, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { aiChat, aiConfigured, docToContext, setStoredKey, type ChatMessage } from '@/utils/aiClient'
import { SYSTEM_DOC_QA } from '@/config/aiModels'
import type { LoadedDoc, PdfElement } from '@/utils/pdfEngine'

/** One original PDF text line offered to the AI (with position when known). */
export interface DocLine { page: number; id: string; text: string; x?: number; y?: number; w?: number; h?: number }

interface Props {
  doc: LoadedDoc
  selectedEl: PdfElement | null
  allElements: PdfElement[]
  onUpdate: (id: string, patch: Partial<PdfElement>) => void
  /** Original PDF text lines (whole document), lazily extracted + cached. */
  getDocLines: () => Promise<DocLine[]>
  /** Replace an original PDF line by text match (whiteout + styled text).
   *  `fontSize` (pt) optionally restyles the replacement. */
  onAiEditOriginal: (page: number, findText: string, next: string, fontSize?: number) => Promise<boolean>
  /** Apply a region effect over an original text line's bbox. */
  onAiRegion: (page: number, action: 'highlight' | 'cover' | 'delete', region: { x: number; y: number; w: number; h: number }) => Promise<boolean>
  /** Remove a user-added element by id. */
  onDelete: (id: string) => void
  /** A text line the user clicked directly in the PDF (select mode). */
  pickedLine?: DocLine | null
  /** Clear the picked line after the panel consumes it. */
  onPickConsumed?: () => void
  /** Tell the editor the AI needs the user to click a text line (click anywhere picks it). */
  onNeedSelection?: (needed: boolean) => void
  /** Blink a bbox on the page after the AI applied an edit there (PDF points). */
  onFlash?: (f: { page: number; x: number; y: number; w: number; h: number; kind?: 'pick' | 'applied' }) => void
  onClose: () => void
}

export default function PdfAiPanel({ doc, selectedEl, allElements, onUpdate, getDocLines, onAiEditOriginal, onAiRegion, onDelete, pickedLine, onPickConsumed, onNeedSelection, onFlash, onClose }: Props) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState<'' | 'chat' | 'ctx'>('')
  const [configured, setConfigured] = useState(() => aiConfigured())
  const [keyInput, setKeyInput] = useState('')
  const ctxRef = useRef<string | null>(null)
  const logRef = useRef<HTMLDivElement>(null)
  /** Unresolved "which text do you mean?" request — a later CLICK on the text resolves it. */
  const pendingRef = useRef<{ q: string; answer: string } | null>(null)

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [msgs, busy])

  const ctx = async () => {
    if (ctxRef.current) return ctxRef.current
    setBusy('ctx')
    ctxRef.current = await docToContext(doc)
    setBusy('')
    return ctxRef.current
  }

  const fail = (err: unknown) =>
    setMsgs((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, content: `⚠️ ${String(err).slice(0, 300)}` } : x)))

  const ask = async (q: string) => {
    if (!q.trim() || busy) return
    setInput('')
    pendingRef.current = null
    onNeedSelection?.(false)
    const base: ChatMessage[] = [...msgs, { role: 'user', content: q }]
    setMsgs([...base, { role: 'assistant', content: '…' }])
    setBusy('chat')
    try {
      const context = await ctx()
      const res = await aiChat([
        { role: 'system', content: `${SYSTEM_DOC_QA}\n\nDocument text:\n${context}` },
        ...base,
      ])
      setMsgs((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, content: res } : x)))
      await maybeApplyEdit(q, res)
    } catch (err) {
      fail(err)
    } finally {
      setBusy('')
    }
  }

  /** After a chat answer, ask the model whether the user requested an *edit* to the
   *  visible text (e.g. "change the title"), and if so apply it — to ORIGINAL PDF
   *  text (via onAiEditOriginal) or to user-added text elements (via onUpdate) —
   *  so chat isn't limited to talking, it can actually change the document. */
  /** The text the AI last edited — follow-up requests that don't name a new
   *  text logically refer to the SAME text (e.g. "sad uvećaj font"). */
  const aiLastRef = useRef<{ id: string } | null>(null)
  const aiHistoryRef = useRef<Array<
    | { kind: 'line'; page: number; oldText: string; newText: string; bbox: { x?: number; y?: number; w?: number; h?: number } | null }
    | { kind: 'el'; id: string; oldText: string; oldFs?: number }
  >>([])
  const revertLast = async (): Promise<boolean> => {
    const last = aiHistoryRef.current.pop()
    if (!last) return false
    if (last.kind === 'el') {
      onUpdate(last.id, { text: last.oldText, ...(last.oldFs !== undefined ? { fontSize: last.oldFs } : {}) })
      return true
    }
    const ok = await onAiEditOriginal(last.page, last.newText, last.oldText)
    if (ok && last.bbox && last.bbox.x !== undefined && last.bbox.y !== undefined && last.bbox.w && last.bbox.h) {
      onFlash?.({ page: last.page, x: last.bbox.x, y: last.bbox.y, w: last.bbox.w, h: last.bbox.h, kind: 'applied' })
    }
    return ok
  }

  const maybeApplyEdit = async (q: string, answer: string) => {
    const selectMsg = () => {
      pendingRef.current = { q, answer }
      onNeedSelection?.(true)
      setMsgs((m) => [...m, {
        role: 'assistant',
        content: '✋ Nisam siguran na koji točno tekst mislite. **Kliknite direktno na taj tekst u PDF-u** — čim kliknete, odmah primjenjujem izmjenu. (Ili napišite točan tekst ovdje.)',
      }])
    }
    // Candidates: every ORIGINAL text line in the whole document + user-added text elements.
    let docLines: DocLine[] = []
    try { docLines = await getDocLines() } catch { /* extraction failed — user elements only */ }
    const docCands = docLines
      .slice(0, 150)
      .map((l) => `[${l.id}] (p.${l.page}) ${l.text.slice(0, 140)}`)
    const selId = selectedEl?.kind === 'text' && selectedEl.text?.trim() ? `u${selectedEl.id}` : ''
    const userCands = allElements
      .filter((e) => e.kind === 'text' && e.text?.trim())
      .map((e) => `${e.id === selId.slice(1) ? '>>> (selected by user) ' : ''}[u${e.id}] (added) ${(e.text as string).replace(/\s+/g, ' ').trim().slice(0, 140)}`)
    const r = await decideEdit(q, answer, [...docCands, ...userCands])
    if (!r) return
    // "I didn't mean that" / "undo" → restore the last AI-applied text change.
    if (r.action === 'undo' || r.id === 'undo') {
      const ok = await revertLast()
      setMsgs((m) => [...m, ok
        ? { role: 'assistant', content: '↩️ Vratio sam prethodnu AI izmjenu na originalni tekst.' }
        : { role: 'assistant', content: 'Nema AI izmjene teksta koju mogu da vratim (highlight/cover se ne vrate automatski).' }])
      return
    }
    if (!r.id) { if (r.ask) selectMsg(); return }
    // Deterministic anti-guess guard: the model may still pick a wrong line when
    // the request is broad ("promijeni tekst na prvoj stranici"). Apply WITHOUT
    // asking only if the user's own words point at that exact line, or the line
    // is the element the user already selected/clicked. Otherwise → selectMsg.
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()
    const chosenLine = docLines.find((l) => l.id === r.id)
    const chosenEl = r.id.startsWith('u') ? allElements.find((e) => `u${e.id}` === r.id) : undefined
    const targetText = norm((chosenLine?.text || (chosenEl?.text as string) || ''))
    const isPointed = !!selId && r.id === selId
    const qClean = norm(q.replace(r.next || '', ' '))
    const qWords = qClean.split(' ').filter((w) => w.length >= 4)
    const tWords = targetText.split(' ').filter((w) => w.length >= 4)
    const overlaps = qWords.some((w) => targetText.includes(w)) || tWords.some((w) => qClean.includes(w))
    // Follow-up continuity: when the request doesn't identify a (new) text and
    // the AI already edited one, logically it means the SAME text.
    const last = aiLastRef.current
    let applyId = r.id
    if (!r.id) {
      if (last && r.action !== 'none') applyId = last.id
      else { if (r.ask) selectMsg(); return }
    } else if (!isPointed && docCands.length + userCands.length > 1 && !overlaps) {
      if (last && r.action !== 'none') applyId = last.id
      else { selectMsg(); return }
    }
    const ok = await runAction(applyId, r.action, r.next, r.fs, docLines)
    if (!ok) {
      pendingRef.current = null
      setMsgs((m) => [...m, { role: 'assistant', content: '⚠️ Nisam uspio da primijenim izmjenu na taj red — napiši točno kakav tekst želiš i pokušavam ponovo.' }])
    }
  }

  /** Ask the model WHICH line the user means and what to do with it.
   *  Candidates marked with ">>>" are what the user pointed at (clicked/selected).
   *  Returns the parsed decision, or null when the reply isn't a valid decision. */
  const decideEdit = async (q: string, answer: string, cands: string[]) => {
    if (!cands.length) return null
    const res = await aiChat([
      { role: 'system', content:
        `A user is chatting about a PDF document. Their message and the assistant answer follow.\n` +
        `Selectable text lines (id in brackets, page shown), the one the user pointed at is marked with >>>:\n${cands.join('\n')}\n\n` +
        `Decide what the user wants. Return ONLY one JSON object, nothing else:\n` +
        `- Change/rewrite the text of a line: {"action":"text","id":"<line id>","next":"<new exact full text>"}\n` +
        `- Change only the font size of a line: {"action":"fontSize","id":"<line id>","fontSize":<new size in pt, number>}\n` +
        `- Both text and size: {"action":"text","id":"<line id>","next":"<text>","fontSize":<pt>}\n` +
        `- Highlight a line (marker over it): {"action":"highlight","id":"<line id>"}\n` +
        `- Cover a line (hide it with an opaque box): {"action":"cover","id":"<line id>"}\n` +
        `- Delete/remove a line from view: {"action":"delete","id":"<line id>"}\n` +
        `- If the user says the last edit hit the WRONG text (e.g. "nisam mislio na to", "vrati", "undo"), return exactly: {"action":"undo"}\n` +
        `- If they ask for an edit but you are NOT sure WHICH line they mean, return ONLY: {"action":"ask"}\n` +
        `- If this is NOT an edit request, return exactly: {"action":"none"}\n` +
        `If a line is marked with >>> the user almost certainly means THAT one — use its id. If they clearly mean the selected element, use its id. ` +
        `Ids are opaque tokens — return them unchanged. Apply the action ONLY to a line you are confident is the one meant; if two or more lines match equally, return {"action":"ask"} instead of guessing. ` +
    `If the user refers only to a POSITION (e.g. "the first text", "on page 2", "the title") WITHOUT quoting actual words from the text itself, return {"action":"ask"} — never guess by position alone. ` +
        `Ids are opaque tokens — return them unchanged. ` +
        `Estimate fontSize sensibly (body text 10-14pt, titles 16-28pt; "smaller" ≈ ×0.7, "bigger" ≈ ×1.4 of the current one).` },
      { role: 'user', content: `User: ${q}\nAssistant: ${answer}` },
    ], { temperature: 0.1 })
    try {
      const p = JSON.parse(res.slice(res.indexOf('{'), res.lastIndexOf('}') + 1))
      const ask = !!p.ask || p.action === 'ask'
      const id = (p.id || '').trim()
      const next = (p.next || '').trim()
      let action = (p.action || '').trim().toLowerCase()
      const fsRaw: unknown = p.fontSize
      const fsNum = typeof fsRaw === 'number' ? fsRaw : typeof fsRaw === 'string' ? parseFloat(fsRaw.replace(',', '.')) : NaN
      const fs = fsNum > 2 && fsNum < 200 ? fsNum : undefined
      // Back-compat: legacy replies carry no `action` — infer from the payload.
      if (!action) action = next || fs !== undefined ? 'text' : ask ? 'ask' : id ? 'text' : 'none'
      return { id, next, action, fs, ask }
    } catch { return null }
  }

  /** Apply a parsed action to an original doc line or a user-added element.
   *  Returns true when something was actually applied. */
  const runAction = async (id: string, action: string, next: string, fs: number | undefined, docLines: DocLine[]): Promise<boolean> => {
    const done = (content: string) => setMsgs((m) => [...m, { role: 'assistant', content }])
    const line = docLines.find((l) => l.id === id)
    const el = allElements.find((e) => `u${e.id}` === id)
    if (!line && !el) return false

    // User-added element: text/fontSize via patch; cover/delete/highlight → remove it.
    if (el) {
      if (action === 'cover' || action === 'delete' || action === 'highlight') {
        onDelete(el.id)
        done('✎ Uklonio sam taj dodani element u PDF-u.')
        return true
      }
      if (el.kind !== 'text' || (!next && fs === undefined)) return false
      const oldText = (el.text as string).replace(/\s+/g, ' ').trim()
      const textChanged = !!next && oldText !== next
      if (!textChanged && fs === undefined) return false
      aiHistoryRef.current.push({ kind: 'el', id: el.id, oldText, oldFs: el.fontSize })
      aiLastRef.current = { id }
      onUpdate(el.id, { ...(textChanged ? { text: next } : {}), ...(fs ? { fontSize: fs } : {}) })
      done(`✎ Izmjena primijenjena — promijenio sam "${oldText.slice(0, 50)}"${textChanged ? ` → "${next.slice(0, 50)}"` : ''}${fs ? ` (font ${fs} pt)` : ''}.`)
      return true
    }

    // Original PDF line — position known, so highlight/cover/delete work by bbox.
    if (line) {
      if (action === 'highlight' || action === 'cover' || action === 'delete') {
        if (line.x === undefined || line.y === undefined || !line.w || !line.h) return false
        const ok = await onAiRegion(line.page, action as 'highlight' | 'cover' | 'delete', { x: line.x, y: line.y, w: line.w, h: line.h })
        if (!ok) return false
        aiLastRef.current = { id }
        onFlash?.({ page: line.page, x: line.x, y: line.y, w: line.w, h: line.h, kind: 'applied' })
        done(`✎ ${action === 'highlight' ? 'Istakao (highlight)' : action === 'cover' ? 'Prekrio' : 'Obrisao'} sam "${line.text.slice(0, 50)}" na stranici ${line.page}.`)
        return true
      }
      const clean = next.replace(/\s+/g, ' ').trim()
      const textChanged = !!clean && line.text !== clean
      if (!textChanged && fs === undefined) return false
      const ok = await onAiEditOriginal(line.page, line.text, textChanged ? clean : line.text, fs)
      if (!ok) return false
      aiHistoryRef.current.push({ kind: 'line', page: line.page, oldText: line.text, newText: clean || line.text, bbox: line.x !== undefined ? { x: line.x, y: line.y, w: line.w, h: line.h } : null })
      aiLastRef.current = { id }
      if (line.x !== undefined && line.y !== undefined && line.w && line.h) {
        onFlash?.({ page: line.page, x: line.x, y: line.y, w: line.w, h: line.h, kind: 'applied' })
      }
      done(`✎ Izmjena primijenjena — na stranici ${line.page} sam promijenio "${line.text.slice(0, 50)}"${textChanged ? ` → "${clean.slice(0, 50)}"` : ''}${fs ? ` (font ${fs} pt)` : ''}.`)
    }
    return true
  }

  /** The user clicked original text in the PDF. With a pending "which text do you
   *  mean?" request, resolve and apply it immediately; without one, acknowledge
   *  the pick so the next chat message can refer to it. */
  useEffect(() => {
    if (!pickedLine) return
    onPickConsumed?.()
    const pend = pendingRef.current
    pendingRef.current = null
    onNeedSelection?.(false)
    aiLastRef.current = { id: pickedLine.id }
    if (!pend) {
      setMsgs((m) => [...m, {
        role: 'assistant',
        content: `👆 Odabrali ste: "${pickedLine.text.slice(0, 80)}". Sada napišite što želite s tim tekstom — npr. "promijeni u …", "uvećaj font", "istakni", "prekrij", "obriši".`,
      }])
      return
    }
    setMsgs((m) => [...m, { role: 'user', content: `👆 (kliknuto u PDF-u, str. ${pickedLine.page}) "${pickedLine.text.slice(0, 80)}"` }])
    toast.info('Prepoznao sam odabrani tekst — primjenjujem zahtjev…')
    setBusy('chat')
    void (async () => {
      try {
        const cand = [`>>> (user just CLICKED this exact line in the PDF) [${pickedLine.id}] (p.${pickedLine.page}) ${pickedLine.text.slice(0, 140)}`]
        const p = await decideEdit(pend.q, pend.answer, cand)
        if (!p || !p.id || p.action === 'ask' || p.action === 'none') {
          setMsgs((m) => [...m, { role: 'assistant', content: '⚠️ Nisam razumio što točno želite s tim tekstom — napišite zahtjev, npr. "promijeni u …", "uvećaj font", "istakni", "obriši".' }])
          return
        }
        const ok = await runAction(p.id, p.action, p.next, p.fs, [pickedLine])
        if (!ok) setMsgs((m) => [...m, { role: 'assistant', content: '⚠️ Izmjena nije uspjela — pokušajte ponovo.' }])
      } catch (err) {
        fail(err)
      } finally {
        setBusy('')
      }
    })()
  }, [pickedLine])

  /** Clicking a user-added element while a request is pending resolves it too. */
  const lastSelRef = useRef<string | null>(null)
  useEffect(() => {
    const el = selectedEl
    if (!el || lastSelRef.current === el.id) return
    lastSelRef.current = el.id
    const pend = pendingRef.current
    if (!pend) return
    pendingRef.current = null
    onNeedSelection?.(false)
    aiLastRef.current = { id: `u${el.id}` }
    const label = el.kind === 'text' ? (el.text as string).replace(/\s+/g, ' ').trim().slice(0, 60) : el.kind
    setMsgs((m) => [...m, { role: 'user', content: `👆 (odabrano u PDF-u) element "${label}"` }])
    setBusy('chat')
    void (async () => {
      try {
        const long = el.kind === 'text' ? (el.text as string).replace(/\s+/g, ' ').trim().slice(0, 140) : el.kind
        const cand = [`>>> (user just CLICKED this element in the PDF) [u${el.id}] (added) ${long}`]
        const p = await decideEdit(pend.q, pend.answer, cand)
        if (!p || !p.id || p.action === 'ask' || p.action === 'none') {
          setMsgs((m) => [...m, { role: 'assistant', content: '⚠️ Nisam razumio što točno želite s tim elementom — napišite zahtjev, npr. "promijeni u …" ili "obriši".' }])
          return
        }
        const ok = await runAction(p.id, p.action, p.next, p.fs, [])
        if (!ok) setMsgs((m) => [...m, { role: 'assistant', content: '⚠️ Izmjena nije uspjela — pokušajte ponovo.' }])
      } catch (err) {
        fail(err)
      } finally {
        setBusy('')
      }
    })()
  }, [selectedEl])

  const saveKey = (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyInput.trim()) return
    setStoredKey('groq', keyInput)
    setKeyInput('')
    setConfigured(aiConfigured())
    toast.success('API key saved — AI is ready')
  }

  return (
    <aside className="relative flex max-h-[70vh] min-h-0 w-[320px] shrink-0 flex-col self-start overflow-hidden rounded-r-3xl border-l border-[#E8E0D6] bg-white/70 dark:border-white/10 dark:bg-ink-950/80">
      <div className="flex items-center justify-between border-b border-[#E8E0D6] px-4 py-3 dark:border-white/10">
        <span className="flex items-center gap-1.5 font-serif text-sm font-bold text-[#211A14] dark:text-white">
          <Sparkles className="h-4 w-4 text-accent-purple" /> AI Assistant
        </span>
        <button type="button" aria-label="Close AI panel" onClick={onClose} className="rounded-full p-1 text-default-500 hover:text-[#211A14] dark:text-white/60 dark:hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {!configured ? (
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <div className="rounded-2xl border border-[#E8E0D6] bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <h4 className="font-serif text-sm font-bold text-[#211A14] dark:text-white">Connect AI (one-time)</h4>
            <p className="mt-1.5 text-xs leading-relaxed text-faint">
              Paste a free API key from{' '}
              <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="font-bold text-accent-purple hover:underline">
                console.groq.com/keys
              </a>
              . It is stored only in this browser and used to answer questions about this document.
            </p>
            <form className="mt-3 flex gap-1.5" onSubmit={saveKey}>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="gsk_…"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-full border border-[#E8E0D6] bg-white px-3 py-1.5 text-xs outline-none focus:border-accent-purple dark:border-white/15 dark:bg-white/5 dark:text-white"
              />
              <button type="submit" disabled={!keyInput.trim()} className="rounded-full bg-accent-purple px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-50">
                Save
              </button>
            </form>
            <p className="mt-2 text-[10px] leading-relaxed text-faint">
              Only extracted document text is sent to the AI — never the PDF file itself.
            </p>
          </div>
        </div>
      ) : (
        <>
      <div ref={logRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3 text-[13px]">
        {msgs.length === 0 && (
          <p className="text-xs leading-relaxed text-faint">
            Ask anything about this document — answers cite pages. Only extracted text is sent to the AI, never the file itself.
          </p>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={cn('whitespace-pre-wrap rounded-2xl px-3 py-2 leading-relaxed', m.role === 'user' ? 'ml-6 bg-accent-purple text-white' : 'mr-2 bg-[#F6F1E9] text-[#211A14] dark:bg-white/10 dark:text-white/90')}>
            {m.content}
          </div>
        ))}
      </div>

      <form className="flex shrink-0 gap-1.5 border-t border-[#E8E0D6] p-3 dark:border-white/10" onSubmit={(e) => { e.preventDefault(); void ask(input) }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the document…"
          className="min-w-0 flex-1 rounded-full border border-[#E8E0D6] bg-white px-3 py-1.5 text-[13px] outline-none focus:border-accent-purple dark:border-white/15 dark:bg-white/5 dark:text-white"
        />
        <button type="submit" disabled={!!busy || !input.trim()} className="rounded-full bg-accent-purple px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-50">
          {busy === 'chat' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Ask'}
        </button>
      </form>
        </>
      )}

    </aside>
  )
}
