'use client'

import { CloudSun, Droplets, Wind, Sun, Moon, MapPin, RefreshCw } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useGeolocation } from '@/hooks/geoLocation'
import type { WeatherData, Coordinates } from '@/types/weather'
import { Separator } from '../ui/separator'
import { Stat, WeatherCardSkeleton } from './weatherCardSkeleton'
import {toast} from 'sonner'

async function fetchWeather(lat: number, lon: number, signal: AbortSignal): Promise<WeatherData> {
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, { signal })
  if (!res.ok) throw new Error('Could not load weather')
  return res.json() as Promise<WeatherData>
}

function hasCoords(c: Coordinates | 0 | null): c is Coordinates {
  return c !== 0 && c !== null
}

export function WeatherCard() {
  const { coords: rawCoords, status: permissionStatus, errorMessage, requestLocation } = useGeolocation()

  const coords = hasCoords( rawCoords )? rawCoords : null;

  const { data: weather, isPending, isFetching, error, refetch, } = useQuery<WeatherData, Error>({
    queryKey: ['weather', coords?.lat, coords?.lon],
    queryFn: ({ signal }) => fetchWeather(coords!.lat, coords!.lon, signal),
    enabled: !!coords,
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
    refetchOnWindowFocus: false
  })

  const isLoadingWeather = !!coords && isPending && isFetching

  return (
    <section
      aria-label="Current weather at your location"
      aria-live="polite"
      className="mt-16 p-6 lg:p-8 rounded-[2rem] border relative overflow-hidden flex flex-col md:flex-row gap-8 justify-between md:items-center shadow-sm bg-secondary/50 transition-colors duration-500"
    >

      {permissionStatus === 'denied' && (
        <div className="flex items-center gap-3 text-sm">
          <MapPin size={16} aria-hidden="true" className="text-accent" />
          <span>Location access was denied, so we can&apos;t show local weather.</span>
          <button
              type="button"
              onClick={() => {
                toast.loading('Refreshing weather...', { id: 'weather-refresh' });
                requestLocation();
              }}
              className="inline-flex items-center gap-1 underline underline-offset-2 font-medium"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Try again
            </button>
        </div>
      )}

      {permissionStatus === 'unsupported' && (
        <p className="text-sm">Your browser doesn&apos;t support location detection.</p>
      )}

      {permissionStatus === 'error' && (
        <div className="flex items-center gap-3 text-sm">
          <span role="alert">{errorMessage ?? 'Could not detect your location.'}</span>
          <button type="button" onClick={() => {
              toast.loading('Fetching weather...', { id: 'weather-fetch' });
              refetch();
            }} className="underline underline-offset-2 font-medium">
            Retry
          </button>
        </div>
      )}

      {!coords && permissionStatus !== 'denied' && permissionStatus !== 'unsupported' && permissionStatus !== 'error' && (
        <WeatherCardSkeleton/>
      )}

      {isLoadingWeather && <WeatherCardSkeleton/>}

      {error && (
        <div className="flex items-center gap-3 text-sm">
          <span role="alert">{error.message}</span>
          <button type="button" onClick={() => refetch()} className="underline underline-offset-2 font-medium">
            Retry
          </button>
        </div>
      )}

      {/* {weather && <WeatherCardSkeleton/>} */}

      {weather && (
        <>
          <div className="flex items-center gap-6 relative z-10">
            <div className="absolute -right-195 -top-10 w-40 h-40 rounded-full mix-blend-overlay opacity-15 blur-3xl transition-colors duration-500 bg-accent" />
            <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 bg-secondary">
              <CloudSun size={32} aria-hidden="true" className="text-accent" />
            </div>
            <div>
              <div className="text-5xl font-light tracking-tighter mb-1">
                {weather.temperature}&deg;C
              </div>
              <p className="text-sm font-medium">
                {weather.location}
                <span className="mx-2" aria-hidden="true">•</span>
                {weather.condition}
                <span className="mx-2" aria-hidden="true">•</span>
                Feels Like {weather.feelsLike}&deg;C
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 relative z-10">
            <Stat icon={<Droplets size={14} aria-hidden="true" />} label="Humidity" value={`${weather.humidity}%`} />
            <Separator orientation="vertical" />
            <Stat
              icon={<Wind size={14} aria-hidden="true" />}
              label="Wind"
              value={`${weather.windSpeed} km/h ${weather.windDirection}`}
            />
            <Separator orientation="vertical" />
            <Stat icon={<Sun size={14} aria-hidden="true" />} label="Sunrise" value={weather.sunRise} />
            <Stat icon={<Moon size={14} aria-hidden="true" />} label="Sunset" value={weather.sunSet} />
          </div>
        </>
      )}
    </section>
  )
}