import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrawTaxNumberUtils } from '../DrawTaxNumberUtils';
import { ITaxNumber } from '../../DrawStampTypes';

class MockPath2D {}
(global as any).Path2D = MockPath2D;

describe('DrawTaxNumberUtils', () => {
    let utils: DrawTaxNumberUtils;
    let ctx: any;

    beforeEach(() => {
        utils = new DrawTaxNumberUtils(10);
        ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            scale: vi.fn(),
            fillText: vi.fn(),
            font: '',
            fillStyle: '',
            textAlign: '',
            textBaseline: ''
        };
    });

    it('initializes with empty text paths', () => {
        expect(utils.getTextPaths()).toEqual([]);
    });

    it('clears text paths', () => {
        const taxNumber: ITaxNumber = {
            code: '123',
            compression: 1,
            fontHeight: 2,
            fontFamily: 'Arial',
            fontWidth: 2,
            letterSpacing: 0,
            positionY: 5,
            totalWidth: 20,
            fontWeight: 'normal',
        };

        utils.drawTaxNumber(ctx, taxNumber, 100, 100, 'red');
        expect(utils.getTextPaths().length).toBeGreaterThan(0);

        utils.clearTextPaths();
        expect(utils.getTextPaths()).toEqual([]);
    });

    it('draws tax number and stores paths correctly', () => {
        const taxNumber: ITaxNumber = {
            code: '12',
            compression: 1,
            fontHeight: 2, // 20px
            fontFamily: 'Arial',
            fontWidth: 2,
            letterSpacing: 0.5, // 5px
            positionY: 5, // 50px + 0.3
            totalWidth: 10, // 100px
            fontWeight: 'normal',
        };

        utils.drawTaxNumber(ctx, taxNumber, 100, 100, 'red');

        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
        expect(ctx.font).toBe('normal 20px Arial');
        expect(ctx.fillStyle).toBe('red');
        expect(ctx.textAlign).toBe('center');
        expect(ctx.textBaseline).toBe('middle');

        expect(ctx.fillText).toHaveBeenCalledTimes(2);

        const paths = utils.getTextPaths();
        expect(paths).toHaveLength(2);
        expect(paths[0].text).toBe('1');
        expect(paths[0].type).toBe('taxNumber');
        expect(paths[0].bounds).toBeDefined();

        expect(paths[1].text).toBe('2');
        expect(paths[1].type).toBe('taxNumber');
    });

    it('handles compression properly', () => {
        const taxNumber: ITaxNumber = {
            code: 'A',
            compression: 0.5,
            fontHeight: 2,
            fontFamily: 'Arial',
            fontWidth: 2,
            letterSpacing: 0,
            positionY: 5,
            totalWidth: 10,
            fontWeight: 'bold',
        };

        utils.drawTaxNumber(ctx, taxNumber, 100, 100, 'blue');

        expect(ctx.font).toBe('bold 20px Arial');
        expect(ctx.fillStyle).toBe('blue');
        expect(ctx.scale).toHaveBeenCalledWith(0.5, 1.35);

        const paths = utils.getTextPaths();
        expect(paths).toHaveLength(1);
        expect(paths[0].text).toBe('A');
    });
});