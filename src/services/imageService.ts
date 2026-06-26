import { ref, push, set, get, remove } from 'firebase/database'
import { db } from '@/lib/firebase'
import { uploadToImgBB } from '@/lib/imgbb'

/** An image hosted on ImgBB, indexed under the user in Realtime Database. */
export interface CloudImage {
  id: string
  name: string
  format: string
  url: string
  displayUrl: string
  deleteUrl: string
  thumbUrl: string
  size: number
  width: number
  height: number
  createdAt: number
}

/**
 * Uploads a converted image to ImgBB, then records the resulting URLs under
 * users/{uid}/images in Realtime Database. Returns the saved record.
 */
export async function uploadAndSaveImage(
  uid: string,
  blob: Blob,
  meta: { name: string; format: string },
): Promise<CloudImage> {
  const hosted = await uploadToImgBB(blob, meta.name)

  const record: Omit<CloudImage, 'id'> = {
    name: meta.name,
    format: meta.format,
    url: hosted.url,
    displayUrl: hosted.displayUrl,
    deleteUrl: hosted.deleteUrl,
    thumbUrl: hosted.thumbUrl,
    size: hosted.size,
    width: hosted.width,
    height: hosted.height,
    createdAt: Date.now(),
  }

  const node = push(ref(db, `users/${uid}/images`))
  await set(node, record)
  return { id: node.key as string, ...record }
}

export async function listImages(uid: string): Promise<CloudImage[]> {
  const snap = await get(ref(db, `users/${uid}/images`))
  if (!snap.exists()) return []
  const out: CloudImage[] = []
  snap.forEach((child) => {
    out.push({ id: child.key as string, ...(child.val() as Omit<CloudImage, 'id'>) })
  })
  return out.sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteImageRecord(uid: string, id: string): Promise<void> {
  await remove(ref(db, `users/${uid}/images/${id}`))
}
