// スナップショットリゾルバー設定
// スナップショットファイルの保存場所と読み込み場所を指定

module.exports = {
  // テストパスからスナップショットを保存する場所を解決
  resolveSnapshotPath: (testPath, snapshotExtension) => {
    // 例: __tests__/components/Button.spec.tsx -> __tests__/components/__snapshots__/Button.spec.tsx.snap
    return testPath.replace(/\.spec\.(tsx|ts|js|jsx)$/, `.spec$1${snapshotExtension}`);
  },

  // スナップショットパスからテストファイルのパスを解決
  resolveTestPath: (snapshotFilePath, snapshotExtension) => {
    return snapshotFilePath.replace(snapshotExtension, '');
  },

  // スナップショットの拡張子を指定
  testPathForConsistencyCheck: '__tests__/components/Button.spec.tsx',
};
