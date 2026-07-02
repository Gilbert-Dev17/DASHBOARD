import type { WeatherData } from '@/types/weather'

const COMPASS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
] as const

export function degreesToCompass(deg: number): string {
  return COMPASS[Math.round(deg / 22.5) % 16]
}

export function uvIndexToRisk(uvi: number): WeatherData['uvRisk'] {
  if (uvi < 3) return 'Low'
  if (uvi < 6) return 'Moderate'
  if (uvi < 8) return 'High'
  if (uvi < 11) return 'Very High'
  return 'Extreme'
}

/** Haversine distance in km — used to avoid refetching for tiny GPS jitter */
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lon - a.lon) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}