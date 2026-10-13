import { ISvgShape } from '../DrawStampTypes';

export class SvgCacheUtils {
    private svgBitmapCache: Map<string, ImageBitmap> = new Map();
    private pendingSvgLoads: Map<string, Promise<void>> = new Map();
    private onLoadCallback: () => void;

    constructor(onLoadCallback: () => void) {
        this.onLoadCallback = onLoadCallback;
    }

    public getSvgBitmap(svg: ISvgShape): ImageBitmap | undefined {
        const cacheKey = this.getSvgCacheKey(svg);
        return this.svgBitmapCache.get(cacheKey);
    }

    public resetSvgCache() {
        this.svgBitmapCache.clear();
        this.pendingSvgLoads.clear();
    }

    public getSvgCacheKey(svg: ISvgShape) {
        return `${svg.id}-${svg.version ?? 0}-${svg.color || ''}`;
    }

    public scheduleSvgBitmapLoad(svg: ISvgShape, primaryColor: string) {
        if (!svg.svgContent) return;
        const cacheKey = this.getSvgCacheKey(svg);
        if (this.pendingSvgLoads.has(cacheKey)) {
            return;
        }
        const loadPromise = this.createSvgBitmap(svg, primaryColor)
            .then((bitmap) => {
                if (bitmap) {
                    this.svgBitmapCache.set(cacheKey, bitmap);
                }
            })
            .catch((error) => {
                console.error('加载 SVG 图片失败:', error);
            })
            .finally(() => {
                this.pendingSvgLoads.delete(cacheKey);
                this.onLoadCallback();
            });
        this.pendingSvgLoads.set(cacheKey, loadPromise);
    }

    private async createSvgBitmap(svg: ISvgShape, primaryColor: string): Promise<ImageBitmap | null> {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(svg.svgContent, 'image/svg+xml');
            const svgElement = doc.documentElement;
            if (!svgElement) return null;

            const color = svg.color || primaryColor || '#d40000';
            const style = doc.createElement('style');
            style.textContent = `* { fill: ${color} !important; stroke: ${color} !important; }`;
            svgElement.insertBefore(style, svgElement.firstChild);

            if (!svgElement.getAttribute('viewBox')) {
                const widthAttr = svgElement.getAttribute('width');
                const heightAttr = svgElement.getAttribute('height');
                if (widthAttr && heightAttr) {
                    const widthValue = parseFloat(widthAttr);
                    const heightValue = parseFloat(heightAttr);
                    if (!Number.isNaN(widthValue) && !Number.isNaN(heightValue) && widthValue > 0 && heightValue > 0) {
                        svgElement.setAttribute('viewBox', `0 0 ${widthValue} ${heightValue}`);
                    }
                }
            }

            if (svg.color) {
                this.applyColorToSvg(svgElement, svg.color);
            }

            if (!svgElement.getAttribute('width')) {
                svgElement.setAttribute('width', '100');
            }
            if (!svgElement.getAttribute('height')) {
                svgElement.setAttribute('height', '100');
            }

            const svgString = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const objectUrl = URL.createObjectURL(blob);
            try {
                const bitmap = await new Promise<ImageBitmap>((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        createImageBitmap(img).then(resolve).catch(reject);
                    };
                    img.onerror = (err) => reject(err);
                    img.src = objectUrl;
                });
                return bitmap;
            } finally {
                URL.revokeObjectURL(objectUrl);
            }
        } catch (error) {
            console.error('创建 SVG 位图失败:', error);
            return null;
        }
    }

    private applyColorToSvg(element: Element, color: string) {
        const tagName = element.tagName.toLowerCase();
        const hasFill = element.hasAttribute('fill');
        const hasStroke = element.hasAttribute('stroke');

        if (!hasFill || tagName === 'svg' || tagName === 'g') {
            element.setAttribute('fill', color);
        }
        if (!hasStroke && tagName !== 'image') {
            element.setAttribute('stroke', color);
        }

        Array.from(element.children).forEach((child) => this.applyColorToSvg(child, color));
    }
}
