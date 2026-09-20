import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { Home, MapPin, Pencil } from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useRef } from 'react'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import type { LngLat } from '@/lib/geo'
import { rupiah } from '@/lib/format'

const STATUS_COLOR: Record<string, string> = {
  Aktif: '#1f5c43',
  'Perlu Perhatian': '#d97706',
  Replanting: '#0284c7',
  'Non-aktif': '#6b7568',
}

const PALM_PATTERN_ID = 'palmtrack-palm-pattern'

/** A small tileable image of oil-palm silhouettes, used as a fill-pattern so block polygons read as plantation, not just colored zones. */
function buildPalmPatternImage(): ImageData {
  const size = 56
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new ImageData(size, size)

  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = 1.3
  ctx.lineCap = 'round'

  function drawPalm(cx: number, baseY: number, scale: number) {
    const trunkTopX = cx - 1.5 * scale
    const trunkTopY = baseY - 7 * scale
    ctx?.beginPath()
    ctx?.moveTo(cx, baseY)
    ctx?.quadraticCurveTo(cx - 0.5 * scale, baseY - 4 * scale, trunkTopX, trunkTopY)
    ctx?.stroke()

    for (const deg of [-75, -38, -5, 30, 65]) {
      const rad = (deg * Math.PI) / 180
      const len = 5.5 * scale
      const endX = trunkTopX + Math.sin(rad) * len
      const endY = trunkTopY - Math.cos(rad) * len * 0.55
      ctx?.beginPath()
      ctx?.moveTo(trunkTopX, trunkTopY)
      ctx?.quadraticCurveTo(trunkTopX + Math.sin(rad) * len * 0.5, trunkTopY - len * 0.45, endX, endY)
      ctx?.stroke()
    }
  }

  drawPalm(14, 46, 1)
  drawPalm(41, 20, 0.8)
  return ctx.getImageData(0, 0, size, size)
}

export interface BlokMapData {
  blok: string
  kebun: string
  luas: number
  tanam: number
  status: string
  polygon?: LngLat[]
}

export interface PeronMapData {
  peron: string
  location: LngLat
  harga: number
  netto: number
  transaksi: number
  belumLunas: number
}

interface KebunMapProps {
  bloks: BlokMapData[]
  peron: PeronMapData[]
  center: LngLat
  initialZoom?: number
  drawingForBlok: string | null
  onPolygonSaved: (blok: string, polygon: LngLat[]) => void
  onCancelDrawing: () => void
  onPeronMoved: (peron: string, location: LngLat) => void
  kebunLocation?: LngLat
  kebunName?: string
  editingLocation?: boolean
  onSetKebunLocation?: (location: LngLat) => void
  onCancelEditLocation?: () => void
}

const BLOK_SOURCE_ID = 'palmtrack-bloks'

