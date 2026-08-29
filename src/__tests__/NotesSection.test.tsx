// @vitest-environment jsdom
// NotesSection.test.tsx
import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { NotesSection } from '../components/Shared/NotesSection'

afterEach(() => {
  cleanup()
})
import * as actions from '@/lib/actions/daily-notes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mocking dependencies
vi.mock('@/lib/actions/daily-notes')
vi.mock('@/app/(main)/schedule/action', () => ({
  getDailyNotes: vi.fn().mockResolvedValue(null)
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() })
}))
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))
vi.mock('@/components/ui/drawer', () => ({
  Drawer: ({ children }: any) => <div>{children}</div>,
  DrawerTrigger: ({ render }: any) => <div>{render}</div>,
  DrawerContent: ({ children }: any) => <div>{children}</div>,
  DrawerClose: ({ render }: any) => <div>{render}</div>,
}))

const mockedUpsert = vi.mocked(actions.upsertDailyNote)

describe('NotesSection autosave', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockedUpsert.mockResolvedValue({ success: true, message: 'ok' } as any)
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  })

  it('debounces: does not save until 1500ms after the last keystroke', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NotesSection note={null} dateStr="2026-08-20" userId="test-user" />
      </QueryClientProvider>
    )

    fireEvent.click(screen.getAllByText('Edit →')[0])
    const textarea = screen.getByRole('textbox', { name: /daily journal entry/i })

    fireEvent.change(textarea, { target: { value: 'a12341234' } })
    await vi.advanceTimersByTimeAsync(1000)

    fireEvent.change(textarea, { target: { value: 'abasdfasdfadf' } })
    await vi.advanceTimersByTimeAsync(1000) // total 2000ms since 'a', but only 1000ms since 'b'

    expect(mockedUpsert).not.toHaveBeenCalled()

    await vi.runAllTimersAsync() // fast-forward past the 1500ms debounce
    expect(mockedUpsert).toHaveBeenCalledWith('2026-08-20', 'abasdfasdfadf')
  })

  it('reschedules instead of dropping when a save is already pending', async () => {
    let resolveFirst: (v: any) => void
    mockedUpsert.mockImplementationOnce(() => new Promise(res => { resolveFirst = res }))

    render(
      <QueryClientProvider client={queryClient}>
        <NotesSection note={null} dateStr="2026-08-20" userId="test-user" />
      </QueryClientProvider>
    )

    fireEvent.click(screen.getAllByText('Edit →')[0])
    const textarea = screen.getByRole('textbox', { name: /daily journal entry/i })

    fireEvent.change(textarea, { target: { value: 'first' } })
    await vi.advanceTimersByTimeAsync(1500) // flush the 1500ms debounce
    expect(mockedUpsert).toHaveBeenCalledTimes(1)

    fireEvent.change(textarea, { target: { value: 'first second' } })
    await vi.advanceTimersByTimeAsync(1500) // fires while still pending → should reschedule, not save
    expect(mockedUpsert).toHaveBeenCalledTimes(1)

    resolveFirst!({ success: true, message: 'ok' })
    await vi.runAllTimersAsync() // reschedule check fires again, now free to save

    expect(mockedUpsert).toHaveBeenCalledWith('2026-08-20', 'first second')
  })
})
