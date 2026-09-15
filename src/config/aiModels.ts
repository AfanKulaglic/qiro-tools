/**
 * AI PDF Studio — model configuration.
 * Failover chains: first available model answers; on failure we fall through.
 */

export interface ModelSpec {
  provider: 'groq' | 'openrouter'
  model: string
  label: string
}

/** Main chain: smart first, cheaper fallbacks after. (Models verified live 2026-09.) */
export const MODEL_CHAIN: ModelSpec[] = [
  { provider: 'groq', model: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B' },
  { provider: 'groq', model: 'qwen/qwen3.8-27b', label: 'Qwen 3.8 27B' },
  { provider: 'groq', model: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B' },
]

/** Vision chain — for scans / OCR-style work (D3.4). */
export const VISION_CHAIN: ModelSpec[] = [
  { provider: 'groq', model: 'groq/compound-mini', label: 'Groq Compound Mini' },
]

export const SYSTEM_DOC_QA =
  'You answer strictly from the provided PDF document text. Cite pages like (p.3). ' +
  'If the answer is not in the document, say so honestly — never invent content. ' +
  "If the user asks you to REWRITE/CHANGE/EDIT text in the document (e.g. \"change the title to X\", \"fix this sentence\"), do NOT say it's not in the document — treat it as an edit request and briefly confirm you will apply it, then describe the new text. " +
  'Reply in EXACTLY the same language (and dialect) the user writes in — Bosnian question → Bosnian answer, English → English. Never switch languages.'
