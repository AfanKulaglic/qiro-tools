export type QRContentType = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'whatsapp' | 'vcard' | 'event' | 'location' | 'crypto' | 'wifi'

export type QRErrorLevel = 'L' | 'M' | 'Q' | 'H'

/** Decorative frame around the QR (e.g. a "Scan me" card). */
export type QRFrameStyle =
  | 'none' | 'card' | 'label' | 'banner'
  | 'header' | 'pill' | 'minimal' | 'circle'
  | 'bubble' | 'button' | 'ticket'
  | 'flyer' | 'shadow' | 'strip' | 'corners' | 'topbar'

/** Where the logo sits on the QR — 3×3 grid. */
export type QRLogoPosition =
  | 'center'
  | 'top-left' | 'top' | 'top-right'
  | 'left' | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right'

export interface QRSettings {
  value: string
  type: QRContentType
  fgColor: string
  bgColor: string
  transparent: boolean
  size: number
  level: QRErrorLevel
  margin: number
  logoUrl?: string
  logoSize?: number
  logoPosition?: QRLogoPosition
  /** Draw a rounded backing plate behind the logo for contrast. */
  logoPad?: boolean
  logoPadColor?: string
  // Frame / caption decoration
  frame?: QRFrameStyle
  frameLabel?: string
  frameFont?: 'script' | 'sans'
  frameAccent?: string
  frameArrow?: boolean
  /** Border width around card-style frames (0 = no border). */
  frameBorder?: number
  /** Border color for card-style frames (defaults to frameAccent). */
  frameBorderColor?: string
  /** Secondary caption text (used by the flyer frame below the QR). */
  frameFootLabel?: string
}

export interface QRHistoryItem {
  id: string
  content: string
  type: QRContentType
  createdAt: number
}

export interface ImageConversionHistoryItem {
  id: string
  fileName: string
  outputFormat: string
  createdAt: number
}

export interface VideoConversionHistoryItem {
  id: string
  fileName: string
  outputFormat: string
  createdAt: number
}

export interface AudioConversionHistoryItem {
  id: string
  fileName: string
  outputFormat: string
  createdAt: number
}

export interface GifHistoryItem {
  id: string
  fileName: string
  createdAt: number
}

export interface UtmHistoryItem {
  id: string
  url: string
  campaign: string
  createdAt: number
}
