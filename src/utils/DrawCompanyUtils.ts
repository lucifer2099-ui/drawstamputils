import { ICompany } from "../DrawStampTypes"

export class DrawCompanyUtils {
    private mmToPixel = 10
    // 娣诲姞瀛樺偍鏂囧瓧璺緞鐨勬暟缁?
    private textPaths: Array<{
        text: string,

        type: 'company',
        bounds: {
            x: number,
            y: number,
            width: number,
            height: number
        }
    }> = []

    constructor(mmToPixel: number) {
        this.mmToPixel = mmToPixel
        this.textPaths = []
    }

    // 娣诲姞鑾峰彇鏂囧瓧璺緞鐨勬柟娉?
    getTextPaths() {
        return this.textPaths
    }

    // 娓呴櫎鏂囧瓧璺緞
    clearTextPaths() {
        this.textPaths = []
    }

    // 娣诲姞缁樺埗鍏徃鍒楄〃鐨勬柟娉?
    drawCompanyList(
        ctx: CanvasRenderingContext2D,
        companyList: ICompany[],
        centerX: number,
        centerY: number,
        radiusX: number,
        radiusY: number,
        color: string
        ) {
            companyList.forEach((company) => {
                this.drawCompanyName(ctx, company, centerX, centerY, radiusX, radiusY, company.color || color)
            })
        }

            /**
     * 缁樺埗鍏徃鍚嶇О
     * @param centerX 鍦嗗績x鍧愭爣
     * @param centerY 鍦嗗績y鍧愭爣
     * @param radiusX 妞渾闀胯酱鍗婂緞
     * @param radiusY 妞渾鐭酱鍗婂緞
     * @param text 鍏徃鍚嶇О鏂囨湰
     * @param fontSize 瀛椾綋澶у皬
     */
    drawCompanyName(
        ctx: CanvasRenderingContext2D,
        company: ICompany,
        centerX: number,
        centerY: number,
        radiusX: number,
        radiusY: number,
        color: string
      ) {
        this.clearTextPaths()
        
        // 鏍规嵁鍗扮珷褰㈢姸閫夋嫨缁樺埗鏂瑰紡
        if (company.shape === 'rectangle' || company.shape === 'rhombus' || company.shape === 'organic' || company.shape === 'triangle') {
            this.drawRectangleText(ctx, company, centerX, centerY, radiusX, radiusY, color)
        } else {
            this.drawEllipseText(ctx, company, centerX, centerY, radiusX, radiusY, color)
        }
    }

