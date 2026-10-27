import { describe, it, expect } from 'vitest'
import { getSvgAssets } from './svgAssets'

describe('svgAssets', () => {
  it('should return an array of svg assets with expected properties', () => {
    const assets = getSvgAssets()

    expect(assets).toBeInstanceOf(Array)
    expect(assets.length).toBeGreaterThan(0)

    const asset = assets[0]
    expect(asset).toHaveProperty('key')
    expect(asset).toHaveProperty('name')
    expect(asset).toHaveProperty('content')

    expect(typeof asset.key).toBe('string')
    expect(typeof asset.name).toBe('string')
    expect(typeof asset.content).toBe('string')

    expect(asset.key).toMatch(/\.svg$/)
  })
})
