import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';

export default [
    // 全局忽略配置
    {
        ignores: ['dist/**', 'node_modules/**', '*.min.js'],
    },
    js.configs.recommended,
    prettierConfig,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                localStorage: 'readonly',
                console: 'readonly',
                Image: 'readonly',
                FileReader: 'readonly',
                Blob: 'readonly',
                URL: 'readonly',
                EXIF: 'readonly',
                languageManager: 'readonly',
                alert: 'readonly',
                requestAnimationFrame: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                EventTarget: 'readonly',
                CustomEvent: 'readonly',
                Node: 'readonly',
            },
        },
        rules: {
            'no-console': 'off',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-undef': 'error',
            semi: ['error', 'always'],
            quotes: ['error', 'single', { avoidEscape: true }],
            indent: ['error', 4, { SwitchCase: 1 }],
            'comma-dangle': ['error', 'only-multiline'],
            'arrow-spacing': ['error', { before: true, after: true }],
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-spacing': ['error', 'never'],
            'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],
            'eol-last': ['error', 'always'],
        },
    },
];