    /**
     * 缁樺埗妞渾鏂囧瓧锛堝師鏈夐€昏緫锛?
     */
    private drawEllipseText(
        ctx: CanvasRenderingContext2D,
        company: ICompany,
        centerX: number,
        centerY: number,
        radiusX: number,
        radiusY: number,
        color: string
    ) {
        const fontSize = company.fontHeight * this.mmToPixel
        const fontWeight = company.fontWeight || 'normal'
        const fontStyle = company.fontStyle || 'normal'
        ctx.save()
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${company.fontFamily}`
        ctx.fillStyle = color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
      
        const characters = company.companyName.split('')
        const charWidthCache = new Map<string, number>()
        const getCharWidth = (char: string) => {
            let width = charWidthCache.get(char)
            if (width === undefined) {
                width = ctx.measureText(char).width
                charWidthCache.set(char, width)
            }
            return width
        }
        const characterCount = characters.length
        const borderOffset = company.borderOffset * this.mmToPixel
      
        // 璁＄畻鎬昏搴﹀拰姣忎釜瀛楃鐨勮搴?
        const totalAngle = Math.PI * (0.5 + characterCount / (company.textDistributionFactor * 4))
        const anglePerChar = totalAngle / characterCount
      
        // 鏍规嵁鏃嬭浆鏂瑰悜璁剧疆璧峰瑙掑害鍜岃搴﹀閲?
        const direction = company.rotateDirection === 'clockwise' ? -1 : 1
        const startAngle = (company.startAngle ? company.startAngle : 0) + (company.rotateDirection === 'clockwise' ? 
          Math.PI - totalAngle / 2 : 
          Math.PI + (Math.PI - totalAngle) / 2)
      
        const angleOffset = company.rotateDirection === 'clockwise' ? -Math.PI/2 : Math.PI/2

        // 璁＄畻瀛楃浣嶇疆鏃惰€冭檻妞渾鏂囧瓧璋冩暣
        if (company.adjustEllipseText) {
          let halfCharCount = 0
          if(characterCount % 2 !== 0){
            halfCharCount = characterCount / 2
          }else{
            halfCharCount = (characterCount + 1) / 2
          }
      
          characters.forEach((char, index) => {
            // 璁＄畻褰撳墠瀛楃鐨勮搴︼紝鍖呭惈妞渾璋冩暣
            const halfIndex = halfCharCount - index - 1
            const adjustmentFactor = Math.pow(halfIndex / halfCharCount, 2)
            const additionalAngle = adjustmentFactor * anglePerChar * company.adjustEllipseTextFactor
            const indexValue = index - halfCharCount
            const factor = indexValue / Math.abs(indexValue)
      
            let angle = startAngle + direction * anglePerChar * (index + 0.5)
            angle += additionalAngle * factor
      
            // 璁＄畻瀛楃浣嶇疆
            const x = centerX + Math.cos(angle) * (radiusX - fontSize - borderOffset)
            const y = centerY + Math.sin(angle) * (radiusY - fontSize - borderOffset)
      
            ctx.save()
            ctx.translate(x, y)
            // 鏍规嵁鏃嬭浆鏂瑰悜璋冩暣鏂囧瓧鏃嬭浆瑙掑害
            ctx.rotate(angle + angleOffset)
            ctx.scale(company.compression, 1)

            // 鍒涘缓鏂囧瓧璺緞
            this.textPaths.push({
                text: char,
                type: 'company',
                bounds: {
                    x: x - fontSize/2,
                    y: y - fontSize,
                    width: fontSize,
                    height: fontSize
                }
            })

            this.drawChar(ctx, char, company, fontSize, 'bottom', 0, 0)
            ctx.restore()
          })
        } else {
          // 涓嶈皟鏁存き鍦嗘枃瀛楁椂鐨勬甯哥粯鍒?
          characters.forEach((char, index) => {
            const angle = startAngle + direction * anglePerChar * (index + 0.5)
            
            const x = centerX + Math.cos(angle) * (radiusX - fontSize - borderOffset)
            const y = centerY + Math.sin(angle) * (radiusY - fontSize - borderOffset)
      
            ctx.save()
            ctx.translate(x, y)
            ctx.rotate(angle + angleOffset)
            ctx.scale(company.compression, 1)

            // 鍒涘缓鏂囧瓧璺緞
            this.textPaths.push({
                text: char,
                type: 'company',
                bounds: {
                    x: x - fontSize/2,
                    y: y - fontSize,
                    width: fontSize,
                    height: fontSize
                }
            })

            this.drawChar(ctx, char, company, fontSize, 'bottom', 0, 0)
            ctx.restore()
          })
        }
      
        ctx.restore()
    }

    /**
     * 缁樺埗鐭╁舰鏂囧瓧锛堟í鍚戞垨绾靛悜锛?
     */
    private drawRectangleText(
        ctx: CanvasRenderingContext2D,
        company: ICompany,
        centerX: number,
        centerY: number,
        width: number,
        height: number,
        color: string
    ) {
        const fontSize = company.fontHeight * this.mmToPixel
        const fontWeight = company.fontWeight || 'normal'
        const fontStyle = company.fontStyle || 'normal'
        const textMargin = (company.rectangleTextMargin !== undefined ? company.rectangleTextMargin : company.borderOffset) * this.mmToPixel
        const textDirection = company.rectangleTextDirection || 'horizontal'
        const textPosition = company.rectangleTextPosition || 'center'
        const textAlignment = company.rectangleTextAlignment || 'center'
        const verticalAlignment = company.rectangleVerticalAlignment || 'center'
        const lineSpacing = (company.rectangleLineSpacing || 0) * this.mmToPixel
        
        // 搴旂敤浣嶇疆鍋忕Щ閲忥紙姣背杞儚绱狅級
        const positionOffsetX = (company.rectanglePositionX || 0) * this.mmToPixel
        const positionOffsetY = (company.rectanglePositionY || 0) * this.mmToPixel
        const adjustedCenterX = centerX + positionOffsetX
        const adjustedCenterY = centerY + positionOffsetY

        ctx.save()
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${company.fontFamily}`
        ctx.fillStyle = color

        // 鐭╁舰灏哄锛堝儚绱狅級
        const rectWidth = width * this.mmToPixel
        const rectHeight = height * this.mmToPixel

        if (textDirection === 'horizontal') {
            // 妯悜缁樺埗
            this.drawHorizontalTextWithWrap(
                ctx,
                company.companyName,
                adjustedCenterX,
                adjustedCenterY,
                rectWidth,
                rectHeight,
                fontSize,
                textMargin,
                textPosition,
                textAlignment,
                company.compression
            )
        } else {
            // 绾靛悜缁樺埗
            this.drawVerticalTextWithWrap(
                ctx,
                company.companyName,
                adjustedCenterX,
                adjustedCenterY,
                rectWidth,
                rectHeight,
                fontSize,
                textMargin,
                textPosition,
                verticalAlignment,
                lineSpacing,
                company.compression
            )
        }

        ctx.restore()
    }

