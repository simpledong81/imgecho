/**
 * Logo UI 管理器
 * 管理 Logo 相关的 UI 交互和显示
 */
import { Dialog } from './dialog.js';

/**
 * LogoUI 类
 */
export class LogoUI {
    constructor(logoManager, languageManager) {
        this.logoManager = logoManager;
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
            // Logo 控制
            logoSelect: document.getElementById('logo-select'),
            uploadLogoBtn: document.getElementById('upload-logo-btn'),
            logoPosition: document.getElementById('logo-position'),
            logoSize: document.getElementById('logo-size'),
            logoSizeValue: document.getElementById('logo-size-value'),
            logoOpacity: document.getElementById('logo-opacity'),
            logoOpacityValue: document.getElementById('logo-opacity-value'),
            logoTiled: document.getElementById('logo-tiled'),
            manageLogosBtn: document.getElementById('manage-logos-btn'),

            // Logo 管理器对话框
            logoManagerOverlay: document.getElementById('logo-manager-overlay'),
            closeLogoManagerBtn: document.getElementById('close-logo-manager'),
            logoList: document.getElementById('logo-list'),

            // 文件输入
            logoFileInput: document.getElementById('logo-file-input'),
        };
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 上传 Logo
        this.elements.uploadLogoBtn.addEventListener('click', () => {
            this.elements.logoFileInput.click();
        });

        this.elements.logoFileInput.addEventListener('change', (e) => {
            this.handleLogoUpload(e);
        });

        // Logo 选择
        this.elements.logoSelect.addEventListener('change', (e) => {
            this.handleLogoSelect(e.target.value);
        });

        // Logo 大小滑块
        this.elements.logoSize.addEventListener('input', (e) => {
            this.elements.logoSizeValue.textContent = e.target.value;
            this.triggerLogoUpdate();
        });

        // Logo 透明度滑块
        this.elements.logoOpacity.addEventListener('input', (e) => {
            this.elements.logoOpacityValue.textContent = e.target.value;
            this.triggerLogoUpdate();
        });

        // Logo 位置
        this.elements.logoPosition.addEventListener('change', () => {
            this.triggerLogoUpdate();
        });

        // 平铺模式
        this.elements.logoTiled.addEventListener('change', () => {
            this.triggerLogoUpdate();
        });

        // 打开 Logo 管理器
        this.elements.manageLogosBtn.addEventListener('click', () => {
            this.openLogoManager();
        });

        // 关闭 Logo 管理器
        this.elements.closeLogoManagerBtn.addEventListener('click', () => {
            this.closeLogoManager();
        });

