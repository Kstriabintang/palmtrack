const STORAGE_KEY = 'palmtrack_offline_timbang_queue'

export interface OfflineTimbangEntry {
  id: string
  waktu: string
  petani: string
  telepon: string
  plat: string
  peron: string
  bruto: number
  tara: number
  netto: number
  harga: number
  status: string
  queuedAt: string
}

export function getQueue(): OfflineTimbangEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as OfflineTimbangEntry[]) : []
  } catch {
    return []
  }
}

export function addToQueue(entry: OfflineTimbangEntry) {
  const queue = [...getQueue(), entry]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
  return queue
}

export function clearQueue() {
  localStorage.removeItem(STORAGE_KEY)
}
