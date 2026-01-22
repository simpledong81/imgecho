/**
 * 社交媒体优化管理器
 * 提供预设尺寸、多尺寸导出、安全区域提示等功能
 */
export class SocialMediaManager {
    /**
     * 社交媒体平台预设配置
     */
    static PRESETS = {
        instagram_square: {
            name: 'Instagram Square',
            nameZh: 'Instagram 正方形',
            width: 1080,
            height: 1080,
            aspectRatio: '1:1',
            safeArea: { top: 0, bottom: 0, left: 0, right: 0 } // 无特殊安全区域
        },
        instagram_story: {
            name: 'Instagram Story',
            nameZh: 'Instagram 故事',
            width: 1080,
            height: 1920,
            aspectRatio: '9:16',
            safeArea: { top: 250, bottom: 250, left: 0, right: 0 } // 顶部和底部有UI遮挡
        },
        wechat_moments: {
            name: 'WeChat Moments',
            nameZh: '微信朋友圈',
            width: 1280,
            height: 1280,
            aspectRatio: '1:1',
            safeArea: { top: 0, bottom: 0, left: 0, right: 0 }
        },
        weibo: {
            name: 'Weibo Post',
            nameZh: '微博配图',
            width: 2048,
            height: 2048,
            aspectRatio: '1:1',
            safeArea: { top: 0, bottom: 0, left: 0, right: 0 }
        },
        youtube_thumbnail: {
            name: 'YouTube Thumbnail',
            nameZh: 'YouTube 缩略图',
            width: 1280,
            height: 720,
            aspectRatio: '16:9',
            safeArea: { top: 0, bottom: 80, left: 0, right: 180 } // 右下角有播放时长显示
        },
        twitter_post: {
            name: 'Twitter Post',
            nameZh: 'Twitter 配图',
            width: 1200,
            height: 675,
            aspectRatio: '16:9',
            safeArea: { top: 0, bottom: 0, left: 0, right: 0 }
        },
        facebook_post: {
            name: 'Facebook Post',
            nameZh: 'Facebook 配图',
            width: 1200,
            height: 630,
            aspectRatio: '1.91:1',
            safeArea: { top: 0, bottom: 0, left: 0, right: 0 }
        }
    };

    constructor() {
        this.currentPreset = null;
        this.showSafeArea = false;
    }

    /**
     * 获取所有预设配置
     */
    static getAllPresets() {
        return Object.entries(this.PRESETS).map(([key, preset]) => ({
            ...preset,
            key
        }));
    }

    /**
     * 获取指定预设配置
     */
    static getPreset(key) {
        return this.PRESETS[key];
    }

    /**
     * 根据预设尺寸调整图片
     * @param {HTMLCanvasElement} sourceCanvas - 源画布
     * @param {string} presetKey - 预设键名
     * @param {string} fitMode - 适配模式: 'cover' (覆盖), 'contain' (包含), 'fill' (拉伸)
     * @returns {HTMLCanvasElement} 调整后的画布
     */
    static resizeToPreset(sourceCanvas, presetKey, fitMode = 'cover') {
        const preset = this.getPreset(presetKey);
        if (!preset) {
            throw new Error(`Unknown preset: ${presetKey}`);
        }

        const targetCanvas = document.createElement('canvas');
        targetCanvas.width = preset.width;
        targetCanvas.height = preset.height;
        const ctx = targetCanvas.getContext('2d');

        // 填充背景色（白色）
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, preset.width, preset.height);

        const sourceWidth = sourceCanvas.width;
        const sourceHeight = sourceCanvas.height;
        const targetWidth = preset.width;
        const targetHeight = preset.height;

        let dx = 0;
        let dy = 0;
        let dw = targetWidth;
        let dh = targetHeight;

        if (fitMode === 'cover') {
            // 覆盖模式：保持比例，填满目标尺寸，可能裁剪
            const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
            dw = sourceWidth * scale;
            dh = sourceHeight * scale;
            dx = (targetWidth - dw) / 2;
            dy = (targetHeight - dh) / 2;
        } else if (fitMode === 'contain') {
            // 包含模式：保持比例，完整显示，可能留白
            const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
            dw = sourceWidth * scale;
            dh = sourceHeight * scale;
            dx = (targetWidth - dw) / 2;
            dy = (targetHeight - dh) / 2;
        }
        // fill 模式直接使用 dx=0, dy=0, dw=targetWidth, dh=targetHeight

        ctx.drawImage(sourceCanvas, dx, dy, dw, dh);

