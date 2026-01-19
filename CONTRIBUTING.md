# 贡献指南 / Contributing Guide

感谢你对 ImgEcho 项目的关注！我们欢迎任何形式的贡献。

Thank you for your interest in contributing to ImgEcho! We welcome contributions of all kinds.

---

## 🌟 如何贡献 / How to Contribute

### 报告 Bug / Report Bugs

如果你发现了 bug，请：
If you find a bug, please:

1. 检查 [Issues](https://github.com/simpledong81/imgecho/issues) 是否已有相同问题
   Check if the issue already exists in [Issues](https://github.com/simpledong81/imgecho/issues)

2. 创建新 Issue，包含：
   Create a new Issue with:
   - Bug 描述 / Bug description
   - 复现步骤 / Steps to reproduce
   - 预期行为 / Expected behavior
   - 实际行为 / Actual behavior
   - 截图（如果适用）/ Screenshots (if applicable)
   - 浏览器和操作系统信息 / Browser and OS information

### 提出功能建议 / Suggest Features

我们欢迎新功能建议！请：
We welcome feature suggestions! Please:

1. 创建 Issue，标记为 `enhancement`
   Create an Issue with `enhancement` label

2. 描述功能需求和使用场景
   Describe the feature and use cases

3. 如果可能，提供设计草图或参考示例
   If possible, provide mockups or reference examples

### 提交代码 / Submit Code

1. **Fork 仓库**
   Fork the repository

2. **克隆你的 Fork**
   Clone your fork
   ```bash
   git clone https://github.com/YOUR_USERNAME/imgecho.git
   cd imgecho
   ```

3. **创建功能分支**
   Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **安装依赖**
   Install dependencies
   ```bash
   npm install
   ```

5. **开发**
   Develop
   ```bash
   npm run dev
   ```

6. **遵循代码规范**
   Follow code standards
   ```bash
   npm run lint        # 检查代码 / Check code
   npm run format      # 格式化代码 / Format code
   ```

7. **构建测试**
   Build and test
   ```bash
   npm run build       # 构建 / Build
   npm run preview     # 预览 / Preview
   ```

8. **提交更改**
   Commit changes
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

9. **推送到你的 Fork**
   Push to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

10. **创建 Pull Request**
    Create a Pull Request

---

## 📝 代码规范 / Code Standards

### 提交信息规范 / Commit Message Convention

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 / Types:**
- `feat`: 新功能 / New feature
- `fix`: Bug 修复 / Bug fix
- `docs`: 文档更新 / Documentation update
- `style`: 代码格式（不影响功能）/ Code style (no functional change)
- `refactor`: 重构 / Refactor
- `perf`: 性能优化 / Performance improvement
- `test`: 测试 / Tests
- `chore`: 构建/工具配置 / Build/tool config

**示例 / Examples:**
```bash
feat: add batch image processing feature
fix: resolve EXIF reading issue on Safari
docs: update README with new features
style: format code with prettier
refactor: reorganize export manager module
perf: optimize canvas rendering performance
chore: update vite config
```

### 代码风格 / Code Style

- ✅ 使用 4 空格缩进 / Use 4 spaces for indentation
- ✅ 使用单引号 / Use single quotes
- ✅ 语句末尾加分号 / Add semicolons at end of statements
- ✅ 添加有意义的注释 / Add meaningful comments
- ✅ 函数和变量使用驼峰命名 / Use camelCase for functions and variables
- ✅ 类使用帕斯卡命名 / Use PascalCase for classes
- ✅ 常量使用大写字母和下划线 / Use UPPER_SNAKE_CASE for constants

### ESLint 和 Prettier

提交前请确保代码通过检查：
Please ensure your code passes checks before submitting:

```bash
npm run lint        # ESLint 检查 / ESLint check
npm run format      # Prettier 格式化 / Prettier format
```

---

## 🧪 测试 / Testing

目前项目还没有自动化测试，但请确保：
Currently there are no automated tests, but please ensure:

- ✅ 在主流浏览器测试（Chrome, Firefox, Safari, Edge）
  Test in major browsers (Chrome, Firefox, Safari, Edge)
- ✅ 测试移动端响应式 / Test mobile responsiveness
- ✅ 测试不同尺寸的图片 / Test with different image sizes
- ✅ 测试 EXIF 数据读取 / Test EXIF data reading
- ✅ 测试导出功能 / Test export functionality

---

## 📁 项目结构 / Project Structure

```
imgecho/
├── app.js              # 应用入口 / App entry
├── imageProcessor.js   # 图片处理 / Image processing
├── exifParser.js       # EXIF解析 / EXIF parsing
├── metadataRenderer.js # 元数据渲染 / Metadata rendering
├── exportManager.js    # 导出管理 / Export management
├── utils.js            # 工具函数 / Utility functions
├── locales.js          # 多语言 / i18n
├── style.css           # 样式 / Styles
├── index.html          # 主页面 / Main page
└── lib/                # 库封装 / Library wrappers
```

---

## 🔄 开发流程 / Development Workflow

### 功能开发 / Feature Development

1. 讨论功能（创建 Issue）/ Discuss feature (create Issue)
2. 获得批准后开始开发 / Start development after approval
3. 小步提交，频繁推送 / Commit small, push often
4. 保持分支与主分支同步 / Keep branch synced with main
5. 完成后创建 PR / Create PR when done

### Pull Request 要求 / PR Requirements

你的 PR 应该：
Your PR should:

- ✅ 有清晰的标题和描述 / Have clear title and description
- ✅ 关联相关 Issue / Link related Issues
- ✅ 通过 CI 检查 / Pass CI checks
- ✅ 包含必要的文档更新 / Include necessary documentation updates
- ✅ 不破坏现有功能 / Not break existing functionality

### PR 模板 / PR Template

```markdown
## 变更类型 / Type of Change
- [ ] Bug 修复 / Bug fix
- [ ] 新功能 / New feature
- [ ] 重构 / Refactor
- [ ] 文档更新 / Documentation update
- [ ] 其他 / Other

## 描述 / Description
<!-- 描述你的更改 / Describe your changes -->

## 关联 Issue / Related Issue
<!-- 如: Closes #123 / e.g., Closes #123 -->

## 测试 / Testing
<!-- 描述如何测试 / Describe how to test -->

## 截图 / Screenshots
<!-- 如果适用 / If applicable -->

## 检查清单 / Checklist
- [ ] 代码通过 ESLint 检查 / Code passes ESLint
- [ ] 代码通过 Prettier 检查 / Code passes Prettier
- [ ] 构建成功 / Build succeeds
- [ ] 在浏览器测试 / Tested in browser
- [ ] 更新了文档 / Updated documentation
```

---

## 🌍 国际化 / Internationalization

如果你添加了新的 UI 文本，请：
If you add new UI text, please:

1. 在 `locales.js` 中添加中英文翻译
   Add Chinese and English translations in `locales.js`

2. 使用 `languageManager.get('key')` 获取文本
   Use `languageManager.get('key')` to get text

示例 / Example:
```javascript
// locales.js
const locales = {
    en: {
        newFeature: "New Feature"
    },
    zh: {
        newFeature: "新功能"
    }
};

// 使用 / Usage
const text = languageManager.get('newFeature');
```

---

## 💬 社区行为准则 / Code of Conduct

请保持友好和尊重：
Please be friendly and respectful:

- ✅ 友善待人 / Be kind
- ✅ 尊重不同观点 / Respect different opinions
- ✅ 接受建设性批评 / Accept constructive criticism
- ✅ 专注于对项目最好的事 / Focus on what's best for the project
- ❌ 不使用攻击性语言 / No offensive language
- ❌ 不进行人身攻击 / No personal attacks

---

## 📞 联系方式 / Contact

- **GitHub Issues**: [提交问题](https://github.com/simpledong81/imgecho/issues)
- **讨论**: [GitHub Discussions](https://github.com/simpledong81/imgecho/discussions)

---

## 🎉 感谢 / Thank You

感谢所有贡献者的付出！你的贡献让 ImgEcho 变得更好！

Thank you to all contributors! Your contributions make ImgEcho better!

---

**Happy Coding! 🚀**
