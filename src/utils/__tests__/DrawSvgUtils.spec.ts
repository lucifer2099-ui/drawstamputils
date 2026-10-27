import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrawSvgUtils } from '../DrawSvgUtils';
import { IDrawStar } from '../../DrawStampTypes';

// Path2D is not defined in jsdom, we need to mock it
global.Path2D = class Path2D {
    constructor() {}
    moveTo() {}
    lineTo() {}
    closePath() {}
} as any;

describe('DrawSvgUtils', () => {
    let drawSvgUtils: DrawSvgUtils;
    let ctx: any;

    beforeEach(() => {
        drawSvgUtils = new DrawSvgUtils(10);
        ctx = {
            save: vi.fn(),
            translate: vi.fn(),
            scale: vi.fn(),
            strokeRect: vi.fn(),
            restore: vi.fn(),
            beginPath: vi.fn(),
            ellipse: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            arc: vi.fn(),
        };

        // Mock global console.error
        vi.spyOn(console, 'error').mockImplementation(() => {});

        // Mock Image and Promise if needed
        global.Image = class {
            onload: () => void = () => {};
            onerror: () => void = () => {};
            src: string = '';
            constructor() {
                setTimeout(() => this.onload(), 0);
            }
        } as any;
    });

    it('catches and logs error when drawSVGContent throws an error (e.g. malformed SVG)', async () => {
        const starConfig = {
            svgPath: '<svg><malformed></svg>', // Intentionally malformed
            starPositionX: 0,
            starPositionY: 0,
            starDiameter: 10,
        } as IDrawStar;

        await drawSvgUtils.drawStarShape(ctx, starConfig, 50, 50, 'red');

        expect(console.error).toHaveBeenCalledWith(
            'Error drawing SVG:',
            expect.any(Error)
        );
    });

    it('catches and logs error when DOMParser finds parsererror', async () => {
        // Intentionally invalid XML that will cause a DOMParser parsererror
        const starConfig = {
            svgPath: '<svg><not-closed>',
            starPositionX: 0,
            starPositionY: 0,
            starDiameter: 10,
        } as IDrawStar;

        await drawSvgUtils.drawStarShape(ctx, starConfig, 50, 50, 'red');

        expect(console.error).toHaveBeenCalledWith(
            'Error drawing SVG:',
            expect.objectContaining({ message: expect.stringContaining('Invalid SVG content') })
        );
    });

    it('catches and logs error when no svg element is found', async () => {
        const starConfig = {
            svgPath: '<svg></svg>', // we will modify the drawSVGContent call instead of trying to pass a non-svg string which would skip drawSVGContent entirely
            starPositionX: 0,
            starPositionY: 0,
            starDiameter: 10,
        } as IDrawStar;

        // we can directly test the private drawSVGContent by making it accessible for testing purposes, but here we can just use drawStarShape which calls it
        // The issue with the previous test is that drawStarShape checks if starConfig.svgPath.startsWith('<svg') before calling drawSVGContent
        const invalidSvgConfig = {
            svgPath: '<svg-not-real></svg-not-real>',
            starPositionX: 0,
            starPositionY: 0,
            starDiameter: 10,
        } as IDrawStar;

        await drawSvgUtils.drawStarShape(ctx, invalidSvgConfig, 50, 50, 'red');

        expect(console.error).toHaveBeenCalledWith(
            'Error drawing SVG:',
            expect.objectContaining({ message: 'Invalid SVG content' })
        );
    });
});
