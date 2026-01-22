// ===== 多语言资源文件 =====

const locales = {
    en: {
        // 应用标题和描述
        appTitle: 'ImgEcho',
        appSubtitle: 'Image Information Display and Editing Tool',
        appDescription: 'ImgEcho - Modern image information display and editing tool, supports EXIF information reading and image metadata editing',

        // 页面标题
        pageTitle: 'ImgEcho - Image Information Display and Editing Tool',

        // 导航和按钮
        uploadImage: 'Upload Image',
        blur: 'Blur',
        exportImage: 'Export Image',
        exportInfoPage: 'Export Info Page',

        // 图片信息部分
        imageInfo: 'Image Information',
        basicInfo: 'Basic Information',
        camera: 'Camera',
        lens: 'Lens',
        iso: 'ISO',
        aperture: 'Aperture',
        shutter: 'Shutter',
        location: 'Location',

        // 文字设置
        textSettings: 'Text Settings',
        fontFamily: 'Font',
        fontWeight: 'Weight',
        fontSize: 'Size',
        fontPosition: 'Position',

        // 字体选项
        fontNormal: 'Normal',
        fontBold: 'Bold',

        // 位置选项
        positionTopLeft: 'Top Left',
        positionTopRight: 'Top Right',
        positionBottomLeft: 'Bottom Left',
        positionBottomCenter: 'Bottom Center',
        positionBottomRight: 'Bottom Right',
        positionCenter: 'Center',

        // 其他信息
        otherInfo: 'Other Information',
        copyright: 'Copyright',
        notes: 'Notes',
        displayMode: 'Display Mode',

        // 显示模式选项
        modeFull: 'Full Mode',
        modeSimple: 'Simple Mode',

        // 占位符文本
        cameraPlaceholder: 'Camera model',
        lensPlaceholder: 'Lens model',
        isoPlaceholder: 'ISO value',
        aperturePlaceholder: 'Aperture value',
        shutterPlaceholder: 'Shutter speed',
        locationPlaceholder: 'Shooting location',
        copyrightPlaceholder: 'Copyright information',
        notesPlaceholder: 'Add notes',

        // 语言切换
        language: 'Language',
        english: 'English',
        chinese: '中文',

        // 默认元数据
        defaultLocation: 'Unknown',
        defaultNotes: 'Sample photo',
        defaultCopyright: '© 2026 Sample Copyright',

        // 批量模式
        singleMode: 'Single Mode',
        batchMode: 'Batch Mode',
        batchQueue: 'Batch Queue',
        images: 'images',
        clearQueue: 'Clear Queue',
        applyToAll: 'Apply Settings to All',
        exportAsZip: 'Export All Images',
        processing: 'Processing',
        preview: 'Preview',
        reset: 'Reset',
        remove: 'Remove',
        batchQueueEmpty: 'Queue is empty, please upload images',
        statusPending: 'Pending',
        statusProcessing: 'Processing',
        statusCompleted: 'Completed',
        statusError: 'Failed',

        // 模板系统
        templateTitle: 'Template Management',
        builtInTemplates: 'Built-in Templates',
        userTemplates: 'My Templates',
        selectTemplate: 'Select template...',
        applyTemplate: 'Apply',
        saveAsTemplate: 'Save as Template',
        manageTemplates: 'Manage Templates',
        templateName: 'Template Name',
        templateDescription: 'Template Description',
        enterTemplateName: 'Enter template name',
        enterTemplateDescription: 'Enter template description (optional)',
        importTemplate: 'Import Template',
        exportAllTemplates: 'Export All',
        editTemplate: 'Edit Template',
        deleteTemplate: 'Delete Template',
        confirmDeleteTemplate: 'Confirm delete template',
        templateSaved: 'Template saved',
        templateUpdated: 'Template updated',
        templateDeleted: 'Template deleted',
        templateNotFound: 'Template not found',
        templateNameRequired: 'Template name is required',
        noUserTemplates: 'No custom templates',
        saveTemplateHint: 'Click "Save as Template" to create your first template',
        selectTemplateFirst: 'Please select a template first',
        importSuccess: 'Successfully imported',
        importFailed: 'Import failed, please check file format',
        templates: 'templates',
        noDescription: 'No description',
        edit: 'Edit',
        export: 'Export',
        delete: 'Delete',
        notice: 'Notice',
        error: 'Error',

        // 内置模板名称
        templatePhotography: 'Photography Portfolio',
        templatePhotographyDesc: 'White text at bottom-left, perfect for photography showcase',
        templateInstagram: 'Instagram Style',
        templateInstagramDesc: 'Bottom-center large font, perfect for social media',
        templateProduct: 'Product Display',
        templateProductDesc: 'Bottom-right brand info, perfect for commercial products',
        templateMinimal: 'Minimal Style',
        templateMinimalDesc: 'Bottom-right small font, minimalist style',
        success: 'Success',
        confirm: 'Confirm',
        cancel: 'Cancel',
        noSettingsToSave: 'No settings to save',

        // Logo/水印系统
        logoWatermark: 'Logo/Watermark',
        selectLogo: 'Select Logo',
        noLogo: 'No Logo',
        uploadLogo: 'Upload Logo',
        logoPosition: 'Logo Position',
        logoSize: 'Logo Size',
        logoOpacity: 'Logo Opacity',
        logoTiled: 'Tiled Watermark',
        manageLogo: 'Manage Logos',
        logoManager: 'Logo Manager',
        logoUploaded: 'Logo uploaded successfully',
        logoUploadFailed: 'Logo upload failed',
        logoDeleted: 'Logo deleted',
        confirmDeleteLogo: 'Confirm delete logo',
        noLogos: 'No logos',
        uploadLogoHint: 'Click "Upload Logo" to add your first logo',

        // 高级文字样式
        fontColor: 'Font Color',
        fontOpacity: 'Font Opacity',
        strokeColor: 'Stroke Color',
        strokeWidth: 'Stroke Width',
        textShadow: 'Text Shadow',
        bgMask: 'Background Mask',
        bgMaskOpacity: 'Mask Opacity',
        textRotation: 'Text Rotation',
        lineHeight: 'Line Height',
        letterSpacing: 'Letter Spacing',

        // 撤销/重做和历史记录
        undo: 'Undo',
        redo: 'Redo',
        historyPanel: 'History',
        clearHistory: 'Clear History',
        close: 'Close',
        confirmClearHistory: 'Are you sure you want to clear all history? This action cannot be undone.',
        noHistory: 'No history yet',
        justNow: 'Just now',
        minutesAgo: 'minutes ago',
        hoursAgo: 'hours ago',

        // 操作类型
        operationImageUpload: 'Image Upload',
        operationMetadataChange: 'Settings Change',
        operationTextStyleChange: 'Text Style',
        operationBlurChange: 'Blur Effect',
        operationLogoChange: 'Logo Settings',
        operationTemplateApplied: 'Template Applied',
        operationBatchSettingChange: 'Batch Settings',

        // 导出格式和质量
        exportFormat: 'Export Format',
        exportQuality: 'Export Quality',
        exportQualityHint: 'Higher quality = larger file size. Recommended: 85-95%',
        exportFormatJpeg: 'JPEG',
        exportFormatPng: 'PNG (Preserve Transparency)',
        exportFormatWebp: 'WebP (Smaller Size)',
        exportFormatPdf: 'PDF (Document Format)',

        // 社交媒体优化
        socialMediaOptimization: 'Social Media Optimization',
        socialPreset: 'Preset Size',
        selectPresetSize: 'Select preset size...',
        presetInstagramSquare: 'Instagram Square (1080x1080)',
        presetInstagramStory: 'Instagram Story (1080x1920)',
        presetWechatMoments: 'WeChat Moments (1280x1280)',
        presetWeibo: 'Weibo Post (2048x2048)',
        presetYoutubeThumbnail: 'YouTube Thumbnail (1280x720)',
        presetTwitterPost: 'Twitter Post (1200x675)',
        presetFacebookPost: 'Facebook Post (1200x630)',
        fitMode: 'Fit Mode',
        fitModeCover: 'Cover (Fill, may crop)',
        fitModeContain: 'Contain (Full display, may have borders)',
        fitModeFill: 'Fill (Stretch to fill)',
        showSafeArea: 'Show Safe Area',
        safeAreaHint: 'Red areas indicate parts that may be obscured by UI elements',
        applyPreset: 'Apply Preset',
        copyToClipboard: 'Copy to Clipboard',
        exportMultiSizes: 'Export Multiple Sizes',
        pleaseSelectPreset: 'Please select a preset size',
        copiedToClipboard: 'Image copied to clipboard successfully!',
        copyToClipboardFailed: 'Failed to copy image to clipboard',
        multiSizeExportSuccess: 'Multiple sizes exported successfully!',
        multiSizeExportFailed: 'Failed to export multiple sizes',
        applySocialPreset: 'Apply Social Media Preset',
        noImageToExport: 'No image to export',

        // 裁剪和旋转
        crop: 'Crop',
        rotateLeft: 'Rotate Left 90°',
        rotateRight: 'Rotate Right 90°',
        flipHorizontal: 'Flip Horizontal',
        flipVertical: 'Flip Vertical',
        resetTransform: 'Reset Transform',
        cropFree: 'Free',
        apply: 'Apply',
        pleaseUploadImage: 'Please upload an image first',
        tip: 'Tip'
    },

    zh: {
        // 应用标题和描述
        appTitle: 'ImgEcho',
        appSubtitle: '图片信息展示与编辑工具',
        appDescription: 'ImgEcho - 现代化的图片信息展示与编辑工具，支持EXIF信息读取和图片元数据编辑',

        // 页面标题
        pageTitle: 'ImgEcho - 图片信息展示与编辑工具',

        // 导航和按钮
        uploadImage: '上传图片',
        blur: '模糊',
        exportImage: '导出图片',
        exportInfoPage: '导出信息页',

        // 图片信息部分
        imageInfo: '图片信息',
        basicInfo: '基本信息',
        camera: '相机',
        lens: '镜头',
        iso: 'ISO',
        aperture: '光圈',
        shutter: '快门',
        location: '地点',

        // 文字设置
        textSettings: '文字设置',
        fontFamily: '字体',
        fontWeight: '粗细',
        fontSize: '大小',
        fontPosition: '位置',

        // 字体选项
        fontNormal: '常规',
        fontBold: '粗体',

        // 位置选项
        positionTopLeft: '左上',
        positionTopRight: '右上',
        positionBottomLeft: '左下',
        positionBottomCenter: '底部居中',
        positionBottomRight: '右下',
        positionCenter: '中心',

        // 其他信息
        otherInfo: '其他信息',
        copyright: '版权',
        notes: '注释',
        displayMode: '显示模式',

        // 显示模式选项
        modeFull: '完整模式',
        modeSimple: '简洁模式',

        // 占位符文本
        cameraPlaceholder: '相机型号',
        lensPlaceholder: '镜头型号',
        isoPlaceholder: 'ISO值',
        aperturePlaceholder: '光圈值',
        shutterPlaceholder: '快门速度',
        locationPlaceholder: '拍摄地点',
        copyrightPlaceholder: '版权信息',
        notesPlaceholder: '添加注释',

        // 语言切换
        language: '语言',
        english: 'English',
        chinese: '中文',

        // 默认元数据
        defaultLocation: '未知',
        defaultNotes: '示例照片',
        defaultCopyright: '© 2026 示例版权',

        // 批量模式
        singleMode: '单张模式',
        batchMode: '批量模式',
        batchQueue: '批量队列',
        images: '张图片',
        clearQueue: '清空队列',
        applyToAll: '应用当前设置到全部',
        exportAsZip: '导出全部图片',
        processing: '处理中',
        preview: '预览',
        reset: '还原',
        remove: '移除',
        batchQueueEmpty: '队列为空，请上传图片',
        statusPending: '待处理',
        statusProcessing: '处理中',
        statusCompleted: '已完成',
        statusError: '失败',

        // 模板系统
        templateTitle: '模板管理',
        builtInTemplates: '内置模板',
        userTemplates: '我的模板',
        selectTemplate: '选择模板...',
        applyTemplate: '应用',
        saveAsTemplate: '保存模板',
        manageTemplates: '管理模板',
        templateName: '模板名称',
        templateDescription: '模板描述',
        enterTemplateName: '输入模板名称',
        enterTemplateDescription: '输入模板描述（可选）',
        importTemplate: '导入模板',
        exportAllTemplates: '导出全部',
        editTemplate: '编辑模板',
        deleteTemplate: '删除模板',
        confirmDeleteTemplate: '确定删除模板',
        templateSaved: '模板已保存',
        templateUpdated: '模板已更新',
        templateDeleted: '模板已删除',
        templateNotFound: '模板不存在',
        templateNameRequired: '模板名称不能为空',
        noUserTemplates: '暂无自定义模板',
        saveTemplateHint: '点击"保存为模板"创建第一个模板',
        selectTemplateFirst: '请先选择一个模板',
        importSuccess: '成功导入',
        importFailed: '导入失败，请检查文件格式',
        templates: '个模板',
        noDescription: '无描述',
        edit: '编辑',
        export: '导出',
        delete: '删除',
        notice: '提示',
        error: '错误',

        // 内置模板名称
        templatePhotography: '摄影作品集',
        templatePhotographyDesc: '左下角白色文字，适合摄影作品展示',
        templateInstagram: 'Instagram 风格',
        templateInstagramDesc: '底部居中大字体，适合社交媒体',
        templateProduct: '产品图',
        templateProductDesc: '右下角品牌信息，适合商业产品展示',
        templateMinimal: '极简风格',
        templateMinimalDesc: '右下角小字体，极简主义风格',

        success: '成功',
        confirm: '确认',
        cancel: '取消',
        noSettingsToSave: '没有可保存的设置',

        // Logo/水印系统
        logoWatermark: 'Logo/水印',
        selectLogo: '选择 Logo',
        noLogo: '无 Logo',
        uploadLogo: '上传 Logo',
        logoPosition: 'Logo 位置',
        logoSize: 'Logo 大小',
        logoOpacity: 'Logo 透明度',
        logoTiled: '平铺水印',
        manageLogo: '管理 Logo',
        logoManager: 'Logo 管理器',
        logoUploaded: 'Logo 上传成功',
        logoUploadFailed: 'Logo 上传失败',
        logoDeleted: 'Logo 已删除',
        confirmDeleteLogo: '确定删除 Logo',
        noLogos: '暂无 Logo',
        uploadLogoHint: '点击"上传 Logo"添加您的第一个 Logo',

        // 高级文字样式
        fontColor: '文字颜色',
        fontOpacity: '文字透明度',
        strokeColor: '描边颜色',
        strokeWidth: '描边粗细',
        textShadow: '文字阴影',
        bgMask: '背景遮罩',
        bgMaskOpacity: '遮罩透明度',
        textRotation: '文字旋转',
        lineHeight: '行间距',
        letterSpacing: '字间距',

        // 撤销/重做和历史记录
        undo: '撤销',
        redo: '重做',
        historyPanel: '历史记录',
        clearHistory: '清空历史',
        close: '关闭',
        confirmClearHistory: '确定清空所有历史记录吗？此操作无法撤销。',
        noHistory: '暂无历史记录',
        justNow: '刚刚',
        minutesAgo: '分钟前',
        hoursAgo: '小时前',

        // 操作类型
        operationImageUpload: '上传图片',
        operationMetadataChange: '修改设置',
        operationTextStyleChange: '文字样式',
        operationBlurChange: '模糊效果',
        operationLogoChange: 'Logo 设置',
        operationTemplateApplied: '应用模板',
        operationBatchSettingChange: '批量设置',

        // 导出格式和质量
        exportFormat: '导出格式',
        exportQuality: '导出质量',
        exportQualityHint: '质量越高，文件越大。推荐 85-95%',
        exportFormatJpeg: 'JPEG',
        exportFormatPng: 'PNG (保留透明度)',
        exportFormatWebp: 'WebP (更小体积)',
        exportFormatPdf: 'PDF (文档格式)',

        // 社交媒体优化
        socialMediaOptimization: '社交媒体优化',
        socialPreset: '预设尺寸',
        selectPresetSize: '选择预设尺寸...',
        presetInstagramSquare: 'Instagram 正方形 (1080x1080)',
        presetInstagramStory: 'Instagram 故事 (1080x1920)',
        presetWechatMoments: '微信朋友圈 (1280x1280)',
        presetWeibo: '微博配图 (2048x2048)',
        presetYoutubeThumbnail: 'YouTube 缩略图 (1280x720)',
        presetTwitterPost: 'Twitter 配图 (1200x675)',
        presetFacebookPost: 'Facebook 配图 (1200x630)',
        fitMode: '适配模式',
        fitModeCover: '覆盖（填满，可能裁剪）',
        fitModeContain: '包含（完整显示，可能留白）',
        fitModeFill: '拉伸（填满，可能变形）',
        showSafeArea: '显示安全区域提示',
        safeAreaHint: '红色区域表示可能被UI遮挡的部分',
        applyPreset: '应用预设',
        copyToClipboard: '复制到剪贴板',
        exportMultiSizes: '导出多尺寸',
        pleaseSelectPreset: '请选择一个预设尺寸',
        copiedToClipboard: '图片已成功复制到剪贴板！',
        copyToClipboardFailed: '复制图片到剪贴板失败',
        multiSizeExportSuccess: '多尺寸导出成功！',
        multiSizeExportFailed: '多尺寸导出失败',
        applySocialPreset: '应用社交媒体预设',
        noImageToExport: '没有可导出的图片',

        // 裁剪和旋转
        crop: '裁剪',
        rotateLeft: '左旋90°',
        rotateRight: '右旋90°',
        flipHorizontal: '水平翻转',
        flipVertical: '垂直翻转',
        resetTransform: '还原',
        cropFree: '自由',
        apply: '应用',
        pleaseUploadImage: '请先上传图片',
        tip: '提示'
    }
};

