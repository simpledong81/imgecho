/**
 * 历史记录管理器
 * 管理撤销/重做栈，提供快照保存和恢复功能
 */
export class HistoryManager extends EventTarget {
    constructor(maxEntries = 50) {
        super();
        this.storageKey = 'imgecho_history_session'; // 会话级存储
        this.maxEntries = maxEntries;
        this.undoStack = [];
        this.redoStack = [];
        this.currentState = null;
        this.isRestoring = false;

        // 性能优化：防抖定时器
        this.snapshotDebounceTimer = null;
        this.snapshotDebounceDelay = 500; // 500ms 后才保存快照
    }

    /**
     * 创建状态快照
     * @param {Object} state - 当前状态对象
     * @param {string} operation - 操作类型
     * @param {string} label - 操作描述
     * @param {HTMLCanvasElement} canvas - 用于生成缩略图
     */
    saveSnapshot(state, operation, label, canvas) {
        // 如果正在恢复状态，不创建新快照
        if (this.isRestoring) return;

        // 清空重做栈（新操作后不能再重做）
        this.redoStack = [];

        // 生成缩略图
        const thumbnail = this.generateThumbnail(canvas);

        const snapshot = {
            id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            operation,
            label,
            thumbnail,
            state: JSON.parse(JSON.stringify(state)), // 深拷贝
        };

        // 添加到撤销栈
        this.undoStack.push(snapshot);
        this.currentState = snapshot;

        // 限制栈大小
        if (this.undoStack.length > this.maxEntries) {
            this.undoStack.shift(); // 移除最旧的
        }

        // 触发事件
        this.dispatchEvent(
            new CustomEvent('snapshot-saved', {
                detail: { snapshot },
            })
        );

        // 更新按钮状态
        this.updateButtonStates();
    }

    /**
     * 防抖版快照保存（用于频繁变化的操作）
     * @param {Object} state - 当前状态对象
     * @param {string} operation - 操作类型
     * @param {string} label - 操作描述
     * @param {HTMLCanvasElement} canvas - 用于生成缩略图
     * @param {Function} getDetailedLabel - 可选的函数，用于生成详细标签
     */
    debouncedSnapshot(state, operation, label, canvas, getDetailedLabel = null) {
        if (this.snapshotDebounceTimer) {
            clearTimeout(this.snapshotDebounceTimer);
        }

        this.snapshotDebounceTimer = setTimeout(() => {
            // 如果提供了 getDetailedLabel 函数，生成详细标签
            const finalLabel = getDetailedLabel ? getDetailedLabel(this.currentState?.state, state) : label;
            this.saveSnapshot(state, operation, finalLabel, canvas);
        }, this.snapshotDebounceDelay);
    }

    /**
     * 比较两个状态并生成变更描述
     * @param {Object} oldState - 旧状态
     * @param {Object} newState - 新状态
     * @param {Object} languageManager - 语言管理器实例
     * @returns {string} 变更描述
     */
    static getChangeDescription(oldState, newState, languageManager) {
        if (!oldState || !newState) return languageManager?.get('operationMetadataChange') || '修改设置';

        const changes = [];
        const fieldLabels = {
            camera: languageManager?.get('camera') || '相机',
            lens: languageManager?.get('lens') || '镜头',
            location: languageManager?.get('location') || '位置',
            iso: 'ISO',
            aperture: languageManager?.get('aperture') || '光圈',
            shutter: languageManager?.get('shutter') || '快门',
            copyright: languageManager?.get('copyright') || '版权',
            notes: languageManager?.get('notes') || '注释',
            fontFamily: '字体',
            fontWeight: '字重',
            fontSize: '字号',
            fontPosition: '文字位置',
            displayMode: '显示模式',
            fontColor: '文字颜色',
            fontOpacity: '文字透明度',
            strokeColor: '描边颜色',
            strokeWidth: '描边宽度',
            textShadow: '文字阴影',
            bgMask: '背景遮罩',
            bgMaskOpacity: '遮罩透明度',
            textRotation: '文字旋转',
            letterSpacing: '字间距',
            lineHeight: '行高',
            blurValue: '模糊度',
            logoId: 'Logo',
        };

        // 比较各个字段
        for (const [key, label] of Object.entries(fieldLabels)) {
            if (oldState[key] !== newState[key]) {
                // 特殊处理某些字段
                if (key === 'textShadow' || key === 'bgMask') {
                    const oldValue = oldState[key] ? '启用' : '禁用';
                    const newValue = newState[key] ? '启用' : '禁用';
                    changes.push(`${label}: ${oldValue} → ${newValue}`);
                } else if (key === 'logoId') {
                    if (!oldState[key] && newState[key]) {
                        changes.push('添加 Logo');
                    } else if (oldState[key] && !newState[key]) {
                        changes.push('移除 Logo');
                    } else if (oldState[key] !== newState[key]) {
                        changes.push('更换 Logo');
                    }
                } else {
                    // 截断过长的值
                    const oldValue = String(oldState[key] || '').substring(0, 20);
                    const newValue = String(newState[key] || '').substring(0, 20);
                    if (oldValue || newValue) {
                        changes.push(`${label}: ${oldValue || '空'} → ${newValue || '空'}`);
                    }
                }

                // 最多显示3个变更
                if (changes.length >= 3) break;
            }
        }

        if (changes.length === 0) {
            return languageManager?.get('operationMetadataChange') || '修改设置';
        } else if (changes.length === 1) {
            return changes[0];
        } else {
            return `${changes[0]}等${changes.length}项`;
        }
    }