    /**
     * 缁樺埗妯悜鏂囧瓧锛堝甫鑷姩鎹㈣锛?
     */
    private drawHorizontalTextWithWrap(
        ctx: CanvasRenderingContext2D,
        text: string,
        centerX: number,
        centerY: number,
        rectWidth: number,
        rectHeight: number,
        fontSize: number,
        textMargin: number,
        position: 'top' | 'bottom' | 'left' | 'right' | 'center',
        alignment: 'left' | 'center' | 'right',
        compression: number
    ) {
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'

        // 璁＄畻鍙敤瀹藉害锛堝噺鍘诲乏鍙宠竟璺濓級
        const availableWidth = rectWidth - 2 * textMargin
        const characters = text.split('')

        // 灏嗘枃瀛楁寜琛屽垎鍓诧紙鑷姩鎹㈣锛?
        const lines: string[] = []
        let currentLine = ''
        let currentLineWidth = 0

        for (const char of characters) {
            const metrics = ctx.measureText(char)
            const charWidth = metrics.width * compression

            if (currentLineWidth + charWidth > availableWidth && currentLine.length > 0) {
                // 褰撳墠琛屽凡婊★紝寮€濮嬫柊琛?
                lines.push(currentLine)
                currentLine = char
                currentLineWidth = charWidth
            } else {
                // 娣诲姞鍒板綋鍓嶈
                currentLine += char
                currentLineWidth += charWidth
            }
        }
        // 娣诲姞鏈€鍚庝竴琛?
        if (currentLine.length > 0) {
            lines.push(currentLine)
        }

        // 璁＄畻鎬婚珮搴?
        const totalHeight = lines.length * fontSize + (lines.length - 1) * fontSize * 0.2 // 琛岄棿璺濅负瀛椾綋澶у皬鐨?0%

        // 鏍规嵁浣嶇疆璁＄畻璧峰Y鍧愭爣
        let startY = centerY
        if (position === 'top') {
            startY = centerY - rectHeight / 2 + textMargin + fontSize / 2
        } else if (position === 'bottom') {
            startY = centerY + rectHeight / 2 - textMargin - fontSize / 2 - totalHeight + fontSize
        } else if (position === 'center') {
            startY = centerY - totalHeight / 2 + fontSize / 2
        } else if (position === 'left' || position === 'right') {
            startY = centerY
        }

        // 濡傛灉鏄乏鍙充綅缃紝闇€瑕佹棆杞?0搴?
        if (position === 'left' || position === 'right') {
            const x = position === 'left' 
                ? centerX - rectWidth / 2 + textMargin + fontSize / 2
                : centerX + rectWidth / 2 - textMargin - fontSize / 2

            lines.forEach((line, lineIndex) => {
                const lineY = startY + lineIndex * (fontSize * 1.2)
                const lineChars = line.split('')
                
                // 璁＄畻琛岀殑鎬诲搴?
                const lineCharWidths = new Array(lineChars.length)
                let lineTotalWidth = 0
                for (let i = 0; i < lineChars.length; i++) {
                    const metrics = ctx.measureText(lineChars[i])
                    const w = metrics.width * compression
                    lineCharWidths[i] = w
                    lineTotalWidth += w
                }

                // 鏍规嵁瀵归綈鏂瑰紡璁＄畻璧峰X鍧愭爣
                let lineStartX = centerX
                if (alignment === 'left') {
                    lineStartX = centerX - rectWidth / 2 + textMargin
                } else if (alignment === 'right') {
                    lineStartX = centerX + rectWidth / 2 - textMargin - lineTotalWidth
                } else {
                    lineStartX = centerX - lineTotalWidth / 2
                }

                let currentWidth = 0
                lineChars.forEach((char, charIndex) => {
                    const charWidth = lineCharWidths[charIndex]
                    const charX = lineStartX + currentWidth + charWidth / 2
                    currentWidth += charWidth

                    ctx.save()
                    ctx.translate(x, charX)
                    ctx.rotate(position === 'left' ? -Math.PI / 2 : Math.PI / 2)
                    ctx.scale(compression, 1)

                    const metrics = ctx.measureText(char)
                    this.textPaths.push({
                        text: char,
                        type: 'company',
                        bounds: {
                            x: x - metrics.width / 2,
                            y: charX - fontSize / 2,
                            width: metrics.width,
                            height: fontSize
                        }
                    })

                    this.drawChar(ctx, char, company, fontSize, 'middle', 0, 0)
                    ctx.restore()
                })
            })
        } else {
            // 椤堕儴銆佸簳閮ㄦ垨涓績浣嶇疆锛屾甯告í鍚戠粯鍒?
            lines.forEach((line, lineIndex) => {
                const lineY = startY + lineIndex * (fontSize * 1.2)
                const lineChars = line.split('')
                
                // 璁＄畻琛岀殑鎬诲搴?
                const lineCharWidths = new Array(lineChars.length)
                let lineTotalWidth = 0
                for (let i = 0; i < lineChars.length; i++) {
                    const metrics = ctx.measureText(lineChars[i])
                    const w = metrics.width * compression
                    lineCharWidths[i] = w
                    lineTotalWidth += w
                }

                // 鏍规嵁瀵归綈鏂瑰紡璁＄畻璧峰X鍧愭爣
                let lineStartX = centerX
                if (alignment === 'left') {
                    lineStartX = centerX - rectWidth / 2 + textMargin
                } else if (alignment === 'right') {
                    lineStartX = centerX + rectWidth / 2 - textMargin - lineTotalWidth
                } else {
                    lineStartX = centerX - lineTotalWidth / 2
                }

                let currentWidth = 0
                lineChars.forEach((char, charIndex) => {
                    const charWidth = lineCharWidths[charIndex]
                    const charX = lineStartX + currentWidth + charWidth / 2
                    currentWidth += charWidth

                    ctx.save()
                    ctx.translate(charX, lineY)
                    ctx.scale(compression, 1)

                    const metrics = ctx.measureText(char)
                    this.textPaths.push({
                        text: char,
                        type: 'company',
                        bounds: {
                            x: charX - metrics.width / 2,
                            y: lineY - fontSize / 2,
                            width: metrics.width,
                            height: fontSize
                        }
                    })

                    this.drawChar(ctx, char, company, fontSize, 'middle', 0, 0)
                    ctx.restore()
                })
            })
        }
    }

