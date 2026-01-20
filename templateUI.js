/**
 * 模板 UI 管理器
 * 管理模板相关的 UI 交互和显示
 */
import { Dialog } from './dialog.js';

/**
 * TemplateUI 类
 */
export class TemplateUI {
    constructor(templateManager, languageManager) {
        this.templateManager = templateManager;
        this.languageManager = languageManager;
        this.elements = {};
        this.initElements();
        this.bindEvents();
    }

    /**
     * 初始化 DOM 元素引用
     */
    initElements() {
        this.elements = {
            // 模板选择器
            builtInSelect: document.getElementById('built-in-templates'),
            userSelect: document.getElementById('user-templates'),
            applyBuiltInBtn: document.getElementById('apply-built-in-btn'),
            applyUserBtn: document.getElementById('apply-user-btn'),

            // 模板操作按钮
            saveTemplateBtn: document.getElementById('save-template-btn'),
            manageTemplatesBtn: document.getElementById('manage-templates-btn'),

            // 模板管理器对话框
            managerOverlay: document.getElementById('template-manager-overlay'),
            closeManagerBtn: document.getElementById('close-template-manager'),
            templateList: document.getElementById('template-list'),
            importBtn: document.getElementById('import-template-btn'),
            exportAllBtn: document.getElementById('export-all-templates-btn'),
            templateFileInput: document.getElementById('template-file-input'),
        };
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 应用内置模板
        this.elements.applyBuiltInBtn.addEventListener('click', () => {
            this.handleApplyBuiltInTemplate();
        });

        // 应用用户模板
        this.elements.applyUserBtn.addEventListener('click', () => {
            this.handleApplyUserTemplate();
        });

        // 保存为模板
        this.elements.saveTemplateBtn.addEventListener('click', () => {
            this.handleSaveTemplate();
        });

        // 打开模板管理器
        this.elements.manageTemplatesBtn.addEventListener('click', () => {
            this.openTemplateManager();
        });

        // 关闭模板管理器
        this.elements.closeManagerBtn.addEventListener('click', () => {
            this.closeTemplateManager();
        });

        // 导入模板
        this.elements.importBtn.addEventListener('click', () => {
            this.elements.templateFileInput.click();
        });

        this.elements.templateFileInput.addEventListener('change', (e) => {
            this.handleImportTemplate(e);
        });

        // 导出所有模板
        this.elements.exportAllBtn.addEventListener('click', () => {
            this.handleExportAllTemplates();
        });

        // 监听模板事件
        this.templateManager.addEventListener('template-created', () => {
            this.refreshTemplateSelectors();
        });

        this.templateManager.addEventListener('template-updated', () => {
            this.refreshTemplateSelectors();
        });

        this.templateManager.addEventListener('template-deleted', () => {
            this.refreshTemplateSelectors();
        });

        // 点击遮罩层关闭
        this.elements.managerOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.managerOverlay) {
                this.closeTemplateManager();
            }
        });
    }

    /**
     * 初始化模板选择器
     */
    initTemplateSelectors() {
        this.refreshTemplateSelectors();
    }

    /**
     * 刷新模板选择器
     */
    refreshTemplateSelectors() {
        // 刷新内置模板下拉框
        const builtInTemplates = this.templateManager.getBuiltInTemplates();
        this.populateSelect(this.elements.builtInSelect, builtInTemplates);

        // 刷新用户模板下拉框
        const userTemplates = this.templateManager.getUserTemplates();
        this.populateSelect(this.elements.userSelect, userTemplates);
    }

    /**
     * 填充下拉框
     * @param {HTMLSelectElement} selectElement - 下拉框元素
     * @param {Template[]} templates - 模板数组
     */
    populateSelect(selectElement, templates) {
        // 清空现有选项（保留第一个"选择模板..."）
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }

        // 添加模板选项
        templates.forEach((template) => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            if (template.description) {
                option.title = template.description;
            }
            selectElement.appendChild(option);
        });
    }

    /**
     * 应用内置模板
     */
    handleApplyBuiltInTemplate() {
        const selectedId = this.elements.builtInSelect.value;
        if (!selectedId) {
            Dialog.alert(
                this.languageManager.get('selectTemplateFirst') || '请先选择一个模板',
                this.languageManager.get('notice') || '提示'
            );
            return;
        }

        this.applyTemplate(selectedId);
    }

    /**
     * 应用用户模板
     */
    handleApplyUserTemplate() {
        const selectedId = this.elements.userSelect.value;
        if (!selectedId) {
            Dialog.alert(
                this.languageManager.get('selectTemplateFirst') || '请先选择一个模板',
                this.languageManager.get('notice') || '提示'
            );
            return;
        }

        this.applyTemplate(selectedId);
    }

    /**
     * 应用模板
     * @param {string} templateId - 模板 ID
     */
    applyTemplate(templateId) {
        const settings = this.templateManager.applyTemplate(templateId);
        if (!settings) {
            Dialog.alert(
                this.languageManager.get('templateNotFound') || '模板不存在',
                this.languageManager.get('error') || '错误'
            );
            return;
        }

        // 触发自定义事件，让 app.js 应用设置
        const event = new CustomEvent('apply-template', {
            detail: { settings },
        });
        document.dispatchEvent(event);

        console.log('已应用模板:', templateId);
    }

    /**
     * 保存为模板
     */
    async handleSaveTemplate() {
        // 触发自定义事件，获取当前设置
        const event = new CustomEvent('get-current-settings');
        document.dispatchEvent(event);

        // 等待设置返回（通过自定义属性）
        const currentSettings = window.currentSettings;
        if (!currentSettings) {
            await Dialog.alert(
                this.languageManager.get('noSettingsToSave') || '没有可保存的设置',
                this.languageManager.get('error') || '错误'
            );
            return;
        }

        // 创建保存模板对话框
        const dialogHTML = `
            <div class="save-template-form">
                <div class="form-group">
                    <label for="template-name-input">${this.languageManager.get('templateName') || '模板名称'}</label>
                    <input type="text" id="template-name-input" placeholder="${this.languageManager.get('enterTemplateName') || '输入模板名称'}" required>
                </div>
                <div class="form-group">
                    <label for="template-desc-input">${this.languageManager.get('templateDescription') || '模板描述'}</label>
                    <textarea id="template-desc-input" placeholder="${this.languageManager.get('enterTemplateDescription') || '输入模板描述（可选）'}" rows="3"></textarea>
                </div>
            </div>
        `;

        const saveDialog = this.createCustomDialog(
            this.languageManager.get('saveAsTemplate') || '保存为模板',
            dialogHTML,
            true
        );

        document.body.appendChild(saveDialog);

        // 等待用户输入
        const result = await this.waitForDialogResult(saveDialog);

        if (result) {
            const name = document.getElementById('template-name-input').value.trim();
            const description = document.getElementById('template-desc-input').value.trim();

            if (!name) {
                await Dialog.alert(
                    this.languageManager.get('templateNameRequired') || '模板名称不能为空',
                    this.languageManager.get('error') || '错误'
                );
                document.body.removeChild(saveDialog);
                return;
            }

            // 创建模板
            const template = this.templateManager.createTemplate(name, description, currentSettings);

            await Dialog.alert(
                `${this.languageManager.get('templateSaved') || '模板已保存'}: ${name}`,
                this.languageManager.get('success') || '成功'
            );

            console.log('模板已保存:', template);
        }

        document.body.removeChild(saveDialog);
    }

    /**
     * 打开模板管理器
     */
    openTemplateManager() {
        this.renderTemplateList();
        this.elements.managerOverlay.style.display = 'flex';
    }

    /**
     * 关闭模板管理器
     */
    closeTemplateManager() {
        this.elements.managerOverlay.style.display = 'none';
    }

    /**
     * 渲染模板列表
     */
    renderTemplateList() {
        const userTemplates = this.templateManager.getUserTemplates();

        if (userTemplates.length === 0) {
            this.elements.templateList.innerHTML = `
                <div class="empty-state">
                    <p>${this.languageManager.get('noUserTemplates') || '暂无自定义模板'}</p>
                    <p class="empty-state-hint">${this.languageManager.get('saveTemplateHint') || '点击"保存为模板"创建第一个模板'}</p>
                </div>
            `;
            return;
        }

        this.elements.templateList.innerHTML = '';

        userTemplates.forEach((template) => {
            const templateItem = this.createTemplateItem(template);
            this.elements.templateList.appendChild(templateItem);
        });
    }

    /**
     * 创建模板项 DOM
     * @param {Template} template - 模板对象
     * @returns {HTMLElement}
     */
    createTemplateItem(template) {
        const item = document.createElement('div');
        item.className = 'template-item';
        item.dataset.templateId = template.id;

        const info = document.createElement('div');
        info.className = 'template-item-info';

        const name = document.createElement('h4');
        name.className = 'template-item-name';
        name.textContent = template.name;

        const description = document.createElement('p');
        description.className = 'template-item-description';
        description.textContent = template.description || this.languageManager.get('noDescription') || '无描述';

        const date = document.createElement('p');
        date.className = 'template-item-date';
        date.textContent = new Date(template.createdAt).toLocaleString();

        info.appendChild(name);
        info.appendChild(description);
        info.appendChild(date);

        const actions = document.createElement('div');
        actions.className = 'template-item-actions';

        // 编辑按钮
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-icon edit-btn';
        editBtn.title = this.languageManager.get('edit') || '编辑';
        editBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
        `;
        editBtn.addEventListener('click', () => this.handleEditTemplate(template.id));

        // 导出按钮
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn-icon export-btn';
        exportBtn.title = this.languageManager.get('export') || '导出';
        exportBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
        `;
        exportBtn.addEventListener('click', () => this.handleExportTemplate(template.id));

        // 删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-icon delete-btn';
        deleteBtn.title = this.languageManager.get('delete') || '删除';
        deleteBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
        `;
        deleteBtn.addEventListener('click', () => this.handleDeleteTemplate(template.id));

        actions.appendChild(editBtn);
        actions.appendChild(exportBtn);
        actions.appendChild(deleteBtn);

        item.appendChild(info);
        item.appendChild(actions);

        return item;
    }

    /**
     * 处理编辑模板
     * @param {string} templateId - 模板 ID
     */
    async handleEditTemplate(templateId) {
        const template = this.templateManager.getTemplateById(templateId);
        if (!template) return;

        const dialogHTML = `
            <div class="save-template-form">
                <div class="form-group">
                    <label for="edit-template-name-input">${this.languageManager.get('templateName') || '模板名称'}</label>
                    <input type="text" id="edit-template-name-input" value="${template.name}" required>
                </div>
                <div class="form-group">
                    <label for="edit-template-desc-input">${this.languageManager.get('templateDescription') || '模板描述'}</label>
                    <textarea id="edit-template-desc-input" rows="3">${template.description || ''}</textarea>
                </div>
            </div>
        `;

        const editDialog = this.createCustomDialog(
            this.languageManager.get('editTemplate') || '编辑模板',
            dialogHTML,
            true
        );

        document.body.appendChild(editDialog);

        const result = await this.waitForDialogResult(editDialog);

        if (result) {
            const name = document.getElementById('edit-template-name-input').value.trim();
            const description = document.getElementById('edit-template-desc-input').value.trim();

            if (!name) {
                await Dialog.alert(
                    this.languageManager.get('templateNameRequired') || '模板名称不能为空',
                    this.languageManager.get('error') || '错误'
                );
                document.body.removeChild(editDialog);
                return;
            }

            this.templateManager.updateTemplate(templateId, { name, description });

            await Dialog.alert(
                this.languageManager.get('templateUpdated') || '模板已更新',
                this.languageManager.get('success') || '成功'
            );

            this.renderTemplateList();
        }

        document.body.removeChild(editDialog);
    }

    /**
     * 处理导出模板
     * @param {string} templateId - 模板 ID
     */
    handleExportTemplate(templateId) {
        const jsonString = this.templateManager.exportTemplate(templateId);
        if (!jsonString) {
            Dialog.alert(
                this.languageManager.get('templateNotFound') || '模板不存在',
                this.languageManager.get('error') || '错误'
            );
            return;
        }

        const template = this.templateManager.getTemplateById(templateId);
        const filename = `imgecho_template_${template.name}_${Date.now()}.json`;

        this.downloadTextFile(jsonString, filename);

        console.log('模板已导出:', filename);
    }

    /**
     * 处理导出所有模板
     */
    handleExportAllTemplates() {
        const userTemplates = this.templateManager.getUserTemplates();
        if (userTemplates.length === 0) {
            Dialog.alert(
                this.languageManager.get('noUserTemplates') || '暂无自定义模板',
                this.languageManager.get('notice') || '提示'
            );
            return;
        }

        const jsonString = this.templateManager.exportAllUserTemplates();
        const filename = `imgecho_templates_all_${Date.now()}.json`;

        this.downloadTextFile(jsonString, filename);

        console.log('所有模板已导出:', filename);
    }

    /**
     * 处理导入模板
     * @param {Event} e - 文件输入事件
     */
    async handleImportTemplate(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const templates = this.templateManager.importMultipleTemplates(text);

            if (templates.length === 0) {
                await Dialog.alert(
                    this.languageManager.get('importFailed') || '导入失败，请检查文件格式',
                    this.languageManager.get('error') || '错误'
                );
                return;
            }

            await Dialog.alert(
                `${this.languageManager.get('importSuccess') || '成功导入'} ${templates.length} ${this.languageManager.get('templates') || '个模板'}`,
                this.languageManager.get('success') || '成功'
            );

            this.renderTemplateList();
            console.log('导入模板:', templates);
        } catch (error) {
            console.error('导入模板失败:', error);
            await Dialog.alert(
                this.languageManager.get('importFailed') || '导入失败',
                this.languageManager.get('error') || '错误'
            );
        } finally {
            // 清空文件输入，允许重复导入相同文件
            e.target.value = '';
        }
    }

    /**
     * 处理删除模板
     * @param {string} templateId - 模板 ID
     */
    async handleDeleteTemplate(templateId) {
        const template = this.templateManager.getTemplateById(templateId);
        if (!template) return;

        const confirmed = await Dialog.confirm(
            `${this.languageManager.get('confirmDeleteTemplate') || '确定删除模板'} "${template.name}" 吗？`,
            this.languageManager.get('confirm') || '确认'
        );

        if (confirmed) {
            this.templateManager.deleteTemplate(templateId);
            await Dialog.alert(
                this.languageManager.get('templateDeleted') || '模板已删除',
                this.languageManager.get('success') || '成功'
            );
            this.renderTemplateList();
        }
    }

    /**
     * 下载文本文件
     * @param {string} content - 文件内容
     * @param {string} filename - 文件名
     */
    downloadTextFile(content, filename) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * 创建自定义对话框
     * @param {string} title - 标题
     * @param {string} contentHTML - 内容 HTML
     * @param {boolean} showCancel - 是否显示取消按钮
     * @returns {HTMLElement}
     */
    createCustomDialog(title, contentHTML, showCancel = false) {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.style.display = 'flex';

        overlay.innerHTML = `
            <div class="dialog-box">
                <div class="dialog-header">
                    <h3>${title}</h3>
                </div>
                <div class="dialog-content">
                    ${contentHTML}
                </div>
                <div class="dialog-footer">
                    ${showCancel ? `<button class="btn btn-secondary dialog-cancel-btn">${this.languageManager.get('cancel') || '取消'}</button>` : ''}
                    <button class="btn btn-primary dialog-confirm-btn">${this.languageManager.get('confirm') || '确定'}</button>
                </div>
            </div>
        `;

        return overlay;
    }

    /**
     * 等待对话框结果
     * @param {HTMLElement} dialogElement - 对话框元素
     * @returns {Promise<boolean>}
     */
    waitForDialogResult(dialogElement) {
        return new Promise((resolve) => {
            const confirmBtn = dialogElement.querySelector('.dialog-confirm-btn');
            const cancelBtn = dialogElement.querySelector('.dialog-cancel-btn');

            const cleanup = () => {
                confirmBtn.removeEventListener('click', onConfirm);
                if (cancelBtn) {
                    cancelBtn.removeEventListener('click', onCancel);
                }
            };

            const onConfirm = () => {
                cleanup();
                resolve(true);
            };

            const onCancel = () => {
                cleanup();
                resolve(false);
            };

            confirmBtn.addEventListener('click', onConfirm);
            if (cancelBtn) {
                cancelBtn.addEventListener('click', onCancel);
            }
        });
    }
}
