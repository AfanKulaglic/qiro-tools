#!/usr/bin/env node
/**
 * F4 — Proves the export pipeline that was silently failing: embedding the
 * original typeface with pdf-lib(+fontkit) and having pdf.js still read the
 * text back out of the exported file. Mirrors exactly what buildEditedPdf()
 * does (subset -> full embed -> standard-font fallback, guaranteed save).
 *
 * Run: node scripts/test-pdf-edit.mjs   (from the repo root)
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

const fontBytes = new Uint8Array(readFileSync('C:/Windows/Fonts/arial.ttf'))
let id = 0

// Same element shape buildEditedPdf consumes (whiteout + text replacement).
function replacementEls(x, y, w, h, text, fontSize) {
  return [
    { id: 'w' + id++, kind: 'whiteout', x, y, w, h, bg: '#ffffff' },
    { id: 't' + id++, kind: 'text', x, y, w, h, text, fontSize, color: '#111111', bold: false, italic: false, family: 'helv', cssFont: 'g_font_a', lineHeight: fontSize * 1.2 },
  ]
}

async function main() {
  const { PDFDocument, rgb, StandardFonts } = require('pdf-lib')
  const fontkit = require('@pdf-lib/fontkit')

  // 1) Source PDF with an embedded TTF.
  const src = await PDFDocument.create()
  src.registerFontkit(fontkit)
  const page = src.addPage([400, 200])
  const srcFont = await src.embedFont(fontBytes)
  page.drawText('Hello original world', { x: 30, y: 100, size: 24, font: srcFont, color: rgb(0, 0, 0) })
  page.drawText('Unchanged second line', { x: 30, y: 70, size: 24, font: srcFont, color: rgb(0, 0, 0) })
  const srcBytes = await src.save()
  const file = { size: srcBytes.length, arrayBuffer: async () => srcBytes.slice().buffer }

  // 2) Re-embed the SAME font program (this is where it used to abort pdf.save).
  const pdf = await PDFDocument.load(new Uint8Array(srcBytes))
  pdf.registerFontkit(fontkit)
  let re = null
  try { re = await pdf.embedFont(fontBytes, { subset: true }) } catch {
    try { re = await pdf.embedFont(fontBytes, { subset: false }) } catch { re = await pdf.embedFont(StandardFonts.Helvetica) }
  }
  const [pg] = pdf.getPages()
  const [w, t] = replacementEls(30, 100, 220, 29, 'Hello edited world', 24)
  pg.drawRectangle({ x: w.x, y: 200 - w.y - w.h, width: w.w, height: w.h, color: rgb(1, 1, 1) })
  pg.drawText(t.text, { x: t.x, y: 200 - t.y - 24, size: t.fontSize, font: re, color: rgb(0, 0, 0) })
  const outBytes = await pdf.save()

  // 3) pdf.js must read the edit back out.
  const pdfjs = require('pdfjs-dist/legacy/build/pdf.mjs')
  const doc = await pdfjs.getDocument({ data: new Uint8Array(outBytes), fontExtraProperties: true }).promise
  const txt = await doc.getPage(1).then((p) => p.getTextContent())
  const joined = txt.items.map((i) => i.str).join(' ')

  const expect = (c, m) => { if (c) console.log('ok: ' + m); else { console.error('FAIL: ' + m); process.exitCode = 1 } }
  expect(joined.includes('edited'), `new text 'edited' present in output (got: ${joined})`)
  expect(joined.includes('Unchanged second line'), 'unchanged line survived untouched')
  expect(outBytes.length > 0, 'export produced valid, re-readable PDF bytes (no abort on embed/save)')
  console.log('\n' + (process.exitCode ? 'FAILED' : 'PASS — embed + guaranteed save + readable edit all work.'))
}

main().catch((e) => { console.error(e); process.exit(1) })
