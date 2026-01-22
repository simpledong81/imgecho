/**
 * 裁剪和旋转管理器
 * 提供图片裁剪、旋转、翻转功能
 */
export class CropRotateManager {
    constructor(imageProcessor) {
        this.imageProcessor = imageProcessor;
        this.isCropMode = false;
        this.cropBox = null;
        this.isDragging = false;
        this.isResizing = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.resizeHandle = null;
        this.aspectRatio = null; // null = free crop, number = fixed ratio
        this.showGrid = true;

        // 旋转和翻转状态
        this.rotation = 0; // 当前旋转角度
        this.flipHorizontal = false;
        this.flipVertical = false;

        // 裁剪框最小尺寸
        this.minCropSize = 50;
    }

    /**
     * 进入裁剪模式
     */
    enterCropMode() {
        const originalImage = this.imageProcessor.getOriginalImage();
        if (!originalImage) {
            console.log('无原始图片，无法进入裁剪模式');
            return false;
        }

        console.log('进入裁剪模式');
        this.isCropMode = true;

        // 重新显示原始图片（确保是未变换的状态）
        this.imageProcessor.displayImageOnCanvas(originalImage);

        const canvas = this.imageProcessor.getCanvas();
        const dropZone = document.getElementById('drop-zone');
        const uploadHint = dropZone.querySelector('.upload-hint');

        // 禁用canvas的拖拽属性，防止浏览器把它当作可拖拽元素
        canvas.draggable = false;
        canvas.setAttribute('draggable', 'false');
        canvas.style.userSelect = 'none';
        canvas.style.webkitUserSelect = 'none';

        // 确保canvas可以接收鼠标事件
        canvas.style.pointerEvents = 'auto';
        canvas.style.zIndex = '10';

        // 禁用upload-hint的鼠标事件，确保不会阻挡canvas
        if (uploadHint) {
            uploadHint.style.pointerEvents = 'none';
            uploadHint.style.display = 'none'; // 直接隐藏
        }

        // 禁用drop-zone的点击上传功能，防止触发file input
        this.imageProcessor.disableDropZoneClick();

        // 初始化裁剪框为整个画布（留20%边距）
        const margin = Math.min(canvas.width, canvas.height) * 0.1;
        this.cropBox = {
            x: margin,
            y: margin,
            width: canvas.width - margin * 2,
            height: canvas.height - margin * 2
        };

        console.log('初始裁剪框:', this.cropBox);

        // 绘制裁剪框
        this.drawCropOverlay();

        // 显示裁剪工具栏
        this.showCropToolbar();

        return true;
    }

    /**
     * 退出裁剪模式
     */
    exitCropMode() {
        console.log('退出裁剪模式');
        this.isCropMode = false;
        this.cropBox = null;
        this.isDragging = false;
        this.isResizing = false;
        this.aspectRatio = null;

        const canvas = this.imageProcessor.getCanvas();
        const dropZone = document.getElementById('drop-zone');
        const uploadHint = dropZone.querySelector('.upload-hint');

        // 恢复canvas样式
        canvas.style.pointerEvents = '';
        canvas.style.zIndex = '';

        // 恢复upload-hint（如果没有图片才显示）
        if (uploadHint && !this.imageProcessor.getOriginalImage()) {
            uploadHint.style.pointerEvents = '';
            uploadHint.style.display = '';
        }

        // 重新启用drop-zone的点击上传功能
        this.imageProcessor.enableDropZoneClick();

        // 隐藏裁剪工具栏
        this.hideCropToolbar();

        // 重新绘制画布
        this.imageProcessor.displayImageOnCanvas(this.imageProcessor.getOriginalImage());
    }

