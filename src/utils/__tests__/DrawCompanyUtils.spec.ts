import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrawCompanyUtils } from '../DrawCompanyUtils';
import { ICompany } from '../../DrawStampTypes';

// Mock Path2D
class MockPath2D {
    rect = vi.fn();
}
global.Path2D = MockPath2D as any;

describe('DrawCompanyUtils', () => {
    let drawCompanyUtils: DrawCompanyUtils;
    let ctx: any;

    beforeEach(() => {
        drawCompanyUtils = new DrawCompanyUtils(10);
        ctx = {
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
            font: '',
            fillStyle: '',
            textAlign: '',
            textBaseline: '',
            globalCompositeOperation: '',
            strokeStyle: '',
            lineWidth: 0,
            lineCap: '',
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            arc: vi.fn(),
        };
    });

    it('should initialize with empty text paths', () => {
        expect(drawCompanyUtils.getTextPaths()).toEqual([]);
    });

    it('should clear text paths', () => {
        drawCompanyUtils['textPaths'] = [{ text: 'A', type: 'company', bounds: { x: 0, y: 0, width: 10, height: 10 } }];
        drawCompanyUtils.clearTextPaths();
        expect(drawCompanyUtils.getTextPaths()).toEqual([]);
    });

    it('should draw company list', () => {
        const spyDrawCompanyName = vi.spyOn(drawCompanyUtils, 'drawCompanyName').mockImplementation(() => {});
        const companyList: ICompany[] = [{
            companyName: 'Test Company',
            compression: 1,
            borderOffset: 1,
            textDistributionFactor: 1,
            fontFamily: 'Arial',
            fontHeight: 12,
            fontWeight: 'normal',
            shape: 'ellipse',
            adjustEllipseText: false,
            adjustEllipseTextFactor: 1,
            startAngle: 0,
            rotateDirection: 'clockwise',
            rectangleTextDirection: 'horizontal',
            rectangleTextPosition: 'center',
            rectangleTextAlignment: 'center',
            rectangleVerticalAlignment: 'center',
            rectangleLineSpacing: 0,
            rectangleTextMargin: 0,
            color: 'red'
        }];

        drawCompanyUtils.drawCompanyList(ctx, companyList, 100, 100, 50, 25, 'blue');
        expect(spyDrawCompanyName).toHaveBeenCalledTimes(1);
        expect(spyDrawCompanyName).toHaveBeenCalledWith(ctx, companyList[0], 100, 100, 50, 25, 'red');
    });

    it('should draw ellipse text', () => {
        const company: ICompany = {
            companyName: 'Test Company',
            compression: 1,
            borderOffset: 1,
            textDistributionFactor: 1,
            fontFamily: 'Arial',
            fontHeight: 12,
            fontWeight: 'normal',
            shape: 'ellipse',
            adjustEllipseText: false,
            adjustEllipseTextFactor: 1,
            startAngle: 0,
            rotateDirection: 'clockwise',
            rectangleTextDirection: 'horizontal',
            rectangleTextPosition: 'center',
            rectangleTextAlignment: 'center',
            rectangleVerticalAlignment: 'center',
            rectangleLineSpacing: 0,
            rectangleTextMargin: 0
        };

        drawCompanyUtils.drawCompanyName(ctx, company, 100, 100, 50, 25, 'blue');

        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
        expect(ctx.fillText).toHaveBeenCalledTimes(company.companyName.length);
        expect(drawCompanyUtils.getTextPaths().length).toBe(company.companyName.length);
        expect(drawCompanyUtils.getTextPaths()[0].text).toBe('T');
    });

    it('should draw rectangle text', () => {
        const company: ICompany = {
            companyName: 'Test Company',
            compression: 1,
            borderOffset: 1,
            textDistributionFactor: 1,
            fontFamily: 'Arial',
            fontHeight: 12,
            fontWeight: 'normal',
            shape: 'rectangle',
            adjustEllipseText: false,
            adjustEllipseTextFactor: 1,
            startAngle: 0,
            rotateDirection: 'clockwise',
            rectangleTextDirection: 'horizontal',
            rectangleTextPosition: 'center',
            rectangleTextAlignment: 'center',
            rectangleVerticalAlignment: 'center',
            rectangleLineSpacing: 0,
            rectangleTextMargin: 0
        };

        const spyDrawHorizontalTextWithWrap = vi.spyOn(drawCompanyUtils as any, 'drawHorizontalTextWithWrap');

        drawCompanyUtils.drawCompanyName(ctx, company, 100, 100, 50, 25, 'blue');

        expect(spyDrawHorizontalTextWithWrap).toHaveBeenCalled();
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });

    it('should draw rectangle text vertically', () => {
        const company: ICompany = {
            companyName: 'Test Company',
            compression: 1,
            borderOffset: 1,
            textDistributionFactor: 1,
            fontFamily: 'Arial',
            fontHeight: 12,
            fontWeight: 'normal',
            shape: 'rectangle',
            adjustEllipseText: false,
            adjustEllipseTextFactor: 1,
            startAngle: 0,
            rotateDirection: 'clockwise',
            rectangleTextDirection: 'vertical',
            rectangleTextPosition: 'center',
            rectangleTextAlignment: 'center',
            rectangleVerticalAlignment: 'center',
            rectangleLineSpacing: 0,
            rectangleTextMargin: 0
        };

        const spyDrawVerticalTextWithWrap = vi.spyOn(drawCompanyUtils as any, 'drawVerticalTextWithWrap');

        drawCompanyUtils.drawCompanyName(ctx, company, 100, 100, 50, 25, 'blue');

        expect(spyDrawVerticalTextWithWrap).toHaveBeenCalled();
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });

    it('should apply aging to text if drawAging is true', () => {
         const company: ICompany = {
            companyName: 'A',
            compression: 1,
            borderOffset: 1,
            textDistributionFactor: 1,
            fontFamily: 'Arial',
            fontHeight: 12,
            fontWeight: 'normal',
            shape: 'ellipse',
            adjustEllipseText: false,
            adjustEllipseTextFactor: 1,
            startAngle: 0,
            rotateDirection: 'clockwise',
            rectangleTextDirection: 'horizontal',
            rectangleTextPosition: 'center',
            rectangleTextAlignment: 'center',
            rectangleVerticalAlignment: 'center',
            rectangleLineSpacing: 0,
            rectangleTextMargin: 0,
            drawAging: true,
            agingIntensity: 50,
            agingNoiseSize: 0.15
        };

        const spyApplyTextAgingAt = vi.spyOn(drawCompanyUtils as any, 'applyTextAgingAt');

        drawCompanyUtils.drawCompanyName(ctx, company, 100, 100, 50, 25, 'blue');

        expect(spyApplyTextAgingAt).toHaveBeenCalled();
    });
});
