const STORAGE_KEY = 'palmtrack_license'

// Crockford-style alphabet, ambiguous characters (0, 1, I, O) removed so keys
// are easy to read and type back from a printed card.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const GROUP_LENGTH = 4

export interface LicenseInfo {
  key: string
  activatedAt: string
  expiresAt: string
}

export type LicenseState = 'none' | 'active' | 'expiring' | 'expired'

function checksum(payload: string): string {
  let acc = 0
  for (const char of payload) {
    const value = ALPHABET.indexOf(char)
    acc = (acc * 31 + (value === -1 ? 0 : value)) % ALPHABET.length ** GROUP_LENGTH
  }
  let out = ''
  let n = acc
  for (let i = 0; i < GROUP_LENGTH; i++) {
    out = ALPHABET[n % ALPHABET.length] + out
    n = Math.floor(n / ALPHABET.length)
  }
  return out
}

function formatKey(groupA: string, groupB: string): string {
  return `PLMT-${groupA}-${groupB}-${checksum(groupA + groupB)}`
}

/** Always resolves to the same value — used as the ready-to-use key on the public demo. */
export const DEMO_LICENSE_KEY = formatKey('PALM', 'TR26')

/** Inserts dashes as the user types, so `plmtpalmtr26xxxx` becomes `PLMT-PALM-TR26-XXXX`. */
export function autoFormatKeyInput(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const groups = [clean.slice(0, 4), clean.slice(4, 8), clean.slice(8, 12), clean.slice(12, 16)]
  return groups.filter(Boolean).join('-')
}

export function validateLicenseKey(rawKey: string): { ok: true } | { ok: false; error: string } {
  const key = rawKey.trim().toUpperCase()
  const match = key.match(/^PLMT-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/)
  if (!match) {
    return { ok: false, error: 'Format kunci tidak valid. Contoh: PLMT-XXXX-XXXX-XXXX' }
  }
  const [, groupA, groupB, groupC] = match
  if (checksum(groupA + groupB) !== groupC) {
    return { ok: false, error: 'Kunci lisensi tidak dikenali. Periksa kembali penulisannya.' }
  }
  return { ok: true }
}

export function activateLicense(rawKey: string, months = 12): { ok: true; license: LicenseInfo } | { ok: false; error: string } {
  const validation = validateLicenseKey(rawKey)
  if (!validation.ok) return validation

  const key = rawKey.trim().toUpperCase()
  const activatedAt = new Date()
  const expiresAt = new Date(activatedAt)
  expiresAt.setMonth(expiresAt.getMonth() + months)

  const license: LicenseInfo = {
    key,
    activatedAt: activatedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(license))
  return { ok: true, license }
}

export function getStoredLicense(): LicenseInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LicenseInfo
    if (!parsed.key || !parsed.expiresAt) return null
    return parsed
  } catch {
    return null
  }
}

export function daysRemaining(license: LicenseInfo): number {
  const ms = new Date(license.expiresAt).getTime() - Date.now()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export function getLicenseState(): LicenseState {
  const license = getStoredLicense()
  if (!license) return 'none'
  const days = daysRemaining(license)
  if (days < 0) return 'expired'
  if (days <= 30) return 'expiring'
  return 'active'
}

export function isLicenseUsable(): boolean {
  const state = getLicenseState()
  return state === 'active' || state === 'expiring'
}

export function clearLicense(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function maskKey(key: string): string {
  const parts = key.split('-')
  if (parts.length !== 4) return key
  return `${parts[0]}-••••-••••-${parts[3]}`
}
