import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DrawStampTypeUtils } from '../DrawStampTypeUtils'
import { IStampType } from '../../DrawStampTypes'

describe('DrawStampTypeUtils', () => {
    let ctx: any
    let utils: DrawStampTypeUtils

    beforeEach(() => {
        ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            scale: vi.fn(),
            fillText: vi.fn(),
            measureText: vi.fn().mockImplementation((char) => ({ width: 10 })),
            beginPath: vi.fn(),
            ellipse: vi.fn(),
            fill: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            arc: vi.fn(),
            font: '',
            fillStyle: '',
            textAlign: '',
            textBaseline: '',
            globalCompositeOperation: '',
            strokeStyle: '',
            lineWidth: 0,
            lineCap: ''
        }
        utils = new DrawStampTypeUtils(10) // mmToPixel = 10
    })

    describe('getTextPaths and clearTextPaths', () => {
        it('should return empty array initially', () => {
            expect(utils.getTextPaths()).toEqual([])
        })

        it('should clear text paths', () => {
            const stampType: IStampType = {
                stampType: 'Test',
                fontHeight: 2,
                fontFamily: 'Arial',
                compression: 1,
                letterSpacing: 0,
                positionX: 0,
                positionY: 0,
                fontWidth: 2,
                fontWeight: 'normal',
                lineSpacing: 0,
            }
            utils.drawStampTypeList(ctx, [stampType], 100, 100, 50, '#ff0000')
            expect(utils.getTextPaths().length).toBe(4) // 'Test' has 4 chars

            utils.clearTextPaths()
            expect(utils.getTextPaths()).toEqual([])
        })
    })

    describe('drawStampTypeList', () => {
        it('should handle empty stampTypeList', () => {
            utils.drawStampTypeList(ctx, [], 100, 100, 50, '#ff0000')
            expect(ctx.save).toHaveBeenCalledTimes(1)
            expect(ctx.restore).toHaveBeenCalledTimes(1)
            expect(utils.getTextPaths()).toEqual([])
        })

        it('should draw horizontal text by default', () => {
            const stampType: IStampType = {
                stampType: 'ABC',
                fontHeight: 4,
                fontFamily: 'Arial',
                compression: 0.8,
                letterSpacing: 1,
                positionX: 0,
                positionY: 10,
                fontWidth: 4,
                fontWeight: 'bold',
                fontStyle: 'italic',
                lineSpacing: 1,
                color: '#00ff00',
                rotation: 90
            }
            utils.drawStampTypeList(ctx, [stampType], 100, 100, 50, '#ff0000')

            // outer save/restore
            expect(ctx.save).toHaveBeenCalled()
            expect(ctx.restore).toHaveBeenCalled()

            // check styling
            expect(ctx.font).toBe('italic bold 40px Arial') // 4 * 10 = 40
            expect(ctx.fillStyle).toBe('#00ff00')
            expect(ctx.textAlign).toBe('center')
            expect(ctx.textBaseline).toBe('middle')

            expect(ctx.rotate).toHaveBeenCalledWith(90 * Math.PI / 180)
            expect(ctx.scale).toHaveBeenCalledWith(0.8, 1)

            // Should have 3 chars
            const paths = utils.getTextPaths()
            expect(paths.length).toBe(3)
            expect(paths[0].text).toBe('A')
            expect(paths[1].text).toBe('B')
            expect(paths[2].text).toBe('C')

            paths.forEach(p => {
                expect(p.type).toBe('stampType')
                expect(p.bounds).toBeDefined()
            })
        })

        it('should draw vertical text', () => {
            const stampType: IStampType = {
                stampType: 'XY',
                fontHeight: 4,
                fontFamily: 'Arial',
                compression: 1,
                letterSpacing: 1,
                positionX: 0,
                positionY: 0,
                fontWidth: 4,
                fontWeight: 'normal',
                lineSpacing: 1,
                orientation: 'vertical'
            }
            utils.drawStampTypeList(ctx, [stampType], 100, 100, 50, '#ff0000')

            const paths = utils.getTextPaths()
            expect(paths.length).toBe(2)
            expect(paths[0].text).toBe('X')
            expect(paths[1].text).toBe('Y')

            // vertical uses fillText differently
            expect(ctx.fillText).toHaveBeenCalledWith('X', 0, expect.any(Number))
        })

        it('should handle multiline strings', () => {
            const stampType: IStampType = {
                stampType: 'A\nB',
                fontHeight: 4,
                fontFamily: 'Arial',
                compression: 1,
                letterSpacing: 1,
                positionX: 0,
                positionY: 0,
                fontWidth: 4,
                fontWeight: 'normal',
                lineSpacing: 1
            }
            utils.drawStampTypeList(ctx, [stampType], 100, 100, 50, '#ff0000')

            const paths = utils.getTextPaths()
            expect(paths.length).toBe(2) // 1 char per line

            // two lines drawn
            expect(ctx.translate).toHaveBeenCalledTimes(2)
        })

        it('should handle multiline vertical strings', () => {
            const stampType: IStampType = {
                stampType: 'A\nB',
                fontHeight: 4,
                fontFamily: 'Arial',
                compression: 1,
                letterSpacing: 1,
                positionX: 0,
                positionY: 0,
                fontWidth: 4,
                fontWeight: 'normal',
                lineSpacing: 1,
                orientation: 'vertical'
            }
            utils.drawStampTypeList(ctx, [stampType], 100, 100, 50, '#ff0000')

            const paths = utils.getTextPaths()
            expect(paths.length).toBe(2) // 1 char per line

            // two characters drawn in two separate lines
            expect(ctx.translate).toHaveBeenCalledTimes(2)
        })

        it('should apply aging effect when drawAging is true', () => {
            const MathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)

            const stampType: IStampType = {
                stampType: 'A',
                fontHeight: 4,
                fontFamily: 'Arial',
                compression: 1,
                letterSpacing: 0,
                positionX: 0,
                positionY: 0,
                fontWidth: 4,
                fontWeight: 'normal',
                lineSpacing: 0,
                drawAging: true,
                agingIntensity: 100,
                agingNoiseSize: 0.15
            }
            utils.drawStampTypeList(ctx, [stampType], 100, 100, 50, '#ff0000')

            expect(ctx.globalCompositeOperation).toBe('destination-out')
            // Aging effect triggers random shapes drawing
            expect(ctx.beginPath).toHaveBeenCalled()

            // It runs 100 * 0.05 = 5 times
            expect(ctx.ellipse).toHaveBeenCalledTimes(5)

            MathRandomSpy.mockRestore()
        })

        it('should apply aging effect branch 2 (scratch)', () => {
            // Mock random to hit the 0.6 <= rand < 0.85 condition for scratches
            let callCount = 0;
            const MathRandomSpy = vi.spyOn(Math, 'random').mockImplementation(() => {
                callCount++;
                // The first random is rand, subsequent ones for px, py, length, angle, lineWidth
                if (callCount % 8 === 3) return 0.7; // Ensure rand is ~0.7
                return 0.5;
            });

            const stampType: IStampType = {
                stampType: 'A',
                fontHeight: 4,
                fontFamily: 'Arial',
                compression: 1,
                letterSpacing: 0,
                positionX: 0,
                positionY: 0,
                fontWidth: 4,
                fontWeight: 'normal',
                lineSpacing: 0,
                drawAging: true,
                agingIntensity: 100,
                agingNoiseSize: 0.15
            }
            utils.drawStampTypeList(ctx, [stampType], 100, 100, 50, '#ff0000')

            expect(ctx.lineTo).toHaveBeenCalled()
            expect(ctx.stroke).toHaveBeenCalled()

            MathRandomSpy.mockRestore()
        })

        it('should apply aging effect branch 3 (complex fragments)', () => {
            // Mock random to hit the rand >= 0.85 condition
            let callCount = 0;
            const MathRandomSpy = vi.spyOn(Math, 'random').mockImplementation(() => {
                callCount++;
                // The first random is rand
                if (callCount % 12 === 3) return 0.9;
                return 0.5;
            });

            const stampType: IStampType = {
                stampType: 'A',
                fontHeight: 4,
                fontFamily: 'Arial',
                compression: 1,
                letterSpacing: 0,
                positionX: 0,
                positionY: 0,
                fontWidth: 4,
                fontWeight: 'normal',
                lineSpacing: 0,
                drawAging: true,
                agingIntensity: 100,
                agingNoiseSize: 0.15
            }
            utils.drawStampTypeList(ctx, [stampType], 100, 100, 50, '#ff0000')

            expect(ctx.arc).toHaveBeenCalled()

            MathRandomSpy.mockRestore()
        })
    })
})