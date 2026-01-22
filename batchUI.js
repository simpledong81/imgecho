/**
 * 批量处理 UI 管理器
 * 管理批量模式的 UI 交互和显示
 */
import { Dialog } from './dialog.js';

/**
 * BatchUI 类
 */
export class BatchUI {
    constructor(batchProcessor, languageManager) {
        this.batchProcessor = batchProcessor;
        this.languageManager = languageManager;
        this.mode = 'single'; // 'single' | 'batch'
        this.elements = {};
        this.initElements();
        this.bindEvents();
    }

    /**
     * 初始化 DOM 元素引用
     */
    initElements() {
        this.elements = {
            // 模式切换
            singleModeBtn: document.getElementById('single-mode-btn'),
            batchModeBtn: document.getElementById('batch-mode-btn'),

            // 批量面板
            batchQueuePanel: document.getElementById('batch-queue-panel'),
            batchControlsPanel: document.getElementById('batch-controls-panel'),
            queueCount: document.getElementById('queue-count'),
            batchQueue: document.getElementById('batch-queue'),
            clearQueueBtn: document.getElementById('clear-queue-btn'),
            applyToAllBtn: document.getElementById('apply-to-all-btn'),
            batchExportBtn: document.getElementById('batch-export-btn'),

            // 进度条
            batchProgress: document.getElementById('batch-progress'),
            progressFill: document.getElementById('progress-fill'),
            progressCurrent: document.getElementById('progress-current'),
            progressTotal: document.getElementById('progress-total'),

            // 导航按钮
            batchNavigation: document.getElementById('batch-navigation'),
            prevImageBtn: document.getElementById('prev-image-btn'),
            nextImageBtn: document.getElementById('next-image-btn'),
            currentImageIndex: document.getElementById('current-image-index'),
            totalImages: document.getElementById('total-images'),

            // 文件输入
            fileInput: document.getElementById('file-input'),
        };
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 监听队列更新
        this.batchProcessor.addEventListener('queue-updated', () => {
            this.renderQueue();
            this.updateNavigationState();
        });

        // 监听图片选择
        this.batchProcessor.addEventListener('image-selected', (e) => {
            this.updateActiveItem(e.detail.index);
            this.updateNavigationState();
        });

        // 导航按钮点击
        if (this.elements.prevImageBtn) {
            this.elements.prevImageBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡到 drop-zone
                this.navigateToPrevious();
            });
        }

        if (this.elements.nextImageBtn) {
            this.elements.nextImageBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡到 drop-zone
                this.navigateToNext();
            });
        }

        // 阻止导航容器的点击事件冒泡
        if (this.elements.batchNavigation) {
            this.elements.batchNavigation.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡到 drop-zone
            });
        }

        // 键盘快捷键
        this.setupKeyboardShortcuts();
    }

    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 只在批量模式下生效
            if (this.mode !== 'batch') return;

            // 排除文本输入框
            if (
                document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA'
            ) {
                return;
            }

            // 左箭头 - 上一张
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.navigateToPrevious();
            }

            // 右箭头 - 下一张
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.navigateToNext();
            }
        });
    }

    /**
     * 切换模式
     * @param {string} mode - 'single' | 'batch'
     */
    switchMode(mode) {
        this.mode = mode;

        if (mode === 'batch') {
            // 切换到批量模式
            this.elements.singleModeBtn.classList.remove('active');
            this.elements.batchModeBtn.classList.add('active');
            this.elements.batchQueuePanel.style.display = 'block';
            this.elements.batchControlsPanel.style.display = 'block';
            this.elements.fileInput.setAttribute('multiple', '');
            this.updateNavigationVisibility();
        } else {
            // 切换到单张模式
            this.elements.singleModeBtn.classList.add('active');
            this.elements.batchModeBtn.classList.remove('active');
            this.elements.batchQueuePanel.style.display = 'none';
            this.elements.batchControlsPanel.style.display = 'none';
            this.elements.batchNavigation.style.display = 'none';
            this.elements.fileInput.removeAttribute('multiple');
        }
    }

    /**
     * 渲染队列
     */
    renderQueue() {
        const queue = this.batchProcessor.getQueue();
        this.elements.queueCount.textContent = queue.length;

        // 清空队列容器
        this.elements.batchQueue.innerHTML = '';

        if (queue.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'queue-empty-message';
            emptyMessage.textContent =
                this.languageManager.get('batchQueueEmpty') || '队列为空，请上传图片';
            this.elements.batchQueue.appendChild(emptyMessage);
            return;
        }

        // 渲染每个队列项
        queue.forEach((item, index) => {
            const queueItem = this.createQueueItem(item, index);
            this.elements.batchQueue.appendChild(queueItem);
        });

        // 高亮当前选中的项
        this.updateActiveItem(this.batchProcessor.currentIndex);
    }

    /**
     * 创建队列项 DOM
     * @param {BatchImageItem} item - 图片项
     * @param {number} index - 索引
     * @returns {HTMLElement}
     */
    createQueueItem(item, index) {
        const queueItem = document.createElement('div');
        queueItem.className = 'queue-item';
        queueItem.dataset.index = index;

        // 缩略图
        const thumbnail = document.createElement('img');
        thumbnail.className = 'queue-thumbnail';
        thumbnail.src = item.thumbnail;
        thumbnail.alt = item.name;

        // 信息区域
        const info = document.createElement('div');
        info.className = 'queue-item-info';

        const name = document.createElement('p');
        name.className = 'queue-item-name';
        name.textContent = item.name;
        name.title = item.name;

        const status = document.createElement('span');
        status.className = `queue-item-status ${item.status}`;
        status.textContent = this.getStatusText(item.status);

        info.appendChild(name);
        info.appendChild(status);

        // 操作按钮区域
        const actions = document.createElement('div');
        actions.className = 'queue-item-actions';

        // 预览按钮
        const previewBtn = document.createElement('button');
        previewBtn.className = 'btn-icon preview-btn';
        previewBtn.title = this.languageManager.get('preview') || '预览';
        previewBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
        previewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handlePreviewClick(index);
        });

        // 还原按钮
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-icon reset-btn';
        resetBtn.title = this.languageManager.get('reset') || '还原';
        resetBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
            </svg>
        `;
        resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleResetClick(index);
        });

        // 删除按钮
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-icon remove-btn';
        removeBtn.title = this.languageManager.get('remove') || '移除';
        removeBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleRemoveClick(index);
        });

        actions.appendChild(previewBtn);
        actions.appendChild(resetBtn);
        actions.appendChild(removeBtn);

        // 组装
        queueItem.appendChild(thumbnail);
        queueItem.appendChild(info);
        queueItem.appendChild(actions);

        // 整个项目可点击预览
        queueItem.addEventListener('click', () => {
            this.handlePreviewClick(index);
        });

        return queueItem;
    }

    /**
     * 获取状态文本
     * @param {string} status - 状态
     * @returns {string}
     */
    getStatusText(status) {
        const statusMap = {
            pending: this.languageManager.get('statusPending') || '待处理',
            processing: this.languageManager.get('statusProcessing') || '处理中',
            completed: this.languageManager.get('statusCompleted') || '已完成',
            error: this.languageManager.get('statusError') || '失败',
        };
        return statusMap[status] || status;
    }

    /**
     * 更新当前激活的队列项
     * @param {number} index - 索引
     */
    updateActiveItem(index) {
        // 移除所有 active 类
        const allItems = this.elements.batchQueue.querySelectorAll('.queue-item');
        allItems.forEach((item) => item.classList.remove('active'));

        // 添加 active 类到当前项
        if (index >= 0) {
            const activeItem = this.elements.batchQueue.querySelector(
                `.queue-item[data-index="${index}"]`
            );
            if (activeItem) {
                activeItem.classList.add('active');
                // 滚动到可见区域
                activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }

    /**
     * 处理预览点击
     * @param {number} index - 索引
     */
    handlePreviewClick(index) {
        this.batchProcessor.selectImage(index);
    }

    /**
     * 处理还原点击
     * @param {number} index - 索引
     */
    async handleResetClick(index) {
        const item = this.batchProcessor.getQueue()[index];
        if (await Dialog.confirm(`确定要还原 "${item.name}" 到原始 EXIF 数据吗？`)) {
            this.batchProcessor.resetImageMetadata(index);
        }
    }

    /**
     * 处理移除点击
     * @param {number} index - 索引
     */
    async handleRemoveClick(index) {
        const item = this.batchProcessor.getQueue()[index];
        if (await Dialog.confirm(`确定移除 "${item.name}" 吗？`)) {
            this.batchProcessor.removeImage(index);
        }
    }

    /**
     * 更新进度条
     * @param {number} current - 当前进度
     * @param {number} total - 总数
     */
    updateProgress(current, total) {
        if (total === 0) {
            this.hideProgress();
            return;
        }

        this.showProgress();

        const percent = (current / total) * 100;
        this.elements.progressFill.style.width = `${percent}%`;
        this.elements.progressCurrent.textContent = current;
        this.elements.progressTotal.textContent = total;
    }

    /**
     * 显示进度条
     */
    showProgress() {
        this.elements.batchProgress.style.display = 'block';
    }

    /**
     * 隐藏进度条
     */
    hideProgress() {
        this.elements.batchProgress.style.display = 'none';
        this.elements.progressFill.style.width = '0%';
    }

    /**
     * 获取当前模式
     * @returns {string}
     */
    getMode() {
        return this.mode;
    }

    /**
     * 导航到上一张图片
     */
    navigateToPrevious() {
        const currentIndex = this.batchProcessor.currentIndex;
        if (currentIndex > 0) {
            this.batchProcessor.selectImage(currentIndex - 1);
        }
    }

    /**
     * 导航到下一张图片
     */
    navigateToNext() {
        const currentIndex = this.batchProcessor.currentIndex;
        const queueLength = this.batchProcessor.getQueue().length;
        if (currentIndex < queueLength - 1) {
            this.batchProcessor.selectImage(currentIndex + 1);
        }
    }

    /**
     * 更新导航状态
     */
    updateNavigationState() {
        const queue = this.batchProcessor.getQueue();
        const queueLength = queue.length;
        const currentIndex = this.batchProcessor.currentIndex;

        if (!this.elements.batchNavigation) return;

        // 更新计数显示
        if (this.elements.currentImageIndex) {
            this.elements.currentImageIndex.textContent = currentIndex + 1;
        }
        if (this.elements.totalImages) {
            this.elements.totalImages.textContent = queueLength;
        }

        // 更新按钮禁用状态
        if (this.elements.prevImageBtn) {
            this.elements.prevImageBtn.disabled = currentIndex === 0;
        }
        if (this.elements.nextImageBtn) {
            this.elements.nextImageBtn.disabled = currentIndex === queueLength - 1;
        }

        // 更新导航栏可见性
        this.updateNavigationVisibility();
    }

    /**
     * 更新导航栏可见性
     */
    updateNavigationVisibility() {
        if (!this.elements.batchNavigation) return;

        const queue = this.batchProcessor.getQueue();
        const queueLength = queue.length;
        const isBatchMode = this.mode === 'batch';

        // 批量模式且有图片时显示导航
        if (isBatchMode && queueLength > 0) {
            this.elements.batchNavigation.style.display = 'flex';
        } else {
            this.elements.batchNavigation.style.display = 'none';
        }
    }
}
