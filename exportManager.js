/**
 * 导出管理模块
 * 处理图片和信息页的导出功能
 */
import { MetadataRenderer } from './metadataRenderer.js';
import { Dialog } from './dialog.js';

/**
 * 导出管理器类
 */
export class ExportManager {
    /**
     * 导出图片函数（仅Canvas方式）
     * @param {ImageProcessor} imageProcessor - 图片处理器实例
     * @param {Object} languageManager - 语言管理器实例
     * @param {string} format - 导出格式 ('jpeg', 'png', 'webp', 'pdf')
     * @param {number} quality - 导出质量 (0-100)
     */
    static async exportImageWithCanvas(imageProcessor, languageManager, format = 'jpeg', quality = 95) {
        if (!imageProcessor.getOriginalImage()) {
            await Dialog.alert('请先上传图片！', '提示');
            return;
        }

        this.exportWithCanvas(imageProcessor, languageManager, format, quality);
    }

    /**
     * 导出信息页函数
     * @param {ImageProcessor} imageProcessor - 图片处理器实例
     * @param {Object} languageManager - 语言管理器实例
     */
    static async exportInfoPage(imageProcessor, languageManager) {
        if (!imageProcessor.getOriginalImage()) {
            await Dialog.alert('请先上传图片！', '提示');
            return;
        }

        this.exportWithoutCanvas(imageProcessor, languageManager);
    }

    /**
     * 使用Canvas导出（支持多格式）
     * @param {ImageProcessor} imageProcessor - 图片处理器实例
     * @param {Object} languageManager - 语言管理器实例
     * @param {string} format - 导出格式 ('jpeg', 'png', 'webp', 'pdf')
     * @param {number} quality - 导出质量 (0-100)
     */
    static async exportWithCanvas(imageProcessor, languageManager, format = 'jpeg', quality = 95) {
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

        // 根据格式导出
        if (format === 'pdf') {
            await this.exportToPDF(exportCanvas, quality);
        } else {
            await this.exportToImage(exportCanvas, format, quality);
        }
    }

    /**
     * 导出为图片格式
     * @param {HTMLCanvasElement} canvas - 画布对象
     * @param {string} format - 格式 ('jpeg', 'png', 'webp')
     * @param {number} quality - 质量 (0-100)
     */
    static async exportToImage(canvas, format, quality) {
        const mimeType = `image/${format}`;
        const fileExt = format;
        const qualityValue = quality / 100;

        canvas.toBlob(blob => {
            if (!blob) {
                throw new Error('无法创建图片数据');
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `photo_${Date.now()}.${fileExt}`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }, mimeType, qualityValue);
    }

    /**
     * 导出为 PDF 格式
     * @param {HTMLCanvasElement} canvas - 画布对象
     * @param {number} quality - 质量 (0-100)
     */
    static async exportToPDF(canvas, quality) {
        // 使用 jsPDF 库
        if (typeof window.jspdf === 'undefined') {
            await Dialog.alert('PDF 导出功能需要加载额外的库。正在加载...', '提示');
            // 动态加载 jsPDF
            await this.loadJsPDF();
        }

        const { jsPDF } = window.jspdf;

        // 计算 PDF 尺寸（A4 或自适应）
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;

        // A4 尺寸 (210mm x 297mm)
        let pdfWidth = 210;
        let pdfHeight = pdfWidth / ratio;

        // 如果高度超过 A4，则调整
        if (pdfHeight > 297) {
            pdfHeight = 297;
            pdfWidth = pdfHeight * ratio;
        }

        // 创建 PDF
        const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
        const pdf = new jsPDF({
            orientation,
            unit: 'mm',
            format: 'a4'
        });

        // 将 canvas 转为图片数据
        const imgData = canvas.toDataURL('image/jpeg', quality / 100);

        // 居中添加图片
        const x = (pdf.internal.pageSize.getWidth() - pdfWidth) / 2;
        const y = (pdf.internal.pageSize.getHeight() - pdfHeight) / 2;

        pdf.addImage(imgData, 'JPEG', x, y, pdfWidth, pdfHeight);

        // 保存 PDF
        pdf.save(`photo_${Date.now()}.pdf`);
    }

    /**
     * 动态加载 jsPDF 库
     */
    static async loadJsPDF() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
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
