/**
 * 主应用模块
 * 整合所有模块，初始化应用
 */
import { ImageProcessor } from './imageProcessor.js';
import { ExifParser } from './exifParser.js';
import { MetadataRenderer } from './metadataRenderer.js';
import { ExportManager } from './exportManager.js';

/**
 * 主应用类
 */
export class ImgEchoApp {
    constructor() {
        this.imageProcessor = new ImageProcessor();
        this.languageManager = null;
        this.isInitialized = false;
    }

    /**
     * 初始化应用
     * 设置画布上下文、事件监听器，并加载示例图片
     */
    initialize() {
        if (this.isInitialized) return;
        
        // 初始化图片处理器
        this.imageProcessor.initialize();
        
        // 初始化语言管理器引用
        if (typeof languageManager !== 'undefined') {
            this.languageManager = languageManager;
        }
        
        // 设置事件监听器
        this.setupEventListeners();
        
        // 初始化语言管理器后更新界面
        if (this.languageManager) {
            this.languageManager.updateUI();
        }
        
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
        document.getElementById('font-size').addEventListener('input', (e) => {
            const fontSizePercent = parseFloat(e.target.value);
            document.getElementById('font-size-value').textContent = fontSizePercent.toFixed(1);
            this.scheduleRefresh();
        });
        
        // 所有输入字段的实时刷新事件
        const inputFields = ['camera', 'lens', 'location', 'iso', 'aperture', 'shutter', 'notes', 'copyright', 'font-family', 'font-weight', 'font-position', 'display-mode'];
        inputFields.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', this.scheduleRefresh.bind(this));
                if (element.tagName === 'SELECT') {
                    element.addEventListener('change', this.scheduleRefresh.bind(this));
                }
            }
        });
        
        // 语言切换事件
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                const selectedLanguage = e.target.value;
                if (this.languageManager) {
                    this.languageManager.setLanguage(selectedLanguage);
                }
            });
            
            // 设置当前选中的语言
            if (this.languageManager) {
                languageSelect.value = this.languageManager.currentLanguage;
            }
        }
        
        // 导出按钮事件
        document.getElementById('export-btn').addEventListener('click', () => {
            ExportManager.exportImageWithCanvas(this.imageProcessor, this.languageManager);
        });
        
        // 导出信息页按钮事件
        document.getElementById('export-info-btn').addEventListener('click', () => {
            ExportManager.exportInfoPage(this.imageProcessor, this.languageManager);
        });
    }

    /**
     * 处理图片上传
     * @param {Event} e - 文件上传事件
     */
    async handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // 处理文件上传
        this.imageProcessor.handleFileUpload(file);
        
        try {
            // 读取EXIF数据
            const metadata = await ExifParser.readExifData(file);
            // 填充到表单
            ExifParser.fillMetadataToForm(metadata);
            // 刷新画布
            this.scheduleRefresh();
        } catch (error) {
            console.error('EXIF读取失败:', error);
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
     * 刷新画布内容
     */
    refreshCanvas() {
        MetadataRenderer.updateMetadataOverlay(this.imageProcessor, this.languageManager);
    }

    /**
     * 加载示例图片
     */
    loadSampleImage() {
        this.imageProcessor.loadSampleImage(() => {
            // 设置默认元数据
            if (this.languageManager) {
                MetadataRenderer.setDefaultMetadata(this.languageManager);
            }
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
});