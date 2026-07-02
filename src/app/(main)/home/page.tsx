'use client'

import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import {
  CloudSun, Calendar, CheckSquare, Activity,
  Droplets, Wind, Sun
} from 'lucide-react'

import PageComponent from '@/components/shared/PageComponent'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'

// ============================================================================
// 1. DATA MODELS (Backend Contracts)
// ============================================================================

export interface Subtask {
  id: number;
  text: string;
  done: boolean;
}

export interface Task {
  id: number;
  text: string;
  done: boolean;
  category: string;
  time?: string;
  subtasks?: Subtask[];
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number; // in mph
  windDirection: string;
  uvIndex: number;
  uvRisk: string;
}

export interface UserSummary {
  firstName: string;
  meetingsCount: number;
  tasksCount: number;
  habitsCount: number;
  balance: number;
}

// ============================================================================
// 2. COMPONENT PROPS
// ============================================================================

interface DashboardPageProps {
  initialTasks?: Task[];
  weather?: WeatherData;
  user?: UserSummary;
}

// ============================================================================
// 3. MAIN COMPONENT
// ============================================================================

export default function DashboardPage({
  initialTasks = [],
  weather = {
    temperature: 33,
    feelsLike: 41,
    condition: 'Partly sunny',
    location: 'Capas, Central Luzon',
    humidity: 64,
    windSpeed: 5,
    windDirection: 'SE',
    uvIndex: 9,
    uvRisk: 'High'
  },
  user = {
    firstName: 'Gilbert',
    meetingsCount: 3,
    tasksCount: 6,
    habitsCount: 1,
    balance: 150250.75
  }
}: DashboardPageProps) {

  // State for selected date (defaults to today)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Initialize state with backend data
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Calculate the day of week from the selected date
  const dayOfWeek = useMemo(() => {
    if (!selectedDate) return 'Today';
    return format(selectedDate, 'E'); // Returns 'Mon', 'Tue', etc.
  }, [selectedDate]);

  // Filter tasks for the selected date (you'll need to add a date field to tasks)
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return tasks;
    // TODO: Filter tasks based on selectedDate once tasks have date properties
    return tasks;
  }, [tasks, selectedDate]);

  // Backend-ready mutation handler
  const handleToggleTask = async (taskId: number) => {
    // Optimistic UI update
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, done: !task.done } : task
      )
    );

    // TODO: Await your backend API call or Server Action here
    // try {
    //   await updateTaskStatus(taskId);
    // } catch (error) {
    //   // Revert optimistic update on failure
    //   console.error("Failed to update task", error);
    // }
  };

  // Format currency securely using Intl
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(user.balance);

  // Split the balance for the stylized UI requirement ($ 150,250 .75)
  const [dollars, cents] = formattedBalance.split('.');

  return (
    <PageComponent>
      {/* HEADER SECTION */}
      <header className="mb-16 lg:mb-20">
        <div className="flex justify-between items-start mb-8 lg:mb-12">
          <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter leading-none flex items-end">
            {dayOfWeek}
            <span className="w-3 h-3 md:w-4 md:h-4 lg:w-6 lg:h-6 rounded-full ml-3 md:ml-5 mb-2 md:mb-4 lg:mb-6 transition-colors duration-500 bg-accent" aria-hidden="true" />
          </h1>
        </div>

        <p className="text-2xl md:text-3xl lg:text-4xl leading-snug font-light max-w-4xl tracking-tight">
          Good Morning, <span className="font-medium">{user.firstName}</span>.
          You have <span className="inline-flex items-center gap-1 mx-1"><Calendar size={24} aria-hidden="true" /> {user.meetingsCount} meetings</span>,
          <span className="inline-flex items-center gap-1 mx-1"><CheckSquare size={24} aria-hidden="true" /> {user.tasksCount} tasks</span> and
          <span className="inline-flex items-center gap-1 mx-1"><Activity size={24} aria-hidden="true" /> {user.habitsCount} habit</span> today.
        </p>

        {/* WEATHER SECTION */}
        <section
          aria-label="Current Weather"
          className="mt-16 p-6 lg:p-8 rounded-[2rem] border relative overflow-hidden flex flex-col md:flex-row gap-8 justify-between items-start md:items-center shadow-sm"
        >
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500">
              <CloudSun size={32} aria-hidden="true" />
            </div>
            <div>
              {/* Changed from h4 to a span/div as it's data, not a structural heading */}
              <div className="text-5xl font-light tracking-tighter mb-1">{weather.temperature}&deg;C</div>
              <p className="text-sm font-medium">
                {weather.location} <span className="mx-2" aria-hidden="true">•</span> {weather.condition} <span className="mx-2" aria-hidden="true">•</span> Feels Like {weather.feelsLike}&deg;C
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 relative z-10">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-1">
                <Droplets size={14} aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-wider font-semibold">Humidity</span>
              </div>
              <span className="font-medium tabular-nums">{weather.humidity}%</span>
            </div>
            <div className="hidden md:block w-px h-10 bg-border" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-1">
                <Wind size={14} aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-wider font-semibold">Wind</span>
              </div>
              <span className="font-medium tabular-nums">{weather.windSpeed} mph {weather.windDirection}</span>
            </div>
            <div className="hidden md:block w-px h-10 bg-border" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-1">
                <Sun size={14} aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-wider font-semibold">UV Index</span>
              </div>
              <span className="font-medium tabular-nums">{weather.uvIndex} ({weather.uvRisk})</span>
            </div>
          </div>
        </section>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

        {/* AGENDA SECTION */}
        <section className="lg:col-span-7" aria-labelledby="agenda-heading">
          <div className="flex justify-between items-end mb-6 lg:mb-8">
            <h2 id="agenda-heading" className="text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-500">
              Today's Agenda
            </h2>
          </div>

          <div className="flex flex-col" role="list">
            {tasksForSelectedDate.length === 0 ? (
              <p className="text-muted-foreground py-4">No tasks for today.</p>
            ) : (
              tasksForSelectedDate.map((task) => (
                <article
                  key={task.id}
                  role="listitem"
                  className={`flex items-center justify-between py-5 lg:py-6 border-b border-dashed cursor-pointer group transition-all duration-300 ${task.done ? 'opacity-40' : 'hover:opacity-80'}`}
                >
                  <div className="flex items-center gap-4 lg:gap-6">
                    <Checkbox
                      className="rounded-full border-2"
                      checked={task.done}
                      onCheckedChange={() => handleToggleTask(task.id)}
                      aria-label={`Mark "${task.text}" as ${task.done ? 'incomplete' : 'complete'}`}
                    />
                    <div className="flex flex-col gap-1">
                      <span className={`text-base lg:text-lg tracking-wide ${task.done ? 'line-through' : ''}`}>
                        {task.text}
                      </span>
                      <span className="text-[10px] lg:text-xs font-medium tracking-wider uppercase transition-colors duration-500">
                        {task.category}
                      </span>
                    </div>
                  </div>
                  {task.time && (
                    <time dateTime={task.time} className="text-sm font-medium tabular-nums">
                      {task.time}
                    </time>
                  )}
                </article>
              ))
            )}
          </div>
        </section>

        {/* SIDEBAR WIDGETS */}
        <aside className="lg:col-span-5 space-y-16 mt-8 lg:mt-0">

          {/* FINANCES SECTION */}
          <section aria-labelledby="finances-heading">
            <h2 id="finances-heading" className="text-xs font-semibold uppercase tracking-[0.2em] mb-6 lg:mb-8 transition-colors duration-500">
              Finances
            </h2>
            <div className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter tabular-nums mb-8">
              {dollars}<span className="text-3xl lg:text-4xl">.{cents}</span>
            </div>
          </section>

          {/* PROGRESS SECTION */}
          <section aria-labelledby="progress-heading">
            <h2 id="progress-heading" className="text-xs font-semibold uppercase tracking-[0.2em] mb-6 lg:mb-8 transition-colors duration-500">
              Life Progress
            </h2>
            <div className="space-y-6 lg:space-y-8">
              <div>
                  <span>Year</span>
                  <Progress value={45} aria-label="Year Progress" />
              </div>
              <div>
                  <span>Month</span>
                  <Progress value={85} aria-label="Month Progress" />
              </div>
              <div>
                  <span>Day</span>
                  <Progress value={55} aria-label="Day Progress" />
              </div>
            </div>
          </section>

        </aside>
      </div>
    </PageComponent>
  )
}