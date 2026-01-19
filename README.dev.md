# ImgEcho 开发指南

## 📦 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0

推荐使用 [nvm](https://github.com/nvm-sh/nvm) 来管理 Node.js 版本：

```bash
# 安装并使用项目指定的 Node 版本
nvm install
nvm use
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:3000` 启动，支持热模块替换（HMR）。

### 3. 构建生产版本

```bash
npm run build
```

构建输出将生成在 `dist/` 目录。

### 4. 预览生产构建

```bash
npm run preview
```

在本地预览生产构建，运行在 `http://localhost:8080`。

---

## 📜 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（支持热更新） |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run serve` | 与 preview 相同，在 8080 端口启动 |
| `npm run lint` | 检查代码规范 |
| `npm run lint:fix` | 自动修复代码规范问题 |
| `npm run format` | 格式化所有代码 |
| `npm run format:check` | 检查代码格式 |

---

## 🛠️ 技术栈

### 核心技术
- **原生 JavaScript (ES6+)**: 无框架依赖
- **HTML5 Canvas**: 图片处理和渲染
- **CSS3**: 现代化样式设计

### 开发工具
- **Vite**: 快速的开发服务器和构建工具
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **EditorConfig**: 编辑器配置统一

### 依赖库
- **exif-js**: EXIF 信息读取

---

## 📁 项目结构

```
imgecho/
├── app.js              # 应用入口，整合所有模块
├── imageProcessor.js   # 图片处理模块（上传、显示、Canvas渲染）
├── exifParser.js       # EXIF数据解析模块
├── metadataRenderer.js # 元数据渲染模块（文字覆盖）
├── exportManager.js    # 导出管理模块（图片/HTML导出）
├── utils.js            # 工具函数（格式转换、位置计算等）
├── locales.js          # 多语言资源管理
├── style.css           # 全局样式
├── index.html          # 主页面
│
├── lib/                # 第三方库封装
│   └── exif-loader.js  # EXIF库加载器
│
├── assets/             # 静态资源
│   └── Example.jpg     # 示例图片
│
├── vite.config.js      # Vite 配置
├── package.json        # 项目配置和依赖
├── .eslintrc.json      # ESLint 配置
├── .prettierrc.json    # Prettier 配置
├── .editorconfig       # EditorConfig 配置
├── .gitignore          # Git 忽略规则
└── README.md           # 项目说明
```

---

## 🔧 开发配置

### Vite 配置

项目使用 Vite 作为开发服务器和构建工具，配置文件：`vite.config.js`

**主要特性**：
- ✅ 快速的 HMR（热模块替换）
- ✅ 自动代码分割
- ✅ 生产环境自动移除 console
- ✅ 资源优化和压缩
- ✅ 支持 ES 模块

### ESLint 配置

代码规范检查配置：`.eslintrc.json`

**规则概览**：
- 使用单引号
- 分号结尾
- 4 空格缩进
- 允许 console（开发环境）

运行检查：
```bash
npm run lint        # 检查问题
npm run lint:fix    # 自动修复
```

### Prettier 配置

代码格式化配置：`.prettierrc.json`

**格式规则**：
- 单引号
- 分号结尾
- 行宽 100 字符
- 4 空格缩格

运行格式化：
```bash
npm run format              # 格式化所有文件
npm run format:check        # 仅检查格式
```

---

## 🔍 开发建议

### 1. 推荐的 IDE

- **Visual Studio Code** + 插件：
  - ESLint
  - Prettier - Code formatter
  - EditorConfig for VS Code
  - Vite

### 2. 开发流程

```bash
# 1. 创建新分支
git checkout -b feature/new-feature

# 2. 启动开发服务器
npm run dev

# 3. 开发和测试
# ... 编写代码 ...

# 4. 检查代码规范
npm run lint

# 5. 格式化代码
npm run format

# 6. 构建测试
npm run build

# 7. 预览生产版本
npm run preview

# 8. 提交代码
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### 3. 代码提交规范

推荐使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整（不影响功能）
refactor: 重构代码
perf: 性能优化
test: 测试相关
chore: 构建/工具配置
```

示例：
```bash
git commit -m "feat: add batch image processing"
git commit -m "fix: resolve EXIF reading issue on Safari"
git commit -m "docs: update development guide"
```

---

## 🐛 调试技巧

### 浏览器开发者工具

1. **Console 面板**：查看日志和错误
2. **Network 面板**：检查资源加载
3. **Application 面板**：查看 LocalStorage 数据
4. **Performance 面板**：分析性能瓶颈

### Vite 开发特性

- **热更新**：修改代码后自动刷新
- **错误提示**：终端和浏览器同步显示错误
- **Source Map**：支持源代码调试

### 常见问题

**Q: EXIF 库无法加载？**
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

**Q: 端口被占用？**
```bash
# 修改 vite.config.js 中的端口号
server: {
  port: 3001  // 改为其他端口
}
```

**Q: 构建后的文件路径问题？**
```bash
# 检查 vite.config.js 的 base 配置
base: './'  # 相对路径
base: '/imgecho/'  # GitHub Pages 路径
```

---

## 🚀 部署

### GitHub Pages

```bash
# 1. 构建
npm run build

# 2. 推送到 gh-pages 分支
# （可以使用 gh-pages 工具自动化）
npm install -g gh-pages
gh-pages -d dist
```

### Vercel / Netlify

直接连接 GitHub 仓库，配置：
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

## 📦 依赖管理

### 添加新依赖

```bash
# 生产依赖
npm install package-name

# 开发依赖
npm install -D package-name
```

### 更新依赖

```bash
# 检查过期依赖
npm outdated

# 更新所有依赖（谨慎使用）
npm update

# 更新特定依赖
npm update package-name
```

### 依赖安全检查

```bash
# 检查安全漏洞
npm audit

# 自动修复
npm audit fix
```

---

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- [Vite](https://vitejs.dev/) - 极速的开发体验
- [exif-js](https://github.com/exif-js/exif-js) - EXIF 数据读取
- [ESLint](https://eslint.org/) - 代码质量保证
- [Prettier](https://prettier.io/) - 代码格式化

---

## 📞 联系方式

- **GitHub Issues**: [提交问题](https://github.com/simpledong81/imgecho/issues)
- **在线演示**: [https://simpledong81.github.io/imgecho](https://simpledong81.github.io/imgecho)

---

**祝开发愉快！🎉**
