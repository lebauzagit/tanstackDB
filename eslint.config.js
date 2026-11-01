import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import ts from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default ts.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.pnpm-store/**',
      '.codebase-memory/**',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: ts.parser } },
    rules: { 'vue/multi-word-component-names': 'off' },
  },
  {
    files: ['src/**/*.{ts,vue}'],
    // TypeScript ya valida nombres y tipos, incluidos los tipos del DOM.
    rules: { 'no-undef': 'off' },
    languageOptions: {
      globals: {
        console: 'readonly',
        crypto: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
      },
    },
  },
  prettier,
)
