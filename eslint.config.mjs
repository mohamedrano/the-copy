import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tsdoc from 'eslint-plugin-tsdoc';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'tsdoc': tsdoc,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/jsx-no-target-blank': 'error',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-const': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      'tsdoc/syntax': 'error',
      'tsdoc/check-param-names': 'error',
      'tsdoc/check-tag-names': 'error',
      'tsdoc/check-types': 'error',
      'tsdoc/require-param': 'error',
      'tsdoc/require-param-description': 'error',
      'tsdoc/require-param-name': 'error',
      'tsdoc/require-param-type': 'off',
      'tsdoc/require-returns': 'error',
      'tsdoc/require-returns-description': 'error',
      'tsdoc/require-returns-type': 'off',
      'tsdoc/require-description': 'error',
      'tsdoc/require-example': 'off',
      'tsdoc/require-jsdoc': 'error',
      'tsdoc/require-throws': 'off',
      'tsdoc/require-yields': 'off',
      'tsdoc/require-yields-check': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.reports/**',
      'docs/api/**',
      '*.config.js',
      '*.config.mjs',
    ],
  },
];