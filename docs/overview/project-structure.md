---
name: "docs/overview/project-structure.md"
title: "プロジェクト構造 (Project Structure)"
description: "プロジェクトのディレクトリ構造と各ファイルの役割"
---

# プロジェクト構造

## 1. ディレクトリ構造

```
commit_coach/
├── apps/
│   ├── frontend/           # Next.js フロントエンド
│   │   ├── src/
│   │   │   ├── components/ # 共通コンポーネント
│   │   │   ├── pages/     # ページコンポーネント
│   │   │   ├── hooks/     # カスタムフック
│   │   │   ├── utils/     # ユーティリティ関数
│   │   │   ├── types/     # 型定義
│   │   │   └── styles/    # スタイル
│   │   ├── public/        # 静的ファイル
│   │   └── tests/         # テスト
│   │
│   └── backend/           # Express バックエンド
│       ├── src/
│       │   ├── controllers/ # コントローラー
│       │   ├── services/   # ビジネスロジック
│       │   ├── models/     # データモデル
│       │   ├── routes/     # ルーティング
│       │   ├── utils/      # ユーティリティ
│       │   └── types/      # 型定義
│       ├── tests/         # テスト
│       └── config/        # 設定ファイル
│
├── packages/
│   └── shared-types/      # 共有型定義
│
├── docs/                  # ドキュメント
│   ├── overview/         # 概要
│   ├── api/             # API仕様
│   └── development/     # 開発ガイド
│
├── .github/              # GitHub設定
│   └── workflows/       # GitHub Actions
│
└── scripts/             # スクリプト
```

## 2. 主要ファイルの説明

### 2.1 フロントエンド

- `apps/frontend/package.json`: フロントエンドの依存関係とスクリプト
- `apps/frontend/next.config.js`: Next.js設定
- `apps/frontend/tsconfig.json`: TypeScript設定
- `apps/frontend/.env`: 環境変数

### 2.2 バックエンド

- `apps/backend/package.json`: バックエンドの依存関係とスクリプト
- `apps/backend/tsconfig.json`: TypeScript設定
- `apps/backend/.env`: 環境変数
- `apps/backend/src/app.ts`: アプリケーションエントリーポイント

### 2.3 共有

- `packages/shared-types/package.json`: 共有型定義の設定
- `package.json`: ルートの依存関係とスクリプト
- `pnpm-workspace.yaml`: ワークスペース設定
- `.gitignore`: Git除外設定
- `.eslintrc.js`: ESLint設定
- `.prettierrc`: Prettier設定

## 3. 開発環境設定

### 3.1 必要なツール

- Node.js 18以上
- pnpm 7以上
- Docker (オプション)
- Git

### 3.2 環境変数

#### フロントエンド
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### バックエンド
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
PORT=4000
NODE_ENV=development
```

## 4. 開発フロー

1. リポジトリのクローン
2. 依存関係のインストール
3. 環境変数の設定
4. 開発サーバーの起動
5. テストの実行

## 5. デプロイメント

### 5.1 フロントエンド
- Vercelにデプロイ
- 環境変数の設定
- ドメインの設定

### 5.2 バックエンド
- Fly.ioにデプロイ
- 環境変数の設定
- データベースのマイグレーション
