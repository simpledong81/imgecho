/**
 * EXIF数据解析模块
 * 处理图片EXIF信息的读取和解析
 * 使用 exifr 库支持 MakerNote 解析以获取完整镜头信息
 */
import { convertDMSToDD, formatExposureTime } from './utils.js';
import * as exifr from 'exifr';

/**
 * EXIF解析器类
 */
export class ExifParser {
    /**
     * 读取图片的EXIF数据
     * @param {File} file - 图片文件
     * @returns {Promise<Object>} EXIF数据对象
     */
    static async readExifData(file) {
        console.log('开始读取EXIF数据...');

        try {
            // 使用 exifr 读取完整的 EXIF 数据，包括 MakerNote
            const exifData = await exifr.parse(file, {
                // 启用所有 EXIF 段
                tiff: true,
                exif: true,
                gps: true,
                ifd1: true,
                // 启用 MakerNote 解析（用于获取完整镜头信息）
                makerNote: true,
                // 解析所有标签
                translateKeys: true,
                translateValues: true,
                reviveValues: true,
            });

            console.log('exifr原始数据:', exifData);

            if (exifData && Object.keys(exifData).length > 0) {
                // 提取常用EXIF信息
                const metadata = ExifParser.parseExifrData(exifData);
                console.log('解析后的EXIF数据:', metadata);
                return metadata;
            } else {
                console.log('未找到EXIF数据');
                return {};
            }
        } catch (error) {
            console.error('exifr解析失败:', error);
            // 降级到旧的 EXIF.js 方式
            return this.readExifDataFallback(file);
        }
    }

    /**
     * 降级方案：使用 EXIF.js 读取数据
     * @param {File} file - 图片文件
     * @returns {Promise<Object>} EXIF数据对象
     */
    static readExifDataFallback(file) {
        return new Promise((resolve, _reject) => {
            console.log('使用降级方案读取EXIF数据...');

            // 等待 EXIF 库加载完成
            const waitForExif = (callback, maxRetries = 10, interval = 100) => {
                let retries = 0;
                const check = () => {
                    if (typeof EXIF !== 'undefined') {
                        callback();
                    } else if (retries < maxRetries) {
                        retries++;
                        setTimeout(check, interval);
                    } else {
                        console.error('EXIF库加载超时');
                        resolve({});
                    }
                };
                check();
            };

            waitForExif(() => {
                // 使用 FileReader 读取为 ArrayBuffer（EXIF.js 需要二进制数据）
                const reader = new FileReader();

                reader.onload = (e) => {
                    try {
                        // 直接从二进制数据读取 EXIF
                        const arrayBuffer = e.target.result;
                        const exifData = EXIF.readFromBinaryFile(arrayBuffer);

                        console.log('EXIF原始数据:', exifData);

                        if (exifData && Object.keys(exifData).length > 0) {
                            // 提取常用EXIF信息
                            const metadata = ExifParser.parseExifDataFromRaw(exifData);
                            console.log('解析后的EXIF数据:', metadata);
                            resolve(metadata);
                        } else {
                            console.log('未找到EXIF数据，尝试使用图片方式读取');
                            // 如果二进制方式没有读取到数据，尝试使用图片方式
                            this.readExifFromImage(file).then(resolve);
                        }
                    } catch (error) {
                        console.error('EXIF解析失败:', error);
                        // 降级到图片方式
                        this.readExifFromImage(file).then(resolve);
                    }
                };

                reader.onerror = (error) => {
                    console.error('文件读取失败:', error);
                    resolve({});
                };

                reader.readAsArrayBuffer(file);
            });
        });
    }

