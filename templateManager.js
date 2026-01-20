/**
 * 模板管理器
 * 管理用户自定义模板和内置预设模板
 */

/**
 * 模板数据结构
 * @typedef {Object} Template
 * @property {string} id - 唯一标识
 * @property {string} name - 模板名称
 * @property {string} description - 模板描述
 * @property {boolean} isBuiltIn - 是否为内置模板
 * @property {Object} settings - 模板设置
 * @property {string} settings.fontFamily - 字体
 * @property {string} settings.fontWeight - 字重
 * @property {string} settings.fontSize - 字体大小
 * @property {string} settings.fontPosition - 文字位置
 * @property {string} settings.displayMode - 显示模式
 * @property {number} settings.blurValue - 模糊度
 * @property {number} createdAt - 创建时间戳
 */

/**
 * TemplateManager 类
 */
export class TemplateManager extends EventTarget {
    constructor() {
        super();
        this.storageKey = 'imgecho_templates';
        this.templates = [];
        this.currentTemplateId = null;
        this.init();
    }

    /**
     * 初始化模板管理器
     */
    init() {
        // 加载内置模板
        this.loadBuiltInTemplates();
        // 加载用户模板
        this.loadUserTemplates();
    }

    /**
     * 加载内置模板
     */
    loadBuiltInTemplates() {
        const builtInTemplates = [
            {
                id: 'preset-photography',
                name: '摄影作品集',
                description: '左下角白色文字，适合摄影作品展示',
                isBuiltIn: true,
                settings: {
                    fontFamily: "Arial, 'Microsoft YaHei', 微软雅黑, sans-serif",
                    fontWeight: 'normal',
                    fontSize: '3.0',
                    fontPosition: 'bottom-left',
                    displayMode: 'full',
                    blurValue: 5,
                },
                createdAt: Date.now(),
            },
            {
                id: 'preset-instagram',
                name: 'Instagram 风格',
                description: '底部居中大字体，适合社交媒体',
                isBuiltIn: true,
                settings: {
                    fontFamily: "Helvetica, 'PingFang SC', 苹方, sans-serif",
                    fontWeight: 'bold',
                    fontSize: '4.0',
                    fontPosition: 'bottom-center',
                    displayMode: 'simple',
                    blurValue: 6,
                },
                createdAt: Date.now(),
            },
            {
                id: 'preset-product',
                name: '产品图',
                description: '右下角品牌信息，适合商业产品展示',
                isBuiltIn: true,
                settings: {
                    fontFamily: "'Segoe UI', 'Noto Sans SC', 'Source Han Sans SC', sans-serif",
                    fontWeight: '600',
                    fontSize: '2.5',
                    fontPosition: 'bottom-right',
                    displayMode: 'camera-only',
                    blurValue: 4,
                },
                createdAt: Date.now(),
            },
            {
                id: 'preset-minimal',
                name: '极简风格',
                description: '右下角小字体，极简主义风格',
                isBuiltIn: true,
                settings: {
                    fontFamily: "Georgia, 'KaiTi', 楷体, serif",
                    fontWeight: '300',
                    fontSize: '2.0',
                    fontPosition: 'bottom-right',
                    displayMode: 'simple',
                    blurValue: 3,
                },
                createdAt: Date.now(),
            },
        ];

        // 添加内置模板（不保存到 localStorage）
        this.templates = [...builtInTemplates];
    }