        // 点击遮罩层关闭
        this.elements.logoManagerOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.logoManagerOverlay) {
                this.closeLogoManager();
            }
        });

        // 监听 Logo 事件
        this.logoManager.addEventListener('logo-uploaded', () => {
            this.refreshLogoSelect();
        });

        this.logoManager.addEventListener('logo-deleted', () => {
            this.refreshLogoSelect();
        });

        this.logoManager.addEventListener('logo-changed', () => {
            this.triggerLogoUpdate();
        });
    }

    /**
     * 初始化 Logo 选择器
     */
    initLogoSelect() {
        this.refreshLogoSelect();
    }

    /**
     * 刷新 Logo 选择器
     */
    refreshLogoSelect() {
        const logos = this.logoManager.getAllLogos();
        const currentLogo = this.logoManager.getCurrentLogo();

        // 清空选项（保留第一个"无 Logo"）
        while (this.elements.logoSelect.options.length > 1) {
            this.elements.logoSelect.remove(1);
        }

        // 添加 Logo 选项
        logos.forEach((logo) => {
            const option = document.createElement('option');
            option.value = logo.id;
            option.textContent = logo.name;
            if (currentLogo && currentLogo.id === logo.id) {
                option.selected = true;
            }
            this.elements.logoSelect.appendChild(option);
        });

        // 如果当前没有 Logo，选中"无 Logo"
        if (!currentLogo) {
            this.elements.logoSelect.value = '';
        }
    }

    /**
     * 处理 Logo 上传
     * @param {Event} e - 文件输入事件
     */
    async handleLogoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // 显示加载提示（可选）
            const logo = await this.logoManager.uploadLogo(file);

            // 上传成功后自动选中
            this.logoManager.setCurrentLogo(logo.id);
            this.refreshLogoSelect();

            await Dialog.alert(
                `${this.languageManager.get('logoUploaded') || 'Logo 上传成功'}: ${logo.name}`,
                this.languageManager.get('success') || '成功'
            );
        } catch (error) {
            console.error('上传 Logo 失败:', error);
            await Dialog.alert(
                error.message || this.languageManager.get('logoUploadFailed') || 'Logo 上传失败',
                this.languageManager.get('error') || '错误'
            );
        } finally {
            // 清空文件输入
            e.target.value = '';
        }
    }

    /**
     * 处理 Logo 选择
     * @param {string} logoId - Logo ID
     */
    handleLogoSelect(logoId) {
        if (logoId) {
            this.logoManager.setCurrentLogo(logoId);
        } else {
            this.logoManager.clearCurrentLogo();
        }
    }

    /**
     * 触发 Logo 更新事件
     */
    triggerLogoUpdate() {
        // 触发自定义事件，让 app.js 刷新画布
        document.dispatchEvent(new CustomEvent('logo-settings-changed'));
    }

    /**
     * 获取当前 Logo 设置
     * @returns {Object}
     */
    getLogoSettings() {
        return {
            position: this.elements.logoPosition.value,
            size: parseFloat(this.elements.logoSize.value),
            opacity: parseFloat(this.elements.logoOpacity.value) / 100,
            tiled: this.elements.logoTiled.checked,
        };
    }

    /**
     * 打开 Logo 管理器
     */
    openLogoManager() {
        this.renderLogoList();
        this.elements.logoManagerOverlay.style.display = 'flex';
    }

    /**
     * 关闭 Logo 管理器
     */
    closeLogoManager() {
        this.elements.logoManagerOverlay.style.display = 'none';
    }

    /**
     * 渲染 Logo 列表
     */
    renderLogoList() {
        const logos = this.logoManager.getAllLogos();

        if (logos.length === 0) {
            this.elements.logoList.innerHTML = `
                <div class="empty-state">
                    <p>${this.languageManager.get('noLogos') || '暂无 Logo'}</p>
                    <p class="empty-state-hint">${this.languageManager.get('uploadLogoHint') || '点击"上传 Logo"添加您的第一个 Logo'}</p>
                </div>
            `;
            return;
        }

        this.elements.logoList.innerHTML = '';

        logos.forEach((logo) => {
            const logoItem = this.createLogoItem(logo);
            this.elements.logoList.appendChild(logoItem);
        });
    }

    /**
     * 创建 Logo 项 DOM
     * @param {Logo} logo - Logo 对象
     * @returns {HTMLElement}
     */
    createLogoItem(logo) {
        const item = document.createElement('div');
        item.className = 'logo-item';
        item.dataset.logoId = logo.id;

        // Logo 预览
        const preview = document.createElement('div');
        preview.className = 'logo-item-preview';

        const img = document.createElement('img');
        img.src = logo.dataUrl;
        img.alt = logo.name;
        img.className = 'logo-preview-image';

        preview.appendChild(img);

        // Logo 信息
        const info = document.createElement('div');
        info.className = 'logo-item-info';

        const name = document.createElement('h4');
        name.className = 'logo-item-name';
        name.textContent = logo.name;
        name.title = logo.name;

        const details = document.createElement('p');
        details.className = 'logo-item-details';
        details.textContent = `${logo.width} × ${logo.height}`;

        const date = document.createElement('p');
        date.className = 'logo-item-date';
        date.textContent = new Date(logo.createdAt).toLocaleString();

        info.appendChild(name);
        info.appendChild(details);
        info.appendChild(date);

        // 操作按钮
        const actions = document.createElement('div');
        actions.className = 'logo-item-actions';

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
        deleteBtn.addEventListener('click', () => this.handleDeleteLogo(logo.id, logo.name));

        actions.appendChild(deleteBtn);

        // 组装
        item.appendChild(preview);
        item.appendChild(info);
        item.appendChild(actions);

        return item;
    }

    /**
     * 处理删除 Logo
     * @param {string} logoId - Logo ID
     * @param {string} logoName - Logo 名称
     */
    async handleDeleteLogo(logoId, logoName) {
        const confirmed = await Dialog.confirm(
            `${this.languageManager.get('confirmDeleteLogo') || '确定删除 Logo'} "${logoName}" 吗？`,
            this.languageManager.get('confirm') || '确认'
        );

        if (confirmed) {
            this.logoManager.deleteLogo(logoId);
            await Dialog.alert(
                this.languageManager.get('logoDeleted') || 'Logo 已删除',
                this.languageManager.get('success') || '成功'
            );
            this.renderLogoList();
        }
    }
}
