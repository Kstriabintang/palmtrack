import { ArrowLeft, Home, Maximize2, Minimize2, Sprout } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { BlokMapData, PeronMapData } from '@/components/kebun-map'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { getBusinessProfile, saveKebunLocation } from '@/lib/business'
import { isDemoMode, seedData } from '@/lib/dummy-mode'
import { useBlokLahan } from '@/lib/dummy-kebun'
import { activeHargaPeron, computeTodayStatsByPeron, KEBUN_CENTER, PERON_LOCATIONS_DUMMY, TIMBANGAN_DUMMY } from '@/lib/dummy-peron'
import { type LngLat, polygonCenter } from '@/lib/geo'
import { usePersistedState } from '@/lib/use-persisted-state'

// mapbox-gl is a ~1MB library — only fetch it once this page is opened.
const KebunMap = lazy(() => import('@/components/kebun-map').then((m) => ({ default: m.KebunMap })))

const STATUS_LEGEND: Record<string, string> = {
  Aktif: '#1f5c43',
  'Perlu Perhatian': '#d97706',
  Replanting: '#0284c7',
  'Non-aktif': '#6b7568',
}

/** Fallback wide view of Indonesia for a brand-new real account with no location set yet. */
const INDONESIA_CENTER: LngLat = [113.9, -0.8]

export function PetaKebunPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const demo = isDemoMode()
  const businessProfile = getBusinessProfile()
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [BLOK_LAHAN, setBlokLahan] = useBlokLahan()
  const [drawingForBlok, setDrawingForBlok] = useState<string | null>(
    () => (location.state as { drawBlok?: string } | null)?.drawBlok ?? null,
  )
  const [editingLocation, setEditingLocation] = useState(false)
  const [kebunLocation, setKebunLocation] = useState<LngLat | undefined>(() => businessProfile?.kebunLocation)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Consume the "draw this block" navigation hint once, so a later back/forward doesn't replay it.
  useEffect(() => {
    if (location.state) navigate('.', { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function handleChange() {
      setIsFullscreen(document.fullscreenElement === wrapperRef.current)
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      wrapperRef.current?.requestFullscreen()
    }
  }

  const HARGA_PERON = activeHargaPeron(businessProfile)
  const [peronLocations, setPeronLocations] = usePersistedState<Record<string, LngLat>>('peron_locations', () =>
    seedData(PERON_LOCATIONS_DUMMY, { 'Peron 1': KEBUN_CENTER }),
  )
  const [timbangan] = usePersistedState('timbangan', () => seedData(TIMBANGAN_DUMMY, []))
  const todayStats = computeTodayStatsByPeron(timbangan)

  const mapBloks: BlokMapData[] = BLOK_LAHAN
  const mapPeron: PeronMapData[] = HARGA_PERON.map((h) => ({
    peron: h.peron,
    location: peronLocations[h.peron] ?? KEBUN_CENTER,
    harga: h.harga,
    netto: todayStats[h.peron]?.netto ?? 0,
    transaksi: todayStats[h.peron]?.transaksi ?? 0,
    belumLunas: todayStats[h.peron]?.belumLunas ?? 0,
  }))

  const firstPolygonCenter = BLOK_LAHAN.find((b) => b.polygon)?.polygon
  const knownCenter = demo
    ? (firstPolygonCenter ? polygonCenter(firstPolygonCenter) : KEBUN_CENTER)
    : (kebunLocation ?? (firstPolygonCenter ? polygonCenter(firstPolygonCenter) : mapPeron[0]?.location))
  const mapCenter: LngLat = knownCenter ?? INDONESIA_CENTER
  const mapZoom = knownCenter ? 15 : 4.2

  function handlePolygonSaved(blokName: string, polygon: LngLat[]) {
    setBlokLahan((prev) => prev.map((b) => (b.blok === blokName ? { ...b, polygon } : b)))
    setDrawingForBlok(null)
    toast.success(`Denah ${blokName} tersimpan`)
  }

  function handlePeronMoved(peronName: string, loc: LngLat) {
    setPeronLocations((prev) => ({ ...prev, [peronName]: loc }))
    toast.success(`Lokasi ${peronName} diperbarui di peta`)
  }

  function handleSetKebunLocation(loc: LngLat) {
    saveKebunLocation(loc)
    setKebunLocation(loc)
    toast.success('Lokasi kebun diperbarui')
  }

  const kebunName = businessProfile?.namaUsaha ?? 'Kebun Anda'

  return (
    <div ref={wrapperRef} className="relative h-[calc(100dvh-4rem)] w-full bg-background">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Memuat peta...</div>
        }
      >
        <KebunMap
          bloks={mapBloks}
          peron={mapPeron}
          center={mapCenter}
          initialZoom={mapZoom}
          drawingForBlok={drawingForBlok}
          onPolygonSaved={handlePolygonSaved}
          onCancelDrawing={() => setDrawingForBlok(null)}
          onPeronMoved={handlePeronMoved}
          kebunLocation={kebunLocation}
          kebunName={kebunName}
          editingLocation={editingLocation}
          onSetKebunLocation={handleSetKebunLocation}
          onCancelEditLocation={() => setEditingLocation(false)}
        />
      </Suspense>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4">
        <div className="pointer-events-auto flex items-center gap-3 rounded-xl bg-card/95 px-3 py-2 shadow-md ring-1 ring-border backdrop-blur">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate('/kebun')}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Peta Kebun</span>
            <span className="text-xs text-muted-foreground">
              {kebunName} · {BLOK_LAHAN.length} blok
            </span>
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-2 rounded-xl bg-card/95 p-1.5 shadow-md ring-1 ring-border backdrop-blur">
          {!demo && (
            <Button variant={editingLocation ? 'default' : 'outline'} size="sm" onClick={() => setEditingLocation((v) => !v)}>
              <Home />
              {kebunLocation ? 'Ubah Lokasi Kebun' : 'Tetapkan Lokasi Kebun'}
            </Button>
          )}
          <Button variant="outline" size="icon-sm" onClick={toggleFullscreen} data-testid="fullscreen-toggle">
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-3 rounded-xl bg-card/95 px-3 py-2 text-xs text-muted-foreground shadow-md ring-1 ring-border backdrop-blur">
        {Object.entries(STATUS_LEGEND).map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>

      {!demo && BLOK_LAHAN.length === 0 && !editingLocation && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="pointer-events-auto max-w-sm rounded-xl bg-card/95 shadow-lg ring-1 ring-border backdrop-blur">
            <EmptyState
              icon={Sprout}
              title="Belum ada blok lahan"
              description="Tambahkan blok lahan dulu di halaman Kebun, lalu kembali ke sini untuk menggambar denahnya di peta."
              actionLabel="Buka Halaman Kebun"
              onAction={() => navigate('/kebun')}
            />
          </div>
        </div>
      )}
    </div>
  )
}
