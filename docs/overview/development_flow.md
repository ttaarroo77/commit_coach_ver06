---
name: "docs/overview_0/development_flow.md"
title: "開発フロー概要 (Development Flow) – 分離型モノレポ版"
description: "[コミットコーチ] – モノレポで管理する Next.js(フロント) + Express(バック) 二層構成の詳細 200‑Step 作業計画表"
version: "2.0"
last_updated: "2025-04-22"
---

---
name: "docs/overview_0/development_flow.md"
title: "開発フロー概要 (Development Flow) – 分離型モノレポ版"
description: "[コミットコーチ] – Next.js(フロント) + Express(バック) を pnpm モノレポで開発するためのロードマップ。本文=要約、付録=200ステップの詳細チェックリスト。"
version: "2.1"
last_updated: "2025-04-22"
---

# 開発手順書 – **要約＋付録詳細方式**

> 本文は “いつでも俯瞰できる” 粒度に抑え、**付録 A** に旧版と同等の **全 200 ステップの詳細一覧** を残しています。チェックボックスは付録側に集約。

---

## 1. 進捗・次アクション（要約）
| レイヤ | 完了 | 直近 TODO |
|--------|------|-----------|
| **共通基盤** | 0‑6 完了 | 7‑10 の CI/Husky 設定<br>初回コミット作成 |
| **Frontend** | 1‑38 完了 | 41‑60 (Dashboard リファクタ & DnD 置換) |
| **Backend** | 101‑110 完了 | 111‑120 (Supabase スキーマと RLS) |
| **品質/CI** | lint OK | 30 までに unit test & CI 緑化 |
| **デプロイ** | 未着手 | 181‑190 Fly.io セットアップ |

---

## 2. 作業フェーズ概要
### 2.1 共通基盤 (Step 0‑20)
- **目的**: モノレポ (pnpm workspaces) の骨格と開発ツール共有を整備。
- **キーポイント**: ESLint/Prettier/CursorRules のルート共有、GitHub Actions を早期導入。

### 2.2 フロントエンド
| フェーズ | ステップ範囲 | 要点 |
|----------|--------------|------|
| 認証 & ダッシュボード | 21‑40 | UI 骨格と Supabase 認証フロー確立 |
| UI リファクタ & DnD | 41‑60 | **dnd‑kit** 採用 / テスト追加 |
| AI チャット & 設定 | 61‑80 | `/ai` チャット UI + ユーザ設定画面 |
| 品質 & デプロイ | 81‑100 | 単体/E2E テスト→Vercel デプロイ |

### 2.3 バックエンド
| フェーズ | ステップ範囲 | 要点 |
|----------|--------------|------|
| 初期化 | 101‑110 | Express + TypeScript 雛形 |
| DB & マイグレーション | 111‑120 | Supabase スキーマ & RLS ポリシー |
| ルーティング & 認証 | 121‑140 | `/api/v1/*` REST & JWT ミドルウェア |
| CRUD / AI API | 141‑170 | タスク & AI エンドポイント実装 |
| テスト / デプロイ | 171‑200 | Jest/Supertest → Docker → Fly.io |

---

## 3. 付録 A — **詳細ステップ一覧 (0‑200)**

> **使い方**  
> * チェック完了 → `[x]` に変更し末尾に PR 番号 or commit SHA を追記。  
> * 数字は一意。未使用番号は予約し再利用しない。  
> * 旧版からの差分（`react‑beautiful‑dnd` → `dnd‑kit` など）は反映済み。

```markdown
### 共通基盤 (Step 0‑20)
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

### フロントエンド (Step 21‑100)
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
- [x] **35** レスポンシブ調整 (mobile → 縦)
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

### バックエンド (Step 101‑200)
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

