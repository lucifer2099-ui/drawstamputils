import { describe, it, expect, beforeEach } from 'vitest'
import { useStampStore } from './stampStore'
import type { IDrawStampConfig } from '../DrawStampTypes'

describe('useStampStore', () => {
  beforeEach(() => {
    // Reset the state before each test
    const { setConfig } = useStampStore()
    setConfig(null)
  })

  it('should have initial state with null config', () => {
    const { state } = useStampStore()
    expect(state.config).toBeNull()
  })

  it('setConfig should update the config correctly', () => {
    const { state, setConfig } = useStampStore()
    const mockConfig = { companyName: 'Test Company' } as unknown as IDrawStampConfig

    setConfig(mockConfig)

    expect(state.config).toEqual(mockConfig)

    // Clear config
    setConfig(null)
    expect(state.config).toBeNull()
  })

  it('updateConfig should apply updates when config exists', () => {
    const { state, setConfig, updateConfig } = useStampStore()
    const initialConfig = { companyName: 'Initial Company', openSecurityPattern: false } as unknown as IDrawStampConfig

    setConfig(initialConfig)

    updateConfig((config) => {
      config.companyName = 'Updated Company'
      config.openSecurityPattern = true
    })

    expect(state.config?.companyName).toBe('Updated Company')
    expect(state.config?.openSecurityPattern).toBe(true)
  })

  it('updateConfig should safely do nothing when config is null', () => {
    const { state, updateConfig } = useStampStore()

    // Config should be null from beforeEach
    expect(state.config).toBeNull()

    let updaterCalled = false
    updateConfig((config) => {
      updaterCalled = true
      config.companyName = 'Should not happen'
    })

    expect(updaterCalled).toBe(false)
    expect(state.config).toBeNull()
  })
})
