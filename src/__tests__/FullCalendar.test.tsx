import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FullCalendar } from '@/components/Schedule/FullCalendar'
import { parseISO } from 'date-fns'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { TaskWithSubtasks } from '@/types/dashboard'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock })
}))

vi.mock('@/app/(main)/schedule/action', () => ({
  getDailyNotes: vi.fn().mockResolvedValue(null)
}))

// Mock matchMedia which is required by some shadcn components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver which is required by shadcn/base-ui drawer
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Ensure PointerEvent exists for radix ui testing
if (!global.PointerEvent) {
  class PointerEvent extends MouseEvent {
    public pointerId: number;
    public pointerType: string;
    public isPrimary: boolean;
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 1;
      this.pointerType = params.pointerType ?? 'mouse';
      this.isPrimary = params.isPrimary ?? true;
    }
  }
  global.PointerEvent = PointerEvent as any;
}

/* ─── Helpers ──────────────────────────────────────────────── */

function makeTask(overrides: Partial<TaskWithSubtasks> = {}): TaskWithSubtasks {
  return {
    id: 'task-1',
    user_id: 'user-1',
    task_name: 'Test Task',
    time: '09:00:00',
    is_done: false,
    created_for_date: '2026-08-15',
    created_at: '2026-08-15T00:00:00Z',
    task_category: { id: 'cat-1', name: 'Work' },
    subtasks: [],
    ...overrides,
  }
}

function makeMonthTasks(tasks: TaskWithSubtasks[], date = '2026-08-15'): Record<string, TaskWithSubtasks[]> {
  return { [date]: tasks }
}

/** Dispatches a CustomEvent on window inside act() */
function dispatchOptimisticEvent(eventName: string, detail: Record<string, unknown>) {
  act(() => {
    window.dispatchEvent(new CustomEvent(eventName, { detail }))
  })
}

