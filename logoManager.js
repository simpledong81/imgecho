/**
 * Logo/水印管理器
 * 管理 Logo 上传、存储、渲染
 */

/**
 * Logo 数据结构
 * @typedef {Object} Logo
 * @property {string} id - 唯一标识
 * @property {string} name - Logo 名称
 * @property {string} dataUrl - Logo 图片数据 URL
 * @property {number} width - 原始宽度
 * @property {number} height - 原始高度
 * @property {number} createdAt - 创建时间戳
 */

/**
 * LogoManager 类
 */
export class LogoManager extends EventTarget {
    constructor() {
        super();
        this.storageKey = 'imgecho_logos';
        this.logos = [];
        this.currentLogo = null;
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.loadLogos();
    }

    /**
     * 从 localStorage 加载 Logo 列表
     */
    loadLogos() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.logos = JSON.parse(stored);
            }
        } catch (error) {
            console.error('加载 Logo 失败:', error);
        }
    }

    /**
     * 保存 Logo 列表到 localStorage
     */
    saveLogos() {
        try {
            // 限制存储大小，最多保存 10 个 Logo
            const logosToSave = this.logos.slice(0, 10);
            localStorage.setItem(this.storageKey, JSON.stringify(logosToSave));
        } catch (error) {
            console.error('保存 Logo 失败:', error);
            // 如果存储失败（可能超过配额），尝试只保存最新的 5 个
            try {
                const reducedLogos = this.logos.slice(0, 5);
                localStorage.setItem(this.storageKey, JSON.stringify(reducedLogos));
            } catch (e) {
                console.error('保存 Logo 失败（即使减少数量）:', e);
            }
        }
    }

    /**
     * 获取所有 Logo
     * @returns {Logo[]}
     */
    getAllLogos() {
        return [...this.logos];
    }

    /**
     * 根据 ID 获取 Logo
     * @param {string} id - Logo ID
     * @returns {Logo|null}
     */
    getLogoById(id) {
        return this.logos.find((logo) => logo.id === id) || null;
    }

    /**
     * 上传 Logo
     * @param {File} file - 图片文件
     * @param {string} name - Logo 名称
     * @returns {Promise<Logo>}
     */
    async uploadLogo(file, name) {
        return new Promise((resolve, reject) => {
            // 验证文件类型
            if (!file.type.match(/^image\/(png|svg\+xml|jpeg|jpg|gif|webp)$/)) {
                reject(new Error('不支持的文件格式，请上传 PNG、SVG、JPG 或 GIF 图片'));
                return;
            }

            // 验证文件大小（最大 2MB）
            if (file.size > 2 * 1024 * 1024) {
                reject(new Error('文件过大，请上传小于 2MB 的图片'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    // 创建 Logo 对象
                    const logo = {
                        id: `logo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name: name || file.name,
                        dataUrl: e.target.result,
                        width: img.width,
                        height: img.height,
                        createdAt: Date.now(),
                    };

                    // 添加到列表开头
                    this.logos.unshift(logo);

                    // 保存到 localStorage
                    this.saveLogos();

                    // 触发事件
                    this.dispatchEvent(
                        new CustomEvent('logo-uploaded', {
                            detail: { logo },
                        })
                    );

                    resolve(logo);
                };

                img.onerror = () => {
                    reject(new Error('无法加载图片'));
                };

                img.src = e.target.result;
            };

            reader.onerror = () => {
                reject(new Error('无法读取文件'));
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * 删除 Logo
     * @param {string} id - Logo ID
     * @returns {boolean}
     */
    deleteLogo(id) {
        const index = this.logos.findIndex((logo) => logo.id === id);
        if (index === -1) {
            return false;
        }

        this.logos.splice(index, 1);
        this.saveLogos();

        // 如果删除的是当前 Logo，清除当前 Logo
        if (this.currentLogo && this.currentLogo.id === id) {
            this.currentLogo = null;
        }

        this.dispatchEvent(
            new CustomEvent('logo-deleted', {
                detail: { logoId: id },
            })
        );

        return true;
    }

    /**
     * 设置当前 Logo
     * @param {string} id - Logo ID
     * @returns {Logo|null}
     */
    setCurrentLogo(id) {
        if (!id) {
            this.currentLogo = null;
            this.dispatchEvent(new CustomEvent('logo-changed', { detail: { logo: null } }));
            return null;
        }

        const logo = this.getLogoById(id);
        if (logo) {
            this.currentLogo = logo;
            this.dispatchEvent(new CustomEvent('logo-changed', { detail: { logo } }));
        }
        return logo;
    }

    /**
     * 获取当前 Logo
     * @returns {Logo|null}
     */
    getCurrentLogo() {
        return this.currentLogo;
    }

    /**
     * 清除当前 Logo
     */
    clearCurrentLogo() {
        this.currentLogo = null;
        this.dispatchEvent(new CustomEvent('logo-changed', { detail: { logo: null } }));
    }

    /**
     * 渲染 Logo 到画布
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {HTMLCanvasElement} canvas - 画布元素
     * @param {Object} options - 渲染选项
     * @param {string} options.position - 位置 (top-left, top-right, bottom-left, bottom-right, center)
     * @param {number} options.size - 大小百分比 (相对于画布宽度)
     * @param {number} options.opacity - 透明度 (0-1)
     * @param {boolean} options.tiled - 是否平铺模式
     */
    renderLogo(ctx, canvas, options = {}) {
        if (!this.currentLogo) {
            return;
        }

        const {
            position = 'bottom-right',
            size = 10,
            opacity = 1,
            tiled = false,
        } = options;

        const img = new Image();
        img.src = this.currentLogo.dataUrl;

        // 如果图片还没加载，监听 load 事件
        if (!img.complete) {
            img.onload = () => {
                this.drawLogo(ctx, canvas, img, position, size, opacity, tiled);
            };
        } else {
            this.drawLogo(ctx, canvas, img, position, size, opacity, tiled);
        }
    }

    /**
     * 绘制 Logo
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {HTMLCanvasElement} canvas - 画布元素
     * @param {HTMLImageElement} img - Logo 图片
     * @param {string} position - 位置
     * @param {number} size - 大小百分比
     * @param {number} opacity - 透明度
     * @param {boolean} tiled - 是否平铺
     */
    drawLogo(ctx, canvas, img, position, size, opacity, tiled) {
        ctx.save();
        ctx.globalAlpha = opacity;

        if (tiled) {
            // 平铺模式
            this.drawTiledLogo(ctx, canvas, img, size, opacity);
        } else {
            // 单个 Logo 模式
            this.drawSingleLogo(ctx, canvas, img, position, size);
        }

        ctx.restore();
    }

    /**
     * 绘制单个 Logo
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {HTMLCanvasElement} canvas - 画布元素
     * @param {HTMLImageElement} img - Logo 图片
     * @param {string} position - 位置
     * @param {number} size - 大小百分比
     */
    drawSingleLogo(ctx, canvas, img, position, size) {
        // 计算 Logo 尺寸（基于画布宽度的百分比）
        const logoWidth = (canvas.width * size) / 100;
        const aspectRatio = img.height / img.width;
        const logoHeight = logoWidth * aspectRatio;

        // 边距
        const margin = Math.max(20, canvas.width * 0.02);

        // 计算位置
        let x, y;
        switch (position) {
            case 'top-left':
                x = margin;
                y = margin;
                break;
            case 'top-right':
                x = canvas.width - logoWidth - margin;
                y = margin;
                break;
            case 'bottom-left':
                x = margin;
                y = canvas.height - logoHeight - margin;
                break;
            case 'bottom-right':
                x = canvas.width - logoWidth - margin;
                y = canvas.height - logoHeight - margin;
                break;
            case 'center':
                x = (canvas.width - logoWidth) / 2;
                y = (canvas.height - logoHeight) / 2;
                break;
            default:
                x = canvas.width - logoWidth - margin;
                y = canvas.height - logoHeight - margin;
        }

        ctx.drawImage(img, x, y, logoWidth, logoHeight);
    }

    /**
     * 绘制平铺 Logo
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {HTMLCanvasElement} canvas - 画布元素
     * @param {HTMLImageElement} img - Logo 图片
     * @param {number} size - 大小百分比
     * @param {number} opacity - 透明度
     */
    drawTiledLogo(ctx, canvas, img, size, opacity) {
        // 计算单个 Logo 尺寸
        const logoWidth = (canvas.width * size) / 100;
        const aspectRatio = img.height / img.width;
        const logoHeight = logoWidth * aspectRatio;

        // 间距（Logo 之间的间隔）
        const spacingX = logoWidth * 1.5;
        const spacingY = logoHeight * 1.5;

        // 设置较低的透明度以避免过于显眼
        ctx.globalAlpha = Math.min(opacity * 0.3, 0.3);

        // 旋转 45 度
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(-Math.PI / 6); // -30 度
        ctx.translate(-centerX, -centerY);

        // 计算需要绘制的行列数
        const cols = Math.ceil(canvas.width / spacingX) + 2;
        const rows = Math.ceil(canvas.height / spacingY) + 2;

        // 平铺绘制
        for (let row = -1; row < rows; row++) {
            for (let col = -1; col < cols; col++) {
                const x = col * spacingX;
                const y = row * spacingY;
                ctx.drawImage(img, x, y, logoWidth, logoHeight);
            }
        }
    }
}
