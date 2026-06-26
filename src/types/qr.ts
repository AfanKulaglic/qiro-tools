export type QRContentType = 'url' | 'text' | 'email' | 'phone' | 'wifi'

export type QRErrorLevel = 'L' | 'M' | 'Q' | 'H'

export interface QRSettings {
  value: string
  type: QRContentType
  fgColor: string
  bgColor: string
  transparent: boolean
  size: number
  level: QRErrorLevel
  margin: number
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