// 语言管理类
class LanguageManager {
    constructor() {
        this.currentLanguage = 'en'; // 默认语言为英文
        this.init();
    }

    init() {
        // 从本地存储加载用户的语言偏好
        const savedLanguage = localStorage.getItem('imgEchoLanguage');
        if (savedLanguage && locales[savedLanguage]) {
            this.currentLanguage = savedLanguage;
        }

        // 设置HTML的lang属性
        document.documentElement.lang = this.currentLanguage === 'zh' ? 'zh-CN' : 'en';
    }

    setLanguage(lang) {
        if (locales[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('imgEchoLanguage', lang);
            document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
            this.updateUI();
        }
    }

    get(key) {
        return locales[this.currentLanguage][key] || key;
    }

    updateUI() {
        // 更新页面标题
        document.title = this.get('pageTitle');

        // 更新应用标题和副标题
        const appTitle = document.querySelector('.header h1');
        const appSubtitle = document.querySelector('.header p');
        if (appTitle) appTitle.textContent = this.get('appTitle');
        if (appSubtitle) appSubtitle.textContent = this.get('appSubtitle');

        // 更新所有标签和占位符
        this.updateLabels();
        this.updatePlaceholders();
        this.updateSelectOptions();

        // 更新按钮文本
        this.updateButtonTexts();

        // 更新章节标题
        this.updateSectionTitles();

        // 触发语言切换事件，通知其他模块更新
        document.dispatchEvent(new CustomEvent('language-changed'));

        // 触发刷新以更新画布上的文字
        if (typeof window.scheduleRefresh === 'function') {
            window.scheduleRefresh();
        }
    }

    updateLabels() {
        const labelMap = {
            'file-input': 'uploadImage',
            'blur-slider': 'blur',
            'camera': 'camera',
            'lens': 'lens',
            'iso': 'iso',
            'aperture': 'aperture',
            'shutter': 'shutter',
            'location': 'location',
            'font-family': 'fontFamily',
            'font-weight': 'fontWeight',
            'font-size': 'fontSize',
            'font-position': 'fontPosition',
            'copyright': 'copyright',
            'notes': 'notes',
            'display-mode': 'displayMode',
            'logo-select': 'noLogo',
            'logo-position': 'logoPosition',
            'logo-size': 'logoSize',
            'logo-opacity': 'logoOpacity'
        };

        Object.entries(labelMap).forEach(([id, key]) => {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) {
                // 特殊处理模糊滑块标签，保留blur-value元素
                if (id === 'blur-slider') {
                    const blurValueSpan = label.querySelector('#blur-value');
                    if (blurValueSpan) {
                        const currentValue = blurValueSpan.textContent;
                        label.innerHTML = `${this.get(key)}: <span id="blur-value">${currentValue}</span>`;
                    } else {
                        label.textContent = this.get(key);
                    }
                } else {
                    label.textContent = this.get(key);
                }
            }
        });

        // 特殊处理导出质量标签，保留export-quality-value元素
        const exportQualityLabel = document.querySelector('label[for="export-quality"]');
        if (exportQualityLabel) {
            const exportQualitySlider = document.getElementById('export-quality');
            const currentValue = exportQualitySlider ? exportQualitySlider.value : '95';
            exportQualityLabel.innerHTML = `${this.get('exportQuality')} (<span id="export-quality-value">${currentValue}</span>%)`;
        }
    }

