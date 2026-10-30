import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrawRectangleUtils } from '../DrawRectangleUtils';
import { IInnerCircle } from '../../DrawStampTypes';

describe('DrawRectangleUtils', () => {
    let ctx: any;
    let utils: DrawRectangleUtils;

    beforeEach(() => {
        ctx = {
            beginPath: vi.fn(),
            rect: vi.fn(),
            stroke: vi.fn(),
            strokeStyle: '',
            lineWidth: 0,
        };
        utils = new DrawRectangleUtils(10); // mmToPixel = 10
    });

    describe('drawRectangle', () => {
        it('calculates pixel dimensions correctly and draws a rectangle', () => {
            utils.drawRectangle(ctx, 100, 100, 50, 30, 2, 'red');

            expect(ctx.beginPath).toHaveBeenCalledOnce();
            expect(ctx.rect).toHaveBeenCalledWith(
                100 - (50 * 10) / 2, // centerX - pixelWidth / 2
                100 - (30 * 10) / 2, // centerY - pixelHeight / 2
                500, // pixelWidth
                300  // pixelHeight
            );
            expect(ctx.strokeStyle).toBe('red');
            expect(ctx.lineWidth).toBe(20); // 2 * 10
            expect(ctx.stroke).toHaveBeenCalledOnce();
        });
    });

    describe('drawInnerRectangle', () => {
        it('calculates inner dimensions and delegates to drawRectangle', () => {
            const rectConfig: IInnerCircle = {
                drawInnerCircle: true,
                innerCircleLineRadiusX: 20,
                innerCircleLineRadiusY: 10,
                innerCircleLineWidth: 2
            };

            const drawRectangleSpy = vi.spyOn(utils, 'drawRectangle');

            utils.drawInnerRectangle(ctx, 200, 200, 'blue', rectConfig);

            const expectedWidth = (20 - 2) / 2 * 2;
            const expectedHeight = (10 - 2) / 2 * 2;

            expect(drawRectangleSpy).toHaveBeenCalledWith(
                ctx,
                200,
                200,
                expectedWidth,
                expectedHeight,
                2,
                'blue'
            );
        });
    });

    describe('drawRectangleList', () => {
        it('iterates over rectangle list and calls drawInnerRectangle for rects with drawInnerCircle=true', () => {
            const rectangleList: IInnerCircle[] = [
                {
                    drawInnerCircle: false,
                    innerCircleLineRadiusX: 10,
                    innerCircleLineRadiusY: 5,
                    innerCircleLineWidth: 1
                },
                {
                    drawInnerCircle: true,
                    innerCircleLineRadiusX: 20,
                    innerCircleLineRadiusY: 10,
                    innerCircleLineWidth: 2
                }
            ];

            const drawInnerRectangleSpy = vi.spyOn(utils, 'drawInnerRectangle').mockImplementation(() => {});

            utils.drawRectangleList(ctx, rectangleList, 150, 150, 'green');

            expect(drawInnerRectangleSpy).toHaveBeenCalledOnce();
            expect(drawInnerRectangleSpy).toHaveBeenCalledWith(
                ctx,
                150,
                150,
                'green',
                rectangleList[1]
            );
        });
    });
});
