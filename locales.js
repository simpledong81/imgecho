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
        exportAsZip: 'Export All as ZIP',
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
        success: 'Success',
        confirm: 'Confirm',
        cancel: 'Cancel',
        noSettingsToSave: 'No settings to save'
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
        exportAsZip: '导出全部为 ZIP',
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
        saveAsTemplate: '保存为模板',
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
        success: '成功',
        confirm: '确认',
        cancel: '取消',
        noSettingsToSave: '没有可保存的设置'
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
            'display-mode': 'displayMode'
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
    }

    updateButtonTexts() {
        const exportBtn = document.getElementById('export-btn');
        const exportInfoBtn = document.getElementById('export-info-btn');
        const singleModeBtn = document.getElementById('single-mode-btn');
        const batchModeBtn = document.getElementById('batch-mode-btn');

        if (exportBtn) exportBtn.textContent = this.get('exportImage');
        if (exportInfoBtn) exportInfoBtn.textContent = this.get('exportInfoPage');
        if (singleModeBtn) singleModeBtn.textContent = this.get('singleMode');
        if (batchModeBtn) batchModeBtn.textContent = this.get('batchMode');
    }

    updateSectionTitles() {
        const sectionTitles = document.querySelectorAll('.section-title');
        if (sectionTitles.length >= 3) {
            sectionTitles[0].textContent = this.get('basicInfo');
            sectionTitles[1].textContent = this.get('textSettings');
            sectionTitles[2].textContent = this.get('otherInfo');
        }

        const infoPanelTitle = document.querySelector('.info-panel h2');
        if (infoPanelTitle) {
            infoPanelTitle.textContent = this.get('imageInfo');
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
