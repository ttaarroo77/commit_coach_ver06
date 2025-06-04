# Commit Coach Ver.0 - 次のタスク一覧（2025年6月4日更新）

## 📋 テスト安定化と品質担保

### 🔄 スナップショットテストの RTL への完全移行
- [x] `ChatMessage.spec.tsx` を React Testing Library パターンに移行
- [x] 残りのスナップショットテストを特定し、RTL テストに置き換え
- [x] `react-test-renderer` 依存関係の削除を検討

### 🧹 React 19 対応のクリーンアップ
- [x] JSX 変換に関する警告の解決
  - [x] 新しい JSX 変換方式への移行手順を調査
  - [x] `package.json` または Babel 設定の更新
- [x] React 19 互換性の最終確認

### 📊 テストカバレッジの向上
- [x] テストカバレッジレポート生成: `pnpm test -- --coverage`
- [x] カバレッジの低いコンポーネントやモジュールを特定
- [x] CI と同等の総合テスト実行: `pnpm lint && pnpm type-check && pnpm test && pnpm build`

## 🚀 ポートフォリオ化タスク（Phase 1〜4）

### 🌐 Phase 1: デプロイと公開設定
- [x] **Vercel へのデプロイ**
  - [x] GitHub リポジトリ連携設定
  - [x] 環境変数設定（Supabase URL, anon key 等）
  - [x] デプロイ済み URL 取得
- [x] **Supabase 設定確認**
  - [x] RLS（Row Level Security）設定確認（特に `profiles` テーブル）
  - [x] 無料枠の範囲内であることの確認

### 📝 Phase 2: README の最終更新
- [x] **README.md の最終確認**
  - [x] デモ URL の追加（デプロイ完了後）
  - [x] スクリーンショット/GIF の最適化

### 🔍 Phase 3: アプリケーション品質向上
- [x] **エラーハンドリング改善** ✅ 2025-06-04完了
  - [x] ユーザーフレンドリーなエラーメッセージ表示（エラー種類に応じた詳細メッセージを実装）
- [x] **動作確認**
  - [x] 主要機能の再テスト（ユーザー登録、ログイン、チャット機能など）
  - [ ] 複数ブラウザでの動作確認（Chrome, Firefox, Safari） → `docs/testing/browser_compatibility.md`のチェックリストを使用

### 🏁 Phase 4: リリース作業
- [x] **最終リリースタグ作成** ✅ 2025-06-04完了
  - [x] `git tag -a v0.0.0-portfolio -m "Portfolio release"` → 作成済み
  - [ ] `git push origin v0.0.0-portfolio` → リモートリポジトリにタグをプッシュ
- [x] **GitHub Release ノート作成** ✅ 2025-06-04一部完了
  - [x] 🟢 機能一覧／🛠 技術のリリースノートを作成（RELEASE_NOTES.md）
  - [ ] 🎥 Demo GIFの追加
  - [ ] GitHubリリースページへの反映

## 📚 ドキュメント整備

### 📑 テスト関連ドキュメント整備
- [x] テスト戦略のドキュメント整備
- [x] モックパターンの整理
- [x] テスト環境セットアップ手順の更新文書化（`docs/testing/strategy.md`）
- [x] モック実装パターンの整理（`docs/testing/mocking-patterns.md`）
- [x] テスト環境セットアップの手順更新

### 📝 PR テンプレート最終確認
- [x] `.github/PULL_REQUEST_TEMPLATE.md` の内容確認
  - [x] 概要、スクリーンショット、動作確認手順、レビュー観点の項目確認

## 🔧 CI/CD と品質ゲート

### 🔧 GitHub Actions ワークフロー確認
- [x] ワークフロー構成確認: `lint → type-check → jest → build`
- [x] PR 作成時のテスト自動実行確認

### 🎭 Storybook 整備（可能であれば）
- [ ] 主要コンポーネントの Storybook 化
- [ ] 視覚的な回帰テスト設定

---

**リマインダー**:
- 開発サーバーは`cd apps/frontend && PORT=3100 pnpm dev`で起動可能
- Tailwind CSS設定は最適化済み（node_modules除外、具体的なディレクトリパターン指定）
- React 19 は現在最新バージョンで、いくつかの非推奨警告があります
- テスト環境で DOM API（scrollIntoView など）のモックが必要な場合は、`setup-tests.js` に共通モックを追加することを検討
- ポートフォリオとしてのアピールポイントを意識した作業を優先（特に README やデモ URL）




---

## 💡 リファクタリング・ポートフォリオ化タスク

### 🔄 リファクタリングワークフローの改善 ✅ 2025-06-04完了
- [x] リファクタリングのドキュメント埋め込みと更新
- [x] リファクタリングワークフローの設計ドキュメントを`docs/manuals/refactoring_workflow.md`に作成

### 💼 ポートフォリオ化の完成
- [ ] 複数ブラウザテストの実施と記録（`docs/testing/browser_compatibility.md`）
  - [ ] クロスブラウザ互換性テストの実行（Chrome、Firefox、Safari）
  - [ ] テスト結果のドキュメント化
- [ ] GitHubリリースページの作成
  - [ ] `v0.0.0-portfolio`タグをプッシュ（`git push origin v0.0.0-portfolio`）
  - [ ] GitHub上でリリース作成、`RELEASE_NOTES.md`の内容を貼り付け
- [ ] デモGIFの作成と追加
  - [ ] 主要機能のスクリーンキャプチャ取得（Kap等のツールを使用）
  - [ ] GitHubリリースとREADMEに追加

## 📌 最近実施した作業（2025年6月4日）

### ✅ Next.js/Babel設定の修正
- babel.config.jsをjest.babel.config.jsに変更
- Jest設定で明示的にBabel設定ファイルを参照するよう修正
- これによりNext.jsのSWCトランスパイラ（React Server Components用）が正常に機能

### ✅ エラーハンドリングの改善
- エラータイプに応じた詳細なメッセージ表示機能を実装
- ネットワークエラー、認証エラーなど状況別のユーザーフレンドリーなメッセージ
- 主要機能（会話読込、リスト取得、会話削除、メッセージ送信）でエラー処理を強化

### ✅ ポートフォリオ版リリース準備
- RELEASE_NOTES.mdの作成と機能・技術スタックのまとめ
- v0.0.0-portfolioタグの作成
- ブラウザ互換性テストのチェックリスト作成

