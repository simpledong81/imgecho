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
        const lineHeight = fontSize * 1.8;
        
        // 设置文字样式
        const fontStyle = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.font = fontStyle;
        
        // 根据位置设置文本对齐方式
        const fontPosition = document.getElementById('font-position').value;
        ctx.textAlign = (fontPosition === 'center' || fontPosition === 'bottom-center') ? 'center' : (fontPosition.includes('right') ? 'right' : 'left');
        ctx.textBaseline = fontPosition.includes('bottom') ? 'bottom' : 'top';
        
        // 设置阴影效果
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
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
        this.drawTextLines(ctx, canvas, textLines, fontSize, lineHeight);

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
     * @param {number} lineHeight - 行高
     */
    static drawTextLines(ctx, canvas, textLines, fontSize, lineHeight) {
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
        ctx.globalAlpha = 1;
        
        // 绘制文本
        ctx.fillStyle = 'white';
        textLines.forEach((line, index) => {
            const y = startY + index * lineHeight;
            const x = startX;
            ctx.fillText(line, x, y);
        });
        
        ctx.restore();
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
