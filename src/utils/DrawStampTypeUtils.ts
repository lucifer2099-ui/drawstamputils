import { IStampType } from "../DrawStampTypes"

export class DrawStampTypeUtils {
    private mmToPixel = 10
    // 添加存储文字路径的数组
    private textPaths: Array<{
        text: string,
        path: Path2D,
        type: 'stampType',
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

    // 绘制印章类型列表
    drawStampTypeList(
        ctx: CanvasRenderingContext2D,
        stampTypeList: IStampType[],
        centerX: number,
        centerY: number,
        radiusX: number,
        primaryColor: string
    ) {
        ctx.save()
        stampTypeList.forEach((stampType) => {
            this.drawStampType(ctx, stampType, centerX, centerY, radiusX, primaryColor)
        })
        ctx.restore()
    }

    // 绘制单个印章类型
    private drawStampType(
        ctx: CanvasRenderingContext2D,
        stampType: IStampType,
        centerX: number,
        centerY: number,
        radiusX: number,
        primaryColor: string
    ) {
        const fontSize = stampType.fontHeight * this.mmToPixel
        const letterSpacingPx = stampType.letterSpacing * this.mmToPixel
        const positionY = stampType.positionY
        const offsetX = (stampType.positionX || 0) * this.mmToPixel
        const fontWeight = stampType.fontWeight || 'normal'
        const lineSpacingPx = stampType.lineSpacing * this.mmToPixel
        const orientation = stampType.orientation || 'horizontal'
        const rotationRad = ((stampType.rotation || 0) * Math.PI) / 180

        ctx.save()
        const fontStyle = stampType.fontStyle || 'normal'
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${stampType.fontFamily}`
        ctx.fillStyle = stampType.color || primaryColor
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // 将印章类型文字按换行符分割成多行
        const lines = stampType.stampType.split('\n')
        const lineCount = lines.length

        if (orientation === 'vertical') {
            const baseY = centerY + radiusX * 0.5 + positionY * this.mmToPixel
            lines.forEach((line, lineIndex) => {
                const chars = line.split('')
                const totalHeight =
                    chars.length * fontSize + Math.max(0, chars.length - 1) * letterSpacingPx
                const columnOffset =
                    (lineIndex - (lineCount - 1) / 2) * (fontSize + lineSpacingPx)
                const columnX = centerX + offsetX + columnOffset
                const startY = baseY - totalHeight / 2

                chars.forEach((char, charIndex) => {
                    const charY = startY + charIndex * (fontSize + letterSpacingPx) + fontSize / 2
                    const relativeY = charY - baseY

                    ctx.save()
                    ctx.translate(columnX, baseY)
                    if (rotationRad !== 0) {
                        ctx.rotate(rotationRad)
                    }
                    ctx.scale(stampType.compression, 1)
                    this.drawChar(ctx, char, stampType, fontSize, 'middle', 0, relativeY)
                    
                    ctx.restore()

                    const charWidth = ctx.measureText(char).width * stampType.compression
                    this.textPaths.push({
                        text: char,
                        type: 'stampType',
                        path: new Path2D(),
                        bounds: {
                            x: columnX - charWidth / 2,
                            y: charY - fontSize / 2,
                            width: charWidth,
                            height: fontSize
                        }
                    })
                })
            })
        } else {
            lines.forEach((line, lineIndex) => {
                const chars = line.split('')
                const charWidths = chars.map((char) => ctx.measureText(char).width)
                const totalWidth =
                    charWidths.reduce((sum, width) => sum + width, 0) +
                    (chars.length - 1) * letterSpacingPx

                // 计算每行的垂直偏移，使用 lineSpacing
                const lineOffset = (lineIndex - (lineCount - 1) / 2) * (fontSize + lineSpacingPx)

                // 计算文字位置（在五角星正下方）
                const textY = centerY + radiusX * 0.5 + positionY * this.mmToPixel + lineOffset

                ctx.save()
                ctx.translate(centerX + offsetX, textY)
                if (rotationRad !== 0) {
                    ctx.rotate(rotationRad)
                }
                ctx.scale(stampType.compression, 1)

                let currentX = -totalWidth / 2 // 从文本的左边缘开始

                // 绘制每个字符并存储路径
                chars.forEach((char, index) => {
                    const charX = currentX + charWidths[index] / 2
                    this.drawChar(ctx, char, stampType, fontSize, 'middle', charX, 0)

                    const charWidth = charWidths[index] * stampType.compression

                    this.textPaths.push({
                        text: char,
                        type: 'stampType',
                        path: new Path2D(),
                        bounds: {
                            x: centerX + offsetX + charX * stampType.compression - charWidth / 2,
                            y: textY - fontSize / 2,
                            width: charWidth,
                            height: fontSize
                        }
                    })

                    currentX += charWidths[index] + letterSpacingPx
                })

                ctx.restore()
            })
        }

        ctx.restore()
    }

    private drawChar(
        ctx: CanvasRenderingContext2D,
        char: string,
        stampType: IStampType,
        fontSize: number,
        textBaseline: 'bottom' | 'middle',
        offsetX: number = 0,
        offsetY: number = 0
    ) {
        if (stampType.drawRoughEdge) {
            ctx.filter = 'url(#stamp-ink-filter)';
        }
        ctx.fillText(char, offsetX, offsetY);
        if (stampType.drawRoughEdge) {
            ctx.filter = 'none';
        }
        if (stampType.drawAging) {
            const charWidth = ctx.measureText(char).width;
            this.applyTextAgingAt(ctx, fontSize, textBaseline, charWidth, stampType.drawAging, stampType.agingIntensity, stampType.agingNoiseSize, offsetX, offsetY, char);
        }
    }

    /**
     * 对字符进行局部的噪点磨损做旧擦除
     */
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