    /**
     * 应用裁剪
     */
    applyCrop() {
        console.log('applyCrop被调用, cropBox:', this.cropBox, 'hasImage:', !!this.imageProcessor.getOriginalImage());
        if (!this.cropBox || !this.imageProcessor.getOriginalImage()) {
            console.log('无法应用裁剪：缺少裁剪框或原始图片');
            return false;
        }

        const canvas = this.imageProcessor.getCanvas();

        console.log('开始裁剪，裁剪框:', this.cropBox);

        // 创建临时画布来保存裁剪后的图片
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.cropBox.width;
        tempCanvas.height = this.cropBox.height;
        const tempCtx = tempCanvas.getContext('2d');

        // 将裁剪区域复制到临时画布
        tempCtx.drawImage(
            canvas,
            this.cropBox.x, this.cropBox.y, this.cropBox.width, this.cropBox.height,
            0, 0, this.cropBox.width, this.cropBox.height
        );

        console.log('临时画布创建完成，尺寸:', tempCanvas.width, 'x', tempCanvas.height);

        // 创建新的图片对象
        const croppedImage = new Image();
        croppedImage.onload = () => {
            console.log('裁剪后的图片加载完成');
            // 更新原始图片（直接赋值，不调用 setOriginalImage 以保护 pristineOriginalImage）
            this.imageProcessor.originalImage = croppedImage;

            // 退出裁剪模式
            this.exitCropMode();

            // 重新显示图片
            this.imageProcessor.displayImageOnCanvas(croppedImage);

            // 触发裁剪完成事件
            document.dispatchEvent(new CustomEvent('crop-applied'));
        };
        croppedImage.src = tempCanvas.toDataURL();

        return true;
    }

    /**
     * 设置裁剪比例
     * @param {number|null} ratio - 宽高比，null 表示自由裁剪
     */
    setAspectRatio(ratio) {
        this.aspectRatio = ratio;

        if (!this.cropBox) return;

        const canvas = this.imageProcessor.getCanvas();

        if (ratio) {
            // 根据新比例重新计算裁剪框（基于画布尺寸，留10%边距）
            const margin = Math.min(canvas.width, canvas.height) * 0.1;
            const maxWidth = canvas.width - margin * 2;
            const maxHeight = canvas.height - margin * 2;

            let newWidth, newHeight;

            // 根据比例和可用空间计算尺寸
            if (maxWidth / maxHeight > ratio) {
                // 高度受限
                newHeight = maxHeight;
                newWidth = newHeight * ratio;
            } else {
                // 宽度受限
                newWidth = maxWidth;
                newHeight = newWidth / ratio;
            }

            // 居中裁剪框
            this.cropBox = {
                x: (canvas.width - newWidth) / 2,
                y: (canvas.height - newHeight) / 2,
                width: newWidth,
                height: newHeight
            };
        } else {
            // 自由裁剪 - 重置为带边距的全画布
            const margin = Math.min(canvas.width, canvas.height) * 0.1;
            this.cropBox = {
                x: margin,
                y: margin,
                width: canvas.width - margin * 2,
                height: canvas.height - margin * 2
            };
        }

        // 确保裁剪框在画布内
        this.constrainCropBox();
        this.drawCropOverlay();
    }

    /**
     * 旋转图片
     * @param {number} degrees - 旋转角度（90, 180, 270 或自定义）
     */
    rotateImage(degrees) {
        if (!this.imageProcessor.getOriginalImage()) {
            return false;
        }

        this.rotation = (this.rotation + degrees) % 360;
        this.applyTransformations();
        return true;
    }

    /**
     * 设置自定义旋转角度
     * @param {number} angle - 角度值
     */
    setRotation(angle) {
        if (!this.imageProcessor.getOriginalImage()) {
            return false;
        }

        this.rotation = angle % 360;
        this.applyTransformations();
        return true;
    }

    /**
     * 翻转图片
     * @param {string} direction - 'horizontal' 或 'vertical'
     */
    flipImage(direction) {
        if (!this.imageProcessor.getOriginalImage()) {
            return false;
        }

        if (direction === 'horizontal') {
            this.flipHorizontal = !this.flipHorizontal;
        } else if (direction === 'vertical') {
            this.flipVertical = !this.flipVertical;
        }

        this.applyTransformations();
        return true;
    }

    /**
     * 还原所有变换（重置旋转和翻转到初始状态）
     */
    resetTransform() {
        const pristineImage = this.imageProcessor.getPristineOriginalImage();
        const currentImage = this.imageProcessor.getOriginalImage();
        console.log('resetTransform被调用');
        console.log('pristineImage:', pristineImage ? '存在' : '不存在', pristineImage);
        console.log('currentImage:', currentImage ? '存在' : '不存在', currentImage);
        console.log('pristineImage尺寸:', pristineImage?.naturalWidth, 'x', pristineImage?.naturalHeight);
        console.log('currentImage尺寸:', currentImage?.naturalWidth, 'x', currentImage?.naturalHeight);
        console.log('是否同一个对象:', pristineImage === currentImage);

        if (!pristineImage) {
            console.log('无原始图片，无法还原变换');
            return false;
        }

        console.log('还原所有变换到首次上传的原始图片');
        // 重置所有变换状态
        this.rotation = 0;
        this.flipHorizontal = false;
        this.flipVertical = false;

        // 恢复为首次上传的原始图片
        // 注意：不要调用setOriginalImage，因为它会重新设置pristineOriginalImage
        this.imageProcessor.originalImage = pristineImage;
        this.imageProcessor.displayImageOnCanvas(pristineImage);

        return true;
    }

