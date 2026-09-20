import type { LngLat } from '@/lib/geo'

const STORAGE_KEY = 'palmtrack_business'

export interface BusinessProfile {
  namaUsaha: string
  hargaTbsAwal: number
  onboardedAt: string
  /** Real-world center of the Bos's kebun, set from the Peta Kebun page. Absent until they place it. */
  kebunLocation?: LngLat
}

export function getBusinessProfile(): BusinessProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as BusinessProfile
    if (!parsed.namaUsaha) return null
    return parsed
  } catch {
    return null
  }
}

export function saveBusinessProfile(profile: Omit<BusinessProfile, 'onboardedAt'>): BusinessProfile {
  const full: BusinessProfile = { ...profile, onboardedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full))
  return full
}

export function saveKebunLocation(location: LngLat): BusinessProfile | null {
  const current = getBusinessProfile()
  if (!current) return null
  const updated: BusinessProfile = { ...current, kebunLocation: location }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function isOnboarded(): boolean {
  return getBusinessProfile() !== null
}

export function clearBusinessProfile(): void {
  localStorage.removeItem(STORAGE_KEY)
}