export function KebunMap({
  bloks,
  peron,
  center,
  initialZoom = 15,
  drawingForBlok,
  onPolygonSaved,
  onCancelDrawing,
  onPeronMoved,
  kebunLocation,
  kebunName = 'Kebun Anda',
  editingLocation = false,
  onSetKebunLocation,
  onCancelEditLocation,
}: KebunMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const drawRef = useRef<MapboxDraw | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const homeMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const editingLocationRef = useRef(editingLocation)
  editingLocationRef.current = editingLocation
  const callbacksRef = useRef({ onPolygonSaved, onCancelDrawing, onPeronMoved, onSetKebunLocation })
  callbacksRef.current = { onPolygonSaved, onCancelDrawing, onPeronMoved, onSetKebunLocation }

  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

  // Map created once on mount only — re-creating it on every render/prop
  // change would burn through the Mapbox free-tier map-load quota.
  useEffect(() => {
    if (!token || !containerRef.current) return

    mapboxgl.accessToken = token
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center,
      zoom: initialZoom,
    })
    mapRef.current = map
    // Bottom-right, not top-right — the page's own floating toolbar already occupies the top-right corner.
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')
    map.addControl(
      new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: false }),
      'bottom-right',
    )

    // MapboxDraw is only created once drawing actually starts (see the drawingForBlok effect
    // below) — its vertex/midpoint/fill layers add real per-frame render cost, not worth paying
    // for on every visit to the map when most visits never touch the draw tool.

    map.on('click', (event) => {
      if (!editingLocationRef.current) return
      callbacksRef.current.onSetKebunLocation?.([event.lngLat.lng, event.lngLat.lat])
    })

    // 'style.load' fires once the base style is visually ready, without waiting for every raster
    // tile across the whole map to finish downloading — 'load' can lag far behind on a slow
    // connection, which would otherwise delay showing the block polygons for no good reason.
    map.once('style.load', () => {
      map.addImage(PALM_PATTERN_ID, buildPalmPatternImage())
      map.addSource(BLOK_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addLayer({
        id: 'bloks-fill',
        type: 'fill',
        source: BLOK_SOURCE_ID,
        paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.4 },
      })
      map.addLayer({
        id: 'bloks-pattern',
        type: 'fill',
        source: BLOK_SOURCE_ID,
        paint: { 'fill-pattern': PALM_PATTERN_ID, 'fill-opacity': 0.85 },
      })
      map.addLayer({
        id: 'bloks-line',
        type: 'line',
        source: BLOK_SOURCE_ID,
        paint: { 'line-color': ['get', 'color'], 'line-width': 2 },
      })
      map.addLayer({
        id: 'bloks-label',
        type: 'symbol',
        source: BLOK_SOURCE_ID,
        layout: {
          'text-field': ['get', 'blok'],
          'text-size': 12,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        },
        paint: { 'text-color': '#ffffff', 'text-halo-color': '#16231c', 'text-halo-width': 1.2 },
      })

      map.on('click', 'bloks-fill', (event) => {
        if (editingLocationRef.current) return
        const feature = event.features?.[0]
        if (!feature) return
        const props = (feature as unknown as { properties: Record<string, string> }).properties as {
          blok: string
          kebun: string
          luas: string
          tanam: string
          status: string
        }
        new mapboxgl.Popup({ closeButton: false, maxWidth: '220px' })
          .setLngLat(event.lngLat)
          .setHTML(
            `<div style="font:13px/1.4 system-ui;color:#16231c">
              <div style="font-weight:700;margin-bottom:2px">${props.blok}</div>
              <div style="color:#6b7568;margin-bottom:4px">${props.kebun}</div>
              <div>Luas: <b>${props.luas} Ha</b></div>
              <div>Tahun tanam: <b>${props.tanam}</b></div>
              <div>Status: <b>${props.status}</b></div>
            </div>`,
          )
          .addTo(map)
      })
      map.on('mouseenter', 'bloks-fill', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'bloks-fill', () => {
        map.getCanvas().style.cursor = ''
      })
    })

    return () => {
      for (const marker of markersRef.current) marker.remove()
      markersRef.current = []
      homeMarkerRef.current?.remove()
      homeMarkerRef.current = null
      map.remove()
      mapRef.current = null
      drawRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Sync block polygons whenever the data changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const apply = () => {
      const source = map.getSource(BLOK_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined
      if (!source) return
      source.setData({
        type: 'FeatureCollection',
        features: bloks
          .filter((b) => b.polygon && b.polygon.length >= 4)
          .map((b) => ({
            type: 'Feature' as const,
            properties: {
              blok: b.blok,
              kebun: b.kebun,
              luas: b.luas,
              tanam: b.tanam,
              status: b.status,
              color: STATUS_COLOR[b.status] ?? STATUS_COLOR['Non-aktif'],
            },
            geometry: { type: 'Polygon' as const, coordinates: [b.polygon as LngLat[]] },
          })),
      })
    }
    if (map.isStyleLoaded()) apply()
    else map.once('style.load', apply)
  }, [bloks])

  // Sync peron markers.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    for (const marker of markersRef.current) marker.remove()
    markersRef.current = []

    for (const p of peron) {
      const el = document.createElement('div')
      el.style.cssText =
        'width:26px;height:26px;border-radius:9999px;background:#c9962e;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);cursor:pointer'

      const popupHtml = `<div style="font:13px/1.5 system-ui;color:#16231c">
        <div style="font-weight:700;margin-bottom:3px">🏭 ${p.peron}</div>
        <div>Harga hari ini: <b>${rupiah(p.harga)}/kg</b></div>
        <div>Netto hari ini: <b>${p.netto.toLocaleString('id-ID')} kg</b></div>
        <div>Transaksi: <b>${p.transaksi}</b>${p.belumLunas > 0 ? ` · <span style="color:#c1443a">${p.belumLunas} belum lunas</span>` : ''}</div>
      </div>`

      const marker = new mapboxgl.Marker({ element: el, draggable: true })
        .setLngLat(p.location)
        .setPopup(new mapboxgl.Popup({ closeButton: false, offset: 16 }).setHTML(popupHtml))
        .addTo(map)

      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat()
        callbacksRef.current.onPeronMoved(p.peron, [lng, lat])
      })

      markersRef.current.push(marker)
    }
  }, [peron])

  // Sync the kebun's own home marker (draggable once placed).
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (!kebunLocation) {
      homeMarkerRef.current?.remove()
      homeMarkerRef.current = null
      return
    }

    if (!homeMarkerRef.current) {
      const el = document.createElement('div')
      el.style.cssText =
        'width:32px;height:32px;border-radius:9999px;background:#16231c;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px'
      el.textContent = '🏠'

      const marker = new mapboxgl.Marker({ element: el, draggable: true })
        .setLngLat(kebunLocation)
        .setPopup(new mapboxgl.Popup({ closeButton: false, offset: 18 }).setText(`Lokasi ${kebunName}`))
        .addTo(map)

      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat()
        callbacksRef.current.onSetKebunLocation?.([lng, lat])
      })

      homeMarkerRef.current = marker
    } else {
      homeMarkerRef.current.setLngLat(kebunLocation)
    }
  }, [kebunLocation, kebunName])

  // Toggle map cursor while the Bos is picking a new kebun location.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.getCanvas().style.cursor = editingLocation ? 'crosshair' : ''
  }, [editingLocation])

  // Enter/exit draw mode for the block currently being outlined. Deferred until the style has
  // finished loading — arriving here already in draw mode (e.g. navigated straight from the Kebun
  // page's "Gambar Denah" action) can otherwise call changeMode before Draw's internal layers exist,
  // which silently swallows every click.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    // Nothing to tear down if the draw tool was never instantiated and we're still not drawing.
    if (!drawingForBlok && !drawRef.current) return

    function handleCreate(event: { features: Array<{ geometry: { coordinates: LngLat[][] } }> }) {
      // Don't deleteAll() here — Draw is mid-transition into direct_select for the feature we'd be
      // deleting, and doing it synchronously in this handler throws. The drawingForBlok effect below
      // clears it for us as soon as the parent flips drawingForBlok back to null.
      const coords = event.features[0]?.geometry.coordinates[0]
      if (coords && drawingForBlok) callbacksRef.current.onPolygonSaved(drawingForBlok, coords)
    }

    function apply() {
      if (!map) return
      if (drawingForBlok) {
        // Created lazily, on first actual use — its vertex/midpoint/fill layers add real
        // per-frame render cost, not worth paying for on visits that never touch the draw tool.
        if (!drawRef.current) {
          const draw = new MapboxDraw({ displayControlsDefault: false, controls: {} })
          map.addControl(draw)
          drawRef.current = draw
        }
        drawRef.current.deleteAll()
        drawRef.current.changeMode('draw_polygon')
        map.on('draw.create', handleCreate)
      } else if (drawRef.current) {
        drawRef.current.deleteAll()
        drawRef.current.changeMode('simple_select')
      }
    }

    if (map.isStyleLoaded()) apply()
    else map.once('style.load', apply)

    return () => {
      map.off('draw.create', handleCreate)
      map.off('style.load', apply)
    }
  }, [drawingForBlok])

  if (!token) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
        <EmptyState
          icon={MapPin}
          title="Peta belum dikonfigurasi"
          description="Tambahkan VITE_MAPBOX_TOKEN di file .env.local (token publik dari akun Mapbox kamu sendiri) untuk mengaktifkan Peta Kebun."
        />
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full overflow-hidden" />
      {drawingForBlok && (
        <div className="absolute top-3 left-3 flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-xs shadow-md ring-1 ring-border">
          <Pencil className="size-3.5 text-primary" />
          <span>
            Menggambar denah <b>{drawingForBlok}</b> — klik peta untuk menandai titik, klik titik awal untuk menutup bentuk.
          </span>
          <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={onCancelDrawing}>
            Batal
          </Button>
        </div>
      )}
      {editingLocation && (
        <div className="absolute top-3 left-3 flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-xs shadow-md ring-1 ring-border">
          <Home className="size-3.5 text-primary" />
          <span>Klik titik di peta untuk menetapkan lokasi {kebunName}, atau geser pin yang sudah ada.</span>
          <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={onCancelEditLocation}>
            Selesai
          </Button>
        </div>
      )}
    </div>
  )
}
