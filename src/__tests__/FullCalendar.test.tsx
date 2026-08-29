import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FullCalendar } from '@/components/Schedule/FullCalendar'
import { parseISO } from 'date-fns'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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

describe('FullCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set system time to August 2026 to ensure consistent 'today' behavior if needed
    vi.useFakeTimers()
    vi.setSystemTime(parseISO('2026-08-15T12:00:00Z'))
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  const defaultProps = {
    initialDate: parseISO('2026-08-15'),
    monthTasks: {},
    userId: 'test-user-123',
    // Provide a simple mock startTransition that just executes the callback synchronously
    startTransition: (cb: () => void) => cb()
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    )
  }

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
    // Find the cell containing 15. The first one is the text inside MonthView
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
    // July 31st is the first "31" in the calendar grid
    const cells = screen.getAllByText('31', { selector: 'span' })
    const overflowDayCell = cells[0].closest('div.cursor-pointer')!
    fireEvent.click(overflowDayCell)
    expect(pushMock).toHaveBeenCalledWith('/schedule?date=2026-07-31&drawer=true')
  })
})
