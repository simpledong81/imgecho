/**
 * 主应用模块
 * 整合所有模块，初始化应用
 */
// 首先加载 EXIF 库
import './lib/exif-loader.js';

import { ImageProcessor } from './imageProcessor.js';
import { ExifParser } from './exifParser.js';
import { MetadataRenderer } from './metadataRenderer.js';
import { ExportManager } from './exportManager.js';
import languageManager from './locales.js';
import { BatchProcessor } from './batchProcessor.js';
import { BatchExporter } from './batchExporter.js';
import { BatchUI } from './batchUI.js';
import { Dialog } from './dialog.js';
import { TemplateManager } from './templateManager.js';
import { TemplateUI } from './templateUI.js';
import { LogoManager } from './logoManager.js';
import { LogoUI } from './logoUI.js';

/**
 * 主应用类
 */
export class ImgEchoApp {
    constructor() {
        this.imageProcessor = new ImageProcessor();
        this.languageManager = languageManager;
        this.isInitialized = false;

        // 批量处理模块
        this.batchProcessor = new BatchProcessor();
        this.batchExporter = new BatchExporter(
            this.batchProcessor,
            this.imageProcessor,
            this.languageManager
        );
        this.batchUI = new BatchUI(this.batchProcessor, this.languageManager);

        // 模板管理模块
        this.templateManager = new TemplateManager();
        this.templateUI = new TemplateUI(this.templateManager, this.languageManager);

        // Logo 管理模块
        this.logoManager = new LogoManager();
        this.logoUI = new LogoUI(this.logoManager, this.languageManager);
    }

    /**
     * 初始化应用
     * 设置画布上下文、事件监听器，并加载示例图片
     */
    initialize() {
        if (this.isInitialized) return;

        // 初始化图片处理器
        this.imageProcessor.initialize();

        // 设置事件监听器
        this.setupEventListeners();

        // 初始化语言管理器后更新界面
        this.languageManager.updateUI();

        // 初始化模板选择器
        this.templateUI.initTemplateSelectors();

        // 初始化 Logo 选择器
        this.logoUI.initLogoSelect();

        // 加载示例图片
        this.loadSampleImage();

        this.isInitialized = true;
    }

    /**
     * 设置所有事件监听器
     * 包括文件上传、滑块控制、输入字段变化等
     */
    setupEventListeners() {
        // 文件上传事件
        document.getElementById('file-input').addEventListener('change', this.handleImageUpload.bind(this));
        
        // 模糊效果滑块事件
        const blurSlider = document.getElementById('blur-slider');
        blurSlider.addEventListener('input', this.handleBlurChange.bind(this));
        blurSlider.addEventListener('change', this.handleBlurChange.bind(this));
        
        // 字体大小滑块事件
        const fontSizeSlider = document.getElementById('font-size');
        const fontSizeValue = document.getElementById('font-size-value');
        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.addEventListener('input', (e) => {
                const fontSizePercent = parseFloat(e.target.value);
                fontSizeValue.textContent = fontSizePercent.toFixed(1);
                
                // 强制重新渲染整个画布内容
                if (this.imageProcessor.getOriginalImage()) {
                    // 先清除画布
                    const ctx = this.imageProcessor.getContext();
                    const canvas = this.imageProcessor.getCanvas();
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // 重新绘制图片和元数据
                    this.imageProcessor.displayImageOnCanvas(this.imageProcessor.getOriginalImage());
                    this.refreshCanvas();
                }
            });
        }
        
