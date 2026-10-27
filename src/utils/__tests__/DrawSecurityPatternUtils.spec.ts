import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrawSecurityPatternUtils } from '../DrawSecurityPatternUtils';
import { ISecurityPattern } from '../../DrawStampTypes';

describe('DrawSecurityPatternUtils', () => {
    let ctx: any;
    let utils: DrawSecurityPatternUtils;
    let securityPattern: ISecurityPattern;

    beforeEach(() => {
        ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            strokeStyle: '',
            lineWidth: 0,
            globalCompositeOperation: '',
        };

        utils = new DrawSecurityPatternUtils(10); // mmToPixel = 10

        securityPattern = {
            openSecurityPattern: true,
            securityPatternWidth: 0.5,
            securityPatternLength: 2,
            securityPatternCount: 5,
            securityPatternAngleRange: 30,
            securityPatternParams: [],
        };
    });

    it('generates new parameters when securityPatternParams is empty', () => {
        utils.drawSecurityPattern(ctx, securityPattern, 100, 100, 50, 50, false);

        expect(securityPattern.securityPatternParams).toHaveLength(5);
        expect(ctx.save).toHaveBeenCalledOnce();
        expect(ctx.strokeStyle).toBe('#FFFFFF');
        expect(ctx.lineWidth).toBe(5); // 0.5 * 10
        expect(ctx.globalCompositeOperation).toBe('destination-out');
        expect(ctx.beginPath).toHaveBeenCalledTimes(5);
        expect(ctx.moveTo).toHaveBeenCalledTimes(5);
        expect(ctx.lineTo).toHaveBeenCalledTimes(5);
        expect(ctx.stroke).toHaveBeenCalledTimes(5);
        expect(ctx.restore).toHaveBeenCalledOnce();
    });

    it('generates new parameters when forceRefresh is true', () => {
        securityPattern.securityPatternParams = [
            { angle: 0, lineAngle: 0 },
        ];
        const oldParams = [...securityPattern.securityPatternParams];

        utils.drawSecurityPattern(ctx, securityPattern, 100, 100, 50, 50, true);

        expect(securityPattern.securityPatternParams).toHaveLength(5);
        expect(securityPattern.securityPatternParams).not.toEqual(oldParams);
        expect(ctx.beginPath).toHaveBeenCalledTimes(5);
    });

    it('reuses existing parameters when forceRefresh is false', () => {
        const testParams = [
            { angle: 0, lineAngle: Math.PI / 4 }, // 45 degrees
            { angle: Math.PI / 2, lineAngle: Math.PI / 2 } // 90 degrees
        ];
        securityPattern.securityPatternParams = [...testParams];

        utils.drawSecurityPattern(ctx, securityPattern, 100, 100, 50, 50, false);

        expect(securityPattern.securityPatternParams).toEqual(testParams);
        expect(ctx.beginPath).toHaveBeenCalledTimes(2);
        expect(ctx.moveTo).toHaveBeenCalledTimes(2);
        expect(ctx.lineTo).toHaveBeenCalledTimes(2);
        expect(ctx.stroke).toHaveBeenCalledTimes(2);
    });

    it('generates new parameters when securityPatternParams is undefined', () => {
        (securityPattern as any).securityPatternParams = undefined;

        utils.drawSecurityPattern(ctx, securityPattern, 100, 100, 50, 50, false);

        expect(securityPattern.securityPatternParams).toBeDefined();
        expect(securityPattern.securityPatternParams).toHaveLength(5);
        expect(ctx.beginPath).toHaveBeenCalledTimes(5);
    });

    it('calculates correct coordinates for lines', () => {
        // Mock a specific scenario to calculate coordinates
        // angle: 0 (right edge of circle)
        // x = 100 + 50 * cos(0) = 150
        // y = 100 + 50 * sin(0) = 100
        // length = 2 * 10 = 20
        // lineAngle: 0 (horizontal line)
        // startX = 150 - (20/2) * cos(0) = 140
        // startY = 100 - (20/2) * sin(0) = 100
        // endX = 150 + (20/2) * cos(0) = 160
        // endY = 100 + (20/2) * sin(0) = 100

        securityPattern.securityPatternParams = [
            { angle: 0, lineAngle: 0 }
        ];

        utils.drawSecurityPattern(ctx, securityPattern, 100, 100, 50, 50, false);

        expect(ctx.moveTo).toHaveBeenCalledWith(140, 100);
        expect(ctx.lineTo).toHaveBeenCalledWith(160, 100);
    });
});
