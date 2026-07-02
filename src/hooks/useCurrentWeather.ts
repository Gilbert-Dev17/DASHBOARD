'use client'

import { useEffect, useState } from 'react'
import { useGeolocation } from './geoLocation'
import type { WeatherData } from '@/types/weather'

interface UseCurrentWeatherResult {
  weather: WeatherData | null
  isLoading: boolean
  error: string | null
  permissionStatus: ReturnType<typeof useGeolocation>['status']
  retry: () => void
}

export function useCurrentWeather(): UseCurrentWeatherResult {
  const { coords, status: permissionStatus, errorMessage, requestLocation } = useGeolocation()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!coords) return
    const controller = new AbortController()

    async function fetchWeather() {
        if (!coords) return
        setIsLoading(true)
        setError(null)
      try {
        const url = `/api/weather?lat=${coords.lat || 0}&lon=${coords.lon || 0}`
        console.log('Fetching weather from:', url)
        const res = await fetch(url, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('Could not load weather')
        setWeather(await res.json())
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeather()
    return () => controller.abort()
  }, [coords])

  return {
    weather,
    isLoading,
    error: error ?? (permissionStatus === 'error' ? errorMessage : null),
    permissionStatus,
    retry: requestLocation,
  }
}