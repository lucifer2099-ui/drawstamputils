import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUserStore } from './userStore'
import type { User } from './userStore'

describe('useUserStore', () => {
  beforeEach(() => {
    // Reset the state and localStorage before each test
    const { clearAuth, setLoading } = useUserStore()
    localStorage.clear()
    clearAuth()
    setLoading(false)
    vi.restoreAllMocks()
  })

  it('should have initial state with null user and token', () => {
    const { state, user, token, loading, isAuthenticated } = useUserStore()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.loading).toBe(false)
    expect(user.value).toBeNull()
    expect(token.value).toBeNull()
    expect(loading.value).toBe(false)
    expect(isAuthenticated.value).toBe(false)
  })

  it('setAuth should update the state and localStorage', () => {
    const { state, user, token, isAuthenticated, setAuth } = useUserStore()
    const mockUser: User = { id: '1', email: 'test@example.com' }
    const mockToken = 'mock-jwt-token'

    setAuth(mockToken, mockUser)

    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe(mockToken)
    expect(user.value).toEqual(mockUser)
    expect(token.value).toBe(mockToken)
    expect(isAuthenticated.value).toBe(true)

    expect(localStorage.getItem('auth_token')).toBe(mockToken)
    expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(mockUser))
  })

  it('clearAuth should reset the state and clear localStorage', () => {
    const { state, isAuthenticated, setAuth, clearAuth } = useUserStore()
    const mockUser: User = { id: '1', email: 'test@example.com' }
    const mockToken = 'mock-jwt-token'

    setAuth(mockToken, mockUser)
    expect(isAuthenticated.value).toBe(true)

    clearAuth()

    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(isAuthenticated.value).toBe(false)

    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(localStorage.getItem('auth_user')).toBeNull()
  })

  it('setLoading should update the loading state', () => {
    const { state, loading, setLoading } = useUserStore()

    setLoading(true)
    expect(state.loading).toBe(true)
    expect(loading.value).toBe(true)

    setLoading(false)
    expect(state.loading).toBe(false)
    expect(loading.value).toBe(false)
  })

  it('initAuth should restore auth from localStorage', () => {
    const { state, isAuthenticated, initAuth } = useUserStore()
    const mockUser: User = { id: '1', email: 'test@example.com' }
    const mockToken = 'mock-jwt-token'

    localStorage.setItem('auth_token', mockToken)
    localStorage.setItem('auth_user', JSON.stringify(mockUser))

    initAuth()

    expect(state.token).toBe(mockToken)
    expect(state.user).toEqual(mockUser)
    expect(isAuthenticated.value).toBe(true)
  })

  it('initAuth should gracefully handle invalid JSON in localStorage', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { state, isAuthenticated, initAuth } = useUserStore()
    const mockToken = 'mock-jwt-token'

    localStorage.setItem('auth_token', mockToken)
    localStorage.setItem('auth_user', 'invalid-json')

    initAuth()

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to parse saved user', expect.any(Error))

    // state should be reset by clearAuth
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(isAuthenticated.value).toBe(false)

    // localStorage should be cleared by clearAuth
    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(localStorage.getItem('auth_user')).toBeNull()
  })

  it('initAuth should ignore partial localStorage data (only token)', () => {
    const { state, isAuthenticated, initAuth } = useUserStore()
    const mockToken = 'mock-jwt-token'

    localStorage.setItem('auth_token', mockToken)

    initAuth()

    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(isAuthenticated.value).toBe(false)
  })

  it('initAuth should ignore partial localStorage data (only user)', () => {
    const { state, isAuthenticated, initAuth } = useUserStore()
    const mockUser: User = { id: '1', email: 'test@example.com' }

    localStorage.setItem('auth_user', JSON.stringify(mockUser))

    initAuth()

    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(isAuthenticated.value).toBe(false)
  })
})
