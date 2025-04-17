```markdown
---
name: "docs/overview_0/project-structure_merged.md"
title: "プロジェクト構成概要 (Project Structure Overview)"
description: "コミットコーチ — フロントエンド／バックエンド ディレクトリ構成と主要ファイルの役割"
---

# プロジェクト構成概要

このドキュメントでは、**コミットコーチ** プロジェクトのルート構成から、フロントエンド／バックエンドそれぞれのディレクトリ構造と主要ファイルの役割をまとめています。重複をなくし、MECE（相互排他かつ網羅的）な構成で整理しました。

---

## 1. ルート構成

```plaintext
[ProjectRoot]/
├── .gitignore           # Git 無視設定
├── README.md            # プロジェクト概要・要件定義書トップ
├── cursorrules/         # Cursor AI 用ルール定義
├── deploy_safe.sh       # セーフデプロイ用スクリプト
├── frontend/            # フロントエンド実装 (Next.js + TypeScript)
├── backend/             # バックエンド実装 (Supabase 前提)
└── knowledge_logs/      # 開発ログ・進捗管理
```

- **cursorrules/**: AI コーディング支援ルール  
- **knowledge_logs/**: metrics、進捗レポート、思考ログなど

---

## 2. バックエンド構成 (`backend/`)

Supabase（PostgreSQL + Auth + Realtime + Storage） を前提とした Node.js＋TypeScript サーバーです。

```plaintext
backend/
├── .env.example         # 環境変数テンプレート
├── Dockerfile           # コンテナビルド定義
├── docker-compose.yml   # (任意) Supabase エミュレータ含む開発用
├── package.json         # 依存管理 & スクリプト
├── pnpm-lock.yaml       # ロックファイル
├── tsconfig.json        # TypeScript 設定
├── src/                 # アプリケーションソース
└── tests/               # 単体 & 結合テスト
```

### 2.1 `src/` 以下

```plaintext
src/
├── config/        # .env から設定値読み込み（env.ts）
├── db/            # @supabase/supabase-js クライアント初期化
├── middlewares/   # JWT 認証、エラーハンドリング、ロガー
├── models/        # Zod スキーマ定義 (DTO / Validation)
├── controllers/   # Express ハンドラ (Request → Service → Response)
├── routes/        # ルーティング定義 (/api/v1/…)
├── services/      # ビジネスロジック (Supabase 操作)
├── utils/         # 汎用ユーティリティ関数
├── types/         # 共通 TypeScript 型定義
├── app.ts         # Express アプリセットアップ
└── server.ts      # サーバ起動 (`app.listen()`)
```

- **tests/**  
  - `unit/`: サービス層・ユーティリティの単体テスト  
  - `integration/`: Supabase 連携・API E2E テスト  

---

## 3. フロントエンド構成 (`frontend/`)

Next.js App Router を用いた SPA＋SSG/SSR 構成です。

```plaintext
frontend/
├── app/                  # ページ & レイアウト
│   ├── dashboard/        # ダッシュボード
│   ├── projects/         # プロジェクト一覧・詳細
│   ├── mypage/           # マイページ
│   ├── settings/         # 設定画面
│   ├── login/            # ログイン
│   ├── register/         # 新規登録
│   ├── layout.tsx        # ルートレイアウト
│   └── page.tsx          # ランディングページ
├── components/           # 再利用可能コンポーネント
│   ├── common/           # Button, Modal, Alert など
│   ├── ai-chat.tsx       # AI チャットウィジェット
│   ├── task-item.tsx     # タスクカード/行表示
│   └── …                 # その他 UI パーツ
├── hooks/                # カスタムフック (useToast, useMobile など)
├── lib/                  # API クライアント / 認証 / utils
├── context/              # React Context (Auth, Project)
├── styles/               # globals.css／Tailwind 設定
├── public/               # 静的アセット
├── types/                # 型定義 (project.ts, task.ts, user.ts)
├── next.config.mjs       # Next.js 設定
├── tailwind.config.ts    # Tailwind CSS 設定
├── tsconfig.json         # TypeScript 設定
└── package.json          # 依存管理 & スクリプト
```

- **App Router** のページ配下で `route.ts` を使えば API Routes も同一リポジトリで実装可能です。

---

## 4. 主要ファイル／フォルダの役割まとめ

| パス                       | 役割                                             |
| -------------------------- | ------------------------------------------------ |
| `.env.example`             | 環境変数サンプル                                 |
| `Dockerfile` / `docker-compose.yml` | 開発／本番環境のコンテナ設定                      |
| `src/config/env.ts`        | 環境変数を型付きで読み込む                       |
| `src/db/supabaseClient.ts` | Supabase クライアント生成                       |
| `src/middlewares/auth.ts`  | JWT 認証チェック                                 |
| `src/models/*.schema.ts`   | Zod による DTO / バリデーション                 |
| `src/controllers/*`         | ビジネスロジック → レスポンス生成               |
| `src/routes/index.ts`       | `/api/v1` 以下のエンドポイント集約               |
| `src/services/*Service.ts`  | 実際の Supabase 操作を含むユースケース実装       |
| `frontend/app/layout.tsx`   | グローバルレイアウト (ナビゲーション等)         |
| `frontend/components/common` | ボタン、モーダル、フォーム入力など再利用コンポーネント |
| `frontend/lib/api.ts`       | Fetch / Axios ベースの API クライアント          |
| `frontend/hooks/useToast.ts`| トースト通知用カスタムフック                    |

---

## 5. 今後の展開

1. **API 設計書 (OpenAPI)**  
2. **DB スキーマ定義書 (ER 図／マイグレーション)**  
3. **コンポーネントカタログ (Storybook)**  
4. **CI/CD ワークフロー整備 (GitHub Actions)**  

---  
以上が **コミットコーチ** のフロントエンド・バックエンドを横断したディレクトリ構成と主要ファイルの役割一覧です。  
これをベースに要件定義書や実装ガイドを個別に詳細化していってください。  
```