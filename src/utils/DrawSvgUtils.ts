import { IDrawStar } from "../DrawStampTypes";

export class DrawSvgUtils {

    private mmToPixel = 10

    constructor(mmToPixel: number) {
        this.mmToPixel = mmToPixel
    }

    /**
     * 绘制SVG内容
     */
    private async drawSVGContent(
        ctx: CanvasRenderingContext2D,
        svgContent: string,
        x: number,
        y: number,
        scale: number = 1
    ) {
        try {
            // 先绘制一个固定大小的矩形（10mm x 10mm）
            const rectSize = 10 * this.mmToPixel;
            // ctx.save();
            // ctx.translate(x, y);
            // ctx.scale(1, 1);
            // ctx.strokeStyle = 'blue';
            // ctx.lineWidth = 1;
            // ctx.strokeRect(10, 10, rectSize, rectSize);
            // ctx.restore();

            // 使用 DOMParser 安全地解析 SVG 内容，避免 XSS 风险
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgContent, 'image/svg+xml');

            // 检查解析错误
            const parserError = doc.querySelector('parsererror');
            if (parserError) {
                throw new Error('Invalid SVG content: ' + parserError.textContent);
            }

            const svgElement = doc.querySelector('svg');
            if (!svgElement) {
                throw new Error('Invalid SVG content');
            }

            // 确保 SVG 有宽高属性
            if (!svgElement.hasAttribute('width')) {
                svgElement.setAttribute('width', '100');
            }
            if (!svgElement.hasAttribute('height')) {
                svgElement.setAttribute('height', '100');
            }

            const svgWidth = parseFloat(svgElement.getAttribute('width') || '100');
            const svgHeight = parseFloat(svgElement.getAttribute('height') || '100');

            // 将 SVG 转换为 base64
            const svgString = new XMLSerializer().serializeToString(svgElement);
            // Securely encode string to base64, avoiding unescape on user-controlled string
            const bytes = new TextEncoder().encode(svgString);
            let binString = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binString += String.fromCharCode(bytes[i]);
            }
            const base64Data = btoa(binString);
            const base64Url = `data:image/svg+xml;base64,${base64Data}`;
            const tempImg = new Image();
            tempImg.src = base64Url;
            // 等待图片加载完成
            await new Promise((resolve, reject) => {
                tempImg.onload = resolve;
                tempImg.onerror = reject;
            });

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(1, 1);
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 1;
            ctx.strokeRect(10, 10, rectSize, rectSize);
            ctx.restore();
            console.log("draw svg base64Url")
        } catch (error) {
            console.error('Error drawing SVG:', error);
        }
    }

    /**
     * 从文件加载并绘制SVG
     */
    async loadAndDrawSVG(
        ctx: CanvasRenderingContext2D,
        svgPath: string,
        x: number,
        y: number,
        scale: number = 1
    ) {
        try {
            const rectSize = 10 * this.mmToPixel;
            // ctx.save();
            // ctx.translate(x, y);
            // ctx.scale(1, 1);
            // ctx.strokeStyle = 'blue';
            // ctx.lineWidth = 1;
            // ctx.strokeRect(10, 10, rectSize, rectSize);
            // ctx.restore();
            // const response = await fetch(svgPath);
            // if (!response.ok) {
            //     throw new Error(`Failed to load SVG: ${response.statusText}`);
            // }
            // const svgContent = await response.text();
            // await this.drawSVGContent(ctx, svgContent, x, y, scale);
            console.log("draw test svg content", svgPath, x, y, scale)
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(1, 1);
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 1;
            ctx.strokeRect(10, 10, rectSize, rectSize);
            ctx.restore();
        } catch (error) {
            console.error('Error loading SVG:', error);
        }
    }

    /**
     * 绘制五角星或SVG图像
     */
    async drawStarShape(
        ctx: CanvasRenderingContext2D,
        starConfig: IDrawStar,
        centerX: number,
        centerY: number,
        color: string
    ) {
        try {
            const offsetX = (starConfig.starPositionX ?? 0) * this.mmToPixel;
            if (starConfig.svgPath.startsWith('<svg')) {
                // 如果是SVG内容字符串
                await this.drawSVGContent(
                    ctx,
                    starConfig.svgPath,
                    centerX + offsetX,
                    centerY + starConfig.starPositionY * this.mmToPixel,
                    starConfig.starDiameter * this.mmToPixel / 40
                );
            } else if (starConfig.svgPath.endsWith('.svg')) {
                // 如果是SVG文件路径
                await this.loadAndDrawSVG(
                    ctx,
                    starConfig.svgPath,
                    centerX + offsetX,
                    centerY + starConfig.starPositionY * this.mmToPixel,
                    starConfig.starDiameter * this.mmToPixel / 40
                );
            } else {
                // 如果是SVG路径数据
                ctx.save();
                ctx.translate(
                    centerX + offsetX,
                    centerY + starConfig.starPositionY * this.mmToPixel
                );
                const R = (starConfig.starDiameter * this.mmToPixel) / 2;
                ctx.scale(R, R);
                
                const path = new Path2D(starConfig.svgPath);
                ctx.fillStyle = color;
                ctx.fill(path);

                // --- 新增：五角星局部的做旧和毛边擦除 ---
                // 1. 五角星毛边效果 (利用扁椭圆制造更加自然的纸张纤维或边缘磨损切口)
                if (starConfig.drawRoughEdge) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.fillStyle = '#FFFFFF';
                    
                    const size = starConfig.roughEdgeSize ?? 0.1;
                    const count = starConfig.roughEdgeCount ?? 15;
                    const pointRadius = R > 0 ? (size * this.mmToPixel) / R : 0.03; 
                    
                    for (let i = 0; i < count; i++) {
                        const px = (Math.random() - 0.5) * 1.8;
                        const py = (Math.random() - 0.5) * 1.8;
                        
                        const rx = (Math.random() * 0.6 + 0.4) * pointRadius;
                        // 纵横比在 0.3 到 0.7 之间，使其扁平，旋转方向随机，避免圆形切口
                        const ry = rx * (Math.random() * 0.4 + 0.3);
                        const rotation = Math.random() * Math.PI * 2;
                        
                        ctx.beginPath();
                        ctx.ellipse(px, py, rx, ry, rotation, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.restore();
                }

                // 2. 五角星做旧效果 (混合不规则扁椭圆、极细短线划痕和复合碎斑点，避免明显的圆形噪点)
                if (starConfig.drawAging) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.fillStyle = '#FFFFFF';
                    ctx.strokeStyle = '#FFFFFF';
                    
                    const noiseSize = starConfig.agingNoiseSize ?? 0.15;
                    const intensity = starConfig.agingIntensity ?? 50;
                    const pointRadius = R > 0 ? (noiseSize * this.mmToPixel) / R : 0.04;
                    const pointsCount = Math.round(intensity * 0.8); // 强度最大 5000 时可产生 4000 个做旧斑驳点
                    
                    for (let i = 0; i < pointsCount; i++) {
                        const px = (Math.random() - 0.5) * 1.9;
                        const py = (Math.random() - 0.5) * 1.9;
                        
                        const rand = Math.random();
                        if (rand < 0.6) {
                            // 2.1 扁椭圆或长条状斑驳，避免明显的圆形
                            const rx = (Math.random() * 0.8 + 0.2) * pointRadius;
                            // 纵横比在 0.2 到 0.6 之间，呈现扁平状，避免正圆
                            const ry = rx * (Math.random() * 0.4 + 0.2);
                            const rotation = Math.random() * Math.PI * 2;
                            ctx.beginPath();
                            ctx.ellipse(px, py, rx, ry, rotation, 0, Math.PI * 2);
                            ctx.fill();
                        } else if (rand < 0.85) {
                            // 2.2 细长划痕 (Scratch)，模拟物理划伤
                            const length = (Math.random() * 1.5 + 0.5) * pointRadius; // 划痕长度
                            const angle = Math.random() * Math.PI * 2;
                            const dx = Math.cos(angle) * length;
                            const dy = Math.sin(angle) * length;
                            const lineWidth = (Math.random() * 0.3 + 0.15) * pointRadius; // 划痕粗细
                            
                            ctx.beginPath();
                            ctx.lineWidth = lineWidth;
                            ctx.lineCap = 'round';
                            ctx.moveTo(px, py);
                            ctx.lineTo(px + dx, py + dy);
                            ctx.stroke();
                        } else {
                            // 2.3 复合碎斑：由 2~3 个更小且相互重叠的微小圆点组成，打破单一圆形的物理边界
                            const rx = (Math.random() * 0.6 + 0.2) * pointRadius;
                            ctx.beginPath();
                            // 主圆
                            ctx.arc(px, py, rx, 0, Math.PI * 2);
                            // 偏置圆 1
                            const ox1 = (Math.random() - 0.5) * rx * 0.8;
                            const oy1 = (Math.random() - 0.5) * rx * 0.8;
                            const r1 = rx * (Math.random() * 0.4 + 0.4);
                            ctx.arc(px + ox1, py + oy1, r1, 0, Math.PI * 2);
                            // 偏置圆 2
                            const ox2 = (Math.random() - 0.5) * rx * 0.8;
                            const oy2 = (Math.random() - 0.5) * rx * 0.8;
                            const r2 = rx * (Math.random() * 0.4 + 0.4);
                            ctx.arc(px + ox2, py + oy2, r2, 0, Math.PI * 2);
                            
                            ctx.fill();
                        }
                    }
                    ctx.restore();
                }
                
                ctx.restore();
            }
        } catch (error) {
            console.error('Error in drawStarShape:', error);
        }
    }

}