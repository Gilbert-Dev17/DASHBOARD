import { NextRequest, NextResponse } from 'next/server'
import { degreesToCompass} from '@/utils/weather-utils'
import type { WeatherData } from '@/types/weather'
import {format} from 'date-fns'

// TODO: Consider updating to Google's Weather api call, which is more accurate and has better coverage than OpenWeatherMap. For now, we use OpenWeatherMap because it's free and easy to use. (Google's API requires billing and is more complex to set up.)


// * make the dashboard backend ready, connect all of the components to the same interface, and add a supabase backend for user data and tasks. For now, we just return a static user summary. (must be all the same interface.)
// !! Keep DRY (Don't Repeat Yourself) in mind.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 })
  }
  const latNum = Number(lat)
  const lonNum = Number(lon)

  if (Number.isNaN(latNum) || Number.isNaN(lonNum) || Math.abs(latNum) > 90 || Math.abs(lonNum) > 180) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    const [weatherRes, geoRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latNum}&lon=${lonNum}&units=metric&lang=en&appid=${apiKey}`,
        { next: { revalidate: 600 } } // cache 10 min server-side
      ),
      fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latNum}&lon=${lonNum}&limit=1&appid=${apiKey}`,
        { next: { revalidate: 3600 } }
      )
    ])

    if (!weatherRes.ok) {
      const body = await weatherRes.text()
      return NextResponse.json({ error: 'Weather provider error', detail: body }, { status: weatherRes.status })
    }

    const raw = await weatherRes.json()
    const geo = geoRes.ok ? await geoRes.json() : []

    const data: WeatherData = {
      temperature: Math.round(raw.main.temp),
      feelsLike: Math.round(raw.main.feels_like),
      condition: raw.weather?.[0]?.description ?? 'Unknown',
      location: geo?.[0]?.name ?? raw.name ?? 'Your location',
      humidity: raw.main.humidity,
      windSpeed: Math.round(raw.wind.speed * 3.6), // m/s -> km/h
      windDirection: degreesToCompass(raw.wind?.deg ?? 0),
      sunRise: format(new Date(raw.sys.sunrise * 1000), 'p'),
      sunSet: format(new Date(raw.sys.sunset * 1000), 'p'),
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[weather-route] data', data)
    }

    try{
      return NextResponse.json(data, {
        headers: { 'Cache-Control': 'private, max-age=600' },
      })
  } catch (err) {
    console.error('[weather-route]', err)
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 502 })
  }

} catch (err) {
    console.error('[weather-route]', err)
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 502 })
  }
}