import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SvgCacheUtils } from '../SvgCacheUtils';
import { ISvgShape } from '../../DrawStampTypes';

describe('SvgCacheUtils', () => {
    let callback: ReturnType<typeof vi.fn>;
    let svgCache: SvgCacheUtils;

    beforeEach(() => {
        callback = vi.fn();
        svgCache = new SvgCacheUtils(callback);
    });

    it('generates consistent cache key based on id, version and color', () => {
        const svg1: ISvgShape = {
            id: 'svg-1',
            svgContent: '<svg></svg>',
            color: '#ff0000',
            version: 1,
        } as unknown as ISvgShape;

        const key1 = svgCache.getSvgCacheKey(svg1);
        expect(key1).toBe('svg-1-1-#ff0000');

        const svg2: ISvgShape = {
            id: 'svg-2',
            svgContent: '<svg></svg>',
        } as unknown as ISvgShape;

        const key2 = svgCache.getSvgCacheKey(svg2);
        expect(key2).toBe('svg-2-0-');
    });

    it('returns undefined when bitmap is not cached', () => {
        const svg: ISvgShape = {
            id: 'test',
            svgContent: '<svg></svg>',
        } as unknown as ISvgShape;

        expect(svgCache.getSvgBitmap(svg)).toBeUndefined();
    });

    it('clears caches on resetSvgCache', () => {
        const svg: ISvgShape = {
            id: 'test-reset',
            svgContent: '<svg></svg>',
        } as unknown as ISvgShape;

        svgCache.resetSvgCache();
        expect(svgCache.getSvgBitmap(svg)).toBeUndefined();
    });

    it('does not load if svgContent is empty', () => {
        const svg = {
            id: 'empty-svg',
            svgContent: '',
        } as unknown as ISvgShape;

        svgCache.scheduleSvgBitmapLoad(svg, '#ff0000');
        expect(callback).not.toHaveBeenCalled();
    });
});
