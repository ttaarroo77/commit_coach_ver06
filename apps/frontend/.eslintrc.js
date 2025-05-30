module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
  ],
  rules: {
    // 開発中は警告を無効化
    'no-unused-vars': 'off',
    'no-undef': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  ignorePatterns: ['.next', 'node_modules', 'out', 'public', 'stories/**/*'],
};
