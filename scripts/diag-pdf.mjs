#!/usr/bin/env node
/**
 * Diagnose a real PDF: fonts used (embedded?), per-page line geometry and the
 * values extractTextItems would produce — the ground truth behind "font looks
 * wrong when editing". Mirrors extractTextItems() but prints for inspection.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const pdfjs = require('pdfjs-dist/legacy/build/pdf.mjs')

async function main() {
  const path = process.argv[2]
  const data = new Uint8Array(readFileSync(path))
  const doc = await pdfjs.getDocument({ data, fontExtraProperties: true }).promise
  console.log('pages:', doc.numPages)
  for (let n = 1; n <= Math.min(doc.numPages, 2); n++) {
    const page = await doc.getPage(n)
    const viewport = page.getViewport({ scale: 1 })
    console.log(`\n===== PAGE ${n}  ${Math.round(viewport.width)}x${Math.round(viewport.height)} =====`)
    const content = await page.getTextContent()
    const styles = content.styles || {}
    const seen = new Set()
    console.log('--- fonts seen in styles ---')
    for (const [name, s] of Object.entries(styles)) {
      if (seen.has(s.fontFamily)) continue
      seen.add(s.fontFamily)
      console.log(`  ${name}  =>  family="${s.fontFamily}"  ascent=${s.ascent?.toFixed?.(2)} descent=${s.descent?.toFixed?.(2)}`)
    }
    // Look at commonObjs for embedded font data presence.
    try {
      const store = page.commonObjs?._objs
      if (store) {
        const keys = Object.keys(store).filter((k) => store[k]?.data?.loadedName)
        console.log('--- commonObjs font entries:', keys.length, '---')
        for (const k of keys) {
          const d = store[k].data
          const has = d.data && (d.data.length || d.data.byteLength)
          console.log(`  ${d.loadedName}  name=${d.name} bold=${d.bold} italic=${d.italic} dataBytes=${d.data ? (d.data.length || d.data.byteLength) : 0} mimetype=${d.mimetype}`)
        }
      }
    } catch (e) { console.log('commonObjs inspect failed:', e.message) }
    // First ~12 text runs
    console.log('--- first 12 text items ---')
    let c = 0
    for (const it of content.items) {
      if (!('str' in it) || !it.str.trim()) continue
      const fz = Math.hypot(it.transform[2], it.transform[3]) || it.height
      const fam = styles[it.fontName]?.fontFamily
      console.log(`  fz=${fz.toFixed(1)} x=${it.transform[4].toFixed(1)} y=${it.transform[5].toFixed(1)} font=${it.fontName} fam=${fam} :: "${it.str.slice(0, 40)}"`)
      if (++c >= 12) break
    }
  }
  await doc.destroy()
}
main().catch((e) => { console.error(e); process.exit(1) })
