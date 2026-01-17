/**
 * EXIF数据解析模块
 * 处理图片EXIF信息的读取和解析
 */
import { convertDMSToDD, formatExposureTime } from './utils.js';

/**
 * EXIF解析器类
 */
export class ExifParser {
    /**
     * 读取图片的EXIF数据
     * @param {File} file - 图片文件
     * @returns {Promise<Object>} EXIF数据对象
     */
    static readExifData(file) {
        return new Promise((resolve, reject) => {
            console.log('开始读取EXIF数据...');
            
            // 检查EXIF库是否可用
            if (typeof EXIF === 'undefined') {
                console.error('EXIF库未正确加载！');
                reject(new Error('EXIF库加载失败，请检查网络连接或刷新页面'));
                return;
            }
            
            EXIF.getData(file, function() {
                const exifData = this;
                console.log('EXIF数据对象:', exifData);
                
                // 调试：打印所有可用的EXIF标签
                console.log('所有EXIF标签:', Object.keys(exifData.exifdata || {}));
                
                // 提取常用EXIF信息
                const metadata = this.parseExifData(exifData);
                console.log('解析后的EXIF数据:', metadata);
                
                resolve(metadata);
            }.bind(this));
        });
    }

    /**
     * 解析EXIF数据
     * @param {Object} exifData - EXIF数据对象
     * @returns {Object} 解析后的元数据
     */
    static parseExifData(exifData) {
        // 提取相机和镜头信息
        const cameraModel = EXIF.getTag(exifData, 'Model') || EXIF.getTag(exifData, 'CameraModelName') || '';
        const lensModel = EXIF.getTag(exifData, 'LensModel') || EXIF.getTag(exifData, 'LensType') || EXIF.getTag(exifData, 'LensInfo') || '';
        
        // 提取GPS和地点信息
        const locationInfo = this.extractLocationInfo(exifData);
        
        // 提取其他EXIF信息
        const isoValue = EXIF.getTag(exifData, 'ISOSpeedRatings') || EXIF.getTag(exifData, 'ISO') || '';
        const apertureValue = EXIF.getTag(exifData, 'FNumber') || '';
        const shutterValue = EXIF.getTag(exifData, 'ExposureTime') || '';
        
        return {
            camera: cameraModel,
            lens: lensModel,
            location: locationInfo,
            iso: isoValue,
            aperture: apertureValue ? `f/${apertureValue}` : '',
            shutter: shutterValue ? formatExposureTime(shutterValue) : ''
        };
    }

    /**
     * 提取地点信息
     * @param {Object} exifData - EXIF数据对象
     * @returns {string} 地点信息字符串
     */
    static extractLocationInfo(exifData) {
        let locationInfo = '';
        
        // 1. 尝试提取GPS坐标
        const gpsInfo = this.extractGPSInfo(exifData);
        if (gpsInfo) {
            locationInfo = gpsInfo;
        }
        
        // 2. 尝试提取城市/地区信息
        const city = EXIF.getTag(exifData, 'City') || EXIF.getTag(exifData, 'Sub-location') || '';
        const state = EXIF.getTag(exifData, 'State') || EXIF.getTag(exifData, 'Province-State') || '';
        const country = EXIF.getTag(exifData, 'Country') || EXIF.getTag(exifData, 'Country-PrimaryLocationName') || '';
        
        if (city || state || country) {
            const locationParts = [city, state, country].filter(Boolean);
            if (locationParts.length > 0) {
                if (locationInfo) {
                    locationInfo += ' | ';
                }
                locationInfo += locationParts.join(', ');
            }
        }
        
        // 3. 如果没有任何地点信息，返回空字符串
        return locationInfo || '';
    }

    /**
     * 提取GPS坐标信息
     * @param {Object} exifData - EXIF数据对象
     * @returns {string} GPS坐标字符串
     */
    static extractGPSInfo(exifData) {
        try {
            const gpsLatitude = EXIF.getTag(exifData, 'GPSLatitude');
            const gpsLongitude = EXIF.getTag(exifData, 'GPSLongitude');
            const gpsLatitudeRef = EXIF.getTag(exifData, 'GPSLatitudeRef') || 'N';
            const gpsLongitudeRef = EXIF.getTag(exifData, 'GPSLongitudeRef') || 'E';
            
            if (gpsLatitude && gpsLongitude) {
                // 将度分秒格式转换为十进制
                const lat = convertDMSToDD(gpsLatitude, gpsLatitudeRef);
                const lng = convertDMSToDD(gpsLongitude, gpsLongitudeRef);
                
                if (lat !== null && lng !== null) {
                    return `${lat.toFixed(6)}°${gpsLatitudeRef}, ${lng.toFixed(6)}°${gpsLongitudeRef}`;
                }
            }
        } catch (error) {
            console.warn('GPS坐标提取失败:', error);
        }
        
        return '';
    }

    /**
     * 将EXIF数据填充到表单
     * @param {Object} metadata - EXIF元数据
     */
    static fillMetadataToForm(metadata) {
        // 填充相机和镜头信息
        document.getElementById('camera').value = metadata.camera || '';
        document.getElementById('lens').value = metadata.lens || '';
        document.getElementById('location').value = metadata.location || '';
        document.getElementById('iso').value = metadata.iso || '';
        document.getElementById('aperture').value = metadata.aperture || '';
        document.getElementById('shutter').value = metadata.shutter || '';
        
        // 清空其他字段
        document.getElementById('notes').value = '';
        document.getElementById('copyright').value = '';
    }
}