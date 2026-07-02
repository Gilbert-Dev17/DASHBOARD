import { NextRequest, NextResponse } from 'next/server'
import { degreesToCompass, uvIndexToRisk } from '@/utils/weather-utils'
import type { WeatherData } from '@/types/weather'

// TODO: Consider updating to Google's new One Call API 3.0, which is more accurate and includes UV index data, but requires a paid plan. For now, we use the free 2.5 API and supplement with Open-Meteo for UV index.
// export const runtime = 'edge' // optional; drop if you need Node APIs

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
    const [weatherRes, geoRes, meteoRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latNum}&lon=${lonNum}&units=metric&lang=en&appid=${apiKey}`,
        { next: { revalidate: 600 } } // cache 10 min server-side
      ),
      fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latNum}&lon=${lonNum}&limit=1&appid=${apiKey}`,
        { next: { revalidate: 3600 } }
      ),
       fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latNum}&longitude=${lonNum}&current=uv_index&timezone=auto`,
        { next: { revalidate: 600 } }
      ),
    ])


    if (!weatherRes.ok) {
      const body = await weatherRes.text()
      return NextResponse.json({ error: 'Weather provider error', detail: body }, { status: weatherRes.status })
    }

    const raw = await weatherRes.json()
    const geo = geoRes.ok ? await geoRes.json() : []
    const meteo = meteoRes.ok ? await meteoRes.json() : null

    const uvIndex = Math.round(meteo?.current?.uv_index ?? 0)

    const data: WeatherData = {
      temperature: Math.round(raw.main.temp),
      feelsLike: Math.round(raw.main.feels_like),
      condition: raw.weather?.[0]?.description ?? 'Unknown',
      location: geo?.[0]?.name ?? raw.name ?? 'Your location',
      humidity: raw.main.humidity,
      windSpeed: Math.round(raw.wind.speed * 3.6), // m/s -> km/h
      windDirection: degreesToCompass(raw.wind?.deg ?? 0),
      uvIndex,       // Not available in 2.5 free tier
      uvRisk: uvIndexToRisk(uvIndex), // Not available in 2.5 free tier
    }

    console.log('[weather-route] data', data)

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'private, max-age=600' },
    })
  } catch (err) {
    console.error('[weather-route]', err)
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 502 })
  }
}