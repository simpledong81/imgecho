# ImgEcho

🌐 **一个现代化的图片信息展示与编辑工具 | A Modern Image Information Display and Editing Tool**

---

## ✨ 主要功能 | Features

### 📸 图片处理 | Image Processing
- **图片上传与实时预览** - 支持拖拽上传和文件选择
- **Image Upload & Real-time Preview** - Drag & drop and file selection support

### 📝 元数据编辑 | Metadata Editing
- **相机参数编辑** - 相机型号、镜头、ISO、光圈、快门速度
- **Camera Parameters** - Model, lens, ISO, aperture, shutter speed
- **位置与版权信息** - 拍摄地点和版权声明
- **Location & Copyright** - Shooting location and copyright information

### 🎨 文字定制 | Text Customization
- **自定义文字样式** - 字体、大小、颜色、透明度
- **Custom Text Styles** - Font, size, color, opacity
- **灵活位置调整** - 拖拽定位文字到任意位置
- **Flexible Positioning** - Drag to position text anywhere

### 🌐 多语言支持 | Multi-language Support
- **中英文界面切换** - 一键切换语言界面
- **Bilingual Interface** - One-click language switching
- **国际化设计** - 支持更多语言扩展
- **International Design** - Ready for more language support

### 💾 高质量导出 | High-quality Export
- **无损图片导出** - 保持原始图片质量
- **Lossless Export** - Preserve original image quality
- **多种格式支持** - PNG、JPEG等格式
- **Multiple Formats** - PNG, JPEG, etc.

---

## 🚀 快速开始 | Quick Start

### 在线使用 | Online Usage
直接访问：[https://simpledong81.github.io/imgecho](https://simpledong81.github.io/imgecho)

### 开发环境 | Development Environment

**推荐使用 npm 开发环境（现代化工具链）：**

```bash
# 克隆项目
git clone https://github.com/simpledong81/imgecho.git
cd imgecho

# 安装依赖
npm install

# 启动开发服务器（支持热更新）
npm run dev

# 构建生产版本
npm run build
```

**或使用简单的静态服务器：**

```bash
# 使用 Python 内置服务器
python -m http.server 8000

# 或使用 Node.js 服务器
npx http-server -p 8000
```

> 💡 **提示**：查看 [SETUP.md](SETUP.md) 获取详细的 5 分钟快速设置指南

---

## 🛠️ 技术栈 | Tech Stack

### 前端技术 | Frontend Technologies
- **HTML5 Canvas** - 图片处理和文字渲染
- **Modern JavaScript (ES6+)** - 模块化设计，纯前端实现
- **CSS3 with CSS Variables** - 现代化响应式设计，主题定制支持
- **Canvas API** - 高性能图片渲染
- **EXIF.js** - 图片EXIF信息解析

### 架构特点 | Architecture Features
- **纯前端解决方案** - 无需后端服务器
- **响应式设计** - 适配桌面、平板和移动设备
- **模块化代码结构** - 易于维护和扩展
- **拖拽上传功能** - 现代化的文件上传体验
- **异步处理优化** - 流畅的用户体验
- **防抖机制** - 优化性能，减少不必要的重绘

### 兼容性 | Compatibility
- **现代浏览器** - Chrome, Firefox, Safari, Edge
- **移动设备** - iOS Safari, Android Chrome
- **无插件依赖** - 纯Web标准实现

---

## 📁 项目结构 | Project Structure

```
imgecho/
├── index.html          # 主页面 | Main page
├── app.js              # 应用入口 | Application entry
├── imageProcessor.js   # 图片处理 | Image processing
├── exifParser.js       # EXIF解析 | EXIF parsing
├── metadataRenderer.js # 元数据渲染 | Metadata rendering
├── exportManager.js    # 导出管理 | Export management
├── utils.js            # 工具函数 | Utility functions
├── style.css           # 样式文件 | Styles
├── locales.js          # 语言管理 | Language management
├── assets/             # 资源文件 | Assets
│   ├── Example.jpg     # 示例图片 | Example images
│   └── ...
└── README.md           # 项目文档 | Documentation
```

---

## 🔧 使用指南 | Usage Guide

### 基本操作 | Basic Operations
1. **上传图片** - 点击上传按钮或拖拽图片到上传区域
2. **编辑信息** - 在右侧面板填写相机参数和文字内容
3. **调整样式** - 使用滑块调整文字样式、大小和位置
4. **实时预览** - 所有修改即时在画布上显示
5. **导出图片** - 点击导出按钮下载处理后的图片

### 高级功能 | Advanced Features
- **拖拽上传** - 支持直接拖拽图片到上传区域
- **EXIF自动解析** - 自动读取图片中的相机信息
- **模糊效果调整** - 可调整图片模糊程度
- **灵活的文字位置** - 多种预设位置可选
- **中英文切换** - 右上角语言选择器
- **响应式布局** - 自动适配不同屏幕尺寸
- **流畅的用户体验** - 优化的异步处理和防抖机制

---

## 🤝 贡献指南 | Contributing

欢迎提交Issue和Pull Request来改进项目！

### 开发规范 | Development Guidelines
- 遵循现有代码风格
- 添加适当的中英文注释
- 确保多语言支持完整
- 测试所有功能正常工作

### 功能建议 | Feature Suggestions
- 更多语言支持
- 高级图片滤镜
- 批量处理功能
- 云存储集成

---

## 📞 联系信息 | Contact

- **项目主页**: [https://github.com/simpledong81/imgecho](https://github.com/simpledong81/imgecho)
- **在线演示**: [https://simpledong81.github.io/imgecho](https://simpledong81.github.io/imgecho)
- **问题反馈**: 通过GitHub Issues提交
