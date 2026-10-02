import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withAuth } from '@/lib/auth/with-auth'

// Mock the getUser module
vi.mock('@/lib/auth/get-user', () => ({
  getUser: vi.fn()
}))

import { getUser } from '@/lib/auth/get-user'

describe('withAuth Higher Order Function', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return authentication error if user is not logged in', async () => {
    // Setup mock to simulate unauthenticated user
    vi.mocked(getUser).mockResolvedValueOnce(null)

    // Dummy action
    const mockAction = vi.fn()
    const wrappedAction = withAuth(mockAction)

    const result = await wrappedAction()

    expect(result).toEqual({
      success: false,
      message: 'Not authenticated',
      error: 'Not authenticated'
    })
    expect(mockAction).not.toHaveBeenCalled()
  })

  it('should call the action with the user if authenticated', async () => {
    // Setup mock to simulate authenticated user
    const mockUser = { id: 'user123', email: 'test@example.com' }
    vi.mocked(getUser).mockResolvedValueOnce(mockUser as any)

    // Dummy action that just returns success
    const mockAction = vi.fn().mockResolvedValue({ success: true, data: 'hello' })
    const wrappedAction = withAuth(mockAction)

    const result = await wrappedAction('arg1', 123)

    expect(result).toEqual({ success: true, data: 'hello' })
    expect(mockAction).toHaveBeenCalledTimes(1)
    expect(mockAction).toHaveBeenCalledWith(mockUser, 'arg1', 123)
  })

  it('should gracefully handle and return errors thrown inside the action', async () => {
    // Setup mock to simulate authenticated user
    const mockUser = { id: 'user123' }
    vi.mocked(getUser).mockResolvedValueOnce(mockUser as any)

    // Dummy action that throws an error
    const mockAction = vi.fn().mockRejectedValue(new Error('Database error'))
    const wrappedAction = withAuth(mockAction)

    const result = await wrappedAction()

    expect(result).toEqual({
      success: false,
      message: 'Database error',
      error: 'Database error'
    })
    expect(mockAction).toHaveBeenCalledTimes(1)
  })
})