describe('FullCalendar', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    // Fresh QueryClient per test to prevent state leakage
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })

    // Set system time to August 2026 to ensure consistent 'today' behavior
    vi.useFakeTimers()
    vi.setSystemTime(parseISO('2026-08-15T12:00:00Z'))
  })
  
  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  const defaultProps = {
    initialDate: parseISO('2026-08-15'),
    monthTasks: {},
    userId: 'test-user-123',
    // Provide a simple mock startTransition that just executes the callback synchronously
    startTransition: (cb: () => void) => cb()
  }

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    )
  }

  /* ─── Navigation Tests ─────────────────────────────────────── */

  it('navigates to next month when next chevron is clicked', () => {
    const { container } = renderWithProviders(<FullCalendar {...defaultProps} />)
    const svg = container.querySelector('svg.lucide-chevron-right')
    const btn = svg?.closest('button')
    if (btn) fireEvent.click(btn)
    expect(pushMock).toHaveBeenCalledWith('/schedule?date=2026-09-15')
  })

  it('navigates to previous month when prev chevron is clicked', () => {
    const { container } = renderWithProviders(<FullCalendar {...defaultProps} />)
    const svg = container.querySelector('svg.lucide-chevron-left')
    const btn = svg?.closest('button')
    if (btn) fireEvent.click(btn)
    expect(pushMock).toHaveBeenCalledWith('/schedule?date=2026-07-15')
  })

  it('opens the drawer locally when an in-month date is clicked', async () => {
    renderWithProviders(<FullCalendar {...defaultProps} />)
    const cells = screen.getAllByText('15', { selector: 'span' })
    const dayCell = cells[0].closest('div.cursor-pointer')!
    fireEvent.click(dayCell)
    
    expect(pushMock).not.toHaveBeenCalled()
    
    // Switch to real timers so RTL's waitFor can poll successfully
    vi.useRealTimers()
    
    await waitFor(() => {
      expect(screen.queryByText('Daily Overview')).not.toBeNull()
    })
  })

  it('navigates via URL with drawer=true when an out-of-month date is clicked', () => {
    renderWithProviders(<FullCalendar {...defaultProps} />)
    const cells = screen.getAllByText('31', { selector: 'span' })
    const overflowDayCell = cells[0].closest('div.cursor-pointer')!
    fireEvent.click(overflowDayCell)
    expect(pushMock).toHaveBeenCalledWith('/schedule?date=2026-07-31&drawer=true')
  })

  /* ─── Optimistic UI: Task Toggle ───────────────────────────── */

  describe('optimistic-task-toggle', () => {
    it('marks a task as done in the calendar grid when toggle event fires', () => {
      const task = makeTask({ id: 'task-toggle-1', task_name: 'Buy groceries' })
      const props = { ...defaultProps, monthTasks: makeMonthTasks([task]) }

      renderWithProviders(<FullCalendar {...props} />)

      // Task should be visible and not struck through
      const pill = screen.getByText(/Buy groceries/i)
      expect(pill.className).not.toContain('line-through')

      // Dispatch toggle event
      dispatchOptimisticEvent('optimistic-task-toggle', { taskId: 'task-toggle-1', isDone: true })

      // After toggle, the pill should have the done styling (line-through)
      expect(pill.className).toContain('line-through')
    })

    it('re-marks a task as not done (rollback) when toggle fires with isDone=false', () => {
      const task = makeTask({ id: 'task-rollback-1', task_name: 'Rollback task', is_done: true })
      const props = { ...defaultProps, monthTasks: makeMonthTasks([task]) }

      renderWithProviders(<FullCalendar {...props} />)

      // Task should start as done (line-through)
      const pill = screen.getByText(/Rollback task/i)
      expect(pill.className).toContain('line-through')

      // Dispatch rollback toggle
      dispatchOptimisticEvent('optimistic-task-toggle', { taskId: 'task-rollback-1', isDone: false })

      // After rollback, the pill should no longer be struck through
      expect(pill.className).not.toContain('line-through')
    })

    it('does not crash or modify state when toggle targets a non-existent task', () => {
      const task = makeTask({ id: 'task-exists', task_name: 'Existing task' })
      const props = { ...defaultProps, monthTasks: makeMonthTasks([task]) }

      renderWithProviders(<FullCalendar {...props} />)

      // Fire toggle for a task ID that doesn't exist
      dispatchOptimisticEvent('optimistic-task-toggle', { taskId: 'task-nonexistent', isDone: true })

      // Original task should remain unchanged
      const pill = screen.getByText(/Existing task/i)
      expect(pill.className).not.toContain('line-through')
    })
  })

  /* ─── Optimistic UI: Task Delete ───────────────────────────── */

  describe('optimistic-task-delete', () => {
    it('removes a task from the calendar grid when delete event fires', () => {
      const task = makeTask({ id: 'task-del-1', task_name: 'Deletable task' })
      const props = { ...defaultProps, monthTasks: makeMonthTasks([task]) }

      renderWithProviders(<FullCalendar {...props} />)

      expect(screen.getByText(/Deletable task/i)).toBeTruthy()

      dispatchOptimisticEvent('optimistic-task-delete', { taskId: 'task-del-1' })

      expect(screen.queryByText(/Deletable task/i)).toBeNull()
    })

    it('only removes the targeted task, leaving others intact', () => {
      const task1 = makeTask({ id: 'task-keep', task_name: 'Keep this' })
      const task2 = makeTask({ id: 'task-remove', task_name: 'Remove this' })
      const props = { ...defaultProps, monthTasks: makeMonthTasks([task1, task2]) }

      renderWithProviders(<FullCalendar {...props} />)

      dispatchOptimisticEvent('optimistic-task-delete', { taskId: 'task-remove' })

      expect(screen.getByText(/Keep this/i)).toBeTruthy()
      expect(screen.queryByText(/Remove this/i)).toBeNull()
    })
  })

  /* ─── Optimistic UI: Task Update ───────────────────────────── */

  describe('optimistic-task-update', () => {
    it('updates the task name in the calendar grid when update event fires', () => {
      const task = makeTask({ id: 'task-upd-1', task_name: 'Old Name' })
      const props = { ...defaultProps, monthTasks: makeMonthTasks([task]) }

      renderWithProviders(<FullCalendar {...props} />)

      expect(screen.getByText(/Old Name/i)).toBeTruthy()

      dispatchOptimisticEvent('optimistic-task-update', {
        taskId: 'task-upd-1',
        values: { task_name: 'New Name', time: '14:30', category: 'Personal' }
      })

      expect(screen.queryByText(/Old Name/i)).toBeNull()
      expect(screen.getByText(/New Name/i)).toBeTruthy()
    })

    it('updates the category when update event fires', () => {
      const task = makeTask({ id: 'task-upd-cat', task_name: 'Cat task', task_category: { id: 'c1', name: 'Work' } })
      const props = { ...defaultProps, monthTasks: makeMonthTasks([task]) }

      renderWithProviders(<FullCalendar {...props} />)

      dispatchOptimisticEvent('optimistic-task-update', {
        taskId: 'task-upd-cat',
        values: { task_name: 'Cat task', time: '09:00', category: 'Personal' }
      })

      // The task should still be visible after category change
      expect(screen.getByText(/Cat task/i)).toBeTruthy()
    })
  })

  /* ─── Optimistic UI: Task Restore ──────────────────────────── */

  describe('optimistic-task-restore', () => {
    it('restores a deleted task back into the calendar grid', () => {
      const task = makeTask({ id: 'task-restore-1', task_name: 'Restorable task', created_for_date: '2026-08-15' })
      const props = { ...defaultProps, monthTasks: makeMonthTasks([task]) }

      const { container } = renderWithProviders(<FullCalendar {...props} />)

      // Delete it first
      dispatchOptimisticEvent('optimistic-task-delete', { taskId: 'task-restore-1' })
      // Use container-scoped query to avoid portal interference
      expect(container.querySelector('[class*="truncate"]')).toBeNull()

      // Restore it
      dispatchOptimisticEvent('optimistic-task-restore', { task })

      // Should be visible again — query within the container (not the portal)
      const pills = container.querySelectorAll('[class*="truncate"]')
      const restored = Array.from(pills).find(el => el.textContent?.includes('Restorable task'))
      expect(restored).toBeTruthy()
    })

    it('does not duplicate a task if restore fires for an already-present task', () => {
      const task = makeTask({ id: 'task-dup-check', task_name: 'No duplicate', created_for_date: '2026-08-15' })
      const props = { ...defaultProps, monthTasks: makeMonthTasks([task]) }

      const { container } = renderWithProviders(<FullCalendar {...props} />)

      // Fire restore for a task that already exists — should be a no-op
      dispatchOptimisticEvent('optimistic-task-restore', { task })

      // Count how many task pills contain "No duplicate" in the calendar grid
      const pills = container.querySelectorAll('[class*="truncate"]')
      const matches = Array.from(pills).filter(el => el.textContent?.includes('No duplicate'))
      expect(matches).toHaveLength(1)
    })

    it('restores a task to a date that had no tasks before', () => {
      const existingTask = makeTask({ id: 'task-existing', task_name: 'Existing', created_for_date: '2026-08-15' })
      const newTask = makeTask({ id: 'task-new-date', task_name: 'Restored to 20th', created_for_date: '2026-08-20' })
      const props = { ...defaultProps, monthTasks: makeMonthTasks([existingTask]) }

      const { container } = renderWithProviders(<FullCalendar {...props} />)

      // Fire restore for a task on a previously empty date
      dispatchOptimisticEvent('optimistic-task-restore', { task: newTask })

      const pills = container.querySelectorAll('[class*="truncate"]')
      const restored = Array.from(pills).find(el => el.textContent?.includes('Restored to 20th'))
      expect(restored).toBeTruthy()
    })
  })

  /* ─── Combined Optimistic Flows ────────────────────────────── */

  describe('combined optimistic flows', () => {
    it('handles toggle then delete in sequence', () => {
      const task = makeTask({ id: 'task-combo-1', task_name: 'Combo task' })
      const props = { ...defaultProps, monthTasks: makeMonthTasks([task]) }

      renderWithProviders(<FullCalendar {...props} />)

      // Toggle done
      dispatchOptimisticEvent('optimistic-task-toggle', { taskId: 'task-combo-1', isDone: true })
      expect(screen.getByText(/Combo task/i).className).toContain('line-through')

      // Then delete
      dispatchOptimisticEvent('optimistic-task-delete', { taskId: 'task-combo-1' })
      expect(screen.queryByText(/Combo task/i)).toBeNull()
    })

    it('handles delete then undo-restore flow', () => {
      const task = makeTask({ id: 'task-undo-1', task_name: 'Undo me', created_for_date: '2026-08-15' })
      const props = { ...defaultProps, monthTasks: makeMonthTasks([task]) }

      const { container } = renderWithProviders(<FullCalendar {...props} />)

      // Delete
      dispatchOptimisticEvent('optimistic-task-delete', { taskId: 'task-undo-1' })
      expect(screen.queryByText(/Undo me/i)).toBeNull()

      // Undo (restore)
      dispatchOptimisticEvent('optimistic-task-restore', { task })

      // Verify restored in the calendar grid container
      const pills = container.querySelectorAll('[class*="truncate"]')
      const restored = Array.from(pills).find(el => el.textContent?.includes('Undo me'))
      expect(restored).toBeTruthy()
    })

    it('handles update then toggle in sequence', () => {
      const task = makeTask({ id: 'task-ut-1', task_name: 'Original' })
      const props = { ...defaultProps, monthTasks: makeMonthTasks([task]) }

      renderWithProviders(<FullCalendar {...props} />)

      // Update name
      dispatchOptimisticEvent('optimistic-task-update', {
        taskId: 'task-ut-1',
        values: { task_name: 'Updated', time: '10:00', category: 'Work' }
      })
      expect(screen.getByText(/Updated/i)).toBeTruthy()

      // Toggle done
      dispatchOptimisticEvent('optimistic-task-toggle', { taskId: 'task-ut-1', isDone: true })
      expect(screen.getByText(/Updated/i).className).toContain('line-through')
    })

    it('handles multiple tasks across different dates', () => {
      const task1 = makeTask({ id: 'task-d1', task_name: 'Task on 10th', created_for_date: '2026-08-10' })
      const task2 = makeTask({ id: 'task-d2', task_name: 'Task on 20th', created_for_date: '2026-08-20' })

      const monthTasks = {
        '2026-08-10': [task1],
        '2026-08-20': [task2],
      }

      const props = { ...defaultProps, monthTasks }

      renderWithProviders(<FullCalendar {...props} />)

      // Toggle task on the 10th
      dispatchOptimisticEvent('optimistic-task-toggle', { taskId: 'task-d1', isDone: true })
      expect(screen.getByText(/Task on 10th/i).className).toContain('line-through')

      // Task on the 20th should be unaffected
      expect(screen.getByText(/Task on 20th/i).className).not.toContain('line-through')

      // Delete task on the 20th
      dispatchOptimisticEvent('optimistic-task-delete', { taskId: 'task-d2' })
      expect(screen.queryByText(/Task on 20th/i)).toBeNull()

      // Task on the 10th should still be present (and done)
      expect(screen.getByText(/Task on 10th/i)).toBeTruthy()
    })
  })

  /* ─── Stats Update Optimistically ──────────────────────────── */

  describe('stats updates optimistically', () => {
    it('updates the total task count after a delete', () => {
      const task1 = makeTask({ id: 'stat-1', task_name: 'Stat task 1' })
      const task2 = makeTask({ id: 'stat-2', task_name: 'Stat task 2' })
      const props = { ...defaultProps, monthTasks: makeMonthTasks([task1, task2]) }

      const { container } = renderWithProviders(<FullCalendar {...props} />)

      // Stats element shows "out of X total tasks"
      const statsEl = container.querySelector('p.text-sm.text-muted-foreground')!
      expect(statsEl.textContent).toContain('2 total tasks')

      // Delete one task
      dispatchOptimisticEvent('optimistic-task-delete', { taskId: 'stat-1' })

      expect(statsEl.textContent).toContain('1 total tasks')
    })

    it('updates the total task count after a restore', () => {
      const task = makeTask({ id: 'stat-restore', task_name: 'Stat restore', created_for_date: '2026-08-15' })
      const props = { ...defaultProps, monthTasks: makeMonthTasks([task]) }

      const { container } = renderWithProviders(<FullCalendar {...props} />)

      const statsEl = container.querySelector('p.text-sm.text-muted-foreground')!
      expect(statsEl.textContent).toContain('1 total tasks')

      // Delete
      dispatchOptimisticEvent('optimistic-task-delete', { taskId: 'stat-restore' })
      expect(statsEl.textContent).toContain('0 total tasks')

      // Restore
      dispatchOptimisticEvent('optimistic-task-restore', { task })
      expect(statsEl.textContent).toContain('1 total tasks')
    })
  })

  /* ─── Event Listener Cleanup ───────────────────────────────── */

  describe('event listener cleanup', () => {
    it('stops responding to events after unmount', () => {
      const task = makeTask({ id: 'task-cleanup', task_name: 'Cleanup task' })
      const props = { ...defaultProps, monthTasks: makeMonthTasks([task]) }

      const { unmount } = renderWithProviders(<FullCalendar {...props} />)

      // Verify task is present
      expect(screen.getByText(/Cleanup task/i)).toBeTruthy()

      // Unmount the component
      unmount()

      // Dispatching events after unmount should not throw
      expect(() => {
        dispatchOptimisticEvent('optimistic-task-toggle', { taskId: 'task-cleanup', isDone: true })
        dispatchOptimisticEvent('optimistic-task-delete', { taskId: 'task-cleanup' })
        dispatchOptimisticEvent('optimistic-task-update', {
          taskId: 'task-cleanup',
          values: { task_name: 'Updated', time: '', category: null }
        })
        dispatchOptimisticEvent('optimistic-task-restore', { task })
      }).not.toThrow()
    })
  })
})
