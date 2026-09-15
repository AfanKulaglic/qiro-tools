import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileVideo, Film } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Video drop target — the video counterpart of `ImageDropzone`. Same visual
 * treatment (dashed card, gradient icon tile, drag animation), but accepts
 * video files. No clipboard-paste path: videos aren't pasted from the OS.
 */
/** Check by MIME type, with an extension fallback for types browsers leave blank. */
function accepts(file: File): boolean {
  if (file.type.startsWith('video/')) return true
  // Chrome on Windows reports an empty `type` for MKV/TS/FLV/WMV etc.
  return /^[a-z0-9]+$/.test(file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase() ?? '')
}

export function VideoDropzone({ onFile, className }: { onFile: (file: File) => void; className?: string }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    if (!accepts(file)) return
    onFile(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn('h-full', className)}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={cn(
          'group relative flex h-full min-h-[18rem] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-16 text-center transition-all duration-300 overflow-hidden',
          dragging
            ? 'border-accent-blue bg-gradient-to-br from-accent-blue/5 via-accent-cyan/5 to-transparent scale-[1.01]'
            : 'border-[#E8E0D6] dark:border-white/15 hover:border-accent-blue/50 hover:bg-accent-blue/[0.02] dark:hover:bg-accent-blue/[0.03]',
        )}
      >
        {/* Animated background pattern on drag */}
        <AnimatePresence>
          {dragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(39,129,236,0.06),transparent_70%)]" />
              <div className="absolute inset-x-[10%] top-0 h-px bg-gradient-to-r from-transparent via-accent-blue/30 to-transparent" />
              <div className="absolute inset-x-[10%] bottom-0 h-px bg-gradient-to-r from-transparent via-accent-blue/30 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icon */}
        <motion.div
          animate={dragging ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
          className="relative mb-5 grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-accent-blue/10 via-accent-cyan/10 to-accent-purple/10 text-accent-blue shadow-[0_8px_24px_-12px_rgba(39,129,236,0.2)] transition-all duration-300 group-hover:shadow-[0_12px_32px_-12px_rgba(39,129,236,0.3)] dark:from-accent-blue/15 dark:via-accent-cyan/15 dark:to-accent-purple/15"
        >
          <UploadCloud className="h-10 w-10" />
        </motion.div>

        {/* Text */}
        <p className="text-base font-bold text-[#211A14] dark:text-white">
          {dragging ? 'Drop video here' : 'Drag video here'}
        </p>
        <p className="mt-1.5 text-sm text-muted">
          or <span className="font-semibold text-accent-blue hover:underline">click to browse</span>
        </p>

        {/* Accepted formats */}
        <div className="mt-6 flex items-center gap-3 text-[11px] text-faint">
          <span className="flex items-center gap-1">
            <FileVideo className="h-3 w-3" />
            MP4
          </span>
          <span className="h-3 w-px bg-[#E8E0D6] dark:bg-white/10" />
          <span className="flex items-center gap-1">
            <FileVideo className="h-3 w-3" />
            MOV
          </span>
          <span className="h-3 w-px bg-[#E8E0D6] dark:bg-white/10" />
          <span className="flex items-center gap-1">
            <Film className="h-3 w-3" />
            WebM, AVI, MKV
          </span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </button>
    </motion.div>
  )
}
