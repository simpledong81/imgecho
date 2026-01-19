/**
 * EXIF 库加载器
 * 动态加载 exif-js 库并暴露到全局
 *
 * 注意：npm 包的 exif-js 存在已知 bug，因此使用 CDN 版本
 */

// 动态加载 EXIF 库
const loadExifLibrary = () => {
    return new Promise((resolve, reject) => {
        // 如果已经加载，直接返回
        if (typeof window !== 'undefined' && window.EXIF) {
            resolve(window.EXIF);
            return;
        }

        // 创建 script 标签加载 CDN 版本
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/exif-js@2.3.0/exif.min.js';
        script.async = true;

        script.onload = () => {
            if (window.EXIF) {
                console.log('EXIF 库加载成功');
                resolve(window.EXIF);
            } else {
                reject(new Error('EXIF 库加载失败'));
            }
        };

        script.onerror = () => {
            console.warn('CDN 加载失败，EXIF 功能将不可用');
            // 创建一个空的 EXIF 对象作为降级方案
            window.EXIF = {
                getData: (img, callback) => {
                    if (callback) callback.call({});
                },
                getTag: () => null,
                getAllTags: () => ({}),
                readFromBinaryFile: () => ({})
            };
            resolve(window.EXIF);
        };

        document.head.appendChild(script);
    });
};

// 立即开始加载
if (typeof window !== 'undefined') {
    loadExifLibrary();
}

export default loadExifLibrary;
