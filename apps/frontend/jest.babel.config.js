// Next.js 15系とBabelの互換性問題を回避するための設定
// JestテストのみにBabel設定を適用し、Next.jsのSWCコンパイラを開発環境で利用できるようにする
module.exports = api => {
  // Jestのテスト環境の場合のみ、この設定を適用する
  const isTest = api.env('test');
  
  // テスト環境以外では空の設定を返す
  if (!isTest) {
    return {};
  }
  
  // テスト環境のみに適用されるBabel設定
  return {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      '@babel/preset-typescript',
      ['@babel/preset-react', {
        runtime: 'automatic',
        importSource: 'react',
        development: process.env.NODE_ENV === 'development',
      }],
    ],
  };
};
