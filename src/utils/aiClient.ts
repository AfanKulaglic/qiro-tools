/**
 * Minimal AI client with provider failover. Keys come from .env:
 *   VITE_GROQ_API_KEY / VITE_OPENROUTER_API_KEY
 * Only extracted document TEXT is ever sent to the provider — never the file.
 */
import { MODEL_CHAIN, type ModelSpec } from '@/config/aiModels'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const KEYS = {
  groq: () =>
    (localStorage.getItem('qiro_groq_key') || (import.meta.env.VITE_GROQ_API_KEY as string) || '').trim(),
  openrouter: () =>
    (localStorage.getItem('qiro_openrouter_key') || (import.meta.env.VITE_OPENROUTER_API_KEY as string) || '').trim(),
}

/** Persist a user-provided key (in-app setup card). Empty string clears it. */
export function setStoredKey(provider: 'groq' | 'openrouter', key: string) {
  const k = key.trim()
  if (k) localStorage.setItem(`qiro_${provider}_key`, k)
  else localStorage.removeItem(`qiro_${provider}_key`)
}

export function aiConfigured(): boolean {
  return MODEL_CHAIN.some((m) => KEYS[m.provider]())
}

export function aiConfigError(): string | null {
  if (!KEYS.groq() && !KEYS.openrouter()) {
    return 'AI is not configured — paste a free Groq API key below (or set VITE_GROQ_API_KEY in .env).'
  }
  return null
}

/** Non-streaming chat completion with automatic failover down the chain. */
export async function aiChat(messages: ChatMessage[], opts?: { chain?: ModelSpec[]; temperature?: number }): Promise<string> {
  const chain = opts?.chain ?? MODEL_CHAIN
  let lastErr: unknown
  for (const spec of chain) {
    const key = KEYS[spec.provider]()
    if (!key) continue
    try {
      return await once(spec, key, messages, opts?.temperature ?? 0.2)
    } catch (err) {
      lastErr = err
    }
  }
  throw new Error(`All AI providers failed: ${String(lastErr)}`)
}

async function once(spec: ModelSpec, key: string, messages: ChatMessage[], temperature: number): Promise<string> {
  const url =
    spec.provider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://openrouter.ai/api/v1/chat/completions'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      ...(spec.provider === 'openrouter' ? { 'X-Title': 'Qiro AI PDF Studio' } : {}),
    },
    body: JSON.stringify({
      model: spec.model,
      messages,
      temperature,
      // gpt-oss are reasoning models — without capping effort they can burn all
      // tokens on hidden reasoning and return an empty `content`.
      ...(spec.model.includes('gpt-oss') ? { reasoning_effort: 'low' } : {}),
    }),
  })
  if (!res.ok) throw new Error(`${spec.model}: ${res.status} ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  const msg = data?.choices?.[0]?.message
  // `content` may be a plain string or OpenAI's newer array-of-parts form.
  const content = msg?.content
  const text = (
    Array.isArray(content)
      ? content.map((p) => (typeof p === 'string' ? p : (p as { text?: string })?.text ?? '')).join('')
      : (content ?? '')
  ).trim()
  // NEVER use `message.reasoning` as the answer: reasoning models (e.g. gpt-oss)
  // sometimes burn all tokens on internal drafting, leaving `content` empty while
  // putting their draft plan in `reasoning`. That draft is not a usable response,
  // so treat it as a failure and let the caller fail over to the next model.
  if (!text) throw new Error(`${spec.model}: empty response (reasoning-only)`)
  return text
}

/** Extract clean text of the whole document (capped), with page markers. */
export async function docToContext(doc: LoadedDocLike, cap = 24000): Promise<string> {
  const { extractTextItems } = await import('@/utils/pdfEngine')
  const parts: string[] = []
  let total = 0
  for (let p = 1; p <= doc.pages.length; p++) {
    const items = await extractTextItems(doc as never, p)
    const page = items.map((i) => i.text).join(' ')
    parts.push(`--- Page ${p} ---\n${page}`)
    total += page.length
    if (total > cap) {
      parts.push(`[Document truncated at page ${p} of ${doc.pages.length}]`)
      break
    }
  }
  return parts.join('\n')
}

interface LoadedDocLike {
  pages: unknown[]
  pdf: unknown
}
