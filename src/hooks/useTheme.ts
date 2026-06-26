import { useCallback, useEffect, useState } from 'react'
import { STORAGE_KEYS, readStorage, writeStorage } from '@/utils/storage'

type Theme = 'dark' | 'light'

function getInitialTheme(): Theme {
  const stored = readStorage<Theme | null>(STORAGE_KEYS.theme, null)
  if (stored === 'dark' || stored === 'light') return stored
  // Default to light to match the Essentio look (white site, dark chrome).
  return 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    writeStorage(STORAGE_KEYS.theme, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme, setTheme }
}