    /**
     * 撤销操作
     * @returns {Object|null} 上一个快照或 null
     */
    undo() {
        if (!this.canUndo()) return null;

        // 保存当前状态到重做栈
        const currentSnapshot = this.undoStack.pop();
        this.redoStack.push(currentSnapshot);

        // 获取上一个状态
        const previousSnapshot = this.undoStack[this.undoStack.length - 1] || null;
        this.currentState = previousSnapshot;

        // 触发恢复事件
        if (previousSnapshot) {
            this.isRestoring = true;
            this.dispatchEvent(
                new CustomEvent('restore-snapshot', {
                    detail: { snapshot: previousSnapshot },
                })
            );
            setTimeout(() => {
                this.isRestoring = false;
            }, 100);
        }

        this.updateButtonStates();
        return previousSnapshot;
    }

    /**
     * 重做操作
     * @returns {Object|null} 下一个快照或 null
     */
    redo() {
        if (!this.canRedo()) return null;

        // 从重做栈取出状态
        const nextSnapshot = this.redoStack.pop();
        this.undoStack.push(nextSnapshot);
        this.currentState = nextSnapshot;

        // 触发恢复事件
        this.isRestoring = true;
        this.dispatchEvent(
            new CustomEvent('restore-snapshot', {
                detail: { snapshot: nextSnapshot },
            })
        );
        setTimeout(() => {
            this.isRestoring = false;
        }, 100);

        this.updateButtonStates();
        return nextSnapshot;
    }

    /**
     * 是否可以撤销
     * @returns {boolean}
     */
    canUndo() {
        return this.undoStack.length > 1; // 至少保留初始状态
    }

    /**
     * 是否可以重做
     * @returns {boolean}
     */
    canRedo() {
        return this.redoStack.length > 0;
    }

    /**
     * 清空历史记录
     */
    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this.currentState = null;
        this.updateButtonStates();
    }

    /**
     * 获取所有历史记录（用于历史面板）
     * @returns {Array} 快照数组（最新的在前）
     */
    getAllSnapshots() {
        return [...this.undoStack].reverse(); // 最新的在前
    }

    /**
     * 跳转到特定快照
     * @param {string} snapshotId - 快照 ID
     * @returns {Object|null} 目标快照或 null
     */
    jumpToSnapshot(snapshotId) {
        const index = this.undoStack.findIndex((s) => s.id === snapshotId);
        if (index === -1) return null;

        // 将当前位置之后的所有快照移到重做栈
        const itemsToMove = this.undoStack.splice(index + 1);
        this.redoStack = itemsToMove.reverse();

        // 恢复目标快照
        const targetSnapshot = this.undoStack[this.undoStack.length - 1];
        this.currentState = targetSnapshot;

        this.isRestoring = true;
        this.dispatchEvent(
            new CustomEvent('restore-snapshot', {
                detail: { snapshot: targetSnapshot },
            })
        );
        setTimeout(() => {
            this.isRestoring = false;
        }, 100);

        this.updateButtonStates();
        return targetSnapshot;
    }

    /**
     * 生成缩略图
     * @param {HTMLCanvasElement} canvas - 源画布
     * @param {number} width - 缩略图宽度
     * @param {number} height - 缩略图高度
     * @returns {string|null} Base64 编码的 JPEG 图片或 null
     */
    generateThumbnail(canvas, width = 100, height = 100) {
        if (!canvas) return null;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const ctx = tempCanvas.getContext('2d');

        // 计算缩放比例（保持宽高比）
        const scale = Math.min(width / canvas.width, height / canvas.height);
        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;
        const offsetX = (width - scaledWidth) / 2;
        const offsetY = (height - scaledHeight) / 2;

        // 绘制缩略图
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(canvas, offsetX, offsetY, scaledWidth, scaledHeight);

        // 返回 JPEG 格式（压缩）
        return tempCanvas.toDataURL('image/jpeg', 0.7);
    }

    /**
     * 更新撤销/重做按钮状态
     */
    updateButtonStates() {
        this.dispatchEvent(
            new CustomEvent('history-state-changed', {
                detail: {
                    canUndo: this.canUndo(),
                    canRedo: this.canRedo(),
                    totalSnapshots: this.undoStack.length,
                },
            })
        );
    }
}