        // 所有输入字段的实时刷新事件
        const inputFields = ['camera', 'lens', 'location', 'iso', 'aperture', 'shutter', 'notes', 'copyright', 'font-family', 'font-weight', 'font-position', 'display-mode'];
        inputFields.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.scheduleRefresh();
                });
                if (element.tagName === 'SELECT') {
                    element.addEventListener('change', () => {
                        this.scheduleRefresh();
                    });
                }
            }
        });
        
        // 语言切换事件
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                const selectedLanguage = e.target.value;
                this.languageManager.setLanguage(selectedLanguage);
            });

            // 设置当前选中的语言
            languageSelect.value = this.languageManager.currentLanguage;
        }
        
        // 导出按钮事件
        document.getElementById('export-btn').addEventListener('click', () => {
            ExportManager.exportImageWithCanvas(this.imageProcessor, this.languageManager);
        });
        
        // 导出信息页按钮事件
        document.getElementById('export-info-btn').addEventListener('click', () => {
            ExportManager.exportInfoPage(this.imageProcessor, this.languageManager);
        });

        // 批量模式事件监听
        this.setupBatchEventListeners();

        // 模板系统事件监听
        this.setupTemplateEventListeners();

        // Logo 系统事件监听
        this.setupLogoEventListeners();
    }

    /**
     * 设置批量模式事件监听器
     */
    setupBatchEventListeners() {
        // 模式切换按钮
        document.getElementById('single-mode-btn').addEventListener('click', () => {
            this.switchToSingleMode();
        });

        document.getElementById('batch-mode-btn').addEventListener('click', () => {
            this.switchToBatchMode();
        });

        // 清空队列按钮
        document.getElementById('clear-queue-btn').addEventListener('click', async () => {
            if (await Dialog.confirm('确定清空队列吗？')) {
                this.batchProcessor.clearQueue();
            }
        });

        // 应用到全部按钮
        document.getElementById('apply-to-all-btn').addEventListener('click', () => {
            this.applyCurrentSettingsToAll();
        });

        // 批量导出按钮
        document.getElementById('batch-export-btn').addEventListener('click', () => {
            this.exportBatch();
        });

        // 监听图片切换前的事件（保存当前图片数据）
        this.batchProcessor.addEventListener('before-image-change', (e) => {
            this.handleBeforeImageChange(e.detail);
        });

        // 监听批量处理器的图片选择事件
        this.batchProcessor.addEventListener('image-selected', (e) => {
            this.handleBatchImageSelected(e.detail);
        });

        // 监听 EXIF 加载完成事件
        this.batchProcessor.addEventListener('exif-loaded', (e) => {
            // 如果是当前图片，且没有共享设置，才更新表单
            const currentImage = this.batchProcessor.getCurrentImage();
            if (currentImage && currentImage.id === e.detail.id && !this.batchProcessor.sharedSettings) {
                this.fillFormWithMetadata(e.detail.exifData);
                this.scheduleRefresh();
            }
        });

        // 监听图片还原事件
        this.batchProcessor.addEventListener('image-reset', (e) => {
            const { imageItem } = e.detail;
            // 重新加载原始 EXIF 数据到表单
            this.fillFormWithMetadata(imageItem.exifData);
            this.scheduleRefresh();
            console.log(`已还原图片 ${imageItem.name} 的表单数据`);
        });
    }

    /**
     * 设置模板系统事件监听器
     */
    setupTemplateEventListeners() {
        // 监听应用模板事件
        document.addEventListener('apply-template', (e) => {
            this.applyTemplateSettings(e.detail.settings);
        });

        // 监听获取当前设置事件（供模板保存使用）
        document.addEventListener('get-current-settings', () => {
            window.currentSettings = this.collectFormData();
        });
    }

    /**
     * 设置 Logo 系统事件监听器
     */
    setupLogoEventListeners() {
        // 监听 Logo 设置变化事件
        document.addEventListener('logo-settings-changed', () => {
            this.scheduleRefresh();
        });
    }

    /**
     * 应用模板设置到表单
     * @param {Object} settings - 模板设置
     */
    applyTemplateSettings(settings) {
        // 应用字体设置
        if (settings.fontFamily) {
            document.getElementById('font-family').value = settings.fontFamily;
        }
        if (settings.fontWeight) {
            document.getElementById('font-weight').value = settings.fontWeight;
        }
        if (settings.fontSize) {
            const fontSizeInput = document.getElementById('font-size');
            const fontSizeValue = document.getElementById('font-size-value');
            if (fontSizeInput) fontSizeInput.value = settings.fontSize;
            if (fontSizeValue) fontSizeValue.textContent = parseFloat(settings.fontSize).toFixed(1);
        }
        if (settings.fontPosition) {
            document.getElementById('font-position').value = settings.fontPosition;
        }
        if (settings.displayMode) {
            document.getElementById('display-mode').value = settings.displayMode;
        }

        // 应用模糊度
        if (settings.blurValue !== undefined) {
            const blurSlider = document.getElementById('blur-slider');
            const blurValue = document.getElementById('blur-value');
            if (blurSlider) blurSlider.value = settings.blurValue;
            if (blurValue) blurValue.textContent = parseFloat(settings.blurValue).toFixed(1);
        }

        // 刷新画布
        this.scheduleRefresh();

        console.log('已应用模板设置:', settings);
    }

    /**
     * 切换到单张模式
     */
    switchToSingleMode() {
        this.batchUI.switchMode('single');
        document.getElementById('file-input').removeAttribute('multiple');
    }

    /**
     * 切换到批量模式
     */
    switchToBatchMode() {
        this.batchUI.switchMode('batch');
        document.getElementById('file-input').setAttribute('multiple', '');
    }

    /**
     * 应用当前设置到所有图片
     */
    async applyCurrentSettingsToAll() {
        const settings = this.collectFormData();
        this.batchProcessor.saveSharedSettings(settings);
        this.batchProcessor.applySharedSettingsToAll();
        await Dialog.alert('已应用当前设置到所有图片');
    }

    /**
     * 导出批量图片
     */
    async exportBatch() {
        if (this.batchProcessor.getIsProcessing()) {
            await Dialog.alert('正在处理中，请稍候...');
            return;
        }

        // 设置进度回调
        this.batchExporter.setProgressCallback((current, total) => {
            this.batchUI.updateProgress(current, total);
        });

        // 开始导出
        await this.batchExporter.exportAsZip();

        // 隐藏进度条
        setTimeout(() => {
            this.batchUI.hideProgress();
        }, 2000);
    }

    /**
     * 处理图片切换前的事件（保存当前图片数据）
     * @param {Object} detail - 事件详情
     */
    handleBeforeImageChange(detail) {
        const { oldIndex } = detail;
        const oldImage = this.batchProcessor.getQueue()[oldIndex];

        if (!oldImage) return;

        // 如果没有共享设置，保存当前表单数据到该图片
        if (!this.batchProcessor.sharedSettings) {
            const currentFormData = this.collectFormData();
            oldImage.userMetadata = currentFormData;
            console.log(`已保存图片 ${oldImage.name} 的设置`);
        }
    }

    /**
     * 处理批量图片选择
     * @param {Object} detail - 事件详情
     */
    handleBatchImageSelected(detail) {
        const { imageItem } = detail;

        // 保存原始图片到 imageProcessor（重要！）
        this.imageProcessor.originalImage = imageItem.originalImage;

        // 加载图片到主画布
        this.imageProcessor.displayImageOnCanvas(imageItem.originalImage);

        // 决定使用哪个数据源填充表单
        let metadataToFill;

        if (this.batchProcessor.sharedSettings) {
            // 如果有共享设置，优先使用共享设置
            metadataToFill = this.batchProcessor.sharedSettings;
        } else if (imageItem.userMetadata) {
            // 否则使用该图片的个性化设置
            metadataToFill = imageItem.userMetadata;
        } else {
            // 最后使用 EXIF 数据
            metadataToFill = imageItem.exifData;
        }

        // 填充表单数据
        if (metadataToFill && Object.keys(metadataToFill).length > 0) {
            this.fillFormWithMetadata(metadataToFill);
        }

        // 刷新画布
        this.scheduleRefresh();
    }

    /**
     * 用元数据填充表单
     * @param {Object} metadata - 元数据对象
     */
    fillFormWithMetadata(metadata) {
        // 填充基本信息
        if (metadata.camera !== undefined) document.getElementById('camera').value = metadata.camera || '';
        if (metadata.lens !== undefined) document.getElementById('lens').value = metadata.lens || '';
        if (metadata.location !== undefined) document.getElementById('location').value = metadata.location || '';
        if (metadata.iso !== undefined) document.getElementById('iso').value = metadata.iso || '';
        if (metadata.aperture !== undefined) document.getElementById('aperture').value = metadata.aperture || '';
        if (metadata.shutter !== undefined) document.getElementById('shutter').value = metadata.shutter || '';
        if (metadata.copyright !== undefined) document.getElementById('copyright').value = metadata.copyright || '';
        if (metadata.notes !== undefined) document.getElementById('notes').value = metadata.notes || '';

        // 填充字体设置
        if (metadata.fontFamily !== undefined) document.getElementById('font-family').value = metadata.fontFamily || "Arial, 'Microsoft YaHei', 微软雅黑, sans-serif";
        if (metadata.fontWeight !== undefined) document.getElementById('font-weight').value = metadata.fontWeight || 'normal';
        if (metadata.fontSize !== undefined) {
            const fontSizeInput = document.getElementById('font-size');
            const fontSizeValue = document.getElementById('font-size-value');
            if (fontSizeInput) fontSizeInput.value = metadata.fontSize || '3';
            if (fontSizeValue) fontSizeValue.textContent = metadata.fontSize || '3.0';
        }
        if (metadata.fontPosition !== undefined) document.getElementById('font-position').value = metadata.fontPosition || 'bottom-right';
        if (metadata.displayMode !== undefined) document.getElementById('display-mode').value = metadata.displayMode || 'full';
    }

    /**
     * 收集表单数据
     * @returns {Object} 表单数据对象
     */
    collectFormData() {
        return {
            camera: document.getElementById('camera').value,
            lens: document.getElementById('lens').value,
            location: document.getElementById('location').value,
            iso: document.getElementById('iso').value,
            aperture: document.getElementById('aperture').value,
            shutter: document.getElementById('shutter').value,
            copyright: document.getElementById('copyright').value,
            notes: document.getElementById('notes').value,
            fontFamily: document.getElementById('font-family').value,
            fontWeight: document.getElementById('font-weight').value,
            fontSize: document.getElementById('font-size').value,
            fontPosition: document.getElementById('font-position').value,
            displayMode: document.getElementById('display-mode').value,
        };
    }

    /**
     * 处理图片上传
     * @param {Event} e - 文件上传事件
     */
    async handleImageUpload(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // 检查是否为批量模式
        if (this.batchUI.getMode() === 'batch') {
            // 批量模式：添加所有文件到队列（包括单张）
            console.log(`批量模式：添加 ${files.length} 张图片到队列`);
            await this.batchProcessor.addImages(files);

            // 如果队列有图片，自动选中并显示第一张
            if (this.batchProcessor.getQueueLength() > 0) {
                const firstImage = this.batchProcessor.getQueue()[0];

                // 手动触发图片显示
                if (firstImage && firstImage.originalImage) {
                    // 保存原始图片到 imageProcessor（重要！）
                    this.imageProcessor.originalImage = firstImage.originalImage;

                    // 显示图片
                    this.imageProcessor.displayImageOnCanvas(firstImage.originalImage);

                    // 填充 EXIF 数据（如果已加载）
                    if (firstImage.exifData && Object.keys(firstImage.exifData).length > 0) {
                        ExifParser.fillMetadataToForm(firstImage.exifData);
                    }

                    // 刷新画布（重新渲染元数据）
                    this.scheduleRefresh();
                }

                // 同时触发选中事件（更新 UI 状态）
                this.batchProcessor.selectImage(0);
            }
            return;
        }

        // 单张模式：只处理第一张图片
        const file = files[0];
        if (!file) return;

        console.log('开始处理上传的文件:', file.name);

        // 处理文件上传 - 这里会直接显示图片
        this.imageProcessor.handleFileUpload(file);

        // 刷新画布，确保图片显示
        this.scheduleRefresh();

        // 读取EXIF数据（可选，失败不影响图片显示）
        try {
            const metadata = await ExifParser.readExifData(file);
            ExifParser.fillMetadataToForm(metadata);
            this.scheduleRefresh();
            console.log('EXIF数据读取成功');
        } catch (error) {
            console.error('EXIF读取失败:', error);
            // 继续执行，不影响图片显示
        }
    }

    /**
     * 处理模糊效果变化
     * @param {Event} e - 滑块变化事件
     */
    handleBlurChange(e) {
        const blurValue = Math.max(0, Math.min(10, parseFloat(e.target.value)));
        document.getElementById('blur-value').textContent = blurValue.toFixed(1);
        this.scheduleRefresh();
    }

    /**
     * 刷新调度函数 - 防抖处理
     * 优化性能，避免频繁刷新
     */
    scheduleRefresh() {
        this.imageProcessor.scheduleRefresh(() => {
            this.refreshCanvas();
        });
    }
    
    /**
     * 获取应用实例
     */
    getInstance() {
        return this;
    }

    /**
     * 刷新画布内容
     */
    refreshCanvas() {
        MetadataRenderer.updateMetadataOverlay(this.imageProcessor, this.languageManager, null, this.logoManager);
    }

    /**
     * 加载示例图片
     */
    loadSampleImage() {
        this.imageProcessor.loadSampleImage(() => {
            // 设置默认元数据
            MetadataRenderer.setDefaultMetadata(this.languageManager);
            // 刷新画布
            this.scheduleRefresh();
        });
    }
}

// 创建应用实例
const app = new ImgEchoApp();

// 页面加载时初始化应用
window.addEventListener('load', () => {
    app.initialize();
    
    // 暴露scheduleRefresh函数到全局作用域，以便语言管理器可以调用它
    window.scheduleRefresh = () => {
        app.scheduleRefresh();
    };
});

// 暴露应用实例到全局作用域
window.imgEchoApp = app;