    /**
     * 从 localStorage 加载用户模板
     */
    loadUserTemplates() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const userTemplates = JSON.parse(stored);
                // 合并用户模板和内置模板
                this.templates = [...this.templates, ...userTemplates];
            }
        } catch (error) {
            console.error('加载用户模板失败:', error);
        }
    }

    /**
     * 保存用户模板到 localStorage
     */
    saveUserTemplates() {
        try {
            // 只保存非内置模板
            const userTemplates = this.templates.filter((t) => !t.isBuiltIn);
            localStorage.setItem(this.storageKey, JSON.stringify(userTemplates));
        } catch (error) {
            console.error('保存用户模板失败:', error);
        }
    }

    /**
     * 获取所有模板
     * @returns {Template[]}
     */
    getAllTemplates() {
        return [...this.templates];
    }

    /**
     * 获取用户自定义模板
     * @returns {Template[]}
     */
    getUserTemplates() {
        return this.templates.filter((t) => !t.isBuiltIn);
    }

    /**
     * 获取内置模板
     * @returns {Template[]}
     */
    getBuiltInTemplates() {
        return this.templates.filter((t) => t.isBuiltIn);
    }

    /**
     * 根据 ID 获取模板
     * @param {string} id - 模板 ID
     * @returns {Template|null}
     */
    getTemplateById(id) {
        return this.templates.find((t) => t.id === id) || null;
    }

    /**
     * 创建新模板
     * @param {string} name - 模板名称
     * @param {string} description - 模板描述
     * @param {Object} settings - 模板设置
     * @returns {Template}
     */
    createTemplate(name, description, settings) {
        const template = {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            description,
            isBuiltIn: false,
            settings: { ...settings },
            createdAt: Date.now(),
        };

        this.templates.push(template);
        this.saveUserTemplates();

        this.dispatchEvent(
            new CustomEvent('template-created', {
                detail: { template },
            })
        );

        return template;
    }

    /**
     * 更新模板
     * @param {string} id - 模板 ID
     * @param {Object} updates - 更新内容
     * @returns {boolean}
     */
    updateTemplate(id, updates) {
        const template = this.getTemplateById(id);
        if (!template) {
            return false;
        }

        // 内置模板不能修改
        if (template.isBuiltIn) {
            console.warn('内置模板不能修改');
            return false;
        }

        // 更新模板
        if (updates.name) template.name = updates.name;
        if (updates.description) template.description = updates.description;
        if (updates.settings) template.settings = { ...updates.settings };

        this.saveUserTemplates();

        this.dispatchEvent(
            new CustomEvent('template-updated', {
                detail: { template },
            })
        );

        return true;
    }

    /**
     * 删除模板
     * @param {string} id - 模板 ID
     * @returns {boolean}
     */
    deleteTemplate(id) {
        const template = this.getTemplateById(id);
        if (!template) {
            return false;
        }

        // 内置模板不能删除
        if (template.isBuiltIn) {
            console.warn('内置模板不能删除');
            return false;
        }

        // 删除模板
        this.templates = this.templates.filter((t) => t.id !== id);
        this.saveUserTemplates();

        this.dispatchEvent(
            new CustomEvent('template-deleted', {
                detail: { templateId: id },
            })
        );

        return true;
    }

    /**
     * 应用模板
     * @param {string} id - 模板 ID
     * @returns {Object|null} - 模板设置
     */
    applyTemplate(id) {
        const template = this.getTemplateById(id);
        if (!template) {
            return null;
        }

        this.currentTemplateId = id;

        this.dispatchEvent(
            new CustomEvent('template-applied', {
                detail: { template },
            })
        );

        return { ...template.settings };
    }

    /**
     * 导出模板为 JSON 文件
     * @param {string} id - 模板 ID
     * @returns {string|null} - JSON 字符串
     */
    exportTemplate(id) {
        const template = this.getTemplateById(id);
        if (!template) {
            return null;
        }

        // 移除内置标记，导出后作为用户模板
        const exportData = {
            ...template,
            isBuiltIn: false,
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * 导出所有用户模板
     * @returns {string}
     */
    exportAllUserTemplates() {
        const userTemplates = this.getUserTemplates();
        return JSON.stringify(userTemplates, null, 2);
    }

    /**
     * 从 JSON 导入模板
     * @param {string} jsonString - JSON 字符串
     * @returns {Template|null}
     */
    importTemplate(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            // 验证数据结构
            if (!data.name || !data.settings) {
                throw new Error('Invalid template format');
            }

            // 创建新模板
            const template = this.createTemplate(
                data.name,
                data.description || '',
                data.settings
            );

            return template;
        } catch (error) {
            console.error('导入模板失败:', error);
            return null;
        }
    }

    /**
     * 从 JSON 批量导入模板
     * @param {string} jsonString - JSON 字符串（数组）
     * @returns {Template[]}
     */
    importMultipleTemplates(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            const templates = [];

            // 支持单个模板或模板数组
            const templateArray = Array.isArray(data) ? data : [data];

            templateArray.forEach((item) => {
                if (item.name && item.settings) {
                    const template = this.createTemplate(
                        item.name,
                        item.description || '',
                        item.settings
                    );
                    templates.push(template);
                }
            });

            return templates;
        } catch (error) {
            console.error('批量导入模板失败:', error);
            return [];
        }
    }

    /**
     * 获取当前应用的模板 ID
     * @returns {string|null}
     */
    getCurrentTemplateId() {
        return this.currentTemplateId;
    }

    /**
     * 清除当前模板标记
     */
    clearCurrentTemplate() {
        this.currentTemplateId = null;
    }
}
