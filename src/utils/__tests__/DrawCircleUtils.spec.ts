import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrawCircleUtils } from '../DrawCircleUtils';
import { IInnerCircle } from '../../DrawStampTypes';

describe('DrawCircleUtils', () => {
    let ctx: any;
    let utils: DrawCircleUtils;

    beforeEach(() => {
        ctx = {
            beginPath: vi.fn(),
            ellipse: vi.fn(),
            rect: vi.fn(),
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
        utils = new DrawCircleUtils(10); // mmToPixel = 10
    });

    describe('drawEllipse', () => {
        it('draws a solid ellipse by default', () => {
            utils.drawEllipse(ctx, 100, 100, 50, 25, 2, 'red');
            expect(ctx.setLineDash).toHaveBeenCalledWith([]);
            expect(ctx.beginPath).toHaveBeenCalledOnce();
            expect(ctx.ellipse).toHaveBeenCalledWith(100, 100, 50, 25, 0, 0, Math.PI * 2);
            expect(ctx.fill).not.toHaveBeenCalled();
            expect(ctx.strokeStyle).toBe('red');
            expect(ctx.lineWidth).toBe(2);
            expect(ctx.stroke).toHaveBeenCalledOnce();
            expect(ctx.setLineDash).toHaveBeenLastCalledWith([]);
        });

        it('draws a dashed ellipse', () => {
            utils.drawEllipse(ctx, 100, 100, 50, 25, 2, 'blue', 'dashed', 3, 2);
            expect(ctx.setLineDash).toHaveBeenCalledWith([30, 20]); // 3 * 10, 2 * 10
            expect(ctx.stroke).toHaveBeenCalledOnce();
        });

        it('fills background when fillColor is provided', () => {
            utils.drawEllipse(ctx, 100, 100, 50, 25, 2, 'black', 'solid', 2, 1, 'yellow');
            expect(ctx.fillStyle).toBe('yellow');
            expect(ctx.fill).toHaveBeenCalledOnce();
        });
    });

    describe('drawCircle', () => {
        it('draws an ellipse shape', () => {
            const circle: IInnerCircle = {
                drawInnerCircle: true,
                innerCircleLineWidth: 1,
                innerCircleLineRadiusX: 10,
                innerCircleLineRadiusY: 5,
                shape: 'ellipse'
            };
            utils.drawCircle(ctx, 100, 100, 'red', circle);
            expect(ctx.ellipse).toHaveBeenCalledWith(100, 100, 45, 20, 0, 0, Math.PI * 2);
        });

        it('draws a rectangle shape', () => {
            const circle: IInnerCircle = {
                drawInnerCircle: true,
                innerCircleLineWidth: 1,
                innerCircleLineRadiusX: 10,
                innerCircleLineRadiusY: 5,
                shape: 'rectangle'
            };
            utils.drawCircle(ctx, 100, 100, 'red', circle);
            expect(ctx.rect).toHaveBeenCalledWith(55, 80, 90, 40);
        });

        it('draws a rhombus shape', () => {
            const circle: IInnerCircle = {
                drawInnerCircle: true,
                innerCircleLineWidth: 1,
                innerCircleLineRadiusX: 10,
                innerCircleLineRadiusY: 5,
                shape: 'rhombus'
            };
            utils.drawCircle(ctx, 100, 100, 'red', circle);
            expect(ctx.moveTo).toHaveBeenCalledWith(100, 80);
            expect(ctx.lineTo).toHaveBeenCalledWith(145, 100);
            expect(ctx.lineTo).toHaveBeenCalledWith(100, 120);
            expect(ctx.lineTo).toHaveBeenCalledWith(55, 100);
        });

        it('draws a triangle shape', () => {
            const circle: IInnerCircle = {
                drawInnerCircle: true,
                innerCircleLineWidth: 1,
                innerCircleLineRadiusX: 10,
                innerCircleLineRadiusY: 5,
                shape: 'triangle'
            };
            utils.drawCircle(ctx, 100, 100, 'red', circle);
            expect(ctx.moveTo).toHaveBeenCalledWith(100, 90);
            expect(ctx.lineTo).toHaveBeenCalledWith(135, 110);
            expect(ctx.lineTo).toHaveBeenCalledWith(65, 110);
        });

        it('applies offsets and fill color', () => {
            const circle: IInnerCircle = {
                drawInnerCircle: true,
                innerCircleLineWidth: 1,
                innerCircleLineRadiusX: 10,
                innerCircleLineRadiusY: 5,
                shape: 'ellipse',
                offsetX: 2,
                offsetY: -1,
                fillBackground: true,
                fillColor: 'green'
            };
            utils.drawCircle(ctx, 100, 100, 'red', circle);
            expect(ctx.ellipse).toHaveBeenCalledWith(120, 90, 45, 20, 0, 0, Math.PI * 2);
            expect(ctx.fillStyle).toBe('green');
            expect(ctx.fill).toHaveBeenCalledOnce();
        });

        it('falls back to color or borderColor for fill when fillBackground is true but fillColor missing', () => {
            const circle: IInnerCircle = {
                drawInnerCircle: true,
                innerCircleLineWidth: 1,
                innerCircleLineRadiusX: 10,
                innerCircleLineRadiusY: 5,
                shape: 'ellipse',
                fillBackground: true,
                color: 'blue'
            };
            utils.drawCircle(ctx, 100, 100, 'red', circle);
            expect(ctx.fillStyle).toBe('blue');
        });
    });

    describe('drawCircleList', () => {
        it('only draws circles with drawInnerCircle true', () => {
            const circleList: IInnerCircle[] = [
                {
                    drawInnerCircle: false,
                    innerCircleLineWidth: 1,
                    innerCircleLineRadiusX: 10,
                    innerCircleLineRadiusY: 10
                },
                {
                    drawInnerCircle: true,
                    innerCircleLineWidth: 1,
                    innerCircleLineRadiusX: 10,
                    innerCircleLineRadiusY: 10,
                    color: 'blue'
                }
            ];
            utils.drawCircleList(ctx, circleList, 100, 100, 'red');
            expect(ctx.ellipse).toHaveBeenCalledOnce();
            expect(ctx.strokeStyle).toBe('blue');
        });
    });
});
