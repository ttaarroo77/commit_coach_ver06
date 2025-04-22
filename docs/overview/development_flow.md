---
name: "docs/overview/development_flow.md"
title: "開発フロー概要 (Development Flow) – 分離型モノレポ版"
description: "[コミットコーチ] – Next.js(フロント) + Express(バック) を pnpm モノレポで開発するためのロードマップ。本文=要約、付録=200ステップの詳細チェックリスト。"
version: "2.1"
last_updated: "2025-04-22"
---

# 開発手順書 – 要約＋付録詳細方式

このドキュメントは、**フロントエンド = Next.js / バックエンド = Express** を分離し、**pnpm ワークスペースによるモノレポ** 管理で開発を進めるための詳細手順書です。

## 目次
1. [進捗・議事録](#1-進捗議事録)
2. [共通作業 (Step 0‑20)](#2-共通作業--モノレポ基盤-step-0-20)
3. [フロントエンド開発 (Step 21‑100)](#3-フロントエンド開発フロー-step-21-100)
4. [バックエンド開発 (Step 101‑200)](#4-バックエンド開発フロー-step-101-200)
5. [総合チェックリスト](#5-総合チェックリスト)
6. [付録](#6-付録)

## 1. 進捗・議事録

### 1.1 最新の進捗状況 (2025‑04‑22 時点)
| レイヤ | 進捗 | 備考 |
|--------|------|------|
| Frontend | **Step 1‑38 完了** | 基本 UI & 認証まで実装 |
| Backend  | **Step 101‑110 完了** | Express プロジェクト初期化完了 |
| 課題    | API 実装 + テスト | Step 121‑130 着手中 |

### 1.2 次回アクション
- [ ] **Step 131‑140:** 認証 (Supabase JWT) ミドルウェア実装
- [ ] **Step 113‑120:** Supabase マイグレーション実行
- [ ] **Step 171‑180:** テスト自動化 (Jest/Supertest)

> 以降の進捗は PR マージ時に **progress.yml** から自動生成される予定。

<details>
<summary>付録 A — 200 Step 詳細</summary>

## 2. 共通作業 – モノレポ基盤 (Step 0‑20)

| Step | 完了 | 内容 |
|------|------|------|
| 0 | [ ] | Node.js 20.x & **pnpm >=9** インストール |
| 1 | [x] | `pnpm init` – ルート `package.json` (workspace 設定のみ) |
| 2 | [x] | `pnpm add -w eslint prettier husky lint-staged` 共有ツール導入 |
| 3 | [x] | `pnpm dlx create-next-app apps/frontend --ts --tailwind --eslint` |
| 4 | [x] | `pnpm create @express/api apps/backend --ts` (もしくは手動セットアップ) |
| 5 | [x] | `packages/shared-types` 追加 → Zod & tsup 設定 |
| 6 | [x] | `pnpm-workspace.yaml` に `apps/*` と `packages/*` を追加 |
| 7 | [ ] | ルート ESLint / Prettier / **cursorrules** 設定 |
| 8 | [ ] | Husky & lint‑staged 設定 (`pre-commit` で fmt+lint) |
| 9 | [ ] | GitHub Actions: `pnpm install && pnpm lint && pnpm test` を PR ごとに実行 |
| 10 | [ ] | 初回コミット `feat: bootstrap monorepo` |
| 11‑20 | [ ] | 旧 v1 の Step 1‑20 に相当 (frontend 内設定) |

## 3. フロントエンド開発フロー (Step 21‑100)

### 3.1 認証・ダッシュボードまで (Step 21‑40)
| Step | 完了 | 内容 |
|------|------|------|
| 21‑38 | [x] | 旧手順通り (認証・ダッシュボードまで実装済) |
| 39 | [ ] | <!-- reserved: ダッシュボードのパフォーマンス最適化 --> |
| 40 | [ ] | <!-- reserved: アクセシビリティ対応 --> |

### 3.2 UI リファクタ & DnD 置換 (Step 41‑60)
| Step | 完了 | 内容 |
|------|------|------|
| 41 | [ ] | ダッシュボードコンポーネント分割 |
| 42 | [ ] | `useTaskManagement` 等カスタムフック |
| 43 | [ ] | 型定義強化 |
| 44 | [ ] | ユニット/統合テスト追加 |
| 45 | [ ] | **Git**: `refactor(frontend): split dashboard` |
| 51 | [ ] | カンバン UI (`@dnd-kit/core`)   ← ✨ **NEW** |
| 52 | [ ] | ドラッグ&ドロップ実装 (`@dnd-kit/core` + `@dnd-kit/sortable`) |
| 53‑60 | [ ] | タスク詳細モーダル等の実装 |

### 3.3 AI チャット & 設定画面 (Step 61‑80)
| Step | 完了 | 内容 |
|------|------|------|
| 61‑65 | [ ] | AIチャットUI実装 |
| 66 | [ ] | <!-- reserved: 音声入力/読み上げ機能 --> |
| 67‑80 | [ ] | 設定画面とAI設定の実装 |

### 3.4 テスト / CI / デプロイ (Step 81‑100)
| Step | 完了 | 内容 |
|------|------|------|
| 81‑94 | [ ] | テスト実装とCI/CD設定 |
| 95 | [ ] | ダークモード最終調整 |
| 96 | [ ] | アクセシビリティ対応完了 |
| 97 | [ ] | デプロイ後のバグ修正 |
| 98 | [ ] | パフォーマンス最適化 |
| 99 | [ ] | ドキュメント更新 |
| 100 | [ ] | フロントエンド開発完了 |

## 4. バックエンド開発フロー (Step 101‑200)

### 4.1 初期化 (Step 101‑110) ✅ 完了

### 4.2 DB & マイグレーション (Step 111‑120)
| Step | 完了 | 内容 |
|------|------|------|
| 111 | [ ] | Supabase プロジェクト作成 |
| 112 | [ ] | `@supabase/supabase-js` 導入 |
| 113 | [ ] | SQL / Prisma でスキーマ定義 & `supabase db push` |
| 114‑120 | [ ] | RLS ポリシー設定、Git コミット `chore(backend): supabase schema` |

### 4.3 ルーティング & 認証 (Step 121‑140)
| Step | 完了 | 内容 |
|------|------|------|
| 121‑130 | [ ] | Express Router実装 |
| 131‑140 | [ ] | JWT認証実装 |

### 4.4 CRUD & AI API (Step 141‑170)
| Step | 完了 | 内容 |
|------|------|------|
| 141‑160 | [ ] | CRUD API実装 |
| 161‑170 | [ ] | AI API実装 |

### 4.5 テスト / デプロイ (Step 171‑200)
| Step | 完了 | 内容 |
|------|------|------|
| 171‑176 | [ ] | Jest + Supertestでのテスト実装 |
| 177 | [ ] | pinoログ導入 |
| 178 | [ ] | DB & 未知例外ハンドリングテスト |
| 179 | [ ] | テストカバレッジ改善 |
| 180 | [ ] | コードリファクタリング |
| 181 | [ ] | Dockerfile作成 |
| 182 | [ ] | ローカルでのDocker動作確認 |
| 183 | [ ] | 本番環境用の環境変数設定 |
| 184 | [ ] | CI/CDパイプライン構築 |
| 185 | [ ] | Supabase Realtime設定 |
| 186 | [ ] | Fly.ioへのデプロイ |
| 187 | [ ] | ログ/アラート監視設定 |
| 188 | [ ] | ヘルスチェック実装 |
| 189 | [ ] | 本番環境でのテスト |
| 190 | [ ] | スケーリング設定 |
| 191 | [ ] | Datadog/Sentry導入 |
| 192 | [ ] | DBバックアップ設定 |
| 193 | [ ] | セキュリティパッチ適用 |
| 194 | [ ] | アップタイム監視設定 |
| 195 | [ ] | 運用ドキュメント作成 |
| 196 | [ ] | 新機能追加の影響調査 |
| 197 | [ ] | コード/DBスキーマのリファクタリング |
| 198 | [ ] | 不要データのアーカイブ設定 |
| 199 | [ ] | 最終レビュー・改善点共有 |
| 200 | [ ] | バックエンド開発完了 |

</details>

## 5. 総合チェックリスト

- [ ] モノレポ基盤 (Step 0‑20) 完了
- [ ] Frontend Step 21‑60 完了
- [ ] Backend Step 111‑140 完了
- [ ] API ↔ UI 結合テスト通過
- [ ] CI (lint + unit) グリーン
- [ ] Storybook & ドキュメント更新
- [ ] デプロイ (Vercel + Fly.io) 成功

## 6. 付録
### 6.1 ディレクトリ早見表
```
commit_coach/
├── apps/
│   ├── frontend/   # Next.js
│   └── backend/    # Express
├── packages/
│   └── shared-types/
└── docs/
```

### 6.2 ポート & URL
| アプリ | ローカル | 本番 |
|--------|---------|------|
| Frontend | http://localhost:3000 | https://commit‑coach.vercel.app |
| Backend  | http://localhost:4000 | https://api.commit‑coach.com |
| Supabase |        | https://xyz.supabase.co |

---

### Last words
> **案 B (分離型) による改訂はこれで完了です。** 以降はこの計画表を唯一の正として開発を進めてください。質問・追加要望があれば Issue / Discord で連絡を！

```markdown
### 共通基盤 (Step 0‑20)
- [ ] **0**  Node.js 20.x と pnpm 9 インストール
- [x] **1**  `pnpm init` – ルート workspace package.json 生成
- [x] **2**  共有ツール (eslint, prettier, husky, lint‑staged) 導入
- [x] **3**  `pnpm dlx create-next-app` → apps/frontend 初期化
- [x] **4**  Express + TypeScript テンプレ apps/backend 作成
- [x] **5**  packages/shared-types 作成し Zod & tsup 設定
- [x] **6**  `pnpm-workspace.yaml` で apps/* & packages/* を登録
- [ ] **7**  ルート ESLint / Prettier / cursorrules 設定
- [ ] **8**  Husky + lint‑staged (`pre-commit` で fmt & lint)
- [ ] **9**  GitHub Actions: install → lint → test を PR ごとに実行
- [ ] **10** 初回コミット `feat: bootstrap monorepo`
- [ ] **11** apps/frontend `tsconfig.json` 最適化
- [ ] **12** Tailwind `tailwind.config.js` カスタムテーマ拡張
- [ ] **13** 共通 VSCode workspace 設定追加
- [ ] **14** README に開発コンテナ手順追加
- [ ] **15** Conventional Commits チェックツール導入
- [ ] **16** Dependabot or Renovate 設定
- [ ] **17** `.editorconfig` 追加
- [ ] **18** issue / PR テンプレート配置
- [ ] **19** CODEOWNERS 追加
- [ ] **20** GitHub discussion / wiki 有効化

### フロントエンド (Step 21‑100)
#### 3.1 認証 & ダッシュボード (21‑40)
- [x] **21** `/login` ページ作成 (Email+PW フォーム)
- [x] **22** `useAuth` Context で Supabase 認証状態を保持
- [x] **23** ログイン成功時に JWT を Cookie 保存
- [x] **24** ログアウト処理 (`supabase.auth.signOut`)
- [x] **25** 未認証ガード (Next.js middleware)
- [x] **26** `/register` & `/password/reset` ページ実装
- [x] **27** フォームバリデーション (react-hook‑form + zod)
- [x] **28** エラーハンドリング & ローディング UI
- [x] **29** Git commit `feat(frontend): auth flow`
- [x] **30** RTL ユニットテストでフォーム検証
- [x] **31** `/dashboard` ページ骨格
- [x] **32** AIチャットパネル仮実装
- [x] **33** 今日のタスク / 期限間近カード UI
- [x] **34** 時計 & 簡易カレンダー表示
- [x] **35** レスポンシブ調整 (mobile → 縦)
- [x] **36** モックデータフェッチ (SWR + fake api)
- [x] **37** UI アニメーション追加
- [x] **38** Git commit `feat(frontend): dashboard`
- [ ] **39** (reserved)
- [ ] **40** (reserved)

#### 3.2 UI リファクタ & DnD (41‑60)
- [ ] **41** `TaskGroup.tsx` などコンポーネント分割
- [ ] **42** `useTaskManagement`／`useDragAndDrop` hooks 実装
- [ ] **43** 型定義強化 (タスク, プロジェクト)
- [ ] **44** RTL + Cypress テスト追加
- [ ] **45** Git commit `refactor(frontend): split dashboard`
- [ ] **46** `/projects` 一覧ページ雛形
- [ ] **47** フィルタ／検索バー実装
- [ ] **48** pagination / infinite scroll 検討
- [ ] **49** `/projects/[id]` へ遷移リンク
- [ ] **50** プロジェクト詳細画面骨格
- [ ] **51** カンバン UI コンテナ作成
- [ ] **52** **dnd‑kit** でドラッグ＆ドロップ実装
- [ ] **53** タスク詳細モーダル (`Dialog` from shadcn/ui)
- [ ] **54** サブタスク折りたたみ UI
- [ ] **55** 期限・完了ステータス UI
- [ ] **56** AI「タスク分解」ボタン (モック)
- [ ] **57** 期限切れ警告スタイル
- [ ] **58** API モック → 本 API へ切替準備
- [ ] **59** Git commit `feat(frontend): kanban & subtasks`
- [ ] **60** レスポンシブ最終確認 + ユニットテスト

#### 3.3 AIチャット & 設定 (61‑80)
- [ ] **61** `/ai` ルート or サイドチャット UI
- [ ] **62** メッセージ送信 → state へ即時反映
- [ ] **63** システムメッセージ表示トグル
- [ ] **64** OpenAI 応答を表示 (モック)
- [ ] **65** タブ切替 (分解 / モチベーション)
- [ ] **66** (reserved: 音声入力)
- [ ] **67** 無限スクロール or 仮想リスト
- [ ] **68** `/api/v1/ai/coach` と接続
- [ ] **69** Git commit `feat(frontend): ai chat`
- [ ] **70** localStorage にチャットログ保存

#### 3.4 品質 & デプロイ (81‑100)
- [ ] **81** Jest 単体テスト追加 (>80% カバレッジ)
- [ ] **82** スナップショットテスト
- [ ] **83** 入力フォーム異常値テスト
- [ ] **84** Cypress E2E (login→dashboard)
- [ ] **85** Visual diff (Percy) 導入
- [ ] **86** モバイルレスポンシブ screenshot
- [ ] **87** GitHub Actions で CI 緑化
- [ ] **88** Git commit `test(frontend): coverage`
- [ ] **89** Lint / 型エラー 0
- [ ] **90** Storybook ドキュメント追加
- [ ] **91** `next build` 本番ビルド確認
- [ ] **92** Vercel プロジェクト作成 & 環境変数登録
- [ ] **93** `.env.production` 整備
- [ ] **94** 初回デプロイ
- [ ] **95** ダークモード最終調整
- [ ] **96** a11y 追加 (aria‑label 等)
- [ ] **97** GitHub Actions で Vercel デプロイ自動化
- [ ] **98** Git commit `build(frontend): production ready`
- [ ] **99** バグフィックス／パフォチューン
- [ ] **100** README / wiki 更新

### バックエンド (Step 101‑200)
#### 4.1 初期化 (101‑110)
- [x] **101** apps/backend 生成
- [x] **102** `npm init -y`
- [x] **103** TypeScript, ESLint, Prettier 設定
- [x] **104** Express インストール
- [x] **105** tsconfig 設定
- [x] **106** nodemon / ts-node-dev スクリプト
- [x] **107** Git commit `feat(backend): init`
- [x] **108** .env テンプレ追加
- [x] **109** API 方針ドキュメント生成
- [x] **110** "Hello from Backend" テストルート

#### 4.2 DB & マイグレーション (111‑120)
- [ ] **111** Supabase プロジェクト作成
- [ ] **112** `@supabase/supabase-js` 導入
- [ ] **113** Prisma schema → `supabase db push`
- [ ] **114** `users` `projects` `tasks` 他テーブル定義
- [ ] **115** RLS ポリシー `auth.uid() = user_id`
- [ ] **116** 外部キー & インデックス作成
- [ ] **117** `supabase/migrations` ディレクトリコミット
- [ ] **118** 接続テスト (local .env)
- [ ] **119** トランザクション方針決定
- [ ] **120** Git commit `chore(backend): supabase schema`

#### 4.3 ルーティング & 認証 (121‑140)
- [ ] **121** `src/routes/index.ts` で Router 統合
- [ ] **122** `/api/v1/users` CRUD
- [ ] **123** `/api/v1/projects` CRUD
- [ ] **124** Zod バリデーション middleware
- [ ] **125** GET `/projects` 実装
- [ ] **126** POST `/projects` 実装
- [ ] **127** GET `/tasks` 実装
- [ ] **128** 共通エラーハンドラ JSON 形式
- [ ] **129** Git commit `feat(backend): basic routes`
- [ ] **130** morgan ログ & CORS 設定
- [ ] **131** JWT ミドルウェア (`supabase.jwt.verify`)
- [ ] **132** ログイン API `/auth/login`
- [ ] **133** signup API (Supabase Auth)
- [ ] **134** ログアウト処理
- [ ] **135** 認可チェック (ownerId === req.user.id)
- [ ] **136** 役割ベース guard
- [ ] **137** 401/403 エラー統一
- [ ] **138** テストトークンで E2E テスト
- [ ] **139** Git commit `feat(backend): auth`
- [ ] **140** 認証 E2E テスト pass

#### 4.4 CRUD & AI API (141‑170)
- [ ] **141** projectController.ts 実装
- [ ] **142** taskService.ts 実装
- [ ] **143** createProject(userId, data)
- [ ] **144** controller ↔ service 分離
- [ ] **145** GET `/projects` (owner only)
- [ ] **146** PUT `/tasks/:id`
- [ ] **147** try‑catch → errorHandler
- [ ] **148** アクセス権チェック追加
- [ ] **149** Git commit `feat(backend): controllers`
- [ ] **150** Service ユニットテスト
- [ ] **151** POST `/ai/coach` (OpenAI 代理問い合わせ)
- [ ] **152** ユーザー別モデル設定取得
- [ ] **153** OpenAI API 呼び出し実装
- [ ] **154** タスク分解エンドポイント
- [ ] **155** RateLimiter (redis‑rate‑limit)
- [ ] **156** OpenAI エラー時リトライ
- [ ] **157** ai_messages テーブルにログ保存
- [ ] **158** レスポンスフォーマット決定
- [ ] **159** Git commit `feat(backend): ai endpoints`
- [ ] **160** AI API ユニットテスト
- [ ] **161** `task_groups` CRUD
- [ ] **162** `/task-groups` ルート実装
- [ ] **163** `/tasks` CRUD 完了
- [ ] **164** `/subtasks` CRUD 完了
- [ ] **165** 並び順更新 API (DnD 連携)
- [ ] **166** 期限/完了更新 API
- [ ] **167** タスク bulk 更新トランザクション
- [ ] **168** 所有権チェック
- [ ] **169** Git commit `feat(backend): task crud`
- [ ] **170** CRUD 結合テスト pass

#### 4.5 テスト & デプロイ (171‑200)
- [ ] **171** Supertest で統合テスト雛形
- [ ] **172** 認証フロー統合テスト
- [ ] **173** CRUD 正常/異常系テスト
- [ ] **174** AI API モックテスト
- [ ] **175** 共通レスポンス型テスト
- [ ] **176** Jest カバレッジ > 85%
- [ ] **177** pino ロガー導入
- [ ] **178** DB & 未知例外ハンドリングテ

