/**
 * 元数据渲染模块
 * 处理图片元数据在画布上的渲染
 */
import { buildTextLines, calculateTextPosition } from './utils.js';

/**
 * 元数据渲染器类
 */
export class MetadataRenderer {
    /**
     * 更新元数据覆盖层
     * @param {ImageProcessor} imageProcessor - 图片处理器实例
     * @param {Object} languageManager - 语言管理器实例
     * @param {CanvasRenderingContext2D} overrideCtx - 可选的画布上下文（用于导出）
     * @param {Object} logoManager - Logo 管理器实例（可选）
     */
    static updateMetadataOverlay(imageProcessor, languageManager, overrideCtx = null, logoManager = null) {
        const ctx = overrideCtx || imageProcessor.getContext();
        const canvas = imageProcessor.getCanvas();
        const originalImage = imageProcessor.getOriginalImage();
        
        // 先清除画布，重新绘制图片
        if (originalImage) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.filter = `blur(${document.getElementById('blur-slider').value * 2}px)`;
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
        
        // 获取字体设置
        const fontFamily = document.getElementById('font-family').value;
        const fontWeight = document.getElementById('font-weight').value;
        const fontSizePercent = parseFloat(document.getElementById('font-size').value);
        const fontSize = Math.max(12, (canvas.height * fontSizePercent) / 100);

        // 获取高级文字样式参数
        const fontColor = document.getElementById('font-color')?.value || '#FFFFFF';
        const fontOpacity = parseFloat(document.getElementById('font-opacity')?.value || 100) / 100;
        const strokeColor = document.getElementById('stroke-color')?.value || '#000000';
        const strokeWidth = parseFloat(document.getElementById('stroke-width')?.value || 0);
        const textShadow = document.getElementById('text-shadow')?.checked ?? true;
        const backgroundMask = document.getElementById('bg-mask')?.checked || false;
        const maskOpacity = parseFloat(document.getElementById('bg-mask-opacity')?.value || 50) / 100;
        const textRotation = parseFloat(document.getElementById('text-rotation')?.value || 0);
        const letterSpacing = parseFloat(document.getElementById('letter-spacing')?.value || 0);
        const customLineHeight = parseFloat(document.getElementById('line-height')?.value || 1.8);
        const lineHeight = fontSize * customLineHeight;

        // 设置文字样式
        const fontStyle = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.font = fontStyle;

        // 根据位置设置文本对齐方式
        const fontPosition = document.getElementById('font-position').value;
        ctx.textAlign = (fontPosition === 'center' || fontPosition === 'bottom-center') ? 'center' : (fontPosition.includes('right') ? 'right' : 'left');
        ctx.textBaseline = fontPosition.includes('bottom') ? 'bottom' : 'top';
        
        // 收集所有元数据字段
        const metadata = this.collectMetadata(languageManager);
        
        // 单独处理注释
        const notes = document.getElementById('notes').value;
        
        // 获取显示模式
        const displayMode = document.getElementById('display-mode').value;
        
        // 构建文本内容
        let textLines = buildTextLines(metadata, notes, displayMode);
        
        // 如果没有内容需要显示，直接返回
        if (textLines.length === 0) return;

        // 绘制文本
        this.drawTextLines(ctx, canvas, textLines, fontSize, {
            lineHeight,
            fontColor,
            fontOpacity,
            strokeColor,
            strokeWidth,
            textShadow,
            backgroundMask,
            maskOpacity,
            textRotation,
            letterSpacing
        });

        // 绘制 Logo（如果有）
        if (logoManager && logoManager.getCurrentLogo()) {
            this.renderLogo(ctx, canvas, logoManager);
        }
    }

    /**
     * 渲染 Logo
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {HTMLCanvasElement} canvas - 画布元素
     * @param {Object} logoManager - Logo 管理器实例
     */
    static renderLogo(ctx, canvas, logoManager) {
        const logoPosition = document.getElementById('logo-position')?.value || 'bottom-right';
        const logoSize = parseFloat(document.getElementById('logo-size')?.value || 10);
        const logoOpacity = parseFloat(document.getElementById('logo-opacity')?.value || 100) / 100;
        const logoTiled = document.getElementById('logo-tiled')?.checked || false;

        logoManager.renderLogo(ctx, canvas, {
            position: logoPosition,
            size: logoSize,
            opacity: logoOpacity,
            tiled: logoTiled,
        });
    }

