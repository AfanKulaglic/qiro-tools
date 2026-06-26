/**
 * ImgBB — free image hosting used as our storage layer (no Firebase Storage).
 * Upload returns permanent URLs we then save in Realtime Database next to the
 * signed-in user. The API key is public-ish but lives in env so it can rotate.
 * Get a free key at https://api.imgbb.com → "Get API key".
 */

const ENDPOINT = 'https://api.imgbb.com/1/upload'

export const isImgBBConfigured = Boolean(import.meta.env.VITE_IMGBB_API_KEY)

export interface ImgBBResult {
  url: string // direct image URL (i.ibb.co/...)
  displayUrl: string // viewer-friendly URL
  deleteUrl: string // owner-only delete URL
  thumbUrl: string
  width: number
  height: number
  size: number
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const s = String(reader.result)
      // strip the "data:*/*;base64," prefix — ImgBB wants the raw base64
      resolve(s.includes(',') ? s.slice(s.indexOf(',') + 1) : s)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export async function uploadToImgBB(blob: Blob, name?: string): Promise<ImgBBResult> {
  const key = import.meta.env.VITE_IMGBB_API_KEY
  if (!key) {
    throw new Error('ImgBB is not configured. Add VITE_IMGBB_API_KEY to your .env file.')
  }

  const base64 = await blobToBase64(blob)
  const form = new FormData()
  form.append('image', base64)
  if (name) form.append('name', name)

  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    body: form,
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.success) {
    throw new Error(json?.error?.message || 'ImgBB upload failed. Check your API key and try again.')
  }

  const d = json.data
  return {
    url: d.url,
    displayUrl: d.display_url ?? d.url,
    deleteUrl: d.delete_url ?? '',
    thumbUrl: d.thumb?.url ?? d.url,
    width: Number(d.width) || 0,
    height: Number(d.height) || 0,
    size: Number(d.size) || 0,
  }
}
