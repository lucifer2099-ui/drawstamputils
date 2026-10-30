import { describe, it, expect } from 'vitest';
import { InitDrawStampConfigsUtils } from '../InitDrawStampConfigsUtils';

describe('InitDrawStampConfigsUtils', () => {
    it('returns expected default configuration', () => {
        const utils = new InitDrawStampConfigsUtils();
        const configs = utils.initDrawStampConfigs();

        expect(configs).toBeDefined();

        // Assert specific configuration values that are part of the default config
        expect(configs.primaryColor).toBe('blue');
        expect(configs.ruler.showRuler).toBe(true);
        expect(configs.companyList[0].companyName).toBe('绘制印章有限责任公司');
        expect(configs.stampType.stampType).toBe('印章类型');
        expect(configs.width).toBe(40);
        expect(configs.height).toBe(30);
    });
});