    /**
     * 缁樺埗妯悜鏂囧瓧锛堟棫鏂规硶锛屼繚鐣欑敤浜庡吋瀹癸級
     */
    private drawHorizontalText(
        ctx: CanvasRenderingContext2D,
        text: string,
        centerX: number,
        centerY: number,
        rectWidth: number,
        rectHeight: number,
        fontSize: number,
        borderOffset: number,
        position: 'top' | 'bottom' | 'left' | 'right' | 'center',
        alignment: 'left' | 'center' | 'right',
        compression: number
    ) {
        const characters = text.split('')
        ctx.textBaseline = 'middle'

        // 璁＄畻鏂囧瓧鎬诲搴?
        const charWidths = new Array(characters.length)
        let totalWidth = 0
        for (let i = 0; i < characters.length; i++) {
            const metrics = ctx.measureText(characters[i])
            const w = metrics.width * compression
            charWidths[i] = w
            totalWidth += w
        }

        // 鏍规嵁浣嶇疆璁＄畻Y鍧愭爣
        let y = centerY
        if (position === 'top') {
            y = centerY - rectHeight / 2 + borderOffset + fontSize / 2
        } else if (position === 'bottom') {
            y = centerY + rectHeight / 2 - borderOffset - fontSize / 2
        } else if (position === 'left' || position === 'right') {
            y = centerY
        }

        // 鏍规嵁瀵归綈鏂瑰紡璁＄畻璧峰X鍧愭爣
        let startX = centerX
        if (alignment === 'left') {
            startX = centerX - rectWidth / 2 + borderOffset
        } else if (alignment === 'right') {
            startX = centerX + rectWidth / 2 - borderOffset - totalWidth
        } else {
            startX = centerX - totalWidth / 2
        }

        // 濡傛灉鏄乏鍙充綅缃紝闇€瑕佹棆杞?0搴?
        if (position === 'left' || position === 'right') {
            const x = position === 'left' 
                ? centerX - rectWidth / 2 + borderOffset + fontSize / 2
                : centerX + rectWidth / 2 - borderOffset - fontSize / 2

            let currentWidth = 0
            characters.forEach((char, index) => {
                const charWidth = charWidths[index]
                const charX = startX + currentWidth + charWidth / 2
                currentWidth += charWidth

                ctx.save()
                ctx.translate(x, charX)
                ctx.rotate(position === 'left' ? -Math.PI / 2 : Math.PI / 2)
                ctx.scale(compression, 1)

                // 鍒涘缓鏂囧瓧璺緞
                const metrics = ctx.measureText(char)
                this.textPaths.push({
                    text: char,
                    type: 'company',
                    bounds: {
                        x: x - metrics.width / 2,
                        y: charX - fontSize / 2,
                        width: metrics.width,
                        height: fontSize
                    }
                })

                this.drawChar(ctx, char, company, fontSize, 'middle', 0, 0)
                ctx.restore()
            })
        } else {
            // 椤堕儴銆佸簳閮ㄦ垨涓績浣嶇疆锛屾甯告í鍚戠粯鍒?
            let currentWidth = 0
            characters.forEach((char, index) => {
                const charWidth = charWidths[index]
                const charX = startX + currentWidth + charWidth / 2
                currentWidth += charWidth

                ctx.save()
                ctx.translate(charX, y)
                ctx.scale(compression, 1)
                ctx.textAlign = 'center'

                // 鍒涘缓鏂囧瓧璺緞
                const metrics = ctx.measureText(char)
                this.textPaths.push({
                    text: char,
                    type: 'company',
                    bounds: {
                        x: charX - metrics.width / 2,
                        y: y - fontSize / 2,
                        width: metrics.width,
                        height: fontSize
                    }
                })

                this.drawChar(ctx, char, company, fontSize, 'middle', 0, 0)
                ctx.restore()
            })
        }
    }

