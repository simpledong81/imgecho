/**
 * 导出管理模块
 * 处理图片和信息页的导出功能
 */
import { MetadataRenderer } from './metadataRenderer.js';

/**
 * 导出管理器类
 */
export class ExportManager {
    /**
     * 导出图片函数（仅Canvas方式）
     * @param {ImageProcessor} imageProcessor - 图片处理器实例
     * @param {Object} languageManager - 语言管理器实例
     */
    static exportImageWithCanvas(imageProcessor, languageManager) {
        if (!imageProcessor.getOriginalImage()) {
            alert('请先上传图片！');
            return;
        }
        
        this.exportWithCanvas(imageProcessor, languageManager);
    }

    /**
     * 导出信息页函数
     * @param {ImageProcessor} imageProcessor - 图片处理器实例
     * @param {Object} languageManager - 语言管理器实例
     */
    static exportInfoPage(imageProcessor, languageManager) {
        if (!imageProcessor.getOriginalImage()) {
            alert('请先上传图片！');
            return;
        }
        
        this.exportWithoutCanvas(imageProcessor, languageManager);
    }

    /**
     * 使用Canvas导出（原有方式）
     * @param {ImageProcessor} imageProcessor - 图片处理器实例
     * @param {Object} languageManager - 语言管理器实例
     */
    static async exportWithCanvas(imageProcessor, languageManager) {
        // 确保画布已完成渲染
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        // 创建新画布专门用于导出
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = imageProcessor.getCanvas().width;
        exportCanvas.height = imageProcessor.getCanvas().height;
        const exportCtx = exportCanvas.getContext('2d');
        
        // 重新绘制所有内容
        const originalImage = imageProcessor.getOriginalImage();
        exportCtx.drawImage(originalImage, 0, 0);
        MetadataRenderer.updateMetadataOverlay(imageProcessor, languageManager, exportCtx);
        
        // 等待一帧确保绘制完成
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        // 创建下载链接
        exportCanvas.toBlob(blob => {
            if (!blob) {
                throw new Error('无法创建图片数据');
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `photo_${Date.now()}.jpg`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }, 'image/jpeg', 0.95);
    }

    /**
     * 不使用Canvas的标准导出方式
     * 兼容性更好，Windows不会拦截
     * @param {ImageProcessor} imageProcessor - 图片处理器实例
     * @param {Object} languageManager - 语言管理器实例
     */
    static async exportWithoutCanvas(imageProcessor, languageManager) {
        const originalImage = imageProcessor.getOriginalImage();
        if (!originalImage) {
            throw new Error('没有可用的图片数据');
        }
        
        // 创建新的图片对象
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        // 等待图片加载完成
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = originalImage.src;
        });
        
        // 创建包含元数据的HTML文档
        const htmlContent = this.createImageWithMetadataHTML(img, languageManager);
        
        // 创建Blob对象
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = url;
        link.download = `photo_${Date.now()}.html`;
        link.click();
        
        // 清理URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * 创建包含图片和元数据的HTML文档
     * @param {Image} img - 图片对象
     * @param {Object} languageManager - 语言管理器实例
     * @returns {string} HTML内容
     */
    static createImageWithMetadataHTML(img, languageManager) {
        const metadata = MetadataRenderer.getCurrentMetadata(languageManager);
        const timestamp = new Date().toLocaleString('zh-CN');
        
        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>图片信息 - ${timestamp}</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
        }
        .image-section {
            text-align: center;
            margin-bottom: 20px;
        }
        .image-section img {
            max-width: 100%;
            height: auto;
            border-radius: 5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .metadata-section {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 15px;
        }
        .metadata-section h3 {
            margin-top: 0;
            color: #2563eb;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 5px;
        }
        .metadata-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
        }
        .metadata-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .metadata-label {
            font-weight: bold;
            color: #4a5568;
        }
        .metadata-value {
            color: #2d3748;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #718096;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="image-section">
            <img src="${img.src}" alt="导出图片">
        </div>
        
        <div class="metadata-section">
            <h3>📸 图片信息</h3>
            <div class="metadata-grid">
                ${Object.entries(metadata).map(([key, value]) => 
        value ? `<div class="metadata-item">
                        <span class="metadata-label">${key}</span>
                        <span class="metadata-value">${value}</span>
                    </div>` : ''
    ).filter(Boolean).join('')}
            </div>
        </div>
        
        <div class="footer">
            <p>导出时间: ${timestamp} | 使用 ImgEcho 工具生成</p>
        </div>
    </div>
</body>
</html>`;
    }
}
