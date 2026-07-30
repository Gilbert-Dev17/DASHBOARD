'use client'

import { CloudSun, Droplets, Wind, Sun, Moon, MapPin, RefreshCw, CheckCircle2, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useGeolocation } from '@/hooks/geoLocation'
import type { WeatherData, Coordinates } from '@/types/weather'
import type { TaskWithSubtasks } from '@/types/dashboard'
import { Badge } from '../ui/badge'
import { WeatherCardSkeleton } from './WeatherCardSkeleton'
import { toast } from 'sonner'
import { generateDailyBrief } from '@/utils/daily-brief'

async function fetchWeather(lat: number, lon: number, signal: AbortSignal): Promise<WeatherData> {
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, { signal })
  if (!res.ok) throw new Error('Could not load weather')
  return res.json() as Promise<WeatherData>
}

function hasCoords(c: Coordinates | 0 | null): c is Coordinates {
  return c !== 0 && c !== null
}

export function WeatherCard({ tasks = [] }: { tasks?: TaskWithSubtasks[] }) {
  const { coords: rawCoords, status: permissionStatus, errorMessage, requestLocation } = useGeolocation()

  const coords = hasCoords( rawCoords )? rawCoords : null;

  // Extract actionable facts for the chips
  const brief = generateDailyBrief(tasks);
  const freeTimeMatch = brief.message.match(/free after (.*?)\./i);
  const freeTime = freeTimeMatch ? freeTimeMatch[1] : 'Schedule open';
  const pendingTasks = tasks.filter(t => !t.is_done).length;

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
      className="mt-4 lg:mt-6 relative"
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

      {weather && (
        <div className="relative z-10 w-full max-w-5xl">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full mix-blend-overlay opacity-10 blur-[80px] transition-colors duration-500 bg-accent pointer-events-none" />

          <p className="text-2xl md:text-3xl lg:text-4xl leading-snug tracking-tight font-light text-muted-foreground/90 text-pretty">
            Currently <span className="font-medium text-accent">{weather.temperature}&deg;C</span> in {weather.location} with {' '}
            <span className="font-medium text-accent inline-flex items-center gap-2 mx-1">
              <CloudSun size={32} className="text-accent" />
              {weather.condition.toLowerCase()}
            </span>.
            Feels like <span className="font-medium text-accent">{weather.feelsLike}&deg;C</span> with <span className="text-accent font-medium">{weather.humidity}% humidity</span> and <span className="text-accent font-medium">{weather.windSpeed} km/h</span> winds.
            Sunset is at <span className="text-accent font-medium">{weather.sunSet}</span>.
          </p>

          {/* ── SCANNABLE CHIPS ── */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2">

            <Badge variant={'secondary'}>
              <CheckCircle2 size={16} className="text-accent" />
              {pendingTasks === 0 ? 'No tasks left' : `${pendingTasks} Tasks today`}
            </Badge>

            <Badge variant={'secondary'}>
              <CheckCircle2 size={16} className="text-accent" />
              {pendingTasks === 0 ? 'Free all day' : `Free after ${freeTime}`}
            </Badge>

            <Badge variant={'secondary'}>
              <CloudSun size={16} className="text-accent" />
              {weather.temperature}&deg;C {weather.location}
            </Badge>

          </div>
        </div>
      )}
    </section>
  )
}