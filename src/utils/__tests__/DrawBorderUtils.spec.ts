import { describe, it, expect, vi, beforeEach } from 'vitest';
import { drawBasicBorder, drawTriangleBorder } from '../DrawBorderUtils';

describe('drawBasicBorder', () => {
    let ctx: any;

    beforeEach(() => {
        ctx = {
            beginPath: vi.fn(),
            ellipse: vi.fn(),
            fill: vi.fn(),
            setLineDash: vi.fn(),
            stroke: vi.fn(),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
        };
    });

    it('draws a solid border by default', () => {
        drawBasicBorder(ctx, 100, 100, 50, 25, 2, 'red');

        expect(ctx.beginPath).toHaveBeenCalledOnce();
        expect(ctx.ellipse).toHaveBeenCalledWith(100, 100, 50, 25, 0, 0, Math.PI * 2);

        expect(ctx.fill).not.toHaveBeenCalled();

        expect(ctx.setLineDash).toHaveBeenCalledWith([]);
        expect(ctx.strokeStyle).toBe('red');
        expect(ctx.lineWidth).toBe(2);
        expect(ctx.stroke).toHaveBeenCalledOnce();

        // it resets line dash at the end
        expect(ctx.setLineDash).toHaveBeenLastCalledWith([]);
    });

    it('draws a dashed border', () => {
        drawBasicBorder(ctx, 100, 100, 50, 25, 2, 'blue', 'dashed', 15, 10);

        expect(ctx.setLineDash).toHaveBeenCalledWith([15, 10]);
        expect(ctx.stroke).toHaveBeenCalledOnce();
    });

    it('draws a dotted border', () => {
        drawBasicBorder(ctx, 100, 100, 50, 25, 2, 'green', 'dotted', 2, 4);

        expect(ctx.setLineDash).toHaveBeenCalledWith([2, 4]);
        expect(ctx.stroke).toHaveBeenCalledOnce();
    });

    it('handles negative or zero dash and gap px properly', () => {
        drawBasicBorder(ctx, 100, 100, 50, 25, 2, 'black', 'dashed', -5, 0);

        expect(ctx.setLineDash).toHaveBeenCalledWith([1, 1]); // max(1, x) is used
        expect(ctx.stroke).toHaveBeenCalledOnce();
    });

    it('fills background when fillColor is provided', () => {
        drawBasicBorder(ctx, 100, 100, 50, 25, 2, 'black', 'solid', 10, 5, 'yellow');

        expect(ctx.fillStyle).toBe('yellow');
        expect(ctx.fill).toHaveBeenCalledOnce();
    });
});

describe('drawTriangleBorder', () => {
    let ctx: any;

    beforeEach(() => {
        ctx = {
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            closePath: vi.fn(),
            fill: vi.fn(),
            setLineDash: vi.fn(),
            stroke: vi.fn(),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
        };
    });

    it('draws a solid triangle border by default', () => {
        // width = 50, height = 40, borderWidth = 2
        // adjustedWidth = 50 - 2*2 = 46, halfWidth = 23
        // adjustedHeight = 40 - 2*2 = 36, halfHeight = 18
        // centerX = 100, centerY = 100
        drawTriangleBorder(ctx, 100, 100, 50, 40, 2, 'red');

        expect(ctx.beginPath).toHaveBeenCalledOnce();

        // 1. moveTo(centerX, centerY - halfHeight) -> (100, 100 - 18) = (100, 82)
        expect(ctx.moveTo).toHaveBeenCalledWith(100, 82);
        // 2. lineTo(centerX + halfWidth, centerY + halfHeight) -> (100 + 23, 100 + 18) = (123, 118)
        expect(ctx.lineTo).toHaveBeenCalledWith(123, 118);
        // 3. lineTo(centerX - halfWidth, centerY + halfHeight) -> (100 - 23, 100 + 18) = (77, 118)
        expect(ctx.lineTo).toHaveBeenCalledWith(77, 118);

        expect(ctx.closePath).toHaveBeenCalledOnce();

        expect(ctx.fill).not.toHaveBeenCalled();

        expect(ctx.setLineDash).toHaveBeenCalledWith([]);
        expect(ctx.strokeStyle).toBe('red');
        expect(ctx.lineWidth).toBe(2);
        expect(ctx.stroke).toHaveBeenCalledOnce();

        expect(ctx.setLineDash).toHaveBeenLastCalledWith([]);
    });

    it('draws a dashed triangle border', () => {
        drawTriangleBorder(ctx, 100, 100, 50, 40, 2, 'blue', 'dashed', 15, 10);

        expect(ctx.setLineDash).toHaveBeenCalledWith([15, 10]);
        expect(ctx.stroke).toHaveBeenCalledOnce();
    });

    it('draws a dotted triangle border', () => {
        drawTriangleBorder(ctx, 100, 100, 50, 40, 2, 'green', 'dotted', 2, 4);

        expect(ctx.setLineDash).toHaveBeenCalledWith([2, 4]);
        expect(ctx.stroke).toHaveBeenCalledOnce();
    });

    it('handles negative or zero dash and gap px properly', () => {
        drawTriangleBorder(ctx, 100, 100, 50, 40, 2, 'black', 'dashed', -5, 0);

        expect(ctx.setLineDash).toHaveBeenCalledWith([1, 1]); // max(1, x) is used
        expect(ctx.stroke).toHaveBeenCalledOnce();
    });

    it('fills background when fillColor is provided', () => {
        drawTriangleBorder(ctx, 100, 100, 50, 40, 2, 'black', 'solid', 10, 5, 'yellow');

        expect(ctx.fillStyle).toBe('yellow');
        expect(ctx.fill).toHaveBeenCalledOnce();
    });
});
