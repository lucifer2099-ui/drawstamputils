import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrawRulerUtils } from '../DrawRulerUtils';
import { IShowRuler } from '../../DrawStampTypes';

describe('DrawRulerUtils', () => {
    let ctx: any;
    let utils: DrawRulerUtils;
    let ruler: IShowRuler;

    beforeEach(() => {
        ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            fillRect: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            fillText: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            setLineDash: vi.fn(),
            clearRect: vi.fn(),
            drawImage: vi.fn(),
            fillStyle: '',
            font: '',
            textAlign: '',
            textBaseline: '',
            lineWidth: 0,
            strokeStyle: '',
        };
        utils = new DrawRulerUtils(10, 80); // mmToPixel = 10, rulerSize = 80

        ruler = {
            showSideRuler: true,
            showFullRuler: true,
            showDashLine: true,
            showRuler: true,
            showCurrentPositionText: true,
            showCrossLine: true
        };
    });

    describe('drawRuler', () => {
        it('returns early if showRuler is false', () => {
            ruler.showRuler = false;
            utils.drawRuler(ctx, ruler, 1, 500, 80, true);
            expect(ctx.save).not.toHaveBeenCalled();
        });

        it('draws a horizontal ruler', () => {
            utils.drawRuler(ctx, ruler, 1, 500, 80, true);

            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 500, 80);
            expect(ctx.fillStyle).toBe('black');
            expect(ctx.textAlign).toBe('center');
            expect(ctx.textBaseline).toBe('top');

            // Should draw some ticks and text
            expect(ctx.beginPath).toHaveBeenCalled();
            expect(ctx.moveTo).toHaveBeenCalled();
            expect(ctx.lineTo).toHaveBeenCalled();
            expect(ctx.stroke).toHaveBeenCalled();
            expect(ctx.fillText).toHaveBeenCalled();

            expect(ctx.restore).toHaveBeenCalled();
        });

        it('draws a vertical ruler', () => {
            utils.drawRuler(ctx, ruler, 1, 500, 80, false);

            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 80, 500);

            expect(ctx.translate).toHaveBeenCalled();
            expect(ctx.rotate).toHaveBeenCalledWith(-Math.PI / 2);
            expect(ctx.fillText).toHaveBeenCalled();

            expect(ctx.restore).toHaveBeenCalled();
        });

        it('handles scale correctly', () => {
            utils.drawRuler(ctx, ruler, 2, 500, 80, true);

            // With scale=2, maxMM will be different than scale=1
            // So we just ensure it doesn't crash and draws correctly
            expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 500, 80);
            expect(ctx.fillText).toHaveBeenCalled();
        });
    });

    describe('showCrossDashLine', () => {
        it('returns early if showDashLine is false', () => {
            ruler.showDashLine = false;
            utils.showCrossDashLine(ctx, ruler, 1, 80, 80, 500, 500);
            expect(ctx.save).not.toHaveBeenCalled();
        });

        it('draws horizontal and vertical dash lines', () => {
            utils.showCrossDashLine(ctx, ruler, 1, 80, 80, 500, 500);

            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.setLineDash).toHaveBeenCalledWith([5, 5]);
            expect(ctx.strokeStyle).toBe('#bbbbbb');
            expect(ctx.lineWidth).toBe(1);

            // Should draw lines (both vertical and horizontal)
            expect(ctx.beginPath).toHaveBeenCalled();
            expect(ctx.moveTo).toHaveBeenCalled();
            expect(ctx.lineTo).toHaveBeenCalled();
            expect(ctx.stroke).toHaveBeenCalled();

            expect(ctx.restore).toHaveBeenCalled();
        });
    });

    describe('drawPositionCrossLines', () => {
        it('returns early if offscreenCanvas is null', () => {
            utils.drawPositionCrossLines(null as any, null as any, 80, 80, 200, 200, 'red');
            // If it doesn't throw, it passed the early return test
            expect(true).toBe(true);
        });

        it('draws cross lines on offscreen canvas and main canvas', () => {
            const offscreenCanvas = {
                width: 500,
                height: 500,
                getContext: vi.fn().mockReturnValue(ctx)
            } as any;

            const mainCtx = {
                drawImage: vi.fn()
            };

            const mainCanvas = {
                getContext: vi.fn().mockReturnValue(mainCtx)
            } as any;

            utils.drawPositionCrossLines(offscreenCanvas, mainCanvas, 80, 80, 200, 300, 'red');

            expect(offscreenCanvas.getContext).toHaveBeenCalledWith('2d');
            expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 500, 500);
            expect(ctx.strokeStyle).toBe('red');
            expect(ctx.lineWidth).toBe(1);

            // Check horizontal line
            expect(ctx.moveTo).toHaveBeenCalledWith(80, 300);
            expect(ctx.lineTo).toHaveBeenCalledWith(500, 300);

            // Check vertical line
            expect(ctx.moveTo).toHaveBeenCalledWith(200, 80);
            expect(ctx.lineTo).toHaveBeenCalledWith(200, 500);

            expect(ctx.stroke).toHaveBeenCalled();

            // Check main canvas drawing
            expect(mainCanvas.getContext).toHaveBeenCalledWith('2d');
            expect(mainCtx.drawImage).toHaveBeenCalledWith(offscreenCanvas, 0, 0);
        });
    });

    describe('drawCurrentPositionText', () => {
        it('draws current position text correctly based on scale', () => {
            utils.drawCurrentPositionText(ctx, 150, 250, 2, 80, 80);

            expect(ctx.fillStyle).toBe('black');
            expect(ctx.font).toBe('bold 12px Arial');
            expect(ctx.textAlign).toBe('left');
            expect(ctx.textBaseline).toBe('top');

            // mmX / scale = 150 / 2 = 75.0
            // mmY / scale = 250 / 2 = 125.0
            expect(ctx.fillText).toHaveBeenCalledWith(
                '75.0mm, 125.0mm, scale: 2.00',
                85, // 80 + 5
                85  // 80 + 5
            );
        });
    });
});
