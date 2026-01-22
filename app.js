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
import { HistoryManager } from './historyManager.js';
import { CropRotateManager } from './cropRotateManager.js';

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
        this.templateManager = new TemplateManager(this.languageManager);
        this.templateUI = new TemplateUI(this.templateManager, this.languageManager);

        // Logo 管理模块
        this.logoManager = new LogoManager();
        this.logoUI = new LogoUI(this.logoManager, this.languageManager);

        // 历史记录管理模块
        this.historyManager = new HistoryManager(50);

        // 裁剪/旋转管理模块
        this.cropRotateManager = new CropRotateManager(this.imageProcessor);
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
        const inputFields = [
            'camera', 'lens', 'location', 'iso', 'aperture', 'shutter', 'notes', 'copyright',
            'font-family', 'font-weight', 'font-position', 'display-mode',
            // 高级文字样式字段
            'font-color', 'font-opacity', 'stroke-color', 'stroke-width',
            'text-shadow', 'bg-mask', 'bg-mask-opacity', 'text-rotation',
            'letter-spacing', 'line-height'
        ];
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

        // 高级文字样式滑块值显示更新
        const sliderValuePairs = [
            { slider: 'font-opacity', value: 'font-opacity-value' },
            { slider: 'stroke-width', value: 'stroke-width-value' },
            { slider: 'bg-mask-opacity', value: 'bg-mask-opacity-value' },
            { slider: 'text-rotation', value: 'text-rotation-value' },
            { slider: 'letter-spacing', value: 'letter-spacing-value' },
            { slider: 'line-height', value: 'line-height-value' }
        ];

        sliderValuePairs.forEach(pair => {
            const sliderElement = document.getElementById(pair.slider);
            const valueElement = document.getElementById(pair.value);
            if (sliderElement && valueElement) {
                sliderElement.addEventListener('input', (e) => {
                    const value = e.target.value;
                    // 行间距需要保留一位小数
                    if (pair.slider === 'line-height') {
                        valueElement.textContent = parseFloat(value).toFixed(1);
                    } else {
                        valueElement.textContent = value;
                    }
                });
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

        // 监听语言切换事件，更新模板翻译
        document.addEventListener('language-changed', () => {
            this.templateManager.updateBuiltInTemplateTranslations();
            this.templateUI.refreshTemplateSelectors();
        });

        // 导出按钮事件
        document.getElementById('export-btn').addEventListener('click', () => {
            const format = document.getElementById('export-format').value;
            const quality = parseInt(document.getElementById('export-quality').value);
            ExportManager.exportImageWithCanvas(this.imageProcessor, this.languageManager, format, quality);
        });

        // 导出信息页按钮事件
        document.getElementById('export-info-btn').addEventListener('click', () => {
            ExportManager.exportInfoPage(this.imageProcessor, this.languageManager);
        });

        // 导出质量滑块事件
        const exportQualitySlider = document.getElementById('export-quality');
        if (exportQualitySlider) {
            exportQualitySlider.addEventListener('input', (e) => {
                const exportQualityValue = document.getElementById('export-quality-value');
                if (exportQualityValue) {
                    exportQualityValue.textContent = e.target.value;
                }
            });
        }

        // 批量模式事件监听
        this.setupBatchEventListeners();

        // 模板系统事件监听
        this.setupTemplateEventListeners();

        // Logo 系统事件监听
        this.setupLogoEventListeners();

        // 历史记录系统事件监听
        this.setupHistoryListeners();

        // 裁剪/旋转系统事件监听
        this.setupCropRotateListeners();
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
     * 设置历史记录系统事件监听器
     */
    setupHistoryListeners() {
        // 监听快照恢复事件
        this.historyManager.addEventListener('restore-snapshot', (e) => {
            const snapshot = e.detail.snapshot;
            this.restoreState(snapshot.state);
        });

        // 监听历史状态变化事件
        this.historyManager.addEventListener('history-state-changed', (e) => {
            this.updateUndoRedoButtons(e.detail.canUndo, e.detail.canRedo);
        });

        // 撤销/重做按钮点击
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        const historyPanelBtn = document.getElementById('history-panel-btn');

        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.handleUndo();
            });
        }

        if (redoBtn) {
            redoBtn.addEventListener('click', () => {
                this.handleRedo();
            });
        }

        if (historyPanelBtn) {
            historyPanelBtn.addEventListener('click', () => {
                this.openHistoryPanel();
            });
        }

        // 键盘快捷键
        this.setupKeyboardShortcuts();
    }

    /**
     * 设置裁剪/旋转系统事件监听器
     */
    setupCropRotateListeners() {
        // 裁剪按钮
        const cropBtn = document.getElementById('crop-btn');
        if (cropBtn) {
            cropBtn.addEventListener('click', () => {
                this.handleCropClick();
            });
        }

        // 旋转按钮
        const rotateLeftBtn = document.getElementById('rotate-left-btn');
        const rotateRightBtn = document.getElementById('rotate-right-btn');

        if (rotateLeftBtn) {
            rotateLeftBtn.addEventListener('click', () => {
                this.cropRotateManager.rotateImage(-90);
                // 立即确认变换
                this.cropRotateManager.confirmTransformations();
            });
        }

        if (rotateRightBtn) {
            rotateRightBtn.addEventListener('click', () => {
                this.cropRotateManager.rotateImage(90);
                // 立即确认变换
                this.cropRotateManager.confirmTransformations();
            });
        }

        // 翻转按钮
        const flipHorizontalBtn = document.getElementById('flip-horizontal-btn');
        const flipVerticalBtn = document.getElementById('flip-vertical-btn');

        if (flipHorizontalBtn) {
            flipHorizontalBtn.addEventListener('click', () => {
                this.cropRotateManager.flipImage('horizontal');
                // 立即确认变换
                this.cropRotateManager.confirmTransformations();
            });
        }

        if (flipVerticalBtn) {
            flipVerticalBtn.addEventListener('click', () => {
                this.cropRotateManager.flipImage('vertical');
                // 立即确认变换
                this.cropRotateManager.confirmTransformations();
            });
        }

        // 还原按钮
        const resetTransformBtn = document.getElementById('reset-transform-btn');
        if (resetTransformBtn) {
            resetTransformBtn.addEventListener('click', () => {
                this.cropRotateManager.resetTransform();
                this.scheduleRefresh();
            });
        }

        // 裁剪比例按钮
        const cropFree = document.getElementById('crop-free');
        const crop11 = document.getElementById('crop-1-1');
        const crop43 = document.getElementById('crop-4-3');
        const crop169 = document.getElementById('crop-16-9');
        const crop32 = document.getElementById('crop-3-2');

        const cropRatioButtons = [cropFree, crop11, crop43, crop169, crop32];

        cropRatioButtons.forEach((btn) => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    // 移除所有按钮的 active 类
                    cropRatioButtons.forEach((b) => b?.classList.remove('active'));

                    // 添加当前按钮的 active 类
                    e.target.classList.add('active');

                    // 设置裁剪比例
                    const ratio = e.target.dataset.ratio ? parseFloat(e.target.dataset.ratio) : null;
                    this.cropRotateManager.setAspectRatio(ratio);
                });
            }
        });

        // 裁剪工具栏按钮
        const cropApply = document.getElementById('crop-apply');
        const cropCancel = document.getElementById('crop-cancel');

        if (cropApply) {
            cropApply.addEventListener('click', () => {
                this.applyCrop();
            });
        }

        if (cropCancel) {
            cropCancel.addEventListener('click', () => {
                this.cancelCrop();
            });
        }

        // 监听裁剪应用和变换事件
        document.addEventListener('crop-applied', () => {
            this.saveHistorySnapshot('crop', '应用裁剪');
            this.scheduleRefresh();
        });

        document.addEventListener('transformation-applied', () => {
            this.scheduleRefresh();
        });

        document.addEventListener('transformation-confirmed', () => {
            this.saveHistorySnapshot('rotate-flip', '应用旋转/翻转');
            this.scheduleRefresh();
        });

        // 画布交互（裁剪模式）
        this.setupCropCanvasInteraction();
    }

    /**
     * 处理裁剪按钮点击
     */
    handleCropClick() {
        if (this.cropRotateManager.isCropMode) {
            // 已在裁剪模式，退出
            this.cropRotateManager.exitCropMode();
        } else {
            // 进入裁剪模式
            const success = this.cropRotateManager.enterCropMode();
            if (!success) {
                Dialog.alert(
                    this.languageManager.get('pleaseUploadImage') || '请先上传图片',
                    this.languageManager.get('tip') || '提示'
                );
            }
        }
    }

    /**
     * 应用裁剪
     */
    applyCrop() {
        const success = this.cropRotateManager.applyCrop();
        if (success) {
            // 裁剪成功，自动触发 crop-applied 事件
        }
    }

    /**
     * 取消裁剪
     */
    cancelCrop() {
        this.cropRotateManager.exitCropMode();
        this.scheduleRefresh();
    }

    /**
     * 设置裁剪画布交互
     */
    setupCropCanvasInteraction() {
        const canvas = this.imageProcessor.getCanvas();
        const canvasContainer = document.getElementById('drop-zone');

        // 禁用canvas的拖拽属性
        canvas.draggable = false;
        canvas.setAttribute('draggable', 'false');

        // 阻止canvas的默认拖拽行为
        canvas.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        }, { passive: false });

        // 阻止drag事件
        canvas.addEventListener('drag', (e) => {
            e.preventDefault();
            return false;
        }, { passive: false });

        // 阻止右键菜单
        canvas.addEventListener('contextmenu', (e) => {
            if (this.cropRotateManager.isCropMode) {
                e.preventDefault();
            }
        });

        // 鼠标按下
        canvas.addEventListener('mousedown', (e) => {
            console.log('Canvas mousedown事件触发, isCropMode:', this.cropRotateManager.isCropMode);
            if (!this.cropRotateManager.isCropMode) return;

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            const rect = canvas.getBoundingClientRect();
            // 获取显示坐标
            const displayX = e.clientX - rect.left;
            const displayY = e.clientY - rect.top;

            // 转换为canvas实际像素坐标
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = displayX * scaleX;
            const y = displayY * scaleY;

            console.log('鼠标位置 - 显示:', displayX, displayY, '实际:', x, y, '裁剪框:', this.cropRotateManager.cropBox);

            // 检查是否点击了调整手柄
            const handle = this.cropRotateManager.getHandleAtPoint(x, y);
            console.log('检测到手柄:', handle);
            if (handle) {
                this.cropRotateManager.isResizing = true;
                this.cropRotateManager.resizeHandle = handle;
                canvasContainer.classList.add('resizing');
                console.log('开始调整裁剪框大小，手柄:', handle);
            } else if (this.cropRotateManager.isPointInCropBox(x, y)) {
                // 点击在裁剪框内，开始拖动
                this.cropRotateManager.isDragging = true;
                this.cropRotateManager.dragStartX = x - this.cropRotateManager.cropBox.x;
                this.cropRotateManager.dragStartY = y - this.cropRotateManager.cropBox.y;
                canvasContainer.classList.add('dragging');
                console.log('开始拖动裁剪框');
            }

            return false;
        }, true);

        // 鼠标移动
        canvas.addEventListener('mousemove', (e) => {
            if (!this.cropRotateManager.isCropMode) return;

            e.preventDefault();
            e.stopPropagation();

            const rect = canvas.getBoundingClientRect();
            // 获取显示坐标
            const displayX = e.clientX - rect.left;
            const displayY = e.clientY - rect.top;

            // 转换为canvas实际像素坐标
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = displayX * scaleX;
            const y = displayY * scaleY;

            if (this.cropRotateManager.isDragging) {
                // 拖动裁剪框
                this.cropRotateManager.cropBox.x = x - this.cropRotateManager.dragStartX;
                this.cropRotateManager.cropBox.y = y - this.cropRotateManager.dragStartY;
                this.cropRotateManager.constrainCropBox();
                this.cropRotateManager.drawCropOverlay();
            } else if (this.cropRotateManager.isResizing) {
                // 调整裁剪框大小
                this.resizeCropBox(x, y);
            }

            return false;
        }, true);

        // 鼠标松开
        canvas.addEventListener('mouseup', (e) => {
            if (!this.cropRotateManager.isCropMode) return;

            e.preventDefault();
            e.stopPropagation();

            this.cropRotateManager.isDragging = false;
            this.cropRotateManager.isResizing = false;
            this.cropRotateManager.resizeHandle = null;
            canvasContainer.classList.remove('dragging', 'resizing');

            return false;
        }, true);

        // 鼠标离开画布
        canvas.addEventListener('mouseleave', () => {
            if (!this.cropRotateManager.isCropMode) return;

            this.cropRotateManager.isDragging = false;
            this.cropRotateManager.isResizing = false;
            this.cropRotateManager.resizeHandle = null;
            canvasContainer.classList.remove('dragging', 'resizing');
        });
    }

    /**
     * 调整裁剪框大小
     */
    resizeCropBox(mouseX, mouseY) {
        const cropBox = this.cropRotateManager.cropBox;
        const handle = this.cropRotateManager.resizeHandle;
        const aspectRatio = this.cropRotateManager.aspectRatio;

        const oldX = cropBox.x;
        const oldY = cropBox.y;
        const oldWidth = cropBox.width;
        const oldHeight = cropBox.height;

        // 根据不同的手柄调整裁剪框
        switch (handle) {
            case 'nw':
                cropBox.width = oldX + oldWidth - mouseX;
                cropBox.height = oldY + oldHeight - mouseY;
                cropBox.x = mouseX;
                cropBox.y = mouseY;
                break;
            case 'n':
                cropBox.height = oldY + oldHeight - mouseY;
                cropBox.y = mouseY;
                break;
            case 'ne':
                cropBox.width = mouseX - oldX;
                cropBox.height = oldY + oldHeight - mouseY;
                cropBox.y = mouseY;
                break;
            case 'e':
                cropBox.width = mouseX - oldX;
                break;
            case 'se':
                cropBox.width = mouseX - oldX;
                cropBox.height = mouseY - oldY;
                break;
            case 's':
                cropBox.height = mouseY - oldY;
                break;
            case 'sw':
                cropBox.width = oldX + oldWidth - mouseX;
                cropBox.height = mouseY - oldY;
                cropBox.x = mouseX;
                break;
            case 'w':
                cropBox.width = oldX + oldWidth - mouseX;
                cropBox.x = mouseX;
                break;
        }

        // 如果有固定比例，调整高度或宽度
        if (aspectRatio) {
            if (['e', 'w', 'ne', 'nw', 'se', 'sw'].includes(handle)) {
                cropBox.height = cropBox.width / aspectRatio;
                if (['nw', 'ne'].includes(handle)) {
                    cropBox.y = oldY + oldHeight - cropBox.height;
                }
            }
        }

        // 确保裁剪框在画布内
        this.cropRotateManager.constrainCropBox();

        // 重绘
        this.cropRotateManager.drawCropOverlay();
    }

    /**
     * 保存历史快照的辅助方法
     */
    saveHistorySnapshot(operation, label) {
        if (this.imageProcessor.getOriginalImage()) {
            const state = this.collectHistoryState();
            const canvas = this.imageProcessor.getCanvas();
            this.historyManager.saveSnapshot(state, operation, label, canvas);
        }
    }

    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 排除文本输入框
            if (
                document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA'
            ) {
                return;
            }

            // Ctrl+Z 或 Cmd+Z - 撤销
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.handleUndo();
            }

            // Ctrl+Shift+Z 或 Cmd+Shift+Z - 重做
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                this.handleRedo();
            }

            // Ctrl+Y 或 Cmd+Y - 重做（备选快捷键）
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                this.handleRedo();
            }
        });
    }

    /**
     * 处理撤销操作
     */
    handleUndo() {
        const previousSnapshot = this.historyManager.undo();
        if (previousSnapshot) {
            console.log('已撤销:', previousSnapshot.label);
        }
    }

    /**
     * 处理重做操作
     */
    handleRedo() {
        const nextSnapshot = this.historyManager.redo();
        if (nextSnapshot) {
            console.log('已重做:', nextSnapshot.label);
        }
    }

    /**
     * 更新撤销/重做按钮状态
     * @param {boolean} canUndo - 是否可以撤销
     * @param {boolean} canRedo - 是否可以重做
     */
    updateUndoRedoButtons(canUndo, canRedo) {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');

        if (undoBtn) undoBtn.disabled = !canUndo;
        if (redoBtn) redoBtn.disabled = !canRedo;
    }

    /**
     * 恢复状态到表单
     * @param {Object} state - 状态对象
     */
    restoreState(state) {
        // 复用现有的 fillFormWithMetadata 方法
        this.fillFormWithMetadata(state);

        // 恢复模糊度
        const blurSlider = document.getElementById('blur-slider');
        const blurValue = document.getElementById('blur-value');
        if (blurSlider && state.blurValue !== undefined) {
            blurSlider.value = state.blurValue;
            if (blurValue) blurValue.textContent = parseFloat(state.blurValue).toFixed(1);
        }

        // 恢复 Logo 设置
        if (state.logoId) {
            this.logoManager.setCurrentLogo(state.logoId);
            // 应用 Logo 设置
            if (state.logoSettings) {
                const logoPosition = document.getElementById('logo-position');
                const logoSize = document.getElementById('logo-size');
                const logoOpacity = document.getElementById('logo-opacity');
                const logoTiled = document.getElementById('logo-tiled');

                if (logoPosition) logoPosition.value = state.logoSettings.position || 'bottom-right';
                if (logoSize) logoSize.value = state.logoSettings.size || 10;
                if (logoOpacity) logoOpacity.value = state.logoSettings.opacity || 100;
                if (logoTiled) logoTiled.checked = state.logoSettings.tiled || false;
            }
        } else {
            this.logoManager.clearCurrentLogo();
        }

        // 触发画布刷新
        this.scheduleRefresh();
    }

    /**
     * 收集完整状态（用于历史记录）
     * @returns {Object} 包含所有可序列化状态的对象
     */
    collectHistoryState() {
        // 获取表单数据
        const formData = this.collectFormData();

        // 获取额外状态
        const blurValue = document.getElementById('blur-slider')?.value || 0;

        // 获取 Logo 状态
        const currentLogo = this.logoManager.getCurrentLogo();
        const logoId = currentLogo ? currentLogo.id : null;
        const logoSettings = logoId
            ? {
                position: document.getElementById('logo-position')?.value || 'bottom-right',
                size: parseFloat(document.getElementById('logo-size')?.value || 10),
                opacity: parseFloat(document.getElementById('logo-opacity')?.value || 100),
                tiled: document.getElementById('logo-tiled')?.checked || false,
            }
            : null;

        // 获取图片状态（不存储图片本身）
        const hasImage = !!this.imageProcessor.getOriginalImage();

        return {
            ...formData,
            blurValue,
            logoId,
            logoSettings,
            hasImage,
        };
    }

    /**
     * 打开历史记录面板
     */
    openHistoryPanel() {
        const overlay = document.getElementById('history-panel-overlay');
        const historyList = document.getElementById('history-list');

        if (!overlay || !historyList) return;

        // 获取所有历史记录
        const snapshots = this.historyManager.getAllSnapshots();

        // 渲染历史列表
        if (snapshots.length === 0) {
            historyList.innerHTML = `
                <div class="history-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <p>${this.languageManager.get('noHistory') || '暂无历史记录'}</p>
                </div>
            `;
        } else {
            historyList.innerHTML = snapshots
                .map((snapshot, index) => {
                    const isCurrent = index === 0; // 最新的是当前状态
                    const previousSnapshot = snapshots[index + 1]; // 获取前一个状态用于比较
                    const detailsHtml = this.generateChangeDetails(previousSnapshot?.state, snapshot.state);

                    return `
                        <div class="history-item ${isCurrent ? 'current' : ''}" data-snapshot-id="${snapshot.id}">
                            ${snapshot.thumbnail ? `<img src="${snapshot.thumbnail}" alt="Snapshot" class="history-thumbnail">` : '<div class="history-thumbnail" style="background: #f0f0f0;"></div>'}
                            <div class="history-info">
                                <p class="history-label">${snapshot.label}</p>
                                <p class="history-time">${this.formatTimestamp(snapshot.timestamp)}</p>
                                <span class="history-operation">${this.getOperationLabel(snapshot.operation)}</span>
                                ${detailsHtml}
                            </div>
                        </div>
                    `;
                })
                .join('');

            // 绑定点击事件
            historyList.querySelectorAll('.history-item').forEach((item) => {
                item.addEventListener('click', () => {
                    const snapshotId = item.dataset.snapshotId;
                    this.historyManager.jumpToSnapshot(snapshotId);
                    overlay.style.display = 'none';
                });
            });
        }

        // 显示面板
        overlay.style.display = 'flex';

        // 绑定清空历史按钮
        const clearBtn = document.getElementById('clear-history-btn');
        if (clearBtn) {
            clearBtn.onclick = () => {
                this.confirmClearHistory().then((confirmed) => {
                    if (confirmed) {
                        this.historyManager.clear();
                        this.openHistoryPanel(); // 重新渲染
                    }
                });
            };
        }

        // 点击背景关闭
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
            }
        };
    }

    /**
     * 格式化时间戳
     * @param {number} timestamp - 时间戳
     * @returns {string} 格式化的时间字符串
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / 60000);

        if (diffMinutes < 1) return this.languageManager.get('justNow') || '刚刚';
        if (diffMinutes < 60) return `${diffMinutes} ${this.languageManager.get('minutesAgo') || '分钟前'}`;
        if (diffMinutes < 1440)
            return `${Math.floor(diffMinutes / 60)} ${this.languageManager.get('hoursAgo') || '小时前'}`;

        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    /**
     * 获取操作标签
     * @param {string} operation - 操作类型
     * @returns {string} 操作标签
     */
    getOperationLabel(operation) {
        const labels = {
            'image-upload': this.languageManager.get('operationImageUpload') || '上传图片',
            'metadata-change': this.languageManager.get('operationMetadataChange') || '修改设置',
            'text-style-change': this.languageManager.get('operationTextStyleChange') || '文字样式',
            'blur-change': this.languageManager.get('operationBlurChange') || '模糊效果',
            'logo-change': this.languageManager.get('operationLogoChange') || 'Logo 设置',
            'template-applied': this.languageManager.get('operationTemplateApplied') || '应用模板',
            'batch-setting-change': this.languageManager.get('operationBatchSettingChange') || '批量设置',
        };
        return labels[operation] || operation;
    }

    /**
     * 确认清空历史
     * @returns {Promise<boolean>} 用户确认结果
     */
    async confirmClearHistory() {
        return await Dialog.confirm(
            this.languageManager.get('confirmClearHistory') ||
                '确定清空所有历史记录吗？此操作无法撤销。'
        );
    }

    /**
     * 生成变更详情的 HTML
     * @param {Object} oldState - 旧状态
     * @param {Object} newState - 新状态
     * @returns {string} 详情 HTML
     */
    generateChangeDetails(oldState, newState) {
        if (!oldState || !newState) return '';

        const changes = [];
        const fieldLabels = {
            camera: this.languageManager.get('camera') || '相机',
            lens: this.languageManager.get('lens') || '镜头',
            location: this.languageManager.get('location') || '位置',
            iso: 'ISO',
            aperture: this.languageManager.get('aperture') || '光圈',
            shutter: this.languageManager.get('shutter') || '快门',
            copyright: this.languageManager.get('copyright') || '版权',
            notes: this.languageManager.get('notes') || '注释',
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
                let changeHtml = '';

                // 特殊处理某些字段
                if (key === 'textShadow' || key === 'bgMask') {
                    const oldValue = oldState[key] ? '启用' : '禁用';
                    const newValue = newState[key] ? '启用' : '禁用';
                    changeHtml = `
                        <div class="history-details-item">
                            <span class="history-details-label">${label}:</span>
                            <span class="history-details-value">${oldValue}</span>
                            <span class="history-details-arrow">→</span>
                            <span class="history-details-value">${newValue}</span>
                        </div>
                    `;
                } else if (key === 'logoId') {
                    if (!oldState[key] && newState[key]) {
                        changeHtml = '<div class="history-details-item"><span class="history-details-label">添加 Logo</span></div>';
                    } else if (oldState[key] && !newState[key]) {
                        changeHtml = '<div class="history-details-item"><span class="history-details-label">移除 Logo</span></div>';
                    } else if (oldState[key] !== newState[key]) {
                        changeHtml = '<div class="history-details-item"><span class="history-details-label">更换 Logo</span></div>';
                    }
                } else {
                    // 截断过长的值
                    const oldValue = String(oldState[key] || '').substring(0, 30);
                    const newValue = String(newState[key] || '').substring(0, 30);
                    if (oldValue || newValue) {
                        changeHtml = `
                            <div class="history-details-item">
                                <span class="history-details-label">${label}:</span>
                                <span class="history-details-value">${oldValue || '空'}</span>
                                <span class="history-details-arrow">→</span>
                                <span class="history-details-value">${newValue || '空'}</span>
                            </div>
                        `;
                    }
                }

                if (changeHtml) {
                    changes.push(changeHtml);
                }

                // 最多显示5个变更
                if (changes.length >= 5) break;
            }
        }

        if (changes.length === 0) {
            return '';
        }

        return `<div class="history-details">${changes.join('')}</div>`;
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

        // 应用高级文字样式设置
        if (settings.fontColor) {
            const colorInput = document.getElementById('font-color');
            if (colorInput) colorInput.value = settings.fontColor;
        }
        if (settings.fontOpacity !== undefined) {
            const opacityInput = document.getElementById('font-opacity');
            const opacityValue = document.getElementById('font-opacity-value');
            if (opacityInput) opacityInput.value = settings.fontOpacity;
            if (opacityValue) opacityValue.textContent = settings.fontOpacity;
        }
        if (settings.strokeColor) {
            const strokeColorInput = document.getElementById('stroke-color');
            if (strokeColorInput) strokeColorInput.value = settings.strokeColor;
        }
        if (settings.strokeWidth !== undefined) {
            const strokeWidthInput = document.getElementById('stroke-width');
            const strokeWidthValue = document.getElementById('stroke-width-value');
            if (strokeWidthInput) strokeWidthInput.value = settings.strokeWidth;
            if (strokeWidthValue) strokeWidthValue.textContent = settings.strokeWidth;
        }
        if (settings.textShadow !== undefined) {
            const textShadowInput = document.getElementById('text-shadow');
            if (textShadowInput) textShadowInput.checked = settings.textShadow;
        }
        if (settings.bgMask !== undefined) {
            const bgMaskInput = document.getElementById('bg-mask');
            if (bgMaskInput) bgMaskInput.checked = settings.bgMask;
        }
        if (settings.bgMaskOpacity !== undefined) {
            const bgMaskOpacityInput = document.getElementById('bg-mask-opacity');
            const bgMaskOpacityValue = document.getElementById('bg-mask-opacity-value');
            if (bgMaskOpacityInput) bgMaskOpacityInput.value = settings.bgMaskOpacity;
            if (bgMaskOpacityValue) bgMaskOpacityValue.textContent = settings.bgMaskOpacity;
        }
        if (settings.textRotation !== undefined) {
            const textRotationInput = document.getElementById('text-rotation');
            const textRotationValue = document.getElementById('text-rotation-value');
            if (textRotationInput) textRotationInput.value = settings.textRotation;
            if (textRotationValue) textRotationValue.textContent = settings.textRotation;
        }
        if (settings.letterSpacing !== undefined) {
            const letterSpacingInput = document.getElementById('letter-spacing');
            const letterSpacingValue = document.getElementById('letter-spacing-value');
            if (letterSpacingInput) letterSpacingInput.value = settings.letterSpacing;
            if (letterSpacingValue) letterSpacingValue.textContent = settings.letterSpacing;
        }
        if (settings.lineHeight !== undefined) {
            const lineHeightInput = document.getElementById('line-height');
            const lineHeightValue = document.getElementById('line-height-value');
            if (lineHeightInput) lineHeightInput.value = settings.lineHeight;
            if (lineHeightValue) lineHeightValue.textContent = parseFloat(settings.lineHeight).toFixed(1);
        }

        // 刷新画布
        this.scheduleRefresh();

        // 应用完成后保存快照
        const state = this.collectHistoryState();
        const canvas = this.imageProcessor.getCanvas();
        this.historyManager.saveSnapshot(state, 'template-applied', '应用模板', canvas);

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
        this.imageProcessor.pristineOriginalImage = imageItem.originalImage;

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

        // 填充高级文字样式设置
        if (metadata.fontColor !== undefined) {
            const colorInput = document.getElementById('font-color');
            if (colorInput) colorInput.value = metadata.fontColor || '#FFFFFF';
        }
        if (metadata.fontOpacity !== undefined) {
            const opacityInput = document.getElementById('font-opacity');
            const opacityValue = document.getElementById('font-opacity-value');
            if (opacityInput) opacityInput.value = metadata.fontOpacity || '100';
            if (opacityValue) opacityValue.textContent = metadata.fontOpacity || '100';
        }
        if (metadata.strokeColor !== undefined) {
            const strokeColorInput = document.getElementById('stroke-color');
            if (strokeColorInput) strokeColorInput.value = metadata.strokeColor || '#000000';
        }
        if (metadata.strokeWidth !== undefined) {
            const strokeWidthInput = document.getElementById('stroke-width');
            const strokeWidthValue = document.getElementById('stroke-width-value');
            if (strokeWidthInput) strokeWidthInput.value = metadata.strokeWidth || '0';
            if (strokeWidthValue) strokeWidthValue.textContent = metadata.strokeWidth || '0';
        }
        if (metadata.textShadow !== undefined) {
            const textShadowInput = document.getElementById('text-shadow');
            if (textShadowInput) textShadowInput.checked = metadata.textShadow ?? true;
        }
        if (metadata.bgMask !== undefined) {
            const bgMaskInput = document.getElementById('bg-mask');
            if (bgMaskInput) bgMaskInput.checked = metadata.bgMask ?? false;
        }
        if (metadata.bgMaskOpacity !== undefined) {
            const bgMaskOpacityInput = document.getElementById('bg-mask-opacity');
            const bgMaskOpacityValue = document.getElementById('bg-mask-opacity-value');
            if (bgMaskOpacityInput) bgMaskOpacityInput.value = metadata.bgMaskOpacity || '50';
            if (bgMaskOpacityValue) bgMaskOpacityValue.textContent = metadata.bgMaskOpacity || '50';
        }
        if (metadata.textRotation !== undefined) {
            const textRotationInput = document.getElementById('text-rotation');
            const textRotationValue = document.getElementById('text-rotation-value');
            if (textRotationInput) textRotationInput.value = metadata.textRotation || '0';
            if (textRotationValue) textRotationValue.textContent = metadata.textRotation || '0';
        }
        if (metadata.letterSpacing !== undefined) {
            const letterSpacingInput = document.getElementById('letter-spacing');
            const letterSpacingValue = document.getElementById('letter-spacing-value');
            if (letterSpacingInput) letterSpacingInput.value = metadata.letterSpacing || '0';
            if (letterSpacingValue) letterSpacingValue.textContent = metadata.letterSpacing || '0';
        }
        if (metadata.lineHeight !== undefined) {
            const lineHeightInput = document.getElementById('line-height');
            const lineHeightValue = document.getElementById('line-height-value');
            if (lineHeightInput) lineHeightInput.value = metadata.lineHeight || '1.8';
            if (lineHeightValue) lineHeightValue.textContent = metadata.lineHeight || '1.8';
        }
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

            // 高级文字样式参数
            fontColor: document.getElementById('font-color')?.value || '#FFFFFF',
            fontOpacity: document.getElementById('font-opacity')?.value || '100',
            strokeColor: document.getElementById('stroke-color')?.value || '#000000',
            strokeWidth: document.getElementById('stroke-width')?.value || '0',
            textShadow: document.getElementById('text-shadow')?.checked ?? true,
            bgMask: document.getElementById('bg-mask')?.checked ?? false,
            bgMaskOpacity: document.getElementById('bg-mask-opacity')?.value || '50',
            textRotation: document.getElementById('text-rotation')?.value || '0',
            letterSpacing: document.getElementById('letter-spacing')?.value || '0',
            lineHeight: document.getElementById('line-height')?.value || '1.8',
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
                    this.imageProcessor.pristineOriginalImage = firstImage.originalImage;

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

        // 上传成功后保存快照
        if (this.imageProcessor.getOriginalImage()) {
            const state = this.collectHistoryState();
            const canvas = this.imageProcessor.getCanvas();
            this.historyManager.saveSnapshot(state, 'image-upload', `上传图片: ${file.name}`, canvas);
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

            // 防抖保存快照（用户停止操作 500ms 后）
            if (this.imageProcessor.getOriginalImage()) {
                const state = this.collectHistoryState();
                const canvas = this.imageProcessor.getCanvas();

                // 使用详细的变更描述
                this.historyManager.debouncedSnapshot(
                    state,
                    'metadata-change',
                    '修改设置',
                    canvas,
                    (oldState, newState) => HistoryManager.getChangeDescription(oldState, newState, this.languageManager)
                );
            }
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
