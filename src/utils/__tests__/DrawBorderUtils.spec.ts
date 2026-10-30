import { describe, it, expect, vi, beforeEach } from 'vitest';
import { drawBasicBorder, drawRectangleBorder } from '../DrawBorderUtils';

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

describe('drawRectangleBorder', () => {
    let ctx: any;

    beforeEach(() => {
        ctx = {
            beginPath: vi.fn(),
            rect: vi.fn(),
            fill: vi.fn(),
            setLineDash: vi.fn(),
            stroke: vi.fn(),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
        };
    });

    it('draws a solid border by default', () => {
        drawRectangleBorder(ctx, 100, 100, 60, 40, 2, 'red');

        expect(ctx.beginPath).toHaveBeenCalledOnce();

        const adjustedWidth = 60 - 2;
        const adjustedHeight = 40 - 2;
        const halfWidth = adjustedWidth / 2;
        const halfHeight = adjustedHeight / 2;

        expect(ctx.rect).toHaveBeenCalledWith(
            100 - halfWidth,
            100 - halfHeight,
            adjustedWidth,
            adjustedHeight
        );

        expect(ctx.fill).not.toHaveBeenCalled();

        expect(ctx.setLineDash).toHaveBeenCalledWith([]);
        expect(ctx.strokeStyle).toBe('red');
        expect(ctx.lineWidth).toBe(2);
        expect(ctx.stroke).toHaveBeenCalledOnce();

        // it resets line dash at the end
        expect(ctx.setLineDash).toHaveBeenLastCalledWith([]);
    });

    it('draws a dashed border', () => {
        drawRectangleBorder(ctx, 100, 100, 60, 40, 2, 'blue', 'dashed', 15, 10);

        expect(ctx.setLineDash).toHaveBeenCalledWith([15, 10]);
        expect(ctx.stroke).toHaveBeenCalledOnce();
    });

    it('draws a dotted border', () => {
        drawRectangleBorder(ctx, 100, 100, 60, 40, 2, 'green', 'dotted', 2, 4);

        expect(ctx.setLineDash).toHaveBeenCalledWith([2, 4]);
        expect(ctx.stroke).toHaveBeenCalledOnce();
    });

    it('handles negative or zero dash and gap px properly', () => {
        drawRectangleBorder(ctx, 100, 100, 60, 40, 2, 'black', 'dashed', -5, 0);

        expect(ctx.setLineDash).toHaveBeenCalledWith([1, 1]); // max(1, x) is used
        expect(ctx.stroke).toHaveBeenCalledOnce();
    });

    it('fills background when fillColor is provided', () => {
        drawRectangleBorder(ctx, 100, 100, 60, 40, 2, 'black', 'solid', 10, 5, 'yellow');

        expect(ctx.fillStyle).toBe('yellow');
        expect(ctx.fill).toHaveBeenCalledOnce();
    });

    it('handles cases where width or height is smaller than borderWidth', () => {
        drawRectangleBorder(ctx, 100, 100, 1, 1, 2, 'red');

        expect(ctx.rect).toHaveBeenCalledWith(100, 100, 0, 0);
    });
});
