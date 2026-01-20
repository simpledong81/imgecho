/**
 * 批量导出器
 * 处理批量图片导出为 ZIP 文件
 */
import JSZip from 'jszip';
import { MetadataRenderer } from './metadataRenderer.js';
import { Dialog } from './dialog.js';

/**
 * BatchExporter 类
 */
export class BatchExporter {
    constructor(batchProcessor, imageProcessor, languageManager) {
        this.batchProcessor = batchProcessor;
        this.imageProcessor = imageProcessor;
        this.languageManager = languageManager;
        this.progressCallback = null;
    }

    /**
     * 设置进度回调
     * @param {Function} callback - 回调函数 (current, total)
     */
    setProgressCallback(callback) {
        this.progressCallback = callback;
    }

    /**
     * 导出所有图片为 ZIP
     */
    async exportAsZip() {
        const queue = this.batchProcessor.getQueue();

        if (queue.length === 0) {
            await Dialog.alert('队列为空，没有图片可导出', '提示');
            return;
        }

        try {
            this.batchProcessor.setProcessing(true);
            const zip = new JSZip();

            // 通知开始处理
            this.updateProgress(0, queue.length);

            // 逐个处理图片
            for (let i = 0; i < queue.length; i++) {
                const item = queue[i];

                try {
                    item.status = 'processing';

                    // 处理图片
                    const blob = await this.processImage(item);

                    // 添加到 ZIP
                    const filename = this.sanitizeFilename(item.name, i);
                    zip.file(filename, blob);

                    item.status = 'completed';
                    item.processedBlob = blob;

                    // 更新进度
                    this.updateProgress(i + 1, queue.length);

                    // 每 10 张图片暂停一下，让 GC 工作
                    if ((i + 1) % 10 === 0) {
                        await new Promise((r) => setTimeout(r, 100));
                    }
                } catch (error) {
                    console.error(`处理失败 (${item.name}):`, error);
                    item.status = 'error';
                    item.error = error.message;
                    // 继续处理下一张
                }
            }

            // 生成 ZIP 文件
            console.log('正在生成 ZIP 文件...');
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 },
            });

            // 下载 ZIP
            this.downloadZip(zipBlob, `imgecho_batch_${Date.now()}.zip`);

            // 检查是否有失败的图片
            const failedCount = queue.filter((item) => item.status === 'error').length;
            if (failedCount > 0) {
                await Dialog.alert(`导出完成！成功 ${queue.length - failedCount} 张，失败 ${failedCount} 张`, '导出完成');
            } else {
                await Dialog.alert('所有图片导出成功！', '导出完成');
            }
        } catch (error) {
            console.error('批量导出失败:', error);
            await Dialog.alert('批量导出失败: ' + error.message, '错误');
        } finally {
            this.batchProcessor.setProcessing(false);
        }
    }

    /**
     * 处理单张图片
     * @param {BatchImageItem} item - 图片项
     * @returns {Promise<Blob>}
     */
    async processImage(item) {
        // 创建临时 canvas
        const canvas = document.createElement('canvas');
        canvas.width = item.originalImage.width;
        canvas.height = item.originalImage.height;
        const ctx = canvas.getContext('2d');

        // 应用模糊（如果有）
        const blurValue = this.imageProcessor.blurValue || 0;
        if (blurValue > 0) {
            ctx.filter = `blur(${blurValue}px)`;
        }

        // 绘制原图
        ctx.drawImage(item.originalImage, 0, 0);

        // 重置滤镜
        ctx.filter = 'none';

        // 获取元数据（个性化或共享设置）
        const metadata = this.batchProcessor.getImageMetadata(item);

        // 创建临时 imageProcessor 用于渲染
        const tempProcessor = {
            getCanvas: () => canvas,
            getContext: () => ctx,
            getOriginalImage: () => item.originalImage,
        };

        // 渲染元数据叠加层（复用 MetadataRenderer）
        MetadataRenderer.updateMetadataOverlay(tempProcessor, this.languageManager, ctx, metadata);

        // 转换为 Blob
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas 转换失败'));
                    }
                },
                'image/jpeg',
                0.95
            );
        });
    }

    /**
     * 清理文件名
     * @param {string} filename - 原始文件名
     * @param {number} index - 索引
     * @returns {string} 清理后的文件名
     */
    sanitizeFilename(filename, index) {
        // 移除扩展名
        const base = filename.replace(/\.[^/.]+$/, '');

        // 清理非法字符
        const sanitized = base.replace(/[^a-z0-9_\u4e00-\u9fa5-]/gi, '_');

        // 添加索引和扩展名
        return `${sanitized}_${String(index + 1).padStart(3, '0')}.jpg`;
    }

    /**
     * 下载 ZIP 文件
     * @param {Blob} blob - ZIP Blob
     * @param {string} filename - 文件名
     */
    downloadZip(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();

        // 清理
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * 更新进度
     * @param {number} current - 当前进度
     * @param {number} total - 总数
     */
    updateProgress(current, total) {
        if (this.progressCallback) {
            this.progressCallback(current, total);
        }
    }
}
