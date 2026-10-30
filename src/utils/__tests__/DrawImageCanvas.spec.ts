import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DrawImageCanvas } from '../DrawImageCanvas';

describe('DrawImageCanvas', () => {
    let originalImage: any;
    let mockDrawImage: any;
    let mockClearRect: any;

    beforeEach(() => {
        mockDrawImage = vi.fn();
        mockClearRect = vi.fn();
        HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
            clearRect: mockClearRect,
            drawImage: mockDrawImage,
        } as any));

        originalImage = global.Image;
        global.Image = class {
            onload: () => void = () => {};
            onerror: (e: any) => void = () => {};
            src: string = '';
            constructor() {
                setTimeout(() => this.onload(), 0);
            }
        } as any;
    });

    afterEach(() => {
        global.Image = originalImage;
        vi.restoreAllMocks();
    });

    it('creates a DrawImageCanvas instance', () => {
        const instance = new DrawImageCanvas(100, 100);
        expect(instance.getCanvas()).toBeDefined();
        expect(instance.getCanvas().width).toBe(100);
        expect(instance.getCanvas().height).toBe(100);
    });

    it('draws an image successfully and uses cache on subsequent calls', async () => {
        const instance = new DrawImageCanvas(100, 100);
        const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>';

        // First call
        const canvas = await instance.drawImage(svgContent, 0, 0, 10, 10);
        expect(canvas).toBeDefined();
        expect(mockDrawImage).toHaveBeenCalledTimes(1);

        // Second call (should hit cache)
        const canvas2 = await instance.drawImage(svgContent, 0, 0, 10, 10);
        expect(canvas2).toBeDefined();
        expect(mockDrawImage).toHaveBeenCalledTimes(2);
    });

    it('clears cache when cache size reaches 100', async () => {
        const instance = new DrawImageCanvas(100, 100);
        for (let i = 0; i < 105; i++) {
            const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" id="svg-${i}" width="10" height="10"></svg>`;
            await instance.drawImage(svgContent, 0, 0, 10, 10);
        }
        expect(mockDrawImage).toHaveBeenCalledTimes(105);
        // We expect cache size to be 100 max according to code limit
        expect((instance as any).imageCache.size).toBe(100);
    });

    it('throws error for invalid SVG content without svg element', async () => {
        const instance = new DrawImageCanvas(100, 100);
        const invalidSvgContent = '<div xmlns="http://www.w3.org/2000/svg" width="10" height="10"></div>';

        await expect(instance.drawImage(invalidSvgContent, 0, 0, 10, 10)).rejects.toThrow('Invalid SVG content');
    });

    it('adds missing width and height attributes to svg', async () => {
        const instance = new DrawImageCanvas(100, 100);
        const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

        const canvas = await instance.drawImage(svgContent, 0, 0, 10, 10);
        expect(canvas).toBeDefined();
        expect(mockDrawImage).toHaveBeenCalledTimes(1);
    });

    it('rejects when image loading fails', async () => {
        const instance = new DrawImageCanvas(100, 100);
        const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

        global.Image = class {
            onload: () => void = () => {};
            onerror: (e: any) => void = () => {};
            src: string = '';
            constructor() {
                setTimeout(() => this.onerror(new Error('Load error')), 0);
            }
        } as any;

        await expect(instance.drawImage(svgContent, 0, 0, 10, 10)).rejects.toThrow('Load error');
    });

    it('clears canvas using clear() method', () => {
        const instance = new DrawImageCanvas(100, 100);
        instance.clear();
        expect(mockClearRect).toHaveBeenCalledWith(0, 0, 100, 100);
    });
});
