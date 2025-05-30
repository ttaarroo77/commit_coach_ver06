module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // 必要に応じてルールをカスタマイズ
  },
  env: {
    node: true,
  },
  ignorePatterns: ['dist', 'node_modules'],
};
