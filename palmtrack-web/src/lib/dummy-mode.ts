import { DEMO_LICENSE_KEY, getStoredLicense } from '@/lib/license'

/** True only when the currently active license is the public demo key. */
export function isDemoMode(): boolean {
  return getStoredLicense()?.key === DEMO_LICENSE_KEY
}

/** Picks the sample dataset in demo mode, or the empty/zeroed one for a real account. */
export function seedData<T>(dummy: T, empty: T): T {
  return isDemoMode() ? dummy : empty
}
