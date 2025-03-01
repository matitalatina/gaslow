const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettierConfig = require('eslint-config-prettier');

module.exports = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    files: ['src/**/*.ts'],
    ignores: ['.eslintrc.js'],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.test.json',
      },
    },
    files: ['test/**/*.ts']
  },
  {
    files: ['.eslintrc.{js,cjs}'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  }
); 