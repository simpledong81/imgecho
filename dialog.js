/**
 * 自定义对话框工具类
 * 提供美观的 alert 和 confirm 替代方案
 */
export class Dialog {
    constructor() {
        this.overlay = document.getElementById('custom-dialog-overlay');
        this.title = document.getElementById('dialog-title');
        this.message = document.getElementById('dialog-message');
        this.confirmBtn = document.getElementById('dialog-confirm');
        this.cancelBtn = document.getElementById('dialog-cancel');
        this.resolveCallback = null;

        this.setupEventListeners();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 确定按钮
        this.confirmBtn.addEventListener('click', () => {
            this.close(true);
        });

        // 取消按钮
        this.cancelBtn.addEventListener('click', () => {
            this.close(false);
        });

        // 点击背景关闭
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close(false);
            }
        });

        // ESC 键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.style.display === 'flex') {
                this.close(false);
            }
        });
    }

    /**
     * 显示对话框
     * @param {string} title - 标题
     * @param {string} message - 消息内容
     * @param {boolean} showCancel - 是否显示取消按钮
     * @returns {Promise<boolean>}
     */
    show(title, message, showCancel = false) {
        return new Promise((resolve) => {
            this.resolveCallback = resolve;
            this.title.textContent = title;
            this.message.textContent = message;

            // 控制取消按钮的显示
            if (showCancel) {
                this.cancelBtn.style.display = 'block';
            } else {
                this.cancelBtn.style.display = 'none';
            }

            // 显示对话框
            this.overlay.style.display = 'flex';

            // 聚焦确定按钮
            setTimeout(() => {
                this.confirmBtn.focus();
            }, 100);
        });
    }

    /**
     * 关闭对话框
     * @param {boolean} result - 用户选择结果
     */
    close(result) {
        this.overlay.style.display = 'none';
        if (this.resolveCallback) {
            this.resolveCallback(result);
            this.resolveCallback = null;
        }
    }

    /**
     * 显示警告对话框 (alert 替代)
     * @param {string} message - 消息内容
     * @param {string} title - 标题 (默认: "提示")
     * @returns {Promise<void>}
     */
    static async alert(message, title = '提示') {
        const dialog = window.dialogInstance || new Dialog();
        if (!window.dialogInstance) {
            window.dialogInstance = dialog;
        }
        await dialog.show(title, message, false);
    }

    /**
     * 显示确认对话框 (confirm 替代)
     * @param {string} message - 消息内容
     * @param {string} title - 标题 (默认: "确认")
     * @returns {Promise<boolean>}
     */
    static async confirm(message, title = '确认') {
        const dialog = window.dialogInstance || new Dialog();
        if (!window.dialogInstance) {
            window.dialogInstance = dialog;
        }
        return await dialog.show(title, message, true);
    }
}

// 初始化全局对话框实例
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.dialogInstance = new Dialog();
    });
}
