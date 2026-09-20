import type { BusinessProfile } from '@/lib/business'
import { seedData } from '@/lib/dummy-mode'
import type { LngLat } from '@/lib/geo'

export interface TimbanganEntry {
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
}

/** Shared with the map's peron markers, so both reflect the same persisted transactions. */
export const TIMBANGAN_DUMMY: TimbanganEntry[] = [
  { waktu: '10:24', petani: 'Bapak Suroto', telepon: '0812-5566-7788', plat: 'KB 1234 XY', peron: 'Peron 1', bruto: 3200, tara: 860, netto: 2340, harga: 2450, status: 'Lunas' },
  { waktu: '09:52', petani: 'Ibu Sari Wulandari', telepon: '0813-2233-4455', plat: 'KB 5678 AB', peron: 'Peron 2', bruto: 2850, tara: 720, netto: 2130, harga: 2450, status: 'Lunas' },
  { waktu: '09:18', petani: 'Pak Agus Salim', telepon: '0821-9988-7766', plat: 'KB 9012 CD', peron: 'Peron 1', bruto: 4100, tara: 1050, netto: 3050, harga: 2450, status: 'Belum Lunas' },
  { waktu: '08:45', petani: 'Pak Slamet Riyadi', telepon: '0852-1122-3344', plat: 'KB 3456 EF', peron: 'Peron 3', bruto: 1980, tara: 510, netto: 1470, harga: 2400, status: 'Lunas' },
  { waktu: '08:12', petani: 'Bapak Suroto', telepon: '0812-5566-7788', plat: 'KB 1234 XY', peron: 'Peron 1', bruto: 2760, tara: 700, netto: 2060, harga: 2400, status: 'Lunas' },
  { waktu: '07:40', petani: 'Ibu Ningsih', telepon: '0813-6677-8899', plat: 'KB 7788 GH', peron: 'Peron 2', bruto: 3500, tara: 890, netto: 2610, harga: 2400, status: 'Belum Lunas' },
  { waktu: '07:15', petani: 'Pak Bambang', telepon: '0821-4455-6677', plat: 'KB 4455 IJ', peron: 'Peron 3', bruto: 2200, tara: 560, netto: 1640, harga: 2400, status: 'Lunas' },
  { waktu: '07:03', petani: 'Pak Yusuf', telepon: '0812-3344-5566', plat: 'KB 6677 KL', peron: 'Peron 1', bruto: 3980, tara: 1020, netto: 2960, harga: 2400, status: 'Lunas' },
]

export const HARGA_PERON_DUMMY = [
  { peron: 'Peron 1', harga: 2450, perubahan: 2 },
  { peron: 'Peron 2', harga: 2450, perubahan: 2 },
  { peron: 'Peron 3', harga: 2400, perubahan: 0 },
]

/** Real accounts only ever have one peron (set up during onboarding) until an "add peron" flow exists. */
export function activeHargaPeron(businessProfile: BusinessProfile | null) {
  return seedData(HARGA_PERON_DUMMY, [{ peron: 'Peron 1', harga: businessProfile?.hargaTbsAwal ?? 0, perubahan: 0 }])
}

/** Roughly Kubu Raya / Ambawang, West Kalimantan — matches the PKS names already used in the dummy data. */
export const KEBUN_CENTER: LngLat = [109.3, -0.12]

export const PERON_LOCATIONS_DUMMY: Record<string, LngLat> = {
  'Peron 1': [109.298, -0.121],
  'Peron 2': [109.305, -0.114],
  'Peron 3': [109.292, -0.108],
}

export interface PeronTodayStats {
  netto: number
  transaksi: number
  belumLunas: number
}

export function computeTodayStatsByPeron(timbangan: TimbanganEntry[]): Record<string, PeronTodayStats> {
  const stats: Record<string, PeronTodayStats> = {}
  for (const row of timbangan) {
    stats[row.peron] ??= { netto: 0, transaksi: 0, belumLunas: 0 }
    stats[row.peron].netto += row.netto
    stats[row.peron].transaksi += 1
    if (row.status === 'Belum Lunas') stats[row.peron].belumLunas += 1
  }
  return stats
}
