import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrawStampTypeUtils } from '../DrawStampTypeUtils';
import { IStampType } from '../../DrawStampTypes';

describe('DrawStampTypeUtils', () => {
    let utils: DrawStampTypeUtils;
    let mockCtx: any;

    beforeEach(() => {
        utils = new DrawStampTypeUtils(10); // mmToPixel = 10
        mockCtx = {
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            scale: vi.fn(),
            fillText: vi.fn(),
            measureText: vi.fn().mockReturnValue({ width: 10 }),
            beginPath: vi.fn(),
            ellipse: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            arc: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
        };
    });

    it('should initialize and clear text paths correctly', () => {
        expect(utils.getTextPaths()).toEqual([]);

        const stampType: IStampType = {
            stampType: 'Test',
            fontHeight: 5,
            fontFamily: 'Arial',
            compression: 1,
            letterSpacing: 0,
            positionY: 0,
            fontWidth: 5,
            fontWeight: 'normal',
            lineSpacing: 0
        };
        utils.drawStampTypeList(mockCtx, [stampType], 50, 50, 40, '#ff0000');

        expect(utils.getTextPaths().length).toBeGreaterThan(0);

        utils.clearTextPaths();
        expect(utils.getTextPaths()).toEqual([]);
    });

    it('should draw horizontal text properly with defaults', () => {
        const stampType: IStampType = {
            stampType: 'Test\nLine2',
            fontHeight: 5,
            fontFamily: 'Arial',
            compression: 0.8,
            letterSpacing: 1,
            positionY: 2,
            fontWidth: 5,
            fontWeight: 'bold',
            fontStyle: 'italic',
            lineSpacing: 1,
            orientation: 'horizontal',
            rotation: 45,
            positionX: 0
        };

        utils.drawStampTypeList(mockCtx, [stampType], 100, 100, 40, '#000000');
        const paths = utils.getTextPaths();
        expect(paths.length).toBe(9);
    });

    it('should draw horizontal text with textBaseline default to bottom coverage', () => {
        // We will call the private applyTextAgingAt method with textBaseline = 'bottom'
        // to cover that path (the main drawStampType hardcodes textBaseline = 'middle',
        // so to cover 'bottom' we can just use `any` to call it)
        const applyTextAgingAt = (utils as any).applyTextAgingAt.bind(utils);
        applyTextAgingAt(mockCtx, 10, 'bottom', 10, true, 10, 0.15, 0, 0);
        expect(mockCtx.ellipse).toHaveBeenCalled();
    });

    it('should draw vertical text properly with defaults', () => {
        const stampType: IStampType = {
            stampType: 'Vertical\nText',
            fontHeight: 4,
            fontFamily: 'SimSun',
            compression: 1.2,
            letterSpacing: 0.5,
            positionY: -2,
            fontWidth: 4,
            fontWeight: 400,
            lineSpacing: 2,
            orientation: 'vertical',
            rotation: 0
        };

        utils.drawStampTypeList(mockCtx, [stampType], 100, 100, 40, '#0000ff');
        const paths = utils.getTextPaths();
        expect(paths.length).toBe(12);
    });

    it('should draw vertical text properly with rotation', () => {
        const stampType: IStampType = {
            stampType: 'Vertical\nText',
            fontHeight: 4, // fontSize = 40
            fontFamily: 'SimSun',
            compression: 1.2,
            letterSpacing: 0.5, // 5px
            positionX: 5, // 50px
            positionY: -2, // -20px
            fontWidth: 4,
            fontWeight: 400,
            lineSpacing: 2, // 20px
            orientation: 'vertical',
            rotation: 90 // test rotation for vertical
        };

        utils.drawStampTypeList(mockCtx, [stampType], 100, 100, 40, '#0000ff');

        // 'Vertical' (8 chars) + 'Text' (4 chars) = 12 chars
        const paths = utils.getTextPaths();
        expect(paths.length).toBe(12);

        // Vertical calls translate for EACH CHAR
        expect(mockCtx.translate).toHaveBeenCalledTimes(12);
        expect(mockCtx.rotate).toHaveBeenCalledTimes(12);
        expect(mockCtx.scale).toHaveBeenCalledTimes(12);
    });

    it('should handle missing drawAging and defaults in applyTextAgingAt', () => {
        const stampType: IStampType = {
            stampType: 'ABC',
            fontHeight: 5,
            fontFamily: 'Arial',
            compression: 1,
            letterSpacing: 0,
            positionY: 0,
            fontWidth: 5,
            fontWeight: 'normal',
            lineSpacing: 0,
            orientation: 'horizontal',
            drawAging: true,
            // agingIntensity missing -> default 50
            // agingNoiseSize missing -> default 0.15
        };

        utils.drawStampTypeList(mockCtx, [stampType], 100, 100, 40, '#000000');
        expect(mockCtx.ellipse).toHaveBeenCalled();
    });

    it('should cover all aging effect random branches', () => {
        const stampType: IStampType = {
            stampType: 'A',
            fontHeight: 5,
            fontFamily: 'Arial',
            compression: 1,
            letterSpacing: 0,
            positionY: 0,
            fontWidth: 5,
            fontWeight: 'normal',
            lineSpacing: 0,
            orientation: 'vertical',
            drawAging: true,
            agingIntensity: 100, // 100 * 0.05 = 5 points
            agingNoiseSize: 0.5
        };

        let counter = 0;
        vi.spyOn(Math, 'random').mockImplementation(() => {
            const index = Math.floor(counter / 8); // Math.random is called 8-10 times per point
            counter++;
            if (index % 3 === 0) return 0.5; // < 0.6 branch (ellipse)
            if (index % 3 === 1) return 0.7; // < 0.85 branch (lineTo)
            return 0.9; // else branch (arc)
        });

        utils.drawStampTypeList(mockCtx, [stampType], 100, 100, 40, '#000000');

        expect(mockCtx.globalCompositeOperation).toBe('destination-out');
        expect(mockCtx.ellipse).toHaveBeenCalled();
        expect(mockCtx.lineTo).toHaveBeenCalled();
        expect(mockCtx.arc).toHaveBeenCalled();

        vi.restoreAllMocks();
    });

    it('should not throw if drawAging is explicitly false for applyTextAgingAt', () => {
        const applyTextAgingAt = (utils as any).applyTextAgingAt.bind(utils);
        applyTextAgingAt(mockCtx, 10, 'middle', 10, false, 10, 0.15, 0, 0);
        expect(mockCtx.save).not.toHaveBeenCalled();
    });

    it('should use default fontStyle, fontWeight and positionX when missing', () => {
        const stampType: IStampType = {
            stampType: 'A',
            fontHeight: 5,
            fontFamily: 'Arial',
            compression: 1,
            letterSpacing: 0,
            positionY: 0,
            fontWidth: 5,
            fontWeight: '',
            lineSpacing: 0,
            orientation: 'horizontal'
        };
        utils.drawStampTypeList(mockCtx, [stampType], 100, 100, 40, '#000000');
        expect(mockCtx.font).toContain('normal normal');
    });
});
