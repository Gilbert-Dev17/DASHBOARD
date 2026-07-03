'use client'

import { CloudSun, Droplets, Wind, Sun, MapPin, RefreshCw, Moon } from 'lucide-react'
import { useCurrentWeather } from '@/hooks/useCurrentWeather'
import { Separator } from '../ui/separator'

export function WeatherCard() {
  const { weather, isLoading, error, permissionStatus, retry } = useCurrentWeather()

  return (
    <section
      aria-label="Current weather at your location"
      aria-live="polite"
      className="mt-16 p-6 lg:p-8 rounded-[2rem] border relative overflow-hidden flex flex-col md:flex-row gap-8 justify-between items-start md:items-center shadow-sm bg-secondary/50 transition-colors duration-500"
    >
      {permissionStatus === 'denied' && (
        <div className="flex items-center gap-3 text-sm">
          <MapPin size={16} aria-hidden="true" className="text-accent" />
          <span>Location access was denied, so we can't show local weather.</span>
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center gap-1 underline underline-offset-2 font-medium"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Try again
          </button>
        </div>
      )}

      {permissionStatus === 'unsupported' && (
        <p className="text-sm">Your browser doesn't support location detection.</p>
      )}

      {(isLoading || permissionStatus === 'loading') && !weather && (
        <p className="text-sm" role="status">Detecting your location…</p>
      )}

      {error && permissionStatus !== 'denied' && (
        <div className="flex items-center gap-3 text-sm">
          <span role="alert">{error}</span>
          <button type="button" onClick={retry} className="underline underline-offset-2 font-medium">
            Retry
          </button>
        </div>
      )}

      {weather && (
        <>
          <div className="flex items-center gap-6 relative z-10">
            <div className="absolute -right-195 -top-10 w-40 h-40 rounded-full mix-blend-overlay opacity-15 blur-3xl transition-colors duration-500 bg-accent" />
            <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 bg-secondary">
              <CloudSun size={32} aria-hidden="true" className="text-accent"  />
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
            <Stat
              icon={<Sun size={14} aria-hidden="true" />}
              label="Sunrise"
              value={weather.sunRise}
            />
            <Stat
              icon={<Moon size={14} aria-hidden="true" />}
              label="Sunset"
              value={weather.sunSet}
            />
          </div>
        </>
      )}
    </section>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}