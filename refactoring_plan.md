# コミットコーチ リファクタリング計画

## 概要：
  - 今の作業：v0で作ったfrontendのファイルを、アプリに実装している。
  - 見本：v0/commit-coach
  - 実装先：apps/frontend

## フロントエンド実装計画

### 基本構造
- [x] モノレポ構造のセットアップ
- [x] 基本設定ファイルの移行 (package.json, next.config.mjs, tsconfig.json)
- [x] スタイル設定の移行 (tailwind.config.ts, postcss.config.mjs)
- [x] コンポーネント設定の移行 (components.json)

### コア機能
- [x] 認証コンテキストの実装
- [x] Supabaseクライアントの設定
- [x] 認証機能の実装 (signIn, signUp, signOut)
- [x] ダッシュボードユーティリティの実装

### UI コンポーネント
- [x] グローバルスタイルの実装
- [x] レイアウトコンポーネントの実装
- [x] ダッシュボードページの実装
- [x] ユーティリティ関数の実装
- [x] サイドバーコンポーネントの実装
- [x] AIコーチサイドバーの実装
- [x] shadcn/ui コンポーネントのインストール
  - [x] Button
  - [x] Card
  - [x] Textarea
  - [x] Dialog
  - [x] Input
  - [x] Label
  - [x] Dropdown Menu
  - [x] Checkbox
- [x] タスク項目コンポーネントの実装

### 今後の実装予定
- [ ] タスク項目とメニュー付きコンポーネントの実装
  - [ ] 編集可能なテキストコンポーネント
  - [ ] タスクの階層構造管理
  - [ ] UXの作り込み
    - [ ] 並び順カラム追加 (`sort_order`)
    - [ ] 並び替えAPI（PATCH /reorder）
    - [ ] （後回し）UI: ドラッグ&ドロップ

- [ ] プロジェクト管理機能
  - [ ] プロジェクト作成フォーム
  - [ ] プロジェクト編集機能
  - [ ] プロジェクト削除機能
- [ ] タスク管理機能
  - [ ] タスク作成フォーム
  - [ ] タスク編集機能
  - [ ] タスク削除機能
  - [ ] タスクステータス管理
  - [ ] タスク分解機能
- [ ] AIコーチ機能の拡張
  - [ ] OpenAI APIとの連携
  - [ ] コンテキスト対応の応答生成
  - [ ] タスク分解の提案機能

## バックエンド実装計画
- [ ] APIルートの設計
  - [ ] 認証API
  - [ ] プロジェクトAPI
  - [ ] タスクAPI
- [ ] データベース設計
  - [ ] ユーザーテーブル
  - [ ] プロジェクトテーブル
  - [ ] タスクテーブル
- [ ] Supabase連携
  - [ ] RLS (行レベルセキュリティ) の設定
  - [ ] データ検証ロジック

## テスト計画
- [ ] ユニットテスト
  - [ ] コンポーネントテスト
  - [ ] ユーティリティ関数テスト
- [ ] 統合テスト
  - [ ] ページレンダリングテスト
  - [ ] APIテスト
- [ ] E2Eテスト
  - [ ] ユーザーフロー検証

## デプロイ計画
- [ ] CI/CD設定
  - [ ] GitHub Actions設定
  - [ ] ビルド自動化
- [ ] 環境設定
  - [ ] 開発環境
  - [ ] ステージング環境
  - [ ] 本番環境
- [ ] モニタリング設定
  - [ ] エラートラッキング
  - [ ] パフォーマンスモニタリング

## 引き継ぎ情報

#### フロントエンド
- `/apps/frontend/` - フロントエンドのルートディレクトリ
  - `/app/` - Next.js アプリケーションのページとレイアウト
    - `/dashboard/page.tsx` - ダッシュボードページ（主要機能）
    - `/layout.tsx` - 全体レイアウト
    - `/globals.css` - グローバルスタイル
  - `/components/` - 再利用可能なコンポーネント
    - `/ui/` - shadcn/ui コンポーネント
    - `/sidebar.tsx` - サイドバーコンポーネント
    - `/ai-coach-sidebar.tsx` - AIコーチサイドバー
    - `/task-item.tsx` - タスク項目コンポーネント
  - `/context/` - Reactコンテキスト
    - `/auth-context.tsx` - 認証コンテキスト
  - `/lib/` - ユーティリティ関数
    - `/supabase.ts` - Supabaseクライアント初期化
    - `/auth.ts` - 認証関連関数
    - `/dashboard-utils.ts` - ダッシュボード関連ユーティリティ
    - `/utils.ts` - 汎用ユーティリティ関数

#### 設定ファイル
- `/apps/frontend/package.json` - 依存関係と設定
- `/apps/frontend/next.config.mjs` - Next.js設定
- `/apps/frontend/tsconfig.json` - TypeScript設定
- `/apps/frontend/tailwind.config.ts` - Tailwind CSS設定
- `/apps/frontend/components.json` - shadcn/ui設定

### 注意点・潜在的な問題

1. **認証処理**
   - Supabaseの認証キーが環境変数に設定されていることを確認
   - 開発環境と本番環境で異なる認証設定が必要
   - **対処法**: `.env.local`ファイルに`NEXT_PUBLIC_SUPABASE_URL`と`NEXT_PUBLIC_SUPABASE_ANON_KEY`を設定

2. **コンポーネント依存関係**
   - shadcn/uiコンポーネントの依存関係が正しく解決されているか確認
   - **対処法**: 依存関係エラーが発生した場合は`npx shadcn@latest add [コンポーネント名]`で再インストール

3. **タスクデータの永続化**
   - 現状はローカルストレージを使用しているが、将来的にはバックエンドAPIに移行予定
   - **対処法**: `dashboard-utils.ts`内のデータ取得・保存関数を将来的にAPI呼び出しに置き換える

4. **レスポンシブデザイン**
   - モバイル対応が完全には実装されていない
   - **対処法**: メディアクエリを使用してモバイルビューを最適化

5. **パフォーマンス最適化**
   - タスクリストが大きくなった場合の仮想化が未実装
   - **対処法**: `react-window`や`react-virtualized`などのライブラリを検討

### 開発環境セットアップ

1. リポジトリのクローン後、以下のコマンドを実行：
   ```bash
   cd commit_coach
   pnpm install
   cd apps/frontend
   pnpm dev
   ```

2. 環境変数の設定：
   - `/apps/frontend/.env.local`ファイルを作成し、Supabase認証情報を設定

3. 開発サーバー起動：
   - `pnpm dev`コマンドでNext.jsの開発サーバーを起動
   - デフォルトでは`http://localhost:3000`でアクセス可能
