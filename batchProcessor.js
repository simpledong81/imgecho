/**
 * 批量图片处理器
 * 管理图片队列和批量处理逻辑
 */
import { ExifParser } from './exifParser.js';
import { Dialog } from './dialog.js';

/**
 * 批量图片项数据结构
 * @typedef {Object} BatchImageItem
 * @property {string} id - 唯一标识
 * @property {File} file - 原始文件
 * @property {string} name - 文件名
 * @property {HTMLImageElement} originalImage - 图片对象
 * @property {string} thumbnail - 缩略图 Data URL
 * @property {Object} exifData - EXIF 元数据
 * @property {Object|null} userMetadata - 用户自定义元数据
 * @property {string} status - 状态：pending|processing|completed|error
 * @property {Blob|null} processedBlob - 处理后的图片
 * @property {string|null} error - 错误信息
 */

/**
 * BatchProcessor 类
 */
export class BatchProcessor extends EventTarget {
    constructor() {
        super();
        this.queue = [];
        this.currentIndex = -1;
        this.sharedSettings = null;
        this.isProcessing = false;
    }

    /**
     * 添加图片到队列
     * @param {FileList|File[]} files - 图片文件列表
     */
    async addImages(files) {
        const filesArray = Array.from(files);
        const imageFiles = filesArray.filter((file) => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            console.warn('没有有效的图片文件');
            return;
        }

        // 检查队列限制
        if (this.queue.length + imageFiles.length > 100) {
            const allowed = 100 - this.queue.length;
            if (allowed <= 0) {
                await Dialog.alert('队列已满（最多100张图片），请先导出或清空队列', '提示');
                return;
            }
            await Dialog.alert(`最多只能添加 ${allowed} 张图片（队列限制100张）`, '提示');
            imageFiles.splice(allowed);
        }

        // 并行处理所有图片
        const promises = imageFiles.map((file) => this.createBatchItem(file));
        const items = await Promise.allSettled(promises);

        items.forEach((result) => {
            if (result.status === 'fulfilled') {
                this.queue.push(result.value);
            } else {
                console.error('添加图片失败:', result.reason);
            }
        });

        // 如果是第一次添加，自动选中第一张
        if (this.currentIndex === -1 && this.queue.length > 0) {
            this.currentIndex = 0;
        }

        this.dispatchEvent(new CustomEvent('queue-updated', { detail: { queue: this.queue } }));
    }

    /**
     * 创建批量图片项
     * @param {File} file - 图片文件
     * @returns {Promise<BatchImageItem>}
     */
    async createBatchItem(file) {
        const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // 创建图片对象
        const originalImage = await this.loadImage(file);

        // 生成缩略图
        const thumbnail = await this.createThumbnail(originalImage);

        // 创建基础项（先不读取 EXIF，后台异步读取）
        const item = {
            id,
            file,
            name: file.name,
            originalImage,
            thumbnail,
            exifData: {},
            userMetadata: null,
            status: 'pending',
            processedBlob: null,
            error: null,
        };

        // 后台读取 EXIF（非阻塞）
        this.loadExifData(item);

        return item;
    }

    /**
     * 加载图片
     * @param {File} file - 图片文件
     * @returns {Promise<HTMLImageElement>}
     */
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('图片加载失败'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * 创建缩略图
     * @param {HTMLImageElement} image - 原始图片
     * @returns {Promise<string>} Data URL
     */
    async createThumbnail(image) {
        const maxSize = 120;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 计算缩略图尺寸
        let width = image.width;
        let height = image.height;

        if (width > height) {
            if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }
        }

        canvas.width = width;
        canvas.height = height;

        // 绘制缩略图
        ctx.drawImage(image, 0, 0, width, height);

        return canvas.toDataURL('image/jpeg', 0.8);
    }

    /**
     * 加载 EXIF 数据（异步，非阻塞）
     * @param {BatchImageItem} item - 批量图片项
     */
    async loadExifData(item) {
        try {
            const exifData = await ExifParser.readExifData(item.file);
            item.exifData = exifData;
            this.dispatchEvent(
                new CustomEvent('exif-loaded', { detail: { id: item.id, exifData } })
            );
        } catch (error) {
            console.error(`读取 EXIF 失败 (${item.name}):`, error);
            item.exifData = {};
        }
    }

