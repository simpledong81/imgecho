/**
 * 工具函数模块
 * 包含各种辅助函数
 */

/**
 * 格式化曝光时间
 * @param {number} time - 曝光时间
 * @returns {string} 格式化后的曝光时间
 */
export function formatExposureTime(time) {
    if (time >= 1) {
        return `${time}s`;
    } else {
        const denominator = Math.round(1 / time);
        return `1/${denominator}s`;
    }
}

/**
 * 将度分秒格式转换为十进制
 * @param {Array} dmsArray - 度分秒数组 [度, 分, 秒]
 * @param {string} ref - 方向参考 (N/S/E/W)
 * @returns {number|null} 十进制坐标
 */
export function convertDMSToDD(dmsArray, ref) {
    if (!Array.isArray(dmsArray) || dmsArray.length < 3) {
        return null;
    }
    
    try {
        const degrees = dmsArray[0];
        const minutes = dmsArray[1];
        const seconds = dmsArray[2];
        
        // 确保所有值都是数字
        const deg = typeof degrees === 'number' ? degrees : parseFloat(degrees);
        const min = typeof minutes === 'number' ? minutes : parseFloat(minutes);
        const sec = typeof seconds === 'number' ? seconds : parseFloat(seconds);
        
        if (isNaN(deg) || isNaN(min) || isNaN(sec)) {
            return null;
        }
        
        // 计算十进制坐标
        let dd = deg + (min / 60) + (sec / 3600);
        
        // 根据方向参考调整正负
        if (ref === 'S' || ref === 'W') {
            dd = -dd;
        }
        
        return dd;
    } catch (error) {
        console.warn('坐标转换失败:', error);
        return null;
    }
}

/**
 * 构建文本行数组
 * @param {Object} metadata - 元数据对象
 * @param {string} notes - 注释文本
 * @param {string} displayMode - 显示模式
 * @returns {Array} 文本行数组
 */
export function buildTextLines(metadata, notes, displayMode) {
    let textLines = [];
    
    // 添加元数据行
    Object.entries(metadata).forEach(([key, value]) => {
        if (value.trim()) {
            if (displayMode === 'full') {
                textLines.push(`${key}: ${value}`);
            } else {
                textLines.push(value);
            }
        }
    });
    
    // 添加注释内容
    if (notes.trim()) {
        if (textLines.length > 0) {
            textLines.push('─'.repeat(15));
        }
        textLines.push(...notes.trim().split('\n'));
    }
    
    return textLines;
}

/**
 * 计算文本位置
 * @param {string} fontPosition - 字体位置
 * @param {number} margin - 边距
 * @param {number} maxLineWidth - 最大行宽
 * @param {number} totalTextHeight - 总文本高度
 * @param {Object} canvas - 画布对象
 * @returns {Object} 起始坐标对象
 */
export function calculateTextPosition(fontPosition, margin, maxLineWidth, totalTextHeight, canvas) {
    let startX, startY;
    
    switch (fontPosition) {
        case 'top-left':
            startX = margin;
            startY = margin;
            break;
        case 'top-right':
            startX = canvas.width - margin - maxLineWidth;
            startY = margin;
            break;
        case 'bottom-left':
            startX = margin;
            startY = canvas.height - margin - totalTextHeight;
            break;
        case 'bottom-right':
            startX = canvas.width - margin - maxLineWidth;
            startY = canvas.height - margin - totalTextHeight;
            break;
        case 'center':
            startX = (canvas.width - maxLineWidth) / 2;
            startY = (canvas.height - totalTextHeight) / 2;
            break;
        default:
            startX = margin;
            startY = margin;
    }
    
    return { startX, startY };
}