    /**
     * 解析 exifr 返回的数据
     * @param {Object} exifData - exifr 返回的 EXIF 数据
     * @returns {Object} 解析后的元数据
     */
    static parseExifrData(exifData) {
        console.log('解析exifr数据，可用字段:', Object.keys(exifData));

        // 提取相机信息
        const cameraModel = exifData.Model || exifData.CameraModelName || '';

        // 提取镜头信息 - exifr 支持 MakerNote，可以获取完整镜头型号
        let lensModel = '';

        // 按优先级尝试获取镜头型号
        const lensFields = [
            'LensModel',           // 标准字段（最常用）
            'Lens',                // 某些相机使用
            'LensType',            // Nikon MakerNote
            'LensID',              // Canon MakerNote
            'LensInfo',            // 镜头信息
            'LensSpecification',   // 镜头规格
        ];

        for (const field of lensFields) {
            if (exifData[field]) {
                const value = exifData[field];
                console.log(`找到镜头字段 ${field}:`, value);

                if (typeof value === 'string' && value.length > 0) {
                    // 过滤掉纯数字（可能是序列号）
                    if (!/^\d+$/.test(value)) {
                        lensModel = value;
                        break;
                    }
                } else if (Array.isArray(value)) {
                    // LensSpecification 通常是数组 [minFocal, maxFocal, minAperture, maxAperture]
                    const [minFocal, maxFocal, minAperture, maxAperture] = value;
                    if (minFocal && maxFocal) {
                        lensModel = minFocal === maxFocal ? `${minFocal}mm` : `${minFocal}-${maxFocal}mm`;
                        if (minAperture && maxAperture) {
                            lensModel += minAperture === maxAperture
                                ? ` f/${minAperture}`
                                : ` f/${minAperture}-${maxAperture}`;
                        }
                        break;
                    }
                }
            }
        }

        // 提取焦距
        const focalLength = exifData.FocalLength || exifData.FocalLengthIn35mmFormat || '';

        // 如果没有镜头型号，用焦距代替
        if (!lensModel && focalLength) {
            lensModel = `${focalLength}mm`;
        }

        // 提取 ISO
        let isoValue = exifData.ISO || exifData.ISOSpeedRatings || '';
        if (Array.isArray(isoValue)) {
            isoValue = isoValue[0];
        }

        // 提取光圈
        const apertureValue = exifData.FNumber || exifData.ApertureValue || '';

        // 提取快门速度
        const shutterValue = exifData.ExposureTime || exifData.ShutterSpeedValue || '';

        // 提取 GPS 和地点信息
        const locationInfo = this.extractLocationFromExifr(exifData);

        return {
            camera: cameraModel,
            lens: lensModel,
            location: locationInfo,
            iso: isoValue ? String(isoValue) : '',
            aperture: apertureValue ? `f/${apertureValue}` : '',
            shutter: shutterValue ? formatExposureTime(shutterValue) : '',
            focalLength: focalLength ? `${focalLength}mm` : ''
        };
    }

    /**
     * 从 exifr 数据提取地点信息
     * @param {Object} exifData - exifr 返回的数据
     * @returns {string} 地点信息字符串
     */
    static extractLocationFromExifr(exifData) {
        let locationInfo = '';

        try {
            // exifr 已经将 GPS 坐标转换为十进制
            const lat = exifData.latitude;
            const lng = exifData.longitude;

            if (lat !== undefined && lng !== undefined) {
                const latRef = lat >= 0 ? 'N' : 'S';
                const lngRef = lng >= 0 ? 'E' : 'W';
                locationInfo = `${Math.abs(lat).toFixed(6)}°${latRef}, ${Math.abs(lng).toFixed(6)}°${lngRef}`;
            }
        } catch (error) {
            console.warn('GPS提取失败:', error);
        }

        // 尝试提取城市/地区信息
        const city = exifData.City || '';
        const state = exifData.State || exifData['Province-State'] || '';
        const country = exifData.Country || '';

        if (city || state || country) {
            const locationParts = [city, state, country].filter(Boolean);
            if (locationParts.length > 0) {
                if (locationInfo) {
                    locationInfo += ' | ';
                }
                locationInfo += locationParts.join(', ');
            }
        }

        return locationInfo;
    }

