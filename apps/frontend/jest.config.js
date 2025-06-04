/** @type {import('jest').Config} */
const config = {
  // 特定のBabel設定ファイルを使用するように指定
  rootDir: '.',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './jest.babel.config.js' }]
  },
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // CSSモジュールとその他のファイルのモック
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // react-markdownのモック
    '^react-markdown$': '<rootDir>/__mocks__/react-markdown.jsx'
  },
  testMatch: ['**/__tests__/**/*.spec.(ts|tsx|js|jsx)'],
  transformIgnorePatterns: [
    // ESM形式のパッケージをトランスパイル対象にする
    '/node_modules/(?!(react-markdown|react-syntax-highlighter|micromark|decode-named-character-reference|mdast-util-.*|unist-util-.*|remark-.*|unified|bail|trough|is-plain-obj|vfile.*|.*)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
};

module.exports = config;
