import { seedData } from '@/lib/dummy-mode'
import { type LngLat, offsetPoint, rectPolygon } from '@/lib/geo'
import { usePersistedState } from '@/lib/use-persisted-state'

export interface BlokLahan {
  blok: string
  kebun: string
  luas: number
  tanam: number
  mandor: string
  status: string
  polygon?: LngLat[]
}

// Indragiri Hilir, Riau — rural plantation belt ~13-20km north of Tembilahan town, not on top of
// it or the river. Each point was checked against real Mapbox satellite imagery first (organized
// tree rows / access roads visible, not buildings or water) before being used here.
const SUKAMAJU: LngLat = [103.1243, -0.1841]
const MAKMUR_JAYA: LngLat = [103.1, -0.16]
const HARAPAN_SAWIT: LngLat = [103.1929, -0.1927]
const TUNAS_LESTARI: LngLat = [103.22, -0.21]
const BERKAH_ALAM: LngLat = [103.16, -0.19]

function blockPolygon(cluster: LngLat, dxM: number, dyM: number, sideM: number, rotationDeg = 0): LngLat[] {
  return rectPolygon(offsetPoint(cluster, dxM, dyM), sideM, sideM, rotationDeg)
}

export const STATUS_COLOR_VAR: Record<string, string> = {
  Aktif: 'var(--color-primary)',
  'Perlu Perhatian': 'var(--color-amber-500)',
  Replanting: 'var(--color-sky-500)',
  'Non-aktif': 'var(--color-muted-foreground)',
}

export const BLOK_LAHAN_DUMMY: BlokLahan[] = [
  { blok: 'Blok A1', kebun: 'Kebun Sukamaju', luas: 8.5, tanam: 2018, mandor: 'Pak Herman', status: 'Aktif', polygon: blockPolygon(SUKAMAJU, -400, 0, 290) },
  { blok: 'Blok A2', kebun: 'Kebun Sukamaju', luas: 7.8, tanam: 2018, mandor: 'Pak Herman', status: 'Aktif', polygon: blockPolygon(SUKAMAJU, 0, 20, 280, 8) },
  { blok: 'Blok A3', kebun: 'Kebun Sukamaju', luas: 9.2, tanam: 2019, mandor: 'Pak Herman', status: 'Aktif', polygon: blockPolygon(SUKAMAJU, 400, 50, 300, -6) },
  { blok: 'Blok B1', kebun: 'Kebun Makmur Jaya', luas: 8.0, tanam: 2017, mandor: 'Pak Yusuf', status: 'Aktif', polygon: blockPolygon(MAKMUR_JAYA, -220, 0, 285) },
  { blok: 'Blok B2', kebun: 'Kebun Makmur Jaya', luas: 7.5, tanam: 2017, mandor: 'Pak Yusuf', status: 'Aktif', polygon: blockPolygon(MAKMUR_JAYA, 220, 30, 275, 10) },
  { blok: 'Blok C1', kebun: 'Kebun Harapan Sawit', luas: 10.1, tanam: 2020, mandor: 'Pak Herman', status: 'Aktif', polygon: blockPolygon(HARAPAN_SAWIT, -230, 0, 320) },
  { blok: 'Blok C2', kebun: 'Kebun Harapan Sawit', luas: 9.4, tanam: 2020, mandor: 'Pak Herman', status: 'Perlu Perhatian', polygon: blockPolygon(HARAPAN_SAWIT, 230, -20, 310, -8) },
  { blok: 'Blok D3', kebun: 'Kebun Tunas Lestari', luas: 6.8, tanam: 2022, mandor: 'Pak Slamet', status: 'Replanting', polygon: blockPolygon(TUNAS_LESTARI, -210, 0, 260) },
  { blok: 'Blok D4', kebun: 'Kebun Tunas Lestari', luas: 7.2, tanam: 2016, mandor: 'Pak Yusuf', status: 'Aktif', polygon: blockPolygon(TUNAS_LESTARI, 210, 40, 270, 6) },
  { blok: 'Blok E1', kebun: 'Kebun Berkah Alam', luas: 8.9, tanam: 2015, mandor: 'Pak Bambang', status: 'Aktif', polygon: blockPolygon(BERKAH_ALAM, 0, 0, 300) },
]

/** Shared by the Kebun list page and the standalone Peta Kebun page — both read/write the same persisted list. */
export function useBlokLahan() {
  return usePersistedState<BlokLahan[]>('blok_lahan', () => seedData(BLOK_LAHAN_DUMMY, []))
}
