import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    // 基础路径配置
    base: './',

    // 开发服务器配置
    server: {
        port: 3000,
        open: true,
        cors: true,
        host: '0.0.0.0', // 允许局域网访问
    },

    // 预览服务器配置
    preview: {
        port: 8080,
        open: true,
    },

    // 构建配置
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // 生产环境移除 console
                drop_debugger: true,
            },
        },
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
            },
            output: {
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
            },
        },
        // 优化
        chunkSizeWarningLimit: 1000,
    },

    // 优化依赖预构建
    optimizeDeps: {
        // EXIF 库从 CDN 动态加载，无需预构建
    },

    // CSS 配置
    css: {
        devSourcemap: true,
    },

    // 资源处理
    assetsInclude: ['**/*.jpg', '**/*.png', '**/*.jpeg', '**/*.svg', '**/*.gif', '**/*.webp'],
});
