import { describe, it, expect } from 'vitest';
import { InitDrawStampConfigsUtils } from '../InitDrawStampConfigsUtils';

describe('InitDrawStampConfigsUtils', () => {
    it('should initialize and return default configs correctly', () => {
        const utils = new InitDrawStampConfigsUtils();
        const configs = utils.initDrawStampConfigs();

        expect(configs).toBeDefined();

        // Check general layout properties
        expect(configs.width).toBe(40);
        expect(configs.height).toBe(30);
        expect(configs.borderWidth).toBe(1);
        expect(configs.primaryColor).toBe('blue');
        expect(configs.scale).toBe(1);
        expect(configs.offsetX).toBe(0);
        expect(configs.offsetY).toBe(0);
        expect(configs.mmToPixel).toBe(0);

        // Check nested default components
        expect(configs.roughEdge).toBeDefined();
        expect(configs.roughEdge?.drawRoughEdge).toBe(true);

        expect(configs.ruler).toBeDefined();
        expect(configs.ruler?.showRuler).toBe(true);

        expect(configs.drawStar).toBeDefined();
        expect(configs.drawStar?.starDiameter).toBe(14);

        expect(configs.securityPattern).toBeDefined();
        expect(configs.securityPattern?.openSecurityPattern).toBe(true);

        expect(configs.company).toBeDefined();
        expect(configs.company?.companyName).toBe('印章绘制有限责任公司');

        expect(configs.stampCode).toBeDefined();
        expect(configs.stampCode?.code).toBe('1234567890');

        expect(configs.taxNumber).toBeDefined();
        expect(configs.taxNumber?.code).toBe('000000000000000000');

        expect(configs.agingEffect).toBeDefined();
        expect(configs.agingEffect?.applyAging).toBe(false);

        expect(configs.innerCircle).toBeDefined();
        expect(configs.innerCircle?.drawInnerCircle).toBe(true);

        expect(configs.outThinCircle).toBeDefined();
        expect(configs.outThinCircle?.drawInnerCircle).toBe(true);

        expect(configs.outBorder).toBeDefined();
        expect(configs.outBorder?.drawInnerCircle).toBe(true);

        // Check list components defaults
        expect(configs.stampTypeList).toBeDefined();
        expect(configs.stampTypeList?.length).toBe(1);
        expect(configs.stampTypeList?.[0].stampType).toBe('印章类型');

        expect(configs.stampCodeList).toBeDefined();
        expect(configs.stampCodeList?.length).toBe(1);
        expect(configs.stampCodeList?.[0].code).toBe('1234567890');

        expect(configs.companyList).toBeDefined();
        expect(configs.companyList?.length).toBe(1);
        expect(configs.companyList?.[0].companyName).toBe('绘制印章有限责任公司');

        expect(configs.innerCircleList).toBeDefined();
        expect(configs.innerCircleList?.length).toBe(0);

        expect(configs.imageList).toBeDefined();
        expect(configs.imageList?.length).toBe(0);

        expect(configs.svgList).toBeDefined();
        expect(configs.svgList?.length).toBe(0);

        expect(configs.lineList).toBeDefined();
        expect(configs.lineList?.length).toBe(0);
    });
});
