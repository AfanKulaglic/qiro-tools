export interface ShortLink {
  slug: string
  longUrl: string
  shortUrl: string
  createdAt: number
  updatedAt: number
  clicks: number
  lastClickedAt: number | null
  isActive: boolean
  customAlias: boolean
  source: 'web'
  title: string
  notes: string
}

/** Lightweight record kept in localStorage for the "Recent links" history. */
export interface LinkHistoryItem {
  slug: string
  shortUrl: string
  longUrl: string
  title: string
  createdAt: number
}

export interface CreateLinkInput {
  longUrl: string
  customAlias?: string
  title?: string
  notes?: string
}