    /**
     * 应用所有变换（旋转和翻转）
     */
    applyTransformations() {
        const originalImage = this.imageProcessor.getOriginalImage();
        if (!originalImage) return;

        const canvas = this.imageProcessor.getCanvas();
        const ctx = this.imageProcessor.getContext();

        // 计算旋转后的画布尺寸
        const radians = (this.rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));

        const newWidth = originalImage.width * cos + originalImage.height * sin;
        const newHeight = originalImage.width * sin + originalImage.height * cos;

        // 设置画布尺寸
        canvas.width = newWidth;
        canvas.height = newHeight;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 保存上下文状态
        ctx.save();

        // 移动到画布中心
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // 应用翻转
        const scaleX = this.flipHorizontal ? -1 : 1;
        const scaleY = this.flipVertical ? -1 : 1;
        ctx.scale(scaleX, scaleY);

        // 应用旋转
        ctx.rotate(radians);

        // 绘制图片（从中心点绘制）
        ctx.drawImage(
            originalImage,
            -originalImage.width / 2,
            -originalImage.height / 2,
            originalImage.width,
            originalImage.height
        );

        // 恢复上下文状态
        ctx.restore();

        // 触发变换应用事件
        document.dispatchEvent(new CustomEvent('transformation-applied'));
    }

    /**
     * 确认应用变换（将变换后的图片设为新的原始图片）
     */
    confirmTransformations() {
        const canvas = this.imageProcessor.getCanvas();

        // 创建新的图片对象
        const transformedImage = new Image();
        transformedImage.onload = () => {
            // 重置变换状态
            this.rotation = 0;
            this.flipHorizontal = false;
            this.flipVertical = false;

            // 更新原始图片（直接赋值，不调用 setOriginalImage 以保护 pristineOriginalImage）
            this.imageProcessor.originalImage = transformedImage;

            // 重新显示图片
            this.imageProcessor.displayImageOnCanvas(transformedImage);

            // 触发确认事件
            document.dispatchEvent(new CustomEvent('transformation-confirmed'));
        };
        transformedImage.src = canvas.toDataURL();
    }

    /**
     * 取消变换
     */
    cancelTransformations() {
        this.rotation = 0;
        this.flipHorizontal = false;
        this.flipVertical = false;

        // 重新显示原始图片
        const originalImage = this.imageProcessor.getOriginalImage();
        if (originalImage) {
            this.imageProcessor.displayImageOnCanvas(originalImage);
        }
    }

    /**
     * 绘制裁剪覆盖层
     */
    drawCropOverlay() {
        if (!this.cropBox) return;

        const canvas = this.imageProcessor.getCanvas();
        const ctx = this.imageProcessor.getContext();
        const originalImage = this.imageProcessor.getOriginalImage();

        if (!originalImage) return;

        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 重新绘制完整的原始图片
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

        // 保存当前状态
        ctx.save();

        // 绘制四个半透明黑色矩形来遮罩非裁剪区域
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

        // 上方遮罩
        if (this.cropBox.y > 0) {
            ctx.fillRect(0, 0, canvas.width, this.cropBox.y);
        }

        // 下方遮罩
        if (this.cropBox.y + this.cropBox.height < canvas.height) {
            ctx.fillRect(0, this.cropBox.y + this.cropBox.height, canvas.width, canvas.height - (this.cropBox.y + this.cropBox.height));
        }

        // 左侧遮罩
        if (this.cropBox.x > 0) {
            ctx.fillRect(0, this.cropBox.y, this.cropBox.x, this.cropBox.height);
        }

        // 右侧遮罩
        if (this.cropBox.x + this.cropBox.width < canvas.width) {
            ctx.fillRect(this.cropBox.x + this.cropBox.width, this.cropBox.y, canvas.width - (this.cropBox.x + this.cropBox.width), this.cropBox.height);
        }

        // 绘制裁剪框边框
        ctx.strokeStyle = '#4299e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.cropBox.x, this.cropBox.y, this.cropBox.width, this.cropBox.height);

        // 绘制九宫格网格
        if (this.showGrid) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1;

            // 垂直线
            for (let i = 1; i < 3; i++) {
                const x = this.cropBox.x + (this.cropBox.width / 3) * i;
                ctx.beginPath();
                ctx.moveTo(x, this.cropBox.y);
                ctx.lineTo(x, this.cropBox.y + this.cropBox.height);
                ctx.stroke();
            }

            // 水平线
            for (let i = 1; i < 3; i++) {
                const y = this.cropBox.y + (this.cropBox.height / 3) * i;
                ctx.beginPath();
                ctx.moveTo(this.cropBox.x, y);
                ctx.lineTo(this.cropBox.x + this.cropBox.width, y);
                ctx.stroke();
            }
        }

        // 绘制调整手柄
        this.drawResizeHandles(ctx);

        // 恢复状态
        ctx.restore();
    }

    /**
     * 绘制调整手柄
     */
    drawResizeHandles(ctx) {
        const handleSize = 10;
        const handles = this.getResizeHandles();

        ctx.fillStyle = '#4299e1';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        handles.forEach(handle => {
            ctx.fillRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
            ctx.strokeRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
        });
    }

    /**
     * 获取调整手柄位置
     */
    getResizeHandles() {
        if (!this.cropBox) return [];

        const { x, y, width, height } = this.cropBox;

        return [
            { name: 'nw', x: x, y: y },
            { name: 'n', x: x + width / 2, y: y },
            { name: 'ne', x: x + width, y: y },
            { name: 'e', x: x + width, y: y + height / 2 },
            { name: 'se', x: x + width, y: y + height },
            { name: 's', x: x + width / 2, y: y + height },
            { name: 'sw', x: x, y: y + height },
            { name: 'w', x: x, y: y + height / 2 }
        ];
    }

    /**
     * 检查点是否在裁剪框内
     */
    isPointInCropBox(x, y) {
        if (!this.cropBox) return false;

        return (
            x >= this.cropBox.x &&
            x <= this.cropBox.x + this.cropBox.width &&
            y >= this.cropBox.y &&
            y <= this.cropBox.y + this.cropBox.height
        );
    }

    /**
     * 获取点击的调整手柄
     */
    getHandleAtPoint(x, y) {
        const handles = this.getResizeHandles();
        const threshold = 10;

        for (const handle of handles) {
            const dx = x - handle.x;
            const dy = y - handle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= threshold) {
                return handle.name;
            }
        }

        return null;
    }

    /**
     * 限制裁剪框在画布内
     */
    constrainCropBox() {
        if (!this.cropBox) return;

        const canvas = this.imageProcessor.getCanvas();

        // 限制位置
        this.cropBox.x = Math.max(0, Math.min(this.cropBox.x, canvas.width - this.cropBox.width));
        this.cropBox.y = Math.max(0, Math.min(this.cropBox.y, canvas.height - this.cropBox.height));

        // 限制尺寸
        this.cropBox.width = Math.max(this.minCropSize, Math.min(this.cropBox.width, canvas.width - this.cropBox.x));
        this.cropBox.height = Math.max(this.minCropSize, Math.min(this.cropBox.height, canvas.height - this.cropBox.y));
    }

    /**
     * 显示裁剪工具栏
     */
    showCropToolbar() {
        const toolbar = document.getElementById('crop-toolbar');
        if (toolbar) {
            toolbar.style.display = 'flex';
        }
    }

    /**
     * 隐藏裁剪工具栏
     */
    hideCropToolbar() {
        const toolbar = document.getElementById('crop-toolbar');
        if (toolbar) {
            toolbar.style.display = 'none';
        }
    }

    /**
     * 获取当前状态
     */
    getState() {
        return {
            rotation: this.rotation,
            flipHorizontal: this.flipHorizontal,
            flipVertical: this.flipVertical,
            isCropMode: this.isCropMode,
            cropBox: this.cropBox ? { ...this.cropBox } : null
        };
    }
}
