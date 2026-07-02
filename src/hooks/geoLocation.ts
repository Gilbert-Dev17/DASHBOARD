'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { distanceKm } from '@/utils/weather-utils'
import type { Coordinates } from '@/types/weather'

export type GeoStatus = 'idle' | 'loading' | 'success' | 'denied' | 'unsupported' | 'error'

interface UseGeolocationOptions {
  /** Keep watching for movement instead of a single read. Default: false */
  watch?: boolean
  /** Minimum movement (km) before we treat position as "changed". Default: 1 */
  minDistanceKm?: number
}

interface UseGeolocationResult {
  coords: Coordinates | null | 0
  status: GeoStatus
  errorMessage: string | null
  requestLocation: () => void
}

export function useGeolocation({
  watch = false,
  minDistanceKm = 1,
}: UseGeolocationOptions = {}): UseGeolocationResult {
  const [coords, setCoords] = useState<Coordinates | null>(null)
  const [status, setStatus] = useState<GeoStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const lastCoords = useRef<Coordinates | null>(null)
  const watchId = useRef<number | null>(null)

  const handleSuccess = useCallback(
    (pos: GeolocationPosition) => {
      const next: Coordinates = { lat: pos.coords.latitude, lon: pos.coords.longitude }
      // Ignore GPS jitter — only update state on meaningful movement
      if (!lastCoords.current || distanceKm(lastCoords.current, next) >= minDistanceKm) {
        lastCoords.current = next
        setCoords(next)
      }
      setStatus('success')
    },
    [minDistanceKm]
  )

  const handleError = useCallback((err: GeolocationPositionError) => {
    setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error')
    setErrorMessage(err.message)
  }, [])

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported')
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 5 * 60 * 1000, // reuse a cached fix up to 5 min old
    })
  }, [handleSuccess, handleError])

  useEffect(() => {
    requestLocation()

    if (watch && typeof navigator !== 'undefined' && navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: false,
        maximumAge: 5 * 60 * 1000,
      })
    }
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch])

  return { coords, status, errorMessage, requestLocation }
}