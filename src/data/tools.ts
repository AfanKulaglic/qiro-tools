import {
  QrCode, Link2, Megaphone, ImageDown, FileVideo, AudioLines, Clapperboard, Scissors, Sparkles, FileEdit,
  type LucideIcon,
} from 'lucide-react'
import type { ToolKey } from '@/hooks/useToolGate'

/**
 * Single source of truth for every Qiro tool. Navigation (navbar, mobile menu,
 * footer), the home/hero segmented switchers and per-tool identity all read from
 * here, so a tool is described in exactly one place and the colour/label/route
 * can never drift between surfaces.
 */

export type ToolCategory = 'Converters' | 'Links & QR' | 'AI Image' | 'AI PDF'

export const TOOL_CATEGORIES: ToolCategory[] = ['Converters', 'Links & QR', 'AI Image', 'AI PDF']

export interface ToolDef {
  key: ToolKey
  /** Short label for the segmented tab switchers (e.g. "Slika"). */
  label: string
  /** Longer label for navigation menus (e.g. "Konverter slika"). */
  navLabel: string
  /** One-line hint shown under tabs / menu rows. */
  hint: string
  to: string
  Icon: LucideIcon
  /** Tailwind text-colour class for the signature accent. */
  accent: string
  /** Icon-square background tint (gradient stops). */
  tint: string
  /** Icon-square inset ring. */
  ring: string
  category: ToolCategory
}

export const TOOLS: ToolDef[] = [
  // ── Converters ──
  {
    key: 'convert', label: 'Image', navLabel: 'Image Converter', hint: 'JPG, PNG, WebP',
    to: '/image-converter', Icon: ImageDown,
    accent: 'text-accent-purple', tint: 'from-accent-purple/15 to-accent-blue/10', ring: 'ring-accent-purple/25',
    category: 'Converters',
  },
  {
    key: 'video', label: 'Video', navLabel: 'Video Converter', hint: 'MP4, WebM, GIF, MP3',
    to: '/video-converter', Icon: FileVideo,
    accent: 'text-accent-peach', tint: 'from-accent-peach/20 to-accent-purple/10', ring: 'ring-accent-peach/30',
    category: 'Converters',
  },
  {
    key: 'audio', label: 'Audio', navLabel: 'Audio Converter', hint: 'MP3, WAV, OGG, M4A',
    to: '/audio-converter', Icon: AudioLines,
    accent: 'text-accent-coral', tint: 'from-accent-coral/15 to-accent-purple/10', ring: 'ring-accent-coral/25',
    category: 'Converters',
  },
  {
    key: 'gif', label: 'GIF', navLabel: 'GIF Maker', hint: 'Video → animated GIF',
    to: '/gif-maker', Icon: Clapperboard,
    accent: 'text-accent-yellow', tint: 'from-accent-yellow/20 to-accent-coral/10', ring: 'ring-accent-yellow/30',
    category: 'Converters',
  },

  // ── Links & QR ──
  {
    key: 'shorten', label: 'Link', navLabel: 'URL Shortener', hint: 'Short, clean URLs',
    to: '/shorten', Icon: Link2,
    accent: 'text-accent-blue', tint: 'from-accent-blue/15 to-accent-cyan/10', ring: 'ring-accent-blue/25',
    category: 'Links & QR',
  },
  {
    key: 'utm', label: 'UTM', navLabel: 'UTM Builder', hint: 'Trackable campaign links',
    to: '/utm-builder', Icon: Megaphone,
    accent: 'text-accent-sage', tint: 'from-accent-sage/20 to-accent-blue/10', ring: 'ring-accent-sage/30',
    category: 'Links & QR',
  },
  {
    key: 'qr', label: 'QR code', navLabel: 'QR Generator', hint: 'Branded QR, PNG & SVG',
    to: '/', Icon: QrCode,
    accent: 'text-accent-cyan', tint: 'from-accent-cyan/15 to-accent-blue/10', ring: 'ring-accent-cyan/25',
    category: 'Links & QR',
  },

  // ── AI Image ──
  {
    key: 'bg', label: 'Background', navLabel: 'Background Remover', hint: 'Remove image background (AI)',
    to: '/background-remover', Icon: Scissors,
    accent: 'text-accent-green', tint: 'from-accent-green/15 to-accent-cyan/10', ring: 'ring-accent-green/25',
    category: 'AI Image',
  },
  {
    key: 'enhance', label: 'Enhance', navLabel: 'Image Enhancer', hint: 'Upscale & sharpen photos with AI',
    to: '/image-enhancer', Icon: Sparkles,
    accent: 'text-accent-coral', tint: 'from-accent-coral/15 to-accent-peach/10', ring: 'ring-accent-coral/25',
    category: 'AI Image',
  },

  // â”€â”€ AI PDF â”€â”€
  {
    key: 'pdf', label: 'PDF', navLabel: 'AI PDF Studio', hint: 'Edit, create & chat with PDFs (AI)',
    to: '/pdf-editor', Icon: FileEdit,
    accent: 'text-accent-purple', tint: 'from-accent-purple/20 to-accent-blue/10', ring: 'ring-accent-purple/25',
    category: 'AI PDF',
  },
]

/** Tools grouped by category, preserving the registry order — for grouped UIs. */
export const TOOLS_BY_CATEGORY: { category: ToolCategory; tools: ToolDef[] }[] =
  TOOL_CATEGORIES.map((category) => ({
    category,
    tools: TOOLS.filter((t) => t.category === category),
  }))

export function getTool(key: ToolKey): ToolDef | undefined {
  return TOOLS.find((t) => t.key === key)
}