    /**
     * 缁樺埗绾靛悜鏂囧瓧锛堝甫鑷姩鎹㈣锛?
     */
    private drawVerticalTextWithWrap(
        ctx: CanvasRenderingContext2D,
        text: string,
        centerX: number,
        centerY: number,
        rectWidth: number,
        rectHeight: number,
        fontSize: number,
        textMargin: number,
        position: 'top' | 'bottom' | 'left' | 'right' | 'center',
        alignment: 'top' | 'center' | 'bottom',
        lineSpacing: number,
        compression: number
    ) {
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'

        // 璁＄畻鍙敤楂樺害锛堝噺鍘讳笂涓嬭竟璺濓級
        const availableHeight = rectHeight - 2 * textMargin
        const characters = text.split('')

        // 灏嗘枃瀛楁寜鍒楀垎鍓诧紙鑷姩鎹㈣锛?
        const columns: string[] = []
        let currentColumn = ''
        let currentColumnHeight = 0
        const actualLineSpacing = lineSpacing || fontSize * 0.2

        for (const char of characters) {
            const charHeight = fontSize + actualLineSpacing

            if (currentColumnHeight + charHeight > availableHeight && currentColumn.length > 0) {
                // 褰撳墠鍒楀凡婊★紝寮€濮嬫柊鍒?
                columns.push(currentColumn)
                currentColumn = char
                currentColumnHeight = fontSize
            } else {
                // 娣诲姞鍒板綋鍓嶅垪
                currentColumn += char
                currentColumnHeight += charHeight
            }
        }
        // 娣诲姞鏈€鍚庝竴鍒?
        if (currentColumn.length > 0) {
            columns.push(currentColumn)
        }

        // 璁＄畻鎬诲搴?
        const columnWidth = fontSize + fontSize * 0.2 // 鍒楅棿璺濅负瀛椾綋澶у皬鐨?0%
        const totalWidth = columns.length * columnWidth

        // 鏍规嵁浣嶇疆璁＄畻璧峰X鍧愭爣
        let startX = centerX
        if (position === 'left') {
            startX = centerX - rectWidth / 2 + textMargin + fontSize / 2
        } else if (position === 'right') {
            startX = centerX + rectWidth / 2 - textMargin - fontSize / 2 - totalWidth + columnWidth
        } else if (position === 'center') {
            startX = centerX - totalWidth / 2 + columnWidth / 2
        } else if (position === 'top' || position === 'bottom') {
            startX = centerX
        }

        // 濡傛灉鏄笂涓嬩綅缃紝闇€瑕佹棆杞?0搴?
        if (position === 'top' || position === 'bottom') {
            const y = position === 'top'
                ? centerY - rectHeight / 2 + textMargin + fontSize / 2
                : centerY + rectHeight / 2 - textMargin - fontSize / 2

            columns.forEach((column, columnIndex) => {
                const columnX = startX + columnIndex * columnWidth
                const columnChars = column.split('')
                
                // 璁＄畻鍒楃殑鎬婚珮搴?
                const columnTotalHeight = columnChars.length * fontSize + (columnChars.length - 1) * actualLineSpacing

                // 鏍规嵁瀵归綈鏂瑰紡璁＄畻璧峰Y鍧愭爣
                let columnStartY = centerY
                if (alignment === 'top') {
                    columnStartY = centerY - rectHeight / 2 + textMargin + fontSize / 2
                } else if (alignment === 'bottom') {
                    columnStartY = centerY + rectHeight / 2 - textMargin - fontSize / 2 - columnTotalHeight + fontSize
                } else {
                    columnStartY = centerY - columnTotalHeight / 2 + fontSize / 2
                }

                columnChars.forEach((char, charIndex) => {
                    const charY = columnStartY + charIndex * (fontSize + actualLineSpacing)

                    ctx.save()
                    ctx.translate(charY, y)
                    ctx.rotate(position === 'top' ? Math.PI / 2 : -Math.PI / 2)
                    ctx.scale(compression, 1)

                    const metrics = ctx.measureText(char)
                    this.textPaths.push({
                        text: char,
                        type: 'company',
                        bounds: {
                            x: charY - metrics.width / 2,
                            y: y - fontSize / 2,
                            width: metrics.width,
                            height: fontSize
                        }
                    })

                    this.drawChar(ctx, char, company, fontSize, 'middle', 0, 0)
                    ctx.restore()
                })
            })
        } else {
            // 宸﹀彸浣嶇疆锛屾甯哥旱鍚戠粯鍒?
            columns.forEach((column, columnIndex) => {
                const columnX = startX + columnIndex * columnWidth
                const columnChars = column.split('')
                
                // 璁＄畻鍒楃殑鎬婚珮搴?
                const columnTotalHeight = columnChars.length * fontSize + (columnChars.length - 1) * actualLineSpacing

                // 鏍规嵁瀵归綈鏂瑰紡璁＄畻璧峰Y鍧愭爣
                let columnStartY = centerY
                if (alignment === 'top') {
                    columnStartY = centerY - rectHeight / 2 + textMargin + fontSize / 2
                } else if (alignment === 'bottom') {
                    columnStartY = centerY + rectHeight / 2 - textMargin - fontSize / 2 - columnTotalHeight + fontSize
                } else {
                    columnStartY = centerY - columnTotalHeight / 2 + fontSize / 2
                }

                columnChars.forEach((char, charIndex) => {
                    const charY = columnStartY + charIndex * (fontSize + actualLineSpacing)

                    ctx.save()
                    ctx.translate(columnX, charY)
                    ctx.scale(compression, 1)

                    const metrics = ctx.measureText(char)
                    this.textPaths.push({
                        text: char,
                        type: 'company',
                        bounds: {
                            x: columnX - metrics.width / 2,
                            y: charY - fontSize / 2,
                            width: metrics.width,
                            height: fontSize
                        }
                    })

                    this.drawChar(ctx, char, company, fontSize, 'middle', 0, 0)
                    ctx.restore()
                })
            })
        }
    }

