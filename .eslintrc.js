module.exports = {
  env: {
    es2021: true,
    node: true,
    jest: true,
    jasmine: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'jest',
  ],
  rules: {
    'import/prefer-default-export': 'off',
    'no-useless-constructor': 'off',
    'import/extensions': 'off',
    'no-empty-function': ['warn', { allow: ['constructors'] }],
    'class-methods-use-this': 'off',
    semi: 'off',
    '@typescript-eslint/semi': ['error'],
    'no-console': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
