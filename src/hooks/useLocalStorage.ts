import { useCallback, useEffect, useState } from 'react'
import { readStorage, writeStorage } from '@/utils/storage'

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readStorage<T>(key, initial))

  useEffect(() => {
    writeStorage(key, value)
  }, [key, value])

  // Keep multiple tabs / components in sync.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === key && e.newValue) {
        try {
          setValue(JSON.parse(e.newValue) as T)
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  const reset = useCallback(() => setValue(initial), [initial])

  return [value, setValue, reset] as const
}
