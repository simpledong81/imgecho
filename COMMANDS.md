# ImgEcho 命令速查表

快速参考所有常用的 npm 命令和工作流。

---

## 📦 安装和设置

```bash
# 首次安装依赖
npm install

# 安装特定依赖
npm install package-name

# 安装开发依赖
npm install -D package-name

# 更新所有依赖
npm update

# 检查过期的依赖
npm outdated

# 安全漏洞检查
npm audit
npm audit fix
```

---

## 🚀 开发命令

```bash
# 启动开发服务器（推荐）
npm run dev
# → 在 http://localhost:3000 启动
# → 支持热模块替换（HMR）
# → 自动打开浏览器

# 启动开发服务器（手动指定端口）
vite --port 3001
```

---

## 🏗️ 构建命令

```bash
# 构建生产版本
npm run build
# → 输出到 dist/ 目录
# → 代码压缩和优化
# → 移除 console 日志

# 预览生产构建
npm run preview
# → 在 http://localhost:8080 启动
# → 测试构建后的实际效果

# 与 preview 相同（备选命令）
npm run serve
```

---

## ✅ 代码质量

```bash
# 运行 ESLint 检查
npm run lint
# → 检查代码规范问题
# → 显示所有错误和警告

# 自动修复 ESLint 问题
npm run lint:fix
# → 自动修复可修复的问题
# → 显示剩余需要手动修复的问题

# 格式化所有代码
npm run format
# → 使用 Prettier 格式化
# → 格式化 .js, .json, .html, .css, .md 文件

# 仅检查代码格式（不修改）
npm run format:check
# → 检查是否符合 Prettier 规范
# → 适用于 CI/CD
```

---

## 🧪 测试和验证

```bash
# 完整的代码质量检查流程
npm run lint        # 1. ESLint 检查
npm run format      # 2. 格式化代码
npm run build       # 3. 构建测试
npm run preview     # 4. 预览效果
```

---

## 📁 清理命令

```bash
# 清理构建输出
rm -rf dist

# 清理依赖
rm -rf node_modules

# 清理所有生成文件
rm -rf node_modules dist package-lock.json

# 完全重新安装
rm -rf node_modules package-lock.json
npm install
```

---

## 🔧 Git 工作流

```bash
# 标准开发流程
git checkout -b feature/your-feature    # 1. 创建分支
npm run dev                             # 2. 开发
npm run lint:fix                        # 3. 修复代码问题
npm run format                          # 4. 格式化代码
npm run build                           # 5. 构建测试
git add .                               # 6. 暂存更改
git commit -m "feat: your message"     # 7. 提交
git push origin feature/your-feature   # 8. 推送
```

---

## 🌐 部署命令

### GitHub Pages（自动部署）

```bash
# 推送到 main 分支自动触发部署
git push origin main
```

### GitHub Pages（手动部署）

```bash
# 构建
npm run build

# 安装 gh-pages（首次）
npm install -g gh-pages

# 部署
gh-pages -d dist
```

### Vercel / Netlify

```bash
# 只需要推送代码
git push origin main

# 平台会自动运行：
# Build Command: npm run build
# Output Directory: dist
```

---

## 🐛 调试命令

```bash
# 查看 Node 和 npm 版本
node --version
npm --version

# 查看项目配置
cat package.json

# 查看已安装的包
npm list
npm list --depth=0  # 只显示顶层依赖

# 查看某个包的信息
npm info package-name

# 检查端口占用
lsof -ti:3000

# 杀死占用端口的进程
lsof -ti:3000 | xargs kill -9

# 清除 npm 缓存
npm cache clean --force

# 查看 npm 配置
npm config list
```

---

## 🔍 常见问题排查

### 依赖问题

```bash
# 删除并重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 使用 npm ci（推荐用于 CI/CD）
npm ci
```

### 端口冲突

```bash
# 查找占用端口的进程
lsof -ti:3000

# 杀死进程
lsof -ti:3000 | xargs kill -9

# 或修改配置使用其他端口
# 编辑 vite.config.js
```

### 构建失败

```bash
# 检查 Node 版本
node --version  # 应该 >= 18.0.0

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 清除构建缓存
rm -rf dist
npm run build
```

### ESLint 错误

```bash
# 自动修复
npm run lint:fix

# 如果还有错误，手动检查
npm run lint

# 查看 ESLint 配置
cat eslint.config.js
```

---

## 📚 快捷键和技巧

### Vite 开发服务器快捷键

运行 `npm run dev` 后，在终端按：

- `r` - 重启服务器
- `u` - 显示 URL
- `o` - 在浏览器打开
- `c` - 清除控制台
- `q` - 退出服务器

### VS Code 快捷键

- `Cmd/Ctrl + Shift + P` - 命令面板
- `Cmd/Ctrl + Shift + F` - 格式化文档
- `Cmd/Ctrl + S` - 保存（自动格式化）
- `F12` - 跳转到定义

---

## 🎯 推荐的开发工作流

### 日常开发

```bash
npm run dev
# 编写代码...
# 浏览器自动刷新预览
```

### 提交前

```bash
npm run lint:fix    # 修复代码问题
npm run format      # 格式化代码
npm run build       # 确保构建成功
git add .
git commit -m "feat: your feature"
```

### 发布前

```bash
npm run lint        # 确保无警告
npm run build       # 构建生产版本
npm run preview     # 测试生产版本
# 确认无误后部署
```

---

## 💡 实用技巧

### 并行运行命令

```bash
# 同时运行多个命令（需要安装 npm-run-all）
npm install -D npm-run-all
npx npm-run-all --parallel dev lint:watch
```

### 监听模式

```bash
# 监听文件变化并运行 ESLint
npx eslint . --ext .js --watch
```

### 性能分析

```bash
# 分析构建性能
npm run build -- --profile

# 可视化依赖树
npx vite-bundle-visualizer
```

---

## 📞 获取帮助

```bash
# npm 帮助
npm help
npm help install

# Vite 帮助
npx vite --help

# ESLint 帮助
npx eslint --help

# 查看项目脚本
npm run
```

---

**保存这个文件到你的收藏夹，开发时随时参考！** 📌
