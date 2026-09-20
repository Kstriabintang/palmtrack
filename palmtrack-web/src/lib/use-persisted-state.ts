import { useEffect, useState } from 'react'
import { isDemoMode } from '@/lib/dummy-mode'

/**
 * Like useState, but backed by localStorage so real (non-demo) account data
 * survives a reload instead of resetting to the seed value every time.
 *
 * Keys are scoped by demo/real mode so a portfolio visitor poking at the demo
 * account can never leak into (or get overwritten by) a real license's data
 * on the same browser.
 */
export function usePersistedState<T>(key: string, initialValue: () => T) {
  const scopedKey = `palmtrack_data:${isDemoMode() ? 'demo' : 'real'}:${key}`

  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(scopedKey)
      if (raw) return JSON.parse(raw) as T
    } catch {
      // corrupt/unavailable storage — fall back to the seed value
    }
    return initialValue()
  })

  useEffect(() => {
    try {
      localStorage.setItem(scopedKey, JSON.stringify(state))
    } catch {
      // storage unavailable (private mode, quota, etc.) — state still works in-memory
    }
  }, [scopedKey, state])

  return [state, setState] as const
}
