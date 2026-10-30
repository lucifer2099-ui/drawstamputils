import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DrawStampUtils } from './DrawStampUtils'
import { IDrawStampConfig } from './DrawStampTypes'

// Mocking canvas and its context
const createMockCanvasContext = () => {
  return {
    clearRect: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    clip: vi.fn(),
    ellipse: vi.fn(),
    drawImage: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 10 })),
    setLineDash: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    putImageData: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(100) })),
    rotate: vi.fn(),
    quadraticCurveTo: vi.fn(),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D
}

const createMockCanvas = () => {
  const context = createMockCanvasContext()
  const canvas = {
    getContext: vi.fn((type: string) => {
      if (type === '2d') return context
      return null
    }),
    width: 800,
    height: 600,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 800, height: 600 })),
    toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
  } as unknown as HTMLCanvasElement

  return { canvas, context }
}

describe('DrawStampUtils', () => {
  let mockCanvas: HTMLCanvasElement
  let mockContext: CanvasRenderingContext2D

  beforeEach(() => {
    const mock = createMockCanvas()
    mockCanvas = mock.canvas
    mockContext = mock.context
    // Mock Path2D for jsdom environment since it's not fully supported
    if (typeof global.Path2D === 'undefined') {
      global.Path2D = class Path2D {
        rect() {}
        moveTo() {}
        lineTo() {}
        closePath() {}
        arc() {}
        ellipse() {}
        addPath() {}
      } as any
    }
  })

  it('constructor throws when canvas is null', () => {
    expect(() => new DrawStampUtils(null, 10)).toThrow('Canvas is null')
  })

  it('constructor throws when canvas.getContext returns null', () => {
    const invalidCanvas = {
      getContext: vi.fn(() => null)
    } as unknown as HTMLCanvasElement
    expect(() => new DrawStampUtils(invalidCanvas, 10)).toThrow('Failed to get canvas context')
  })

  it('instantiates correctly with valid canvas', () => {
    const utils = new DrawStampUtils(mockCanvas, 10)
    expect(utils).toBeInstanceOf(DrawStampUtils)
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
    expect(mockCanvas.addEventListener).toHaveBeenCalled() // Listeners should be added
  })

  it('getDrawConfigs returns the current config', () => {
    const utils = new DrawStampUtils(mockCanvas, 10)
    const config = utils.getDrawConfigs()
    expect(config).toBeDefined()
    // It should have default configurations initialized by InitDrawStampConfigsUtils
    expect(config.width).toBeDefined()
    expect(config.height).toBeDefined()
  })

  it('setDrawConfigs updates the config', () => {
    const utils = new DrawStampUtils(mockCanvas, 10)
    const newConfig = {
      width: 50,
      height: 50,
      offsetX: 10,
      offsetY: 20,
      lineList: [],
      svgList: []
    } as unknown as IDrawStampConfig

    utils.setDrawConfigs(newConfig)
    const currentConfig = utils.getDrawConfigs()

    expect(currentConfig.width).toBe(50)
    expect(currentConfig.height).toBe(50)

    // Check if offsets are synced
    // Actually we can't directly read stampOffsetX/Y as they are private
    // but setting them shouldn't throw error and state should be maintained
  })

  it('setDraggable updates the draggable state without error', () => {
    const utils = new DrawStampUtils(mockCanvas, 10)

    expect(() => {
      utils.setDraggable(false)
      utils.setDraggable(true)
    }).not.toThrow()
  })

  it('resetZoom resets scale and offsets', () => {
    const utils = new DrawStampUtils(mockCanvas, 10)

    // resetZoom should call refreshStamp, which clears rect and translates/scales
    utils.resetZoom()

    expect(mockContext.clearRect).toHaveBeenCalled()
    expect(mockContext.translate).toHaveBeenCalled()
    expect(mockContext.scale).toHaveBeenCalled()
  })

  it('getStampImageBase64 rejects when saveCanvas.getContext returns null', async () => {
    const utils = new DrawStampUtils(mockCanvas, 10);

    // Mock document.createElement to return a canvas with null context
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => null)
        } as unknown as HTMLCanvasElement;
      }
      return originalCreateElement(tagName);
    });

    await expect(utils.getStampImageBase64()).rejects.toThrow('无法创建 canvas context');

    vi.restoreAllMocks();
  })

})
