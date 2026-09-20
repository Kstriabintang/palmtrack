import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { MapPin, Pencil } from 'lucide-react'
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
  drawingForBlok: string | null
  onPolygonSaved: (blok: string, polygon: LngLat[]) => void
  onCancelDrawing: () => void
  onPeronMoved: (peron: string, location: LngLat) => void
}

const BLOK_SOURCE_ID = 'palmtrack-bloks'

export function KebunMap({ bloks, peron, center, drawingForBlok, onPolygonSaved, onCancelDrawing, onPeronMoved }: KebunMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const drawRef = useRef<MapboxDraw | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const callbacksRef = useRef({ onPolygonSaved, onCancelDrawing, onPeronMoved })
  callbacksRef.current = { onPolygonSaved, onCancelDrawing, onPeronMoved }

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
      zoom: 15,
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
    })
    map.addControl(draw)
    drawRef.current = draw

    map.on('load', () => {
      map.addSource(BLOK_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addLayer({
        id: 'bloks-fill',
        type: 'fill',
        source: BLOK_SOURCE_ID,
        paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.35 },
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
    else map.once('load', apply)
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

  // Enter/exit draw mode for the block currently being outlined.
  useEffect(() => {
    const draw = drawRef.current
    const map = mapRef.current
    if (!draw || !map) return

    function handleCreate(event: { features: Array<{ geometry: { coordinates: LngLat[][] } }> }) {
      const coords = event.features[0]?.geometry.coordinates[0]
      draw?.deleteAll()
      if (coords && drawingForBlok) callbacksRef.current.onPolygonSaved(drawingForBlok, coords)
    }

    if (drawingForBlok) {
      draw.deleteAll()
      draw.changeMode('draw_polygon')
      map.on('draw.create', handleCreate)
    } else {
      draw.deleteAll()
      draw.changeMode('simple_select')
    }

    return () => {
      map.off('draw.create', handleCreate)
    }
  }, [drawingForBlok])

  if (!token) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
        <EmptyState
          icon={MapPin}
          title="Peta belum dikonfigurasi"
          description="Tambahkan VITE_MAPBOX_TOKEN di file .env.local (token publik dari akun Mapbox kamu sendiri) untuk mengaktifkan Peta Kebun."
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={containerRef} className="h-[520px] w-full overflow-hidden rounded-xl border border-border" />
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
    </div>
  )
}
