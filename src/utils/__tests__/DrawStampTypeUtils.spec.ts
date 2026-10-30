import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrawStampTypeUtils } from '../DrawStampTypeUtils';
import { IStampType } from '../../DrawStampTypes';

describe('DrawStampTypeUtils', () => {
    let ctx: any;
    let utils: DrawStampTypeUtils;

    beforeEach(() => {
        ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            scale: vi.fn(),
            fillText: vi.fn(),
            measureText: vi.fn((text: string) => ({ width: 10 })),
            beginPath: vi.fn(),
            ellipse: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            arc: vi.fn(),
            font: '',
            fillStyle: '',
            textAlign: '',
            textBaseline: '',
            globalCompositeOperation: '',
            strokeStyle: '',
            lineWidth: 0,
            lineCap: '',
        };
        utils = new DrawStampTypeUtils(10);
    });

    describe('Core properties and paths management', () => {
        it('should initialize with correct mmToPixel', () => {
            const newUtils = new DrawStampTypeUtils(20);
            expect(newUtils['mmToPixel']).toBe(20);
        });

        it('should manage text paths correctly', () => {
            expect(utils.getTextPaths()).toEqual([]);

            // Add a mock path
            utils['textPaths'].push({
                text: 'A',
                type: 'stampType',
                bounds: { x: 0, y: 0, width: 10, height: 10 }
            });

            expect(utils.getTextPaths()).toHaveLength(1);

            utils.clearTextPaths();
            expect(utils.getTextPaths()).toEqual([]);
        });
    });

    describe('drawStampTypeList', () => {
        let stampType: IStampType;

        beforeEach(() => {
            stampType = {
                stampType: 'TEXT',
                fontHeight: 2,
                fontFamily: 'Arial',
                compression: 1,
                letterSpacing: 0,
                positionX: 0,
                positionY: 5,
                fontWidth: 2,
                fontWeight: 'normal',
                lineSpacing: 1,
                color: 'blue'
            };
        });

        it('should draw horizontal text and populate textPaths', () => {
            utils.drawStampTypeList(ctx, [stampType], 100, 100, 50, 'red');

            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.font).toContain('20px');
            expect(ctx.font).toContain('Arial');
            expect(ctx.fillStyle).toBe('blue');
            expect(ctx.textAlign).toBe('center');
            expect(ctx.textBaseline).toBe('middle');

            // Should fill text for each character
            expect(ctx.fillText).toHaveBeenCalledTimes(4);

            const paths = utils.getTextPaths();
            expect(paths).toHaveLength(4);
            expect(paths[0].text).toBe('T');
            expect(paths[0].type).toBe('stampType');

            expect(ctx.restore).toHaveBeenCalled();
        });

        it('should fallback to primaryColor when color is not provided', () => {
            delete stampType.color;
            utils.drawStampTypeList(ctx, [stampType], 100, 100, 50, 'red');
            expect(ctx.fillStyle).toBe('red');
        });

        it('should draw vertical text when orientation is vertical', () => {
            stampType.orientation = 'vertical';
            stampType.stampType = 'ABC';

            utils.drawStampTypeList(ctx, [stampType], 100, 100, 50, 'red');

            expect(ctx.fillText).toHaveBeenCalledTimes(3);

            const paths = utils.getTextPaths();
            expect(paths).toHaveLength(3);
            expect(paths[0].text).toBe('A');
        });

        it('should handle multi-line text', () => {
            stampType.stampType = 'A\nB';
            utils.drawStampTypeList(ctx, [stampType], 100, 100, 50, 'red');
            expect(ctx.fillText).toHaveBeenCalledTimes(2);
            expect(utils.getTextPaths()).toHaveLength(2);
        });

        it('should apply aging effect when drawAging is true', () => {
            stampType.stampType = 'A';
            stampType.drawAging = true;
            stampType.agingIntensity = 50;
            stampType.agingNoiseSize = 0.5;

            utils.drawStampTypeList(ctx, [stampType], 100, 100, 50, 'red');

            // 1 fillText per char (1 char here)
            expect(ctx.fillText).toHaveBeenCalledTimes(1);

            // Check that aging specific properties were set
            expect(ctx.globalCompositeOperation).toBe('destination-out');

            // Aging drawing involves beginPath, ellipse or stroke or fill
            expect(ctx.beginPath).toHaveBeenCalled();
        });

        it('should apply rotation if provided', () => {
            stampType.rotation = 90;
            utils.drawStampTypeList(ctx, [stampType], 100, 100, 50, 'red');

            // Expected rotation is in radians
            expect(ctx.rotate).toHaveBeenCalledWith((90 * Math.PI) / 180);
        });
    });
});
