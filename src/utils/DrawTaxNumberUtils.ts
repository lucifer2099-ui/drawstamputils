import { ITaxNumber } from "../DrawStampTypes"

export class DrawTaxNumberUtils {
    private mmToPixel = 10
    // 添加存储文字路径的数组
    private textPaths: Array<{
        text: string,
        path: Path2D,
        type: 'taxNumber',
        bounds: {
            x: number,
            y: number,
            width: number,
            height: number
        }
    }> = []

    constructor(mmToPixel: number) {
        this.mmToPixel = mmToPixel
    }

    // 获取文字路径数组
    getTextPaths() {
        return this.textPaths
    }

    // 清除文字路径
    clearTextPaths() {
        this.textPaths = []
    }

    // 绘制税号
    drawTaxNumber(
        ctx: CanvasRenderingContext2D,
        taxNumber: ITaxNumber,
        centerX: number,
        centerY: number,
        primaryColor: string,
    ) {
        const fontSize = taxNumber.fontHeight * this.mmToPixel
        const totalWidth = taxNumber.totalWidth * this.mmToPixel
        const positionY = taxNumber.positionY * this.mmToPixel + 0.3
        const fontWeight = taxNumber.fontWeight || 'normal'
        const letterSpacing = taxNumber.letterSpacing * this.mmToPixel

        ctx.save()
        ctx.font = `${fontWeight} ${fontSize}px ${taxNumber.fontFamily}`
        ctx.fillStyle = primaryColor
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const characters = taxNumber.code.split('')
        const charCount = characters.length

        // 计算压缩后的总宽度
        const compressedTotalWidth = totalWidth * taxNumber.compression

        // 计算单个字符的宽度（考虑压缩）
        const charWidth = (compressedTotalWidth - (charCount - 1) * letterSpacing) / charCount

        // 计算整个文本的实际宽度
        const actualWidth = charCount * charWidth + (charCount - 1) * letterSpacing

        // 计算起始位置，确保文本居中
        const startX = centerX - actualWidth / 2 + charWidth / 2
        const adjustedCenterY = centerY + positionY

        // 绘制每个字符
        characters.forEach((char, index) => {
            const x = startX + index * (charWidth + letterSpacing)
            
            ctx.save()
            ctx.translate(x, adjustedCenterY)
            ctx.scale(taxNumber.compression, 1.35)
            this.drawChar(ctx, char, taxNumber, fontSize, 'middle', 0, 0)

            // 存储字符路径
            this.textPaths.push({
                text: char,
                type: 'taxNumber',
                path: new Path2D(),
                bounds: {
                    x: x - (charWidth * taxNumber.compression) / 2,
                    y: adjustedCenterY - fontSize / 2,
                    width: Math.abs(charWidth * taxNumber.compression),
                    height: fontSize * 1.35
                }

            })

            ctx.restore()
        })

        ctx.restore()
    }

    private drawChar(
        ctx: CanvasRenderingContext2D,
        char: string,
        taxNumber: ITaxNumber,
        fontSize: number,
        textBaseline: 'bottom' | 'middle',
        offsetX: number = 0,
        offsetY: number = 0
    ) {
        if (taxNumber.drawRoughEdge) {
            ctx.filter = 'url(#stamp-ink-filter)';
        }
        ctx.fillText(char, offsetX, offsetY);
        if (taxNumber.drawRoughEdge) {
            ctx.filter = 'none';
        }
        if (taxNumber.drawAging) {
            const charWidth = ctx.measureText(char).width;
            this.applyTextAgingAt(ctx, fontSize, textBaseline, charWidth, taxNumber.drawAging, taxNumber.agingIntensity, taxNumber.agingNoiseSize, offsetX, offsetY, char);
        }
    }

    private applyTextAgingAt(
        ctx: CanvasRenderingContext2D,
        fontSize: number,
        textBaseline: 'bottom' | 'middle',
        charWidth: number,
        drawAging?: boolean,
        agingIntensity?: number,
        agingNoiseSize?: number,
        offsetX: number = 0,
        offsetY: number = 0,
        char: string = ''
    ) {
        if (!drawAging) return;
        
        // 1. 利用字符 ASCII/Unicode 产生与该字独一无二的随机值（Wear Factor Seed）
        const intensity = agingIntensity ?? 50;
        const charVal = char ? char.charCodeAt(0) : 0;
        const charSeed = Math.abs(Math.sin(charVal + intensity + offsetX + offsetY));
        
        // 20% 的概率该字符为“高清不磨损字”
        if (charSeed < 0.2) {
            return;
        }

        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#FFFFFF';
        
        const noiseSize = agingNoiseSize ?? 0.15;
        
        // 噪声大小换算为像素
        const noiseRadius = noiseSize * this.mmToPixel;
        
        // 每个字的做旧点数量
        let pointsCount = Math.round(intensity * 0.05);

        // 15% 的概率为“重度磨损干枯字”
        if (charSeed > 0.85) {
            pointsCount = Math.round(pointsCount * 1.8);
            // 降低透明度以模拟缺墨干枯感
            ctx.globalAlpha = 0.65;
        } else {
            // 普通磨损字
            ctx.globalAlpha = 0.9;
        }
        
        // 确定以 (offsetX, offsetY) 为基准的包围盒
        const minX = offsetX - charWidth / 2;
        const maxX = offsetX + charWidth / 2;
        let minY = offsetY - fontSize;
        let maxY = offsetY;
        if (textBaseline === 'middle') {
            minY = offsetY - fontSize / 2;
            maxY = offsetY + fontSize / 2;
        }
        
        for (let i = 0; i < pointsCount; i++) {
            const px = minX + Math.random() * (maxX - minX);
            const py = minY + Math.random() * (maxY - minY);
            
            const rand = Math.random();
            if (rand < 0.6) {
                // 1. 随机扁椭圆
                const rx = (Math.random() * 0.8 + 0.2) * noiseRadius;
                const ry = rx * (Math.random() * 0.4 + 0.2);
                const rotation = Math.random() * Math.PI * 2;
                ctx.beginPath();
                ctx.ellipse(px, py, rx, ry, rotation, 0, Math.PI * 2);
                ctx.fill();
            } else if (rand < 0.85) {
                // 2. 细长划痕
                const length = (Math.random() * 1.5 + 0.5) * noiseRadius;
                const angle = Math.random() * Math.PI * 2;
                const dx = Math.cos(angle) * length;
                const dy = Math.sin(angle) * length;
                const lineWidth = (Math.random() * 0.3 + 0.15) * noiseRadius;
                
                ctx.beginPath();
                ctx.lineWidth = lineWidth;
                ctx.lineCap = 'round';
                ctx.moveTo(px, py);
                ctx.lineTo(px + dx, py + dy);
                ctx.stroke();
            } else {
                // 3. 复合碎斑
                const rx = (Math.random() * 0.6 + 0.2) * noiseRadius;
                ctx.beginPath();
                ctx.arc(px, py, rx, 0, Math.PI * 2);
                
                const ox1 = (Math.random() - 0.5) * rx * 0.8;
                const oy1 = (Math.random() - 0.5) * rx * 0.8;
                const r1 = rx * (Math.random() * 0.4 + 0.4);
                ctx.arc(px + ox1, py + oy1, r1, 0, Math.PI * 2);
                
                const ox2 = (Math.random() - 0.5) * rx * 0.8;
                const oy2 = (Math.random() - 0.5) * rx * 0.8;
                const r2 = rx * (Math.random() * 0.4 + 0.4);
                ctx.arc(px + ox2, py + oy2, r2, 0, Math.PI * 2);
                
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
} 