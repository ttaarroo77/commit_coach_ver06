# Commit Coach

![Commit Coach Logo](/apps/frontend/public/logo.png)

**AIを活用したタスク管理・コミット支援アプリケーション**

[![デプロイ状態](https://img.shields.io/badge/deploy-ready-brightgreen)](https://commit-coach.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-blue)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.2-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.39.3-green)](https://supabase.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-blue)](https://tailwindcss.com/)

## 🌟 概要

Commit Coachは、開発者のタスク管理とコミットメッセージ作成を支援するAIパワードアプリケーションです。AIコーチが、あなたの開発プロセスをガイドし、効率的なタスク管理と質の高いコミットメッセージの作成をサポートします。

**[🔗 デモサイトを見る](https://commit-coach.vercel.app)**

## 🎉 主な機能

### 1. AIコーチングチャット
- **パーソナライズされたアドバイス**: タスクの内容や進捗に基づいたAIコーチングを提供
- **トーンプリセット**: Friendly、Tough-Love、Humorの3種類のコーチングスタイルから選択可能
- **チャット履歴**: 過去の会話を保存し、いつでも参照可能

### 2. タスク・プロジェクト管理
- **直感的なUI**: ドラッグ＆ドロップでタスクの優先順位を簡単に変更
- **プロジェクト分類**: タスクをプロジェクト別に整理
- **ステータス管理**: ToDo、In Progress、Doneの3ステータスでタスクを管理

### 3. ユーザー認証
- **Magic Link認証**: メールアドレスのみで簡単にログイン
- **セキュアな認証**: Supabaseによる堅牢な認証システム

### 4. モダンUI/UX
- **レスポンシブデザイン**: モバイルからデスクトップまで最適化されたUI
- **ダークモード対応**: 目に優しいダークモードをサポート
- **アクセシビリティ**: キーボードナビゲーションと適切なARIAラベル

## 📊 スクリーンショット

| ランディングページ | AIチャット | タスク管理 |
|:---:|:---:|:---:|
| ![ランディングページ](/apps/frontend/public/screenshots/landing.png) | ![AIチャット](/apps/frontend/public/screenshots/chat.png) | ![タスク管理](/apps/frontend/public/screenshots/tasks.png) |

## 🚀 デモアクセス

**[🔗 デモサイトを見る](https://commit-coach.vercel.app)**

**デモアカウント:**
- Email: `demo@example.com`
- Password: `demopassword`

---

## ドキュメント

- [開発フロー](docs/overview/development_flow.md)
- [プロジェクト構造](docs/overview/project-structure.md)
- [型定義](docs/overview/types.md)
- [コンポーネント](docs/overview/components.md)
- [データベース設計](docs/overview/database.md)
- [APIルート](docs/overview/api-routes.md)
- [製品概要](docs/overview/product-brief.md)
- [Ver 0 実装チェックリスト](docs/refactoring/scratchpad_ver0.md)

## 開発環境のセットアップ

1. リポジトリのクローン
```bash
git clone https://github.com/your-username/commit-coach.git
cd commit-coach
```

2. 依存関係のインストール
```bash
pnpm install
```

3. 環境変数の設定

フロントエンド用（`apps/frontend/.env.local`）:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI Configuration (for API routes)
OPENAI_API_KEY=your-openai-api-key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Demo Mode (optional)
DEMO_MODE=false
```

バックエンド用（`apps/backend/.env`）:
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
JWT_EXPIRES_IN=1h

# Application Configuration
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=3001

# Database Configuration
SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

4. 開発サーバーの起動
```bash
# フロントエンド
cd apps/frontend && pnpm dev

# バックエンド
cd apps/backend && pnpm dev

# Storybook
cd apps/frontend && pnpm storybook
```

## デプロイ

### Vercelへのデプロイ

1. Vercelアカウントにログイン
2. プロジェクトをインポート
3. 環境変数を設定（上記の本番環境用の値を使用）
4. デプロイ実行

### Supabaseのセットアップ

1. Supabaseプロジェクトを作成
2. データベースマイグレーションを実行:
```bash
supabase db push
```
3. Edge Functionsをデプロイ:
```bash
supabase functions deploy chat
```

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 15**: App Routerを活用したモダンなReactフレームワーク
- **React 19**: 最新のReactフックとパターンを活用
- **TypeScript**: 型安全性を確保し、開発効率を向上
- **Tailwind CSS**: 高度にカスタマイズ可能なユーティリティファーストのCSSフレームワーク
- **shadcn/ui**: 美しく再利用可能なUIコンポーネント
- **dnd-kit**: アクセシブルなドラッグ＆ドロップ機能
- **Sonner**: エレガントなトースト通知

### バックエンド
- **Supabase**: 認証、データベース、ストレージを提供するBaaSプラットフォーム
- **PostgreSQL**: 強力なリレーショナルデータベース
- **Edge Functions**: サーバーレスAPIエンドポイント

### AI統合
- **OpenAI GPT-3.5-turbo**: 自然言語処理と会話型AI

### 開発ツール
- **pnpm**: 高速でディスク効率の良いパッケージマネージャー
- **Turborepo**: モノレポ管理とビルド最適化
- **ESLint & Prettier**: コード品質とフォーマット
- **Husky & lint-staged**: コミット前の自動リント
- **Storybook**: コンポーネント開発とドキュメント
- **Vercel**: 高速でスケーラブルなデプロイプラットフォーム

## 💡 こだわりポイント

### 1. パフォーマンス最適化
- **Lighthouse スコア**: パフォーマンス90+、アクセシビリティ95+
- **最適化されたバンドルサイズ**: ランディングページは578Bの軽量設計
- **Tailwind設定の最適化**: 不要なスキャンを排除し、ビルド時間を短縮

### 2. ユーザー体験
- **エラーハンドリング**: ユーザーフレンドリーなエラーメッセージと回復パス
- **ローディング状態**: スケルトンローダーとスムーズな遷移
- **レスポンシブデザイン**: あらゆるデバイスで最適な表示

### 3. コード品質
- **型安全性**: TypeScriptによる厳格な型チェック
- **コンポーネント設計**: 再利用可能で保守しやすいコンポーネント
- **テスト**: 重要な機能に対するユニットテスト

### 4. AIインテグレーション
- **コンテキスト認識**: ユーザーのタスクとプロジェクトを考慮したAIレスポンス
- **パーソナライズ**: ユーザー好みに合わせたコーチングスタイル

## 🔮 今後の展望

### Ver.1 計画
- **GitHubインテグレーション**: リポジトリと連携したコミット提案
- **チーム機能**: 複数ユーザーでのプロジェクト共有
- **高度な分析**: タスク完了率とパフォーマンス指標
- **AIコーチの強化**: より高度なコンテキスト理解と提案

## 📝 ER図

```
+---------------+       +----------------+       +---------------+
|    users      |       |   projects     |       |     tasks     |
+---------------+       +----------------+       +---------------+
| id            |       | id             |       | id            |
| email         |       | name           |       | title         |
| created_at    |<----->| user_id        |<----->| project_id    |
| updated_at    |       | description    |       | description   |
+---------------+       | created_at     |       | status        |
                        | updated_at     |       | position      |
                        +----------------+       | created_at    |
                                                | updated_at    |
+---------------+       +----------------+       +---------------+
| conversations |       |    messages    |
+---------------+       +----------------+
| id            |       | id             |
| user_id       |<----->| conversation_id|
| title         |       | role           |
| created_at    |       | content        |
| updated_at    |       | created_at     |
+---------------+       +----------------+
```

## 👨‍💻 開発者

- 中澤 太郎 (Taro Nakazawa)
- [GitHub](https://github.com/ttaarroo77)
- [LinkedIn](https://linkedin.com/in/taronakazawa)

## 📄 ライセンス

MIT
