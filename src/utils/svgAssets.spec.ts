import { describe, it, expect } from 'vitest'
import { getSvgAssets, parseSvgAsset } from './svgAssets'

describe('svgAssets', () => {
  describe('parseSvgAsset', () => {
    it('should parse a normal svg path', () => {
      const asset = parseSvgAsset('../assets/svgs/circle1.svg', '<svg></svg>')
      expect(asset).toEqual({
        key: '../assets/svgs/circle1.svg',
        name: 'circle1',
        content: '<svg></svg>'
      })
    })

    it('should handle paths without directories', () => {
      const asset = parseSvgAsset('no-slash.svg', '<svg></svg>')
      expect(asset).toEqual({
        key: 'no-slash.svg',
        name: 'no-slash',
        content: '<svg></svg>'
      })
    })

    it('should handle empty paths', () => {
      const asset = parseSvgAsset('', '<svg></svg>')
      expect(asset).toEqual({
        key: '',
        name: 'unknown',
        content: '<svg></svg>'
      })
    })
  })

  describe('getSvgAssets', () => {
    it('should return parsed SVG assets from the repository', () => {
      const assets = getSvgAssets()

      expect(Array.isArray(assets)).toBe(true)
      expect(assets.length).toBeGreaterThan(0)

      const firstAsset = assets[0]
      expect(firstAsset).toHaveProperty('key')
      expect(firstAsset).toHaveProperty('name')
      expect(firstAsset).toHaveProperty('content')

      expect(typeof firstAsset.key).toBe('string')
      expect(typeof firstAsset.name).toBe('string')
      expect(typeof firstAsset.content).toBe('string')
    })
  })
})
