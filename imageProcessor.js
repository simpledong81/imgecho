/**
 * 图片处理模块
 * 处理图片上传、显示和渲染
 */

/**
 * 图片处理类
 */
export class ImageProcessor {
    constructor() {
        this.originalImage = null;
        this.currentImage = null;
        this.canvas = document.getElementById('image-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.needsRefresh = true;
        this.refreshTimeout = null;
    }

    /**
     * 初始化图片处理器
     */
    initialize() {
        this.setupDragAndDrop();
    }

    /**
     * 设置拖拽上传功能
     */
    setupDragAndDrop() {
        const dropZone = document.getElementById('drop-zone');
        
        // 拖拽进入事件
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        // 拖拽离开事件
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        // 拖拽释放事件
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            // 获取拖拽的文件
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        // 点击上传事件
        dropZone.addEventListener('click', () => {
            document.getElementById('file-input').click();
        });
    }

    /**
     * 处理文件上传
     * @param {File} file - 上传的文件
     */
    handleFileUpload(file) {
        console.log('开始处理文件上传:', file.name, file.type, file.size);
        
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件！');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            console.log('文件读取成功，开始加载图片');
            this.currentImage = event.target.result;
            const img = new Image();
            // 设置跨域属性，避免Canvas污染
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                console.log('图片加载成功，尺寸:', img.naturalWidth, 'x', img.naturalHeight);
                this.originalImage = img;
                this.displayImageOnCanvas(img);
                this.updateCanvasContainer(true);
                console.log('图片显示完成');
            };
            img.onerror = (error) => {
                console.error('图片加载失败:', error);
                alert('图片加载失败，请重试！');
            };
            img.src = this.currentImage;
        };
        reader.onerror = (error) => {
            console.error('文件读取失败:', error);
            alert('文件读取失败，请重试！');
        };
        reader.onloadstart = () => {
            console.log('开始读取文件...');
        };
        reader.readAsDataURL(file);
    }

    /**
     * 更新画布容器状态
     * @param {boolean} hasImage - 是否有图片
     */
    updateCanvasContainer(hasImage) {
        const canvasContainer = document.getElementById('drop-zone');
        if (hasImage) {
            canvasContainer.classList.add('has-image');
        } else {
            canvasContainer.classList.remove('has-image');
        }
    }

    /**
     * 在画布上显示图片
     * @param {Image} img - 要显示的图片对象
     */
    displayImageOnCanvas(img) {
        console.log('开始显示图片:', img);
        
        // 设置canvas尺寸为图片原始尺寸
        this.canvas.width = img.naturalWidth;
        this.canvas.height = img.naturalHeight;
        
        // 计算显示比例
        const maxDisplayWidth = this.canvas.parentElement.clientWidth - 40;
        const maxDisplayHeight = 500;
        const scale = Math.min(maxDisplayWidth / this.canvas.width, maxDisplayHeight / this.canvas.height, 1);
        
        // 设置canvas CSS显示尺寸
        this.canvas.style.width = `${this.canvas.width * scale}px`;
        this.canvas.style.height = `${this.canvas.height * scale}px`;
        
        try {
            // 清除画布
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 应用模糊效果
            const blurValue = parseFloat(document.getElementById('blur-slider').value);
            // 兼容Safari浏览器的模糊效果
            if (this.ctx.filter === undefined) {
                // 旧版浏览器不支持filter属性，使用CSS滤镜
                this.canvas.style.filter = `blur(${blurValue * 2}px)`;
            } else {
                this.ctx.filter = `blur(${blurValue * 2}px)`;
            }
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            
            // 重置所有滤镜和样式，确保文字清晰
            if (this.ctx.filter !== undefined) {
                this.ctx.filter = 'none';
            } else {
                this.canvas.style.filter = 'none';
            }
            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur = 0;
            this.ctx.save();
            
            console.log('图片显示成功');
        } catch (error) {
            console.error('图片绘制失败:', error);
            alert('图片绘制失败，请重试！');
        }
    }

    /**
     * 刷新调度函数 - 防抖处理
     * 优化性能，避免频繁刷新
     * @param {Function} callback - 刷新回调函数
     */
    scheduleRefresh(callback) {
        this.needsRefresh = true;
        
        // 清除之前的定时器
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
        }
        
        // 设置新的定时器，延迟50ms以优化性能
        this.refreshTimeout = setTimeout(() => {
            if (this.needsRefresh && this.originalImage) {
                callback();
                this.needsRefresh = false;
            }
        }, 50);
    }

    /**
     * 刷新画布内容
     * @param {Function} renderCallback - 渲染回调函数
     */
    refreshCanvas(renderCallback) {
        if (this.originalImage) {
            this.displayImageOnCanvas(this.originalImage);
            renderCallback();
        }
    }

    /**
     * 加载示例图片
     * @param {Function} callback - 加载完成回调
     */
    loadSampleImage(callback) {
        const sampleImage = new Image();
        sampleImage.crossOrigin = 'anonymous';
        sampleImage.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
        
        sampleImage.onload = () => {
            this.originalImage = sampleImage;
            this.displayImageOnCanvas(sampleImage);
            this.updateCanvasContainer(true);
            
            if (callback) {
                callback();
            }
        };
    }

    /**
     * 获取原始图片
     * @returns {Image|null} 原始图片对象
     */
    getOriginalImage() {
        return this.originalImage;
    }

    /**
     * 获取画布上下文
     * @returns {CanvasRenderingContext2D} 画布上下文
     */
    getContext() {
        return this.ctx;
    }

    /**
     * 获取画布对象
     * @returns {HTMLCanvasElement} 画布元素
     */
    getCanvas() {
        return this.canvas;
    }
}