    /**
     * 从图片对象读取 EXIF 数据（备选方案）
     * @param {File} file - 图片文件
     * @returns {Promise<Object>} EXIF数据对象
     */
    static readExifFromImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        EXIF.getData(img, function() {
                            const metadata = ExifParser.parseExifData(this);
                            console.log('图片方式读取的EXIF数据:', metadata);
                            resolve(metadata);
                        });
                    } catch (error) {
                        console.error('图片方式EXIF读取失败:', error);
                        resolve({});
                    }
                };
                img.onerror = () => resolve({});
                img.src = e.target.result;
            };
            reader.onerror = () => resolve({});
            reader.readAsDataURL(file);
        });
    }

    /**
     * 解析EXIF数据（使用 EXIF.getTag 方法）
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
     * 解析从二进制数据读取的 EXIF（直接访问属性）
     * @param {Object} rawExif - 原始 EXIF 数据对象
     * @returns {Object} 解析后的元数据
     */
    static parseExifDataFromRaw(rawExif) {
        console.log('解析原始EXIF数据，可用字段:', Object.keys(rawExif));
        console.log('完整EXIF数据:', rawExif);

        // 提取相机信息
        const cameraModel = rawExif.Model || rawExif.CameraModelName || '';

        // 提取镜头信息 - 尝试多个可能的字段
        let lensModel = '';

        // 按优先级尝试获取镜头型号
        const lensFields = [
            'LensModel',           // 标准字段
            'LensType',            // 某些相机使用
            'Lens',                // 简写
            'LensInfo',            // 镜头信息
            'LensSpecification',   // 镜头规格
            'LensMake',            // 镜头制造商（备用）
        ];

        for (const field of lensFields) {
            if (rawExif[field]) {
                const value = rawExif[field];
                // 过滤掉纯数字（可能是序列号）
                if (typeof value === 'string' && !/^\d+$/.test(value)) {
                    lensModel = value;
                    break;
                } else if (Array.isArray(value)) {
                    // LensSpecification 通常是数组 [minFocal, maxFocal, minAperture, maxAperture]
                    const [minFocal, maxFocal, minAperture, maxAperture] = value;
                    if (minFocal && maxFocal) {
                        lensModel = `${minFocal}-${maxFocal}mm`;
                        if (minAperture && maxAperture) {
                            lensModel += ` f/${minAperture}-${maxAperture}`;
                        }
                        break;
                    }
                }
            }
        }

        // 提取焦距
        const focalLength = rawExif.FocalLength || rawExif.FocalLengthIn35mmFilm || '';

        // 如果没有镜头型号，用焦距代替
        if (!lensModel && focalLength) {
            lensModel = `${focalLength}mm`;
        }

        // 提取 ISO
        let isoValue = rawExif.ISOSpeedRatings || rawExif.ISO || '';
        // ISOSpeedRatings 可能是数组
        if (Array.isArray(isoValue)) {
            isoValue = isoValue[0];
        }

        // 提取光圈
        const apertureValue = rawExif.FNumber || rawExif.ApertureValue || '';

        // 提取快门速度
        const shutterValue = rawExif.ExposureTime || rawExif.ShutterSpeedValue || '';

        // 提取 GPS 和地点信息
        const locationInfo = this.extractLocationInfoFromRaw(rawExif);

        return {
            camera: cameraModel,
            lens: lensModel,
            location: locationInfo,
            iso: isoValue ? String(isoValue) : '',
            aperture: apertureValue ? `f/${apertureValue}` : '',
            shutter: shutterValue ? formatExposureTime(shutterValue) : '',
            focalLength: focalLength ? `${focalLength}mm` : ''
        };
    }

    /**
     * 从原始 EXIF 数据提取地点信息
     * @param {Object} rawExif - 原始 EXIF 数据
     * @returns {string} 地点信息字符串
     */
    static extractLocationInfoFromRaw(rawExif) {
        let locationInfo = '';

        try {
            // 尝试提取 GPS 坐标
            const gpsLatitude = rawExif.GPSLatitude;
            const gpsLongitude = rawExif.GPSLongitude;
            const gpsLatitudeRef = rawExif.GPSLatitudeRef || 'N';
            const gpsLongitudeRef = rawExif.GPSLongitudeRef || 'E';

            if (gpsLatitude && gpsLongitude) {
                const lat = convertDMSToDD(gpsLatitude, gpsLatitudeRef);
                const lng = convertDMSToDD(gpsLongitude, gpsLongitudeRef);

                if (lat !== null && lng !== null) {
                    locationInfo = `${lat.toFixed(6)}°${gpsLatitudeRef}, ${lng.toFixed(6)}°${gpsLongitudeRef}`;
                }
            }
        } catch (error) {
            console.warn('GPS提取失败:', error);
        }

        // 尝试提取城市/地区信息
        const city = rawExif.City || '';
        const state = rawExif.State || rawExif['Province-State'] || '';
        const country = rawExif.Country || '';

        if (city || state || country) {
            const locationParts = [city, state, country].filter(Boolean);
            if (locationParts.length > 0) {
                if (locationInfo) {
                    locationInfo += ' | ';
                }
                locationInfo += locationParts.join(', ');
            }
        }

        return locationInfo;
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
