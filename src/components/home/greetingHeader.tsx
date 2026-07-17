'use client'

import { useMemo, useState, useEffect, Fragment } from 'react'
import { format } from 'date-fns'
import { CheckCircle2, Clock, ListTodo, CloudSun, MapPin, RefreshCw } from 'lucide-react'
import { TaskWithSubtasks } from '@/types/dashboard'
import { generateDailyBrief } from '@/utils/daily-brief'
import { Badge } from '@/components/ui/badge'

import { useQuery } from '@tanstack/react-query'
import { useGeolocation } from '@/hooks/geoLocation'
import type { WeatherData, Coordinates } from '@/types/weather'
import { toast } from 'sonner'

interface userGreeting {
    firstName?: string;
    tasks?: TaskWithSubtasks[];
}

async function fetchWeather(lat: number, lon: number, signal: AbortSignal): Promise<WeatherData> {
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, { signal })
  if (!res.ok) throw new Error('Could not load weather')
  return res.json() as Promise<WeatherData>
}

function hasCoords(c: Coordinates | 0 | null): c is Coordinates {
  return c !== 0 && c !== null
}

const parseBoldText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <span key={i} className="font-semibold text-accent">{part.slice(2, -2)}</span>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
};

const getGreeting = (time: Date) => {
  const hour = time.getHours()

  const deepNight    = [ 'Night Owl',          'Still awake?',          'Burning the midnight oil', 'The world sleeps, but not you', ]
  const preDawn      = [ 'Up before the sun?',  'Early riser',          'The early bird',           'Couldn\'t sleep?', ]
  const earlyMorning = [ 'Rise and Shine',      'Top of the Morning',   'Good Early Morning',       'Coffee time?', ]
  const morning      = [ 'Good Morning',        'Morning',              'Ready for today?',         'Let\'s go!', ]
  const midday       = [ 'Good Midday',         'Halfway through!',     'Hope your day is going well', 'Keep it up!', ]
  const afternoon    = [ 'Good Afternoon',       'Afternoon',            'Afternoon grind',          'Stretch break?', ]
  const lateAfternoon= [ 'Evening approaching', 'Home stretch',         'Almost there',             'Winding down?', ]
  const evening      = [ 'Good Evening',        'Welcome Back',         'Hope you had a productive day', 'Wind down time', ]
  const lateEvening  = [ 'Good Night',          'Working late?',        'Wrapping up?',             'Time to rest soon', ]

  const pick = (messages: string[]) => messages[time.getDate() % messages.length]

  if (hour >= 0  && hour < 3)  return pick(deepNight)
  if (hour >= 3  && hour < 5)  return pick(preDawn)
  if (hour >= 5  && hour < 8)  return pick(earlyMorning)
  if (hour >= 8  && hour < 12) return pick(morning)
  if (hour >= 12 && hour < 14) return pick(midday)
  if (hour >= 14 && hour < 17) return pick(afternoon)
  if (hour >= 17 && hour < 19) return pick(lateAfternoon)
  if (hour >= 19 && hour < 21) return pick(evening)
  return pick(lateEvening)
}

export const GreetingHeader = ({firstName, tasks = []}: userGreeting) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // ── Weather Data Fetching ──
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

  useEffect(() => {
      // Update the time every minute so the greeting naturally shifts (e.g. Morning -> Afternoon)
      const intervalId = setInterval(() => {
          setCurrentTime(new Date());
      }, 60000);
      return () => clearInterval(intervalId);
  }, []);

  const dayOfWeek = useMemo(() => {
      return format(currentTime, 'E');
  }, [currentTime]);

  const greeting = useMemo(() => getGreeting(currentTime), [currentTime])
  const brief = useMemo(() => generateDailyBrief(tasks, weather), [tasks, weather]);

  // ── Chip data ──
  const pendingTasks = tasks.filter(t => !t.is_done).length;
  const completedTasks = tasks.filter(t => t.is_done).length;

  const freeTimeMatch = brief.message.match(/free after (.*?)\./i);
  const freeTime = freeTimeMatch ? freeTimeMatch[1] : null;

  return (
    <>
        <div className="flex justify-between items-center mb-8 lg:mb-12">
          <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter leading-none flex items-end">
            {dayOfWeek}
            <span className="w-3 h-3 md:w-4 md:h-4 lg:w-6 lg:h-6 rounded-full ml-3 md:ml-5 mb-2 md:mb-4 lg:mb-6 transition-colors duration-500 bg-accent" aria-hidden="true" />
          </h1>
        </div>

        {/* ── Content Area (Text or Skeleton) ── */}

            <p className="text-2xl md:text-3xl lg:text-4xl leading-snug font-light max-w-5xl tracking-tight text-pretty whitespace-pre-wrap transition-all duration-300">
              {greeting}, <span className="font-bold">{firstName}</span>. {parseBoldText(brief.message)}
            </p>

            {/* ── Scannable Chips ── */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-6">

              {pendingTasks > 0 ? (
                <Badge variant="secondary" >
                  <ListTodo size={16} className="text-accent" />
                  {pendingTasks} {pendingTasks === 1 ? 'task' : 'tasks'} remaining
                </Badge>
              ) : tasks.length > 0 ? (
                <Badge variant="secondary" >
                  <CheckCircle2 size={16} className="text-accent" />
                  All done for today!
                </Badge>
              ) : null}

              {completedTasks > 0 && pendingTasks > 0 && (
                <Badge variant="secondary" >
                  <CheckCircle2 size={16} className="text-accent" />
                  {completedTasks} completed
                </Badge>
              )}

              {freeTime && (
                <Badge variant="secondary" >
                  <Clock size={16} className="text-accent" />
                  Free after {freeTime}
                </Badge>
              )}

              {weather && (
                <>
                 <Badge variant="secondary" >
                  <CloudSun size={16} className="text-accent" />
                  {weather.temperature}&deg;C in {weather.location}
                </Badge>
                </>
              )}

              {permissionStatus === 'unsupported' && (
                <p className="text-sm">Your browser doesn&apos;t support location detection.</p>
              )}

              {/* Weather status feedback chips */}
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
            </div>

    </>
  )
}