    /**
     * 缁樺埗绾靛悜鏂囧瓧锛堟棫鏂规硶锛屼繚鐣欑敤浜庡吋瀹癸級
     */
    private drawVerticalText(
        ctx: CanvasRenderingContext2D,
        text: string,
        centerX: number,
        centerY: number,
        rectWidth: number,
        rectHeight: number,
        fontSize: number,
        borderOffset: number,
        position: 'top' | 'bottom' | 'left' | 'right' | 'center',
        alignment: 'top' | 'center' | 'bottom',
        lineSpacing: number,
        compression: number
    ) {
        const characters = text.split('')
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'

        // 璁＄畻鏂囧瓧鎬婚珮搴?
        const totalHeight = characters.length * fontSize + (characters.length - 1) * lineSpacing

        // 鏍规嵁浣嶇疆璁＄畻X鍧愭爣
        let x = centerX
        if (position === 'left') {
            x = centerX - rectWidth / 2 + borderOffset + fontSize / 2
        } else if (position === 'right') {
            x = centerX + rectWidth / 2 - borderOffset - fontSize / 2
        } else if (position === 'top' || position === 'bottom') {
            x = centerX
        }

        // 鏍规嵁瀵归綈鏂瑰紡璁＄畻璧峰Y鍧愭爣
        let startY = centerY
        if (alignment === 'top') {
            startY = centerY - rectHeight / 2 + borderOffset + fontSize / 2
        } else if (alignment === 'bottom') {
            startY = centerY + rectHeight / 2 - borderOffset - fontSize / 2 - totalHeight + fontSize
        } else {
            startY = centerY - totalHeight / 2 + fontSize / 2
        }

        // 濡傛灉鏄笂涓嬩綅缃紝闇€瑕佹棆杞?0搴?
        if (position === 'top' || position === 'bottom') {
            const y = position === 'top'
                ? centerY - rectHeight / 2 + borderOffset + fontSize / 2
                : centerY + rectHeight / 2 - borderOffset - fontSize / 2

            characters.forEach((char, index) => {
                const charY = startY + index * (fontSize + lineSpacing)

                ctx.save()
                ctx.translate(charY, y)
                ctx.rotate(position === 'top' ? Math.PI / 2 : -Math.PI / 2)
                ctx.scale(compression, 1)

                // 鍒涘缓鏂囧瓧璺緞
                const metrics = ctx.measureText(char)
                this.textPaths.push({
                    text: char,
                    type: 'company',
                    bounds: {
                        x: charY - metrics.width / 2,
                        y: y - fontSize / 2,
                        width: metrics.width,
                        height: fontSize
                    }
                })

                this.drawChar(ctx, char, company, fontSize, 'middle', 0, 0)
                ctx.restore()
            })
        } else {
            // 宸﹀彸浣嶇疆锛屾甯哥旱鍚戠粯鍒?
            characters.forEach((char, index) => {
                const charY = startY + index * (fontSize + lineSpacing)

                ctx.save()
                ctx.translate(x, charY)
                ctx.scale(compression, 1)

                // 鍒涘缓鏂囧瓧璺緞
                const metrics = ctx.measureText(char)
                this.textPaths.push({
                    text: char,
                    type: 'company',
                    bounds: {
                        x: x - metrics.width / 2,
                        y: charY - fontSize / 2,
                        width: metrics.width,
                        height: fontSize
                    }
                })

                this.drawChar(ctx, char, company, fontSize, 'middle', 0, 0)
                ctx.restore()
            })
        }
    }

