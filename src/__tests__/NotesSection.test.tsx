// @vitest-environment jsdom
// NotesSection.test.tsx
import React from 'react'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { NotesSection } from '../components/Shared/NotesSection'

afterEach(() => {
  cleanup()
})

import * as actions from '@/lib/actions/daily-notes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AUTOSAVE_DELAY } from '@/lib/constants/options'

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
  Drawer: ({ children, onOpenChange }: any) => <div>{children}</div>,
  DrawerTrigger: ({ render }: any) => <div>{render}</div>,
  DrawerContent: ({ children }: any) => <div>{children}</div>,
  DrawerClose: ({ render }: any) => <div>{render}</div>,
  DrawerHeader: ({ children }: any) => <div>{children}</div>,
  DrawerFooter: ({ children }: any) => <div>{children}</div>,
}))

const mockedUpsert = vi.mocked(actions.upsertDailyNote)

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
}

function renderNotes(props?: Partial<React.ComponentProps<typeof NotesSection>>) {
  const queryClient = makeQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <NotesSection
        note={null}
        dateStr="2026-08-20"
        userId="test-user"
        {...props}
      />
    </QueryClientProvider>
  )
}

describe('NotesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockedUpsert.mockResolvedValue({ success: true, message: 'ok' } as any)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ------------------------------------------------------------------
  // Empty state
  // ------------------------------------------------------------------
  it('shows empty state when there is no note', () => {
    renderNotes({ note: null })
    expect(screen.getByText('No entry for this date.')).toBeTruthy()
  })

  it('shows existing content in the preview when a note exists', () => {
    renderNotes({
      note: { id: '1', user_id: 'test-user', date: '2026-08-20', content: 'Hello world', created_at: '', updated_at: '' }
    })
    // The drawer mock renders both preview and editor at once — content appears in both <p> and <textarea>
    expect(screen.getAllByText('Hello world').length).toBeGreaterThanOrEqual(1)
  })

  // ------------------------------------------------------------------
  // Autosave debounce (uses AUTOSAVE_DELAY from options.ts)
  // ------------------------------------------------------------------
  it(`debounces: does not save until ${AUTOSAVE_DELAY}ms of inactivity`, async () => {
    renderNotes()

    fireEvent.click(screen.getAllByText('Edit →')[0])
    const textarea = screen.getByRole('textbox', { name: /daily journal entry/i })

    // Type something, wait less than the full delay, then type again
    fireEvent.change(textarea, { target: { value: 'first keystroke' } })
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY - 100)
    expect(mockedUpsert).not.toHaveBeenCalled()

    fireEvent.change(textarea, { target: { value: 'second keystroke' } })
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY - 100)
    expect(mockedUpsert).not.toHaveBeenCalled()

    // Now let the debounce fire
    await vi.runAllTimersAsync()
    expect(mockedUpsert).toHaveBeenCalledTimes(1)
    expect(mockedUpsert).toHaveBeenCalledWith('2026-08-20', 'second keystroke')
  })

  // ------------------------------------------------------------------
  // Rescheduling when a save is in-flight
  // ------------------------------------------------------------------
  it('reschedules instead of dropping when a save is already in-flight', async () => {
    let resolveFirst: (v: any) => void
    mockedUpsert.mockImplementationOnce(() => new Promise(res => { resolveFirst = res }))

    renderNotes()

    fireEvent.click(screen.getAllByText('Edit →')[0])
    const textarea = screen.getByRole('textbox', { name: /daily journal entry/i })

    // Trigger first autosave
    fireEvent.change(textarea, { target: { value: 'first' } })
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY)
    await Promise.resolve()
    expect(mockedUpsert).toHaveBeenCalledTimes(1)

    // Type again while first save is still pending — should reschedule, not double-save
    fireEvent.change(textarea, { target: { value: 'first second' } })
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY)
    await Promise.resolve()
    expect(mockedUpsert).toHaveBeenCalledTimes(1)

    // Resolve the first save, then the rescheduled one should fire
    resolveFirst!({ success: true, message: 'ok' })
    await vi.runAllTimersAsync()
    await Promise.resolve()

    expect(mockedUpsert).toHaveBeenCalledWith('2026-08-20', 'first second')
  })

  // ------------------------------------------------------------------
  // Manual save button
  // ------------------------------------------------------------------
  it('saves immediately and preserves content when Save button is clicked', async () => {
    renderNotes({
      note: { id: '1', user_id: 'test-user', date: '2026-08-20', content: 'Initial note', created_at: '', updated_at: '' }
    })

    fireEvent.click(screen.getAllByText('Edit →')[0])
    const textarea = screen.getByRole('textbox', { name: /daily journal entry/i }) as HTMLTextAreaElement

    expect(textarea.value).toBe('Initial note')
    fireEvent.change(textarea, { target: { value: 'Updated note' } })

    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await vi.runAllTimersAsync()

    expect(mockedUpsert).toHaveBeenCalledWith('2026-08-20', 'Updated note')
    expect(textarea.value).toBe('Updated note')
  })

  // ------------------------------------------------------------------
  // Optimistic preview updates after autosave
  // ------------------------------------------------------------------
  it('updates the preview with optimistic content after autosave completes', async () => {
    renderNotes()

    fireEvent.click(screen.getAllByText('Edit →')[0])
    const textarea = screen.getByRole('textbox', { name: /daily journal entry/i })

    fireEvent.change(textarea, { target: { value: 'My autosaved note' } })
    await vi.runAllTimersAsync()
    await Promise.resolve() // flush mutation

    // The drawer mock renders both preview and editor simultaneously.
    // We specifically confirm the preview <p> (not just the textarea) shows the autosaved content.
    const matches = screen.getAllByText('My autosaved note')
    const previewEl = matches.find(el => el.tagName.toLowerCase() === 'p')
    expect(previewEl).toBeTruthy()
  })
})