    /**
     * 移除图片
     * @param {number} index - 队列索引
     */
    removeImage(index) {
        if (index < 0 || index >= this.queue.length) {
            return;
        }

        this.queue.splice(index, 1);

        // 调整当前索引
        if (this.currentIndex >= this.queue.length) {
            this.currentIndex = this.queue.length - 1;
        }

        this.dispatchEvent(new CustomEvent('queue-updated', { detail: { queue: this.queue } }));
    }

    /**
     * 清空队列
     */
    clearQueue() {
        this.queue = [];
        this.currentIndex = -1;
        this.sharedSettings = null;
        this.dispatchEvent(new CustomEvent('queue-updated', { detail: { queue: this.queue } }));
    }

    /**
     * 选择图片
     * @param {number} index - 队列索引
     */
    selectImage(index) {
        if (index < 0 || index >= this.queue.length) {
            return;
        }

        // 在切换前，先触发保存当前图片的事件
        if (this.currentIndex >= 0 && this.currentIndex < this.queue.length) {
            this.dispatchEvent(
                new CustomEvent('before-image-change', {
                    detail: { oldIndex: this.currentIndex },
                })
            );
        }

        this.currentIndex = index;
        const imageItem = this.queue[index];

        this.dispatchEvent(
            new CustomEvent('image-selected', {
                detail: { index, imageItem },
            })
        );
    }

    /**
     * 获取当前图片
     * @returns {BatchImageItem|null}
     */
    getCurrentImage() {
        if (this.currentIndex >= 0 && this.currentIndex < this.queue.length) {
            return this.queue[this.currentIndex];
        }
        return null;
    }

    /**
     * 保存当前图片的元数据
     * @param {Object} metadata - 元数据对象
     */
    saveCurrentImageMetadata(metadata) {
        const currentImage = this.getCurrentImage();
        if (currentImage) {
            currentImage.userMetadata = { ...metadata };
        }
    }

    /**
     * 还原图片到原始 EXIF 数据
     * @param {number} index - 队列索引
     */
    resetImageMetadata(index) {
        if (index < 0 || index >= this.queue.length) {
            return;
        }

        const item = this.queue[index];
        // 清除用户自定义元数据，恢复到原始 EXIF
        item.userMetadata = null;

        console.log(`已还原图片 ${item.name} 到原始 EXIF 数据`);

        // 如果是当前图片，触发重新加载
        if (this.currentIndex === index) {
            this.dispatchEvent(
                new CustomEvent('image-reset', {
                    detail: { index, imageItem: item },
                })
            );
        }

        this.dispatchEvent(new CustomEvent('queue-updated', { detail: { queue: this.queue } }));
    }

    /**
     * 保存共享设置
     * @param {Object} settings - 设置对象
     */
    saveSharedSettings(settings) {
        this.sharedSettings = { ...settings };
        console.log('共享设置已保存:', this.sharedSettings);
    }

    /**
     * 应用共享设置到所有图片
     */
    applySharedSettingsToAll() {
        if (!this.sharedSettings) {
            console.warn('没有共享设置可应用');
            return;
        }

        this.queue.forEach((item) => {
            item.userMetadata = null; // 清除个性化设置，使用共享设置
        });

        this.dispatchEvent(new CustomEvent('settings-applied', { detail: { queue: this.queue } }));
    }

    /**
     * 获取图片的元数据（个性化或共享）
     * @param {BatchImageItem} item - 图片项
     * @returns {Object} 元数据对象
     */
    getImageMetadata(item) {
        // 优先使用个性化设置，否则使用共享设置，最后使用 EXIF
        return item.userMetadata || this.sharedSettings || item.exifData || {};
    }

    /**
     * 获取队列
     * @returns {BatchImageItem[]}
     */
    getQueue() {
        return this.queue;
    }

    /**
     * 获取队列长度
     * @returns {number}
     */
    getQueueLength() {
        return this.queue.length;
    }

    /**
     * 设置处理状态
     * @param {boolean} isProcessing - 是否正在处理
     */
    setProcessing(isProcessing) {
        this.isProcessing = isProcessing;
    }

    /**
     * 是否正在处理
     * @returns {boolean}
     */
    getIsProcessing() {
        return this.isProcessing;
    }
}