    /**
     * 收集所有元数据字段
     * @param {Object} languageManager - 语言管理器实例
     * @returns {Object} 元数据对象
     */
    static collectMetadata(languageManager) {
        return {
            [languageManager.get('camera')]: document.getElementById('camera').value,
            [languageManager.get('lens')]: document.getElementById('lens').value,
            [languageManager.get('location')]: document.getElementById('location').value,
            [languageManager.get('iso')]: document.getElementById('iso').value,
            [languageManager.get('aperture')]: document.getElementById('aperture').value,
            [languageManager.get('shutter')]: document.getElementById('shutter').value,
            [languageManager.get('copyright')]: document.getElementById('copyright').value
        };
    }

    /**
     * 绘制文本行
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {HTMLCanvasElement} canvas - 画布元素
     * @param {Array} textLines - 文本行数组
     * @param {number} fontSize - 字体大小
     * @param {Object} options - 渲染选项
     * @param {number} options.lineHeight - 行高
     * @param {string} options.fontColor - 文字颜色
     * @param {number} options.fontOpacity - 文字透明度 (0-1)
     * @param {string} options.strokeColor - 描边颜色
     * @param {number} options.strokeWidth - 描边粗细
     * @param {boolean} options.textShadow - 是否显示文字阴影
     * @param {boolean} options.backgroundMask - 是否显示背景遮罩
     * @param {number} options.maskOpacity - 遮罩透明度 (0-1)
     * @param {number} options.textRotation - 文字旋转角度
     * @param {number} options.letterSpacing - 字间距
     */
    static drawTextLines(ctx, canvas, textLines, fontSize, options = {}) {
        const {
            lineHeight = fontSize * 1.8,
            fontColor = '#FFFFFF',
            fontOpacity = 1,
            strokeColor = '#000000',
            strokeWidth = 0,
            textShadow = true,
            backgroundMask = false,
            maskOpacity = 0.5,
            textRotation = 0,
            letterSpacing = 0
        } = options;

        // 获取字体位置
        const fontPosition = document.getElementById('font-position').value;

        // 计算文本位置和布局
        const margin = Math.max(25, fontSize * 1.2);

        // 计算文本块的总高度和最大宽度
        let maxLineWidth = 0;
        textLines.forEach(line => {
            const lineWidth = ctx.measureText(line).width;
            maxLineWidth = Math.max(maxLineWidth, lineWidth);
        });

        const totalTextHeight = textLines.length * lineHeight;

        // 根据位置计算起始坐标
        const { startX, startY } = calculateTextPosition(fontPosition, margin, maxLineWidth, totalTextHeight, canvas);

        // 确保文本绘制不受任何滤镜影响
        ctx.save();
        ctx.filter = 'none';
        ctx.globalAlpha = fontOpacity;  // 应用文字透明度

        // 应用旋转（如果需要）
        if (textRotation !== 0) {
            const centerX = startX + maxLineWidth / 2;
            const centerY = startY + totalTextHeight / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate((textRotation * Math.PI) / 180);
            ctx.translate(-centerX, -centerY);
        }

        // 绘制背景遮罩（如果启用）
        if (backgroundMask) {
            this.drawBackgroundMask(ctx, startX, startY, maxLineWidth, totalTextHeight, maskOpacity, fontOpacity, fontPosition, lineHeight);
        }

        // 设置文字阴影（可选）
        if (textShadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
        } else {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }

        // 设置文字颜色
        ctx.fillStyle = fontColor;

        // 设置描边（如果需要）
        if (strokeWidth > 0) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
        }

        // 绘制文本
        textLines.forEach((line, index) => {
            const y = startY + index * lineHeight;
            const x = startX;

            // 如果需要字间距，逐字符绘制
            if (letterSpacing > 0) {
                this.drawTextWithLetterSpacing(ctx, line, x, y, letterSpacing, strokeWidth);
            } else {
                // 正常绘制
                if (strokeWidth > 0) {
                    ctx.strokeText(line, x, y);
                }
                ctx.fillText(line, x, y);
            }
        });

