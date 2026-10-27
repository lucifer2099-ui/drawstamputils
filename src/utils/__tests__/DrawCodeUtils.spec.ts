import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DrawCodeUtils } from '../DrawCodeUtils';
import { ICode } from '../../DrawStampTypes';

describe('DrawCodeUtils', () => {
    let ctx: any;
    const mmToPixel = 10;
    let utils: DrawCodeUtils;

    beforeEach(() => {
        utils = new DrawCodeUtils(mmToPixel);

        ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            scale: vi.fn(),
            fillText: vi.fn(),
            measureText: vi.fn().mockReturnValue({ width: 20 }),
            font: '',
            fillStyle: '',
            textAlign: '',
            textBaseline: '',
        };

        // Mock Path2D
        global.Path2D = vi.fn().mockImplementation(() => ({
            // mock implementation if needed
        })) as unknown as typeof Path2D;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('initializes correctly and returns empty text paths', () => {
        expect(utils.getTextPaths()).toEqual([]);
    });

    it('clears text paths', () => {
        const code: ICode = {
            code: 'A',
            compression: 1,
            fontHeight: 2,
            fontFamily: 'Arial',
            borderOffset: 1,
            fontWidth: 2,
            textDistributionFactor: 1,
            fontWeight: 'normal'
        };
        utils.drawCode(ctx, code, 100, 100, 50, 50, 'red');
        expect(utils.getTextPaths().length).toBe(1);

        utils.clearTextPaths();
        expect(utils.getTextPaths().length).toBe(0);
    });

    it('draws a single character code correctly', () => {
        const code: ICode = {
            code: '1',
            compression: 1,
            fontHeight: 3, // fontSize = 30
            fontFamily: 'Arial',
            borderOffset: 1, // offset = 10
            fontWidth: 2,
            textDistributionFactor: 1,
            fontWeight: 'bold',
            color: 'blue'
        };

        utils.drawCode(ctx, code, 100, 100, 50, 50, 'blue');

        expect(ctx.save).toHaveBeenCalledTimes(2);
        expect(ctx.restore).toHaveBeenCalledTimes(2);

        expect(ctx.font).toBe('bold 30px Arial');
        expect(ctx.fillStyle).toBe('blue');
        expect(ctx.textAlign).toBe('center');
        expect(ctx.textBaseline).toBe('middle');

        // y = 100(centerY) + 50(radiusY) - 30(fontSize) - 10(borderOffset) = 110
        expect(ctx.translate).toHaveBeenCalledWith(100, 110);
        expect(ctx.scale).toHaveBeenCalledWith(1, 1);
        expect(ctx.fillText).toHaveBeenCalledWith('1', 0, 0);

        const paths = utils.getTextPaths();
        expect(paths.length).toBe(1);
        expect(paths[0].text).toBe('1');
        expect(paths[0].type).toBe('code');
        expect(paths[0].bounds).toEqual({
            x: 100 - (20 * 1) / 2, // x - (width * compression) / 2 = 100 - 10 = 90
            y: 110 - 30 / 2,       // y - fontSize / 2 = 110 - 15 = 95
            width: 20,             // width * compression = 20
            height: 30             // fontSize = 30
        });
    });

    it('draws multiple characters code correctly', () => {
        const code: ICode = {
            code: '123',
            compression: 0.8,
            fontHeight: 2, // fontSize = 20
            fontFamily: 'Arial',
            borderOffset: 0.5, // offset = 5
            fontWidth: 2,
            textDistributionFactor: 1,
            fontWeight: 'normal',
            color: 'red'
        };

        const centerX = 100;
        const centerY = 100;
        const radiusX = 50;
        const radiusY = 50;

        utils.drawCode(ctx, code, centerX, centerY, radiusX, radiusY, 'red');

        expect(ctx.save).toHaveBeenCalledTimes(4); // 1 global + 3 for chars
        expect(ctx.restore).toHaveBeenCalledTimes(4); // 1 global + 3 for chars

        // Total angle logic:
        // characterCount = 3
        // textDistributionFactor = 1
        // totalAngle = Math.PI * ((1 + 3) / 1) = 4 * Math.PI
        // startAngle = Math.PI / 2 + 4 * Math.PI / 2 = 2.5 * Math.PI
        // anglePerChar = 4 * Math.PI / (3 - 1) = 2 * Math.PI

        // char 1 (index 0): angle = 2.5 * Math.PI
        // Math.cos(2.5PI) = 0, Math.sin(2.5PI) = 1
        // x = 100 + 0 * (50 - 10 - 5) = 100
        // y = 100 + 1 * (50 - 10 - 5) = 135

        expect(ctx.translate).toHaveBeenCalledWith(expect.closeTo(100), expect.closeTo(135));
        expect(ctx.rotate).toHaveBeenCalledWith(expect.closeTo(2.5 * Math.PI - Math.PI / 2));
        expect(ctx.scale).toHaveBeenCalledWith(0.8, 1);
        expect(ctx.fillText).toHaveBeenCalledWith('1', 0, 0);

        const paths = utils.getTextPaths();
        expect(paths.length).toBe(3);

        expect(paths[0].text).toBe('1');
        expect(paths[1].text).toBe('2');
        expect(paths[2].text).toBe('3');

        expect(paths[0].bounds).toEqual({
            x: expect.closeTo(100 - (20 * 0.8) / 2),
            y: expect.closeTo(135 - 20 / 2),
            width: 20 * 0.8,
            height: 20
        });
    });
});
