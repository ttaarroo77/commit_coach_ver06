# Commit Coach

AIを活用したタスク管理アプリケーション

## ドキュメント

- [開発フロー](docs/overview/development_flow.md)
- [プロジェクト構造](docs/overview/project-structure.md)
- [型定義](docs/overview/types.md)
- [コンポーネント](docs/overview/components.md)
- [データベース設計](docs/overview/database.md)
- [APIルート](docs/overview/api-routes.md)
- [製品概要](docs/overview/product-brief.md)

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

## 技術スタック

- フロントエンド: Next.js, React, TypeScript, Tailwind CSS, dnd-kit
- バックエンド: Express.js, TypeScript, Supabase
- データベース: PostgreSQL
- 開発ツール: pnpm, ESLint, Prettier, Husky, GitHub Actions, Storybook

## 機能

- ✅ タスク管理（作成、編集、削除、ドラッグ&ドロップ）
- ✅ プロジェクト管理
- ✅ AIチャット機能（3つのトーンプリセット対応）
- ✅ 認証機能（Supabase Auth + デモモード）
- ✅ レスポンシブデザイン
- ✅ ダークモード対応
- ✅ Storybook対応

## ライセンス

MIT