        return targetCanvas;
    }

    /**
     * 在画布上绘制安全区域提示
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {string} presetKey - 预设键名
     */
    static drawSafeArea(ctx, presetKey) {
        const preset = this.getPreset(presetKey);
        if (!preset) return;

        const { safeArea } = preset;
        const { top, bottom, left, right } = safeArea;

        // 如果没有安全区域限制，则不绘制
        if (top === 0 && bottom === 0 && left === 0 && right === 0) return;

        // 使用实际画布尺寸
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        // 计算缩放比例（画布实际尺寸 / 预设原始尺寸）
        const scaleX = canvasWidth / preset.width;
        const scaleY = canvasHeight / preset.height;

        // 按比例调整安全区域尺寸
        const scaledTop = top * scaleY;
        const scaledBottom = bottom * scaleY;
        const scaledLeft = left * scaleX;
        const scaledRight = right * scaleX;

        // 保存当前状态
        ctx.save();

        // 绘制半透明遮罩
        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';

        // 顶部安全区域
        if (scaledTop > 0) {
            ctx.fillRect(0, 0, canvasWidth, scaledTop);
        }

        // 底部安全区域
        if (scaledBottom > 0) {
            ctx.fillRect(0, canvasHeight - scaledBottom, canvasWidth, scaledBottom);
        }

        // 左侧安全区域
        if (scaledLeft > 0) {
            ctx.fillRect(0, 0, scaledLeft, canvasHeight);
        }

        // 右侧安全区域
        if (scaledRight > 0) {
            ctx.fillRect(canvasWidth - scaledRight, 0, scaledRight, canvasHeight);
        }

        // 绘制安全区域边界线
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        ctx.beginPath();
        // 内容安全区域矩形
        ctx.rect(
            scaledLeft,
            scaledTop,
            canvasWidth - scaledLeft - scaledRight,
            canvasHeight - scaledTop - scaledBottom
        );
        ctx.stroke();

        // 恢复状态
        ctx.restore();
    }

    /**
     * 复制画布内容到剪贴板
     * @param {HTMLCanvasElement} canvas - 要复制的画布
     * @returns {Promise<boolean>} 是否成功复制
     */
    static async copyToClipboard(canvas) {
        try {
            // 将画布转换为 Blob
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });

            if (!blob) {
                throw new Error('Failed to create blob from canvas');
            }

            // 使用 Clipboard API 复制
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);

            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    /**
     * 批量生成多个预设尺寸的图片
     * @param {HTMLCanvasElement} sourceCanvas - 源画布
     * @param {Array<string>} presetKeys - 预设键名数组
     * @param {string} fitMode - 适配模式
     * @returns {Array<{preset: object, canvas: HTMLCanvasElement}>} 生成的画布数组
     */
    static generateMultipleSizes(sourceCanvas, presetKeys, fitMode = 'cover') {
        return presetKeys.map(key => {
            const preset = this.getPreset(key);
            const canvas = this.resizeToPreset(sourceCanvas, key, fitMode);
            return {
                preset: { ...preset, key },
                canvas
            };
        });
    }

    /**
     * 导出多个预设尺寸的图片为 ZIP 文件
     * @param {HTMLCanvasElement} sourceCanvas - 源画布
     * @param {Array<string>} presetKeys - 预设键名数组
     * @param {string} fitMode - 适配模式
     * @param {Function} languageManager - 语言管理器
     */
    static async exportMultipleSizesAsZip(sourceCanvas, presetKeys, fitMode, languageManager) {
        // 动态加载 JSZip 库
        if (typeof window.JSZip === 'undefined') {
            await this.loadJSZip();
        }

        const zip = new window.JSZip();
        const timestamp = Date.now();

        // 生成所有尺寸的图片
        const results = this.generateMultipleSizes(sourceCanvas, presetKeys, fitMode);

        // 添加到 ZIP
        for (const { preset, canvas } of results) {
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });

            const filename = `${preset.key}_${preset.width}x${preset.height}.png`;
            zip.file(filename, blob);
        }

        // 生成并下载 ZIP 文件
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `social_media_images_${timestamp}.zip`;
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * 动态加载 JSZip 库
     */
    static async loadJSZip() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * 获取预设的本地化名称
     * @param {string} presetKey - 预设键名
     * @param {string} language - 语言代码
     * @returns {string} 本地化名称
     */
    static getLocalizedPresetName(presetKey, language = 'en') {
        const preset = this.getPreset(presetKey);
        if (!preset) return presetKey;

        return language === 'zh' ? preset.nameZh : preset.name;
    }
}
