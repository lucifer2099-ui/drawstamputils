import { describe, it, expect, vi, beforeEach } from 'vitest';
import { drawBasicBorder, drawRhombusBorder } from '../DrawBorderUtils';

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

describe('drawRhombusBorder', () => {
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

    it('draws a solid rhombus border by default', () => {
        drawRhombusBorder(ctx, 100, 100, 100, 50, 2, 'red');

        // Adjusted width = 100 - 2 = 98. Half width = 49.
        // Adjusted height = 50 - 2 = 48. Half height = 24.
        expect(ctx.beginPath).toHaveBeenCalledOnce();
        expect(ctx.moveTo).toHaveBeenCalledWith(100, 100 - 24);
        expect(ctx.lineTo).toHaveBeenCalledWith(100 + 49, 100);
        expect(ctx.lineTo).toHaveBeenCalledWith(100, 100 + 24);
        expect(ctx.lineTo).toHaveBeenCalledWith(100 - 49, 100);
        expect(ctx.closePath).toHaveBeenCalledOnce();

        expect(ctx.fill).not.toHaveBeenCalled();

        expect(ctx.setLineDash).toHaveBeenCalledWith([]);
        expect(ctx.strokeStyle).toBe('red');
        expect(ctx.lineWidth).toBe(2);
        expect(ctx.stroke).toHaveBeenCalledOnce();

        // it resets line dash at the end
        expect(ctx.setLineDash).toHaveBeenLastCalledWith([]);
    });

    it('draws a dashed rhombus border', () => {
        drawRhombusBorder(ctx, 100, 100, 100, 50, 2, 'blue', 'dashed', 15, 10);

        expect(ctx.setLineDash).toHaveBeenCalledWith([15, 10]);
        expect(ctx.stroke).toHaveBeenCalledOnce();
    });

    it('draws a dotted rhombus border', () => {
        drawRhombusBorder(ctx, 100, 100, 100, 50, 2, 'green', 'dotted', 2, 4);

        expect(ctx.setLineDash).toHaveBeenCalledWith([2, 4]);
        expect(ctx.stroke).toHaveBeenCalledOnce();
    });

    it('handles negative or zero dash and gap px properly', () => {
        drawRhombusBorder(ctx, 100, 100, 100, 50, 2, 'black', 'dashed', -5, 0);

        expect(ctx.setLineDash).toHaveBeenCalledWith([1, 1]); // max(1, x) is used
        expect(ctx.stroke).toHaveBeenCalledOnce();
    });

    it('fills background when fillColor is provided', () => {
        drawRhombusBorder(ctx, 100, 100, 100, 50, 2, 'black', 'solid', 10, 5, 'yellow');

        expect(ctx.fillStyle).toBe('yellow');
        expect(ctx.fill).toHaveBeenCalledOnce();
    });
});