    updatePlaceholders() {
        const placeholderMap = {
            'camera': 'cameraPlaceholder',
            'lens': 'lensPlaceholder',
            'iso': 'isoPlaceholder',
            'aperture': 'aperturePlaceholder',
            'shutter': 'shutterPlaceholder',
            'location': 'locationPlaceholder',
            'copyright': 'copyrightPlaceholder',
            'notes': 'notesPlaceholder'
        };

        Object.entries(placeholderMap).forEach(([id, key]) => {
            const element = document.getElementById(id);
            if (element) {
                element.placeholder = this.get(key);
            }
        });
    }

    updateSelectOptions() {
        // 更新字体粗细选项
        const fontWeightSelect = document.getElementById('font-weight');
        if (fontWeightSelect) {
            fontWeightSelect.options[0].text = this.get('fontNormal');
            fontWeightSelect.options[1].text = this.get('fontBold');
        }

        // 更新位置选项
        const positionSelect = document.getElementById('font-position');
        if (positionSelect) {
            positionSelect.options[0].text = this.get('positionTopLeft');
            positionSelect.options[1].text = this.get('positionTopRight');
            positionSelect.options[2].text = this.get('positionBottomLeft');
            positionSelect.options[3].text = this.get('positionBottomCenter');
            positionSelect.options[4].text = this.get('positionBottomRight');
            positionSelect.options[5].text = this.get('positionCenter');
        }

        // 更新显示模式选项
        const displayModeSelect = document.getElementById('display-mode');
        if (displayModeSelect) {
            displayModeSelect.options[0].text = this.get('modeFull');
            displayModeSelect.options[1].text = this.get('modeSimple');
        }

        // 更新 Logo 位置选项
        const logoPositionSelect = document.getElementById('logo-position');
        if (logoPositionSelect) {
            logoPositionSelect.options[0].text = this.get('positionTopLeft');
            logoPositionSelect.options[1].text = this.get('positionTopRight');
            logoPositionSelect.options[2].text = this.get('positionBottomLeft');
            logoPositionSelect.options[3].text = this.get('positionBottomRight');
            logoPositionSelect.options[4].text = this.get('positionCenter');
        }

        // 更新导出格式选项
        const exportFormatSelect = document.getElementById('export-format');
        if (exportFormatSelect) {
            exportFormatSelect.options[0].text = this.get('exportFormatJpeg');
            exportFormatSelect.options[1].text = this.get('exportFormatPng');
            exportFormatSelect.options[2].text = this.get('exportFormatWebp');
            exportFormatSelect.options[3].text = this.get('exportFormatPdf');
        }

        // 更新适配模式选项
        const fitModeSelect = document.getElementById('fit-mode');
        if (fitModeSelect) {
            fitModeSelect.options[0].text = this.get('fitModeCover');
            fitModeSelect.options[1].text = this.get('fitModeContain');
            fitModeSelect.options[2].text = this.get('fitModeFill');
        }

        // 更新社交媒体预设选项
        const socialPresetSelect = document.getElementById('social-preset');
        if (socialPresetSelect) {
            socialPresetSelect.options[0].text = this.get('selectPresetSize');
            socialPresetSelect.options[1].text = this.get('presetInstagramSquare');
            socialPresetSelect.options[2].text = this.get('presetInstagramStory');
            socialPresetSelect.options[3].text = this.get('presetWechatMoments');
            socialPresetSelect.options[4].text = this.get('presetWeibo');
            socialPresetSelect.options[5].text = this.get('presetYoutubeThumbnail');
            socialPresetSelect.options[6].text = this.get('presetTwitterPost');
            socialPresetSelect.options[7].text = this.get('presetFacebookPost');
        }

        // 更新 Logo 选择选项（包括 data-i18n 标记的选项）
        const logoSelect = document.getElementById('logo-select');
        if (logoSelect) {
            // 更新所有带 data-i18n 的 option 元素
            Array.from(logoSelect.options).forEach(option => {
                const key = option.getAttribute('data-i18n');
                if (key) {
                    option.textContent = this.get(key);
                }
            });
        }

        // 更新所有带 data-i18n 的元素（包括 checkbox 标签等）
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key && element.tagName !== 'OPTION') {
                // 对于 option 元素，已经在上面单独处理了
                // 对于其他元素（如 span, button 等），直接更新 textContent
                if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
                    // 只有纯文本节点才更新
                    element.textContent = this.get(key);
                }
            }
        });
    }

    updateButtonTexts() {
        const exportBtn = document.getElementById('export-btn');
        const exportInfoBtn = document.getElementById('export-info-btn');
        const singleModeBtn = document.getElementById('single-mode-btn');
        const batchModeBtn = document.getElementById('batch-mode-btn');
        const uploadLogoBtn = document.getElementById('upload-logo-btn');
        const manageLogosBtn = document.getElementById('manage-logos-btn');
        const saveTemplateBtn = document.getElementById('save-template-btn');
        const manageTemplatesBtn = document.getElementById('manage-templates-btn');

        if (exportBtn) exportBtn.textContent = this.get('exportImage');
        if (exportInfoBtn) exportInfoBtn.textContent = this.get('exportInfoPage');
        if (singleModeBtn) singleModeBtn.textContent = this.get('singleMode');
        if (batchModeBtn) batchModeBtn.textContent = this.get('batchMode');
        if (uploadLogoBtn) uploadLogoBtn.textContent = this.get('uploadLogo');
        if (manageLogosBtn) manageLogosBtn.textContent = this.get('manageLogo');

        // 对于包含 SVG 图标的按钮，需要保留图标并只更新文本内容
        if (saveTemplateBtn) {
            const svg = saveTemplateBtn.querySelector('svg');
            saveTemplateBtn.textContent = this.get('saveAsTemplate');
            if (svg) saveTemplateBtn.insertBefore(svg, saveTemplateBtn.firstChild);
        }
        if (manageTemplatesBtn) {
            const svg = manageTemplatesBtn.querySelector('svg');
            manageTemplatesBtn.textContent = this.get('manageTemplates');
            if (svg) manageTemplatesBtn.insertBefore(svg, manageTemplatesBtn.firstChild);
        }

        // 更新裁剪/旋转按钮
        const cropBtn = document.getElementById('crop-btn');
        const rotateLeftBtn = document.getElementById('rotate-left-btn');
        const rotateRightBtn = document.getElementById('rotate-right-btn');
        const flipHorizontalBtn = document.getElementById('flip-horizontal-btn');
        const flipVerticalBtn = document.getElementById('flip-vertical-btn');
        const resetTransformBtn = document.getElementById('reset-transform-btn');

        if (cropBtn) {
            const svg = cropBtn.querySelector('svg');
            cropBtn.textContent = this.get('crop');
            if (svg) cropBtn.insertBefore(svg, cropBtn.firstChild);
        }
        if (rotateLeftBtn) {
            const svg = rotateLeftBtn.querySelector('svg');
            rotateLeftBtn.textContent = this.get('rotateLeft');
            if (svg) rotateLeftBtn.insertBefore(svg, rotateLeftBtn.firstChild);
        }
        if (rotateRightBtn) {
            const svg = rotateRightBtn.querySelector('svg');
            rotateRightBtn.textContent = this.get('rotateRight');
            if (svg) rotateRightBtn.insertBefore(svg, rotateRightBtn.firstChild);
        }
        if (flipHorizontalBtn) {
            const svg = flipHorizontalBtn.querySelector('svg');
            flipHorizontalBtn.textContent = this.get('flipHorizontal');
            if (svg) flipHorizontalBtn.insertBefore(svg, flipHorizontalBtn.firstChild);
        }
        if (flipVerticalBtn) {
            const svg = flipVerticalBtn.querySelector('svg');
            flipVerticalBtn.textContent = this.get('flipVertical');
            if (svg) flipVerticalBtn.insertBefore(svg, flipVerticalBtn.firstChild);
        }
        if (resetTransformBtn) {
            const svg = resetTransformBtn.querySelector('svg');
            resetTransformBtn.textContent = this.get('resetTransform');
            if (svg) resetTransformBtn.insertBefore(svg, resetTransformBtn.firstChild);
        }

        // 更新社交媒体优化按钮
        const applyPresetBtn = document.getElementById('apply-preset-btn');
        const copyToClipboardBtn = document.getElementById('copy-to-clipboard-btn');
        const exportMultiSizesBtn = document.getElementById('export-multi-sizes-btn');

        if (applyPresetBtn) {
            const svg = applyPresetBtn.querySelector('svg');
            applyPresetBtn.textContent = this.get('applyPreset');
            if (svg) applyPresetBtn.insertBefore(svg, applyPresetBtn.firstChild);
        }
        if (copyToClipboardBtn) {
            const svg = copyToClipboardBtn.querySelector('svg');
            copyToClipboardBtn.textContent = this.get('copyToClipboard');
            if (svg) copyToClipboardBtn.insertBefore(svg, copyToClipboardBtn.firstChild);
        }
        if (exportMultiSizesBtn) {
            const svg = exportMultiSizesBtn.querySelector('svg');
            exportMultiSizesBtn.textContent = this.get('exportMultiSizes');
            if (svg) exportMultiSizesBtn.insertBefore(svg, exportMultiSizesBtn.firstChild);
        }

        // 更新撤销/重做/历史记录按钮
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        const historyPanelBtn = document.getElementById('history-panel-btn');

        if (undoBtn) {
            const svg = undoBtn.querySelector('svg');
            undoBtn.textContent = this.get('undo');
            if (svg) undoBtn.insertBefore(svg, undoBtn.firstChild);
        }
        if (redoBtn) {
            const svg = redoBtn.querySelector('svg');
            redoBtn.textContent = this.get('redo');
            if (svg) redoBtn.insertBefore(svg, redoBtn.firstChild);
        }
        if (historyPanelBtn) {
            const svg = historyPanelBtn.querySelector('svg');
            historyPanelBtn.textContent = this.get('historyPanel');
            if (svg) historyPanelBtn.insertBefore(svg, historyPanelBtn.firstChild);
        }
    }

    updateSectionTitles() {
        // 更新所有带 data-i18n 属性的章节标题
        const sectionTitleSpans = document.querySelectorAll('.section-title span[data-i18n]');
        sectionTitleSpans.forEach(span => {
            const key = span.getAttribute('data-i18n');
            if (key) {
                span.textContent = this.get(key);
            }
        });

        const infoPanelTitle = document.querySelector('.info-panel h2');
        if (infoPanelTitle) {
            infoPanelTitle.textContent = this.get('imageInfo');
        }

        // 更新 Logo 管理器对话框标题
        const logoManagerTitle = document.querySelector('#logo-manager-overlay h2');
        if (logoManagerTitle) {
            logoManagerTitle.textContent = this.get('logoManager');
        }
    }
}

// 创建全局语言管理器实例
const languageManager = new LanguageManager();

// 暴露到全局作用域（向后兼容）
if (typeof window !== 'undefined') {
    window.languageManager = languageManager;
}

// 导出供其他模块使用
export default languageManager;
