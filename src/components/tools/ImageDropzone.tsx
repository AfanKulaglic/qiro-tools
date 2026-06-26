import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/utils/cn'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

export function ImageDropzone({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    if (!ACCEPTED.includes(file.type)) return
    onFile(file)
  }

  return (
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
        'flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-colors',
        dragging
          ? 'border-accent-blue bg-accent-blue/5'
          : 'border-[#E8E0D6] dark:border-white/15 hover:border-accent-blue/60',
      )}
    >
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent-blue/15 to-accent-purple/15 text-accent-blue">
        <UploadCloud className="h-8 w-8" />
      </div>
      <p className="text-base font-semibold text-[#211A14] dark:text-white">
        Drag & drop an image here
      </p>
      <p className="mt-1 text-sm text-muted">or click to browse — JPG, PNG, WebP</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </button>
  )
}