    private drawChar(
        ctx: CanvasRenderingContext2D,
        char: string,
        company: ICompany,
        fontSize: number,
        textBaseline: 'bottom' | 'middle',
        offsetX: number = 0,
        offsetY: number = 0
    ) {
        if (company.drawRoughEdge) {
            ctx.filter = 'url(#stamp-ink-filter)';
        }
        ctx.fillText(char, offsetX, offsetY);
        if (company.drawRoughEdge) {
            ctx.filter = 'none';
        }
        if (company.drawAging) {
            const charWidth = ctx.measureText(char).width;
            this.applyTextAgingAt(ctx, fontSize, textBaseline, charWidth, company.drawAging, company.agingIntensity, company.agingNoiseSize, offsetX, offsetY, char);
        }
    }

    /**
     * 瀵瑰瓧绗﹁繘琛屽眬閮ㄧ殑鍣偣纾ㄦ崯鍋氭棫鎿﹂櫎
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
        
        // 1. 鍒╃敤瀛楃 ASCII/Unicode 浜х敓涓庤瀛楃嫭涓€鏃犱簩鐨勯殢鏈哄€硷紙Wear Factor Seed锛?
        const intensity = agingIntensity ?? 50;
        const charVal = char ? char.charCodeAt(0) : 0;
        const charSeed = Math.abs(Math.sin(charVal + intensity + offsetX + offsetY));
        
        // 20% 鐨勬鐜囪瀛楃涓衡€滈珮娓呬笉纾ㄦ崯瀛椻€?
        if (charSeed < 0.2) {
            return;
        }

        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#FFFFFF';
        
        const noiseSize = agingNoiseSize ?? 0.15;
        
        // 鍣０澶у皬鎹㈢畻涓哄儚绱?
        const noiseRadius = noiseSize * this.mmToPixel;
        
        // 姣忎釜瀛楃殑鍋氭棫鐐规暟閲?
        let pointsCount = Math.round(intensity * 0.05);

        // 15% 鐨勬鐜囦负鈥滈噸搴︾（鎹熷共鏋瓧鈥?
        if (charSeed > 0.85) {
            pointsCount = Math.round(pointsCount * 1.8);
            // 闄嶄綆閫忔槑搴︿互妯℃嫙缂哄ⅷ骞叉灟鎰?
            ctx.globalAlpha = 0.65;
        } else {
            // 鏅€氱（鎹熷瓧
            ctx.globalAlpha = 0.9;
        }
        
        // 纭畾浠?(offsetX, offsetY) 涓哄熀鍑嗙殑鍖呭洿鐩?
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
                // 1. 闅忔満鎵佹き鍦?
                const rx = (Math.random() * 0.8 + 0.2) * noiseRadius;
                const ry = rx * (Math.random() * 0.4 + 0.2);
                const rotation = Math.random() * Math.PI * 2;
                ctx.beginPath();
                ctx.ellipse(px, py, rx, ry, rotation, 0, Math.PI * 2);
                ctx.fill();
            } else if (rand < 0.85) {
                // 2. 缁嗛暱鍒掔棔
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
                // 3. 澶嶅悎纰庢枒
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