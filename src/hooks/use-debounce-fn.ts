import { useCallback, useRef } from 'react'

export function useDebounceBtn(callback: () => void | Promise<void>, delayMs = 300) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isProcessingRef = useRef(false)

  return useCallback(async () => {
    if (isProcessingRef.current) return

    isProcessingRef.current = true

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        await callback()
      } finally {
        isProcessingRef.current = false
      }
    }, delayMs)
  }, [callback, delayMs])
}
