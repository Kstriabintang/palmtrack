/** [longitude, latitude], matching GeoJSON / Mapbox coordinate order. */
export type LngLat = [number, number]

const METERS_PER_DEGREE_LAT = 111_320

function metersToDegreesLat(meters: number): number {
  return meters / METERS_PER_DEGREE_LAT
}

function metersToDegreesLng(meters: number, atLat: number): number {
  return meters / (METERS_PER_DEGREE_LAT * Math.cos((atLat * Math.PI) / 180))
}

/**
 * A closed rectangular ring (first point repeated last, as GeoJSON polygons
 * require) centered on a point, sized in meters and optionally rotated.
 * Good enough to fake plausible-looking plantation block outlines for demo
 * data — real blocks are drawn by hand on the map.
 */
export function rectPolygon(center: LngLat, widthM: number, heightM: number, rotationDeg = 0): LngLat[] {
  const [lng, lat] = center
  const halfW = widthM / 2
  const halfH = heightM / 2
  const rotation = (rotationDeg * Math.PI) / 180

  const corners: Array<[number, number]> = [
    [-halfW, -halfH],
    [halfW, -halfH],
    [halfW, halfH],
    [-halfW, halfH],
  ]

  const ring: LngLat[] = corners.map(([dx, dy]) => {
    const rx = dx * Math.cos(rotation) - dy * Math.sin(rotation)
    const ry = dx * Math.sin(rotation) + dy * Math.cos(rotation)
    return [lng + metersToDegreesLng(rx, lat), lat + metersToDegreesLat(ry)]
  })

  return [...ring, ring[0]]
}

/** Offsets a point by a number of meters east (dxM) and north (dyM). */
export function offsetPoint(base: LngLat, dxM: number, dyM: number): LngLat {
  const [lng, lat] = base
  return [lng + metersToDegreesLng(dxM, lat), lat + metersToDegreesLat(dyM)]
}

export function polygonCenter(ring: LngLat[]): LngLat {
  const points = ring.slice(0, -1)
  const lng = points.reduce((sum, [pLng]) => sum + pLng, 0) / points.length
  const lat = points.reduce((sum, [, pLat]) => sum + pLat, 0) / points.length
  return [lng, lat]
}