        ctx.restore();
    }

    /**
     * 绘制带字间距的文本
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {string} text - 文本内容
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {number} letterSpacing - 字间距
     * @param {number} strokeWidth - 描边粗细
     */
    static drawTextWithLetterSpacing(ctx, text, x, y, letterSpacing, strokeWidth) {
        let currentX = x;
        for (let char of text) {
            if (strokeWidth > 0) {
                ctx.strokeText(char, currentX, y);
            }
            ctx.fillText(char, currentX, y);
            currentX += ctx.measureText(char).width + letterSpacing;
        }
    }

    /**
     * 绘制背景遮罩
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} x - X 坐标（文本绘制起点）
     * @param {number} y - Y 坐标（第一行文本的 baseline 位置）
     * @param {number} width - 宽度（文本块宽度）
     * @param {number} height - 高度（totalTextHeight）
     * @param {number} opacity - 遮罩透明度 (0-1)
     * @param {number} currentAlpha - 当前透明度（用于恢复）
     * @param {string} fontPosition - 文字位置（用于计算遮罩实际位置）
     * @param {number} lineHeight - 单行行高
     */
    static drawBackgroundMask(ctx, x, y, width, height, opacity, currentAlpha, fontPosition, lineHeight) {
        const padding = 10;

        // 根据文字位置和对齐方式计算遮罩的实际左上角坐标
        let maskX = x;
        let maskY = y;

        // 根据文字对齐方式调整遮罩 X 坐标
        if (fontPosition === 'center' || fontPosition === 'bottom-center') {
            // 居中对齐：遮罩应该从文本中心向两边扩展
            maskX = x - width / 2;
        } else if (fontPosition === 'top-right' || fontPosition === 'bottom-right') {
            // 右对齐：遮罩应该在文本左侧
            maskX = x - width;
        }
        // 左对齐（top-left, bottom-left）：maskX = x，无需调整

        // 根据文字基线调整遮罩 Y 坐标
        // 对于 bottom 位置，y 是第一行文本的底部（textBaseline='bottom'）
        // 第一行顶部在 y - lineHeight，所以遮罩顶部应该是 y - lineHeight
        if (fontPosition.includes('bottom')) {
            maskY = y - lineHeight;
        }
        // 对于 top 和 center 位置，y 是第一行文本的顶部（textBaseline='top'）
        // maskY = y 正确

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = '#000000';
        ctx.shadowColor = 'transparent';  // 背景遮罩不需要阴影
        ctx.shadowBlur = 0;
        ctx.fillRect(maskX - padding, maskY - padding, width + padding * 2, height + padding * 2);
        ctx.restore();
        ctx.globalAlpha = currentAlpha;  // 恢复文字透明度
    }

    /**
     * 获取当前所有元数据
     * @param {Object} languageManager - 语言管理器实例
     * @returns {Object} 元数据对象
     */
    static getCurrentMetadata(languageManager) {
        return {
            [languageManager.get('camera')]: document.getElementById('camera').value,
            [languageManager.get('lens')]: document.getElementById('lens').value,
            [languageManager.get('location')]: document.getElementById('location').value,
            [languageManager.get('iso')]: document.getElementById('iso').value,
            [languageManager.get('aperture')]: document.getElementById('aperture').value,
            [languageManager.get('shutter')]: document.getElementById('shutter').value,
            [languageManager.get('copyright')]: document.getElementById('copyright').value,
            [languageManager.get('notes')]: document.getElementById('notes').value
        };
    }

    /**
     * 设置默认元数据
     * @param {Object} languageManager - 语言管理器实例
     */
    static setDefaultMetadata(languageManager) {
        document.getElementById('camera').value = 'Canon EOS R5';
        document.getElementById('lens').value = 'EF 24-70mm f/2.8L II USM';
        document.getElementById('location').value = languageManager.get('defaultLocation');
        document.getElementById('iso').value = '100';
        document.getElementById('aperture').value = 'f/8';
        document.getElementById('shutter').value = '1/125s';
        document.getElementById('notes').value = languageManager.get('defaultNotes');
        document.getElementById('copyright').value = languageManager.get('defaultCopyright');
    }
}
