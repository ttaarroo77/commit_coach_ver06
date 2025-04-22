---
name: "docs/overview_0/development_flow.md"
title: "Commit Coach Development Flow – Monorepo (Next.js + Express)"
description: "pnpm workspace で管理するフロント (Next.js + TypeScript) とバック (Express + TypeScript) の開発ロードマップ。本文は概要、付録 A に 200 Step の詳細チェックリストを完全収録。"
version: "3.0"
last_updated: "2025-04-22"
---

# 開発手順書 – 要約＋付録詳細方式 (v3.0)

この文書は **分離型モノレポ (Next.js × Express) 方針の正式版** です。旧版との差分を完全に吸収し、200 Step チェックリストを再整備しました。

---

## 1. 進捗サマリ（毎週更新）
| レイヤ | 完了 | 直近 TODO |
|--------|------|-----------|
| **共通基盤** | Step 0‑6 完了 | Step 7‑10: ESLint/Husky/CI 初回コミット |
| **Frontend** | Step 1‑38 完了 | Step 41‑60: Kanban (dnd‑kit) & UI リファクタ |
| **Backend** | Step 101‑110 完了 | Step 111‑120: Supabase スキーマ & RLS |
| **品質/CI** | lint ✅ | unit/E2E テスト → CI グリーン化 |
| **デプロイ** | 未着手 | Step 181‑190: Docker & Fly.io |

> **更新方法**: Step を達成した PR で該当行を `[x]` に変更し、末尾に `(#PR番号)` を追記してください。

---

## 2. 作業フェーズ概要
### 2.1 共通基盤 (Step 0‑20)
モノレポ雛形・共有ツール・CI を整える段階。

### 2.2 フロントエンド (Step 21‑100)
認証 → ダッシュボード → Kanban & AI チャット → 品質・デプロイの 4 フェーズ。

### 2.3 バックエンド (Step 101‑200)
初期化 → DB/RLS → ルーティング&認証 → CRUD+AI → テスト → デプロイ → 運用。

---

## 3. 付録 A — **200 Step チェックリスト**
<details><summary>クリックして展開</summary>

```markdown
### 共通基盤 (0‑20)
- [x] **0**  Node.js 20.x & pnpm 9 インストール
- [x] **1**  `pnpm init` – ルート workspace package.json 生成
- [x] **2**  共有ツール (eslint, prettier, husky, lint‑staged) 導入
- [x] **3**  `pnpm dlx create-next-app` → apps/frontend 初期化
- [x] **4**  `pnpm create @express/api` → apps/backend 初期化
- [x] **5**  packages/shared-types で Zod スキーマ & tsup 設定
- [x] **6**  `pnpm-workspace.yaml` に apps/* & packages/* を登録
- [x] **7**  ルート ESLint / Prettier / CursorRules 設定
- [x] **8**  Husky & lint‑staged (`pre-commit`: fmt+lint)
- [x] **9**  GitHub Actions: install → lint → test ワークフロー
- [x] **10** 初回コミット `feat: bootstrap monorepo`
- [ ] **11** apps/frontend `tsconfig.json` 調整
- [ ] **12** Tailwind `tailwind.config.js` カスタムテーマ
- [ ] **13** VSCode workspace 設定
- [ ] **14** DevContainer / Docker 開発環境 (任意)
- [ ] **15** Conventional Commits チェック (commitlint)
- [ ] **16** Dependabot / Renovate 設定
- [ ] **17** `.editorconfig` 追加
- [ ] **18** Issue & PR テンプレ作成
- [ ] **19** CODEOWNERS 追加
- [ ] **20** GitHub Discussions / Wiki 有効化

### フロントエンド (21‑100)
#### 3.1 認証 & ダッシュボード (21‑40)
- [ ] **21** `/login` ページ – Email/PW フォーム
- [ ] **22** `useAuth` Context (Supabase)
- [ ] **23** JWT を Cookie 保存
- [ ] **24** `/logout` 処理
- [ ] **25** 認証ガード (Next.js middleware)
- [ ] **26** `/register` & `/password/reset` ページ
- [ ] **27** react-hook‑form + zod バリデーション
- [ ] **28** ローディング & エラーメッセージ
- [ ] **29** commit `feat(frontend): auth flow`
- [ ] **30** RTL ユニットテスト(Auth)
- [ ] **31** `/dashboard` 骨格
- [ ] **32** AIチャットプレースホルダ
- [ ] **33** 今日のタスク / 期限間近カード
- [ ] **34** 時計 & mini‑calendar
- [ ] **35** レスポンシブ調整
- [ ] **36** モックデータ (SWR)
- [ ] **37** UI アニメーション
- [ ] **38** commit `feat(frontend): dashboard`
- [ ] **39** (空き)
- [ ] **40** (空き)

#### 3.2 Kanban & リファクタ (41‑60)
- [ ] **41** ダッシュボードコンポーネント分割
- [ ] **42** `useTaskManagement` / `useDragAndDrop` hooks
- [ ] **43** 型定義強化 (Task, Project)
- [ ] **44** RTL + Cypress テスト追加
- [ ] **45** commit `refactor(frontend): split dashboard`
- [ ] **46** `/projects` 一覧 UI
- [ ] **47** 検索 & フィルタ
- [ ] **48** ページネーション / 無限スクロール
- [ ] **49** プロジェクト詳細 `/projects/[id]`
- [ ] **50** 詳細画面骨格
- [ ] **51** カンバンコンテナ
- [ ] **52** **dnd‑kit** 実装 (列/カード DnD)
- [ ] **53** タスク詳細モーダル
- [ ] **54** サブタスク折りたたみ
- [ ] **55** 期限・完了 UI
- [ ] **56** AI「タスク分解」ボタン(モック)
- [ ] **57** 期限切れスタイル
- [ ] **58** API モック → 本 API 切替
- [ ] **59** commit `feat(frontend): kanban`
- [ ] **60** レスポンシブ & ユニットテスト最終

#### 3.3 AIチャット & 設定 (61‑80)
- [ ] **61** サイドチャット UI
- [ ] **62** メッセージ送信即時描画
- [ ] **63** システムメッセージ表示
- [ ] **64** OpenAI 応答 (モック→実装)
- [ ] **65** モード切替タブ
- [ ] **66** 音声入力(将来)
- [ ] **67** 仮想リスト
- [ ] **68** `/api/v1/ai/coach` 接続
- [ ] **69** commit `feat(frontend): ai chat`
- [ ] **70** localStorage ログ保存

#### 3.4 品質 & デプロイ (81‑100)
- [ ] **81** Jest 単体テスト >80%
- [ ] **82** スナップショットテスト
- [ ] **83** フォーム異常値テスト
- [ ] **84** Cypress E2E (auth→dashboard)
- [ ] **85** Percy Visual diff
- [ ] **86** モバイルレスポンシブ shot
- [ ] **87** GitHub Actions CI 緑化
- [ ] **88** commit `test(frontend): coverage`
- [ ] **89** Lint/型エラーゼロ
- [ ] **90** Storybook ドキュメント
- [ ] **91** `next build` 確認
- [ ] **92** Vercel プロジェクト作成
- [ ] **93** `.env.production` 整備
- [ ] **94** 初回デプロイ
- [ ] **95** ダークモード最終
- [ ] **96** a11y (aria‑label)
- [ ] **97** Vercel 自動デプロイ GitHub Actions
- [ ] **98** commit `build(frontend): production ready`
- [ ] **99** バグ修正／パフォチューン
- [ ] **100** README / wiki 更新

### バックエンド (101‑200)
#### 4.1 初期化 (101‑110)
- [ ] **101** apps/backend 生成
- [ ] **102** `npm init -y`
- [ ] **103** TypeScript, ESLint, Prettier 設定
- [ ] **104** Express & ts-node-dev
- [ ] **105** tsconfig
- [ ] **106** 開発サーバースクリプト
- [ ] **107** commit `feat(backend): init`
- [ ] **108** .env.example 追加
- [ ] **109** API 方針ドキュメント
- [ ] **110** "Hello from Backend" ルート

#### 4.2 DB & マイグレーション (111‑120)
- [ ] **111** Supabase プロジェクト作成
- [ ] **112** `@supabase/supabase-js` 導入
- [ ] **113** Prisma schema → `supabase db push`
- [ ] **114** users / projects / tasks 他テーブル
- [ ] **115** RLS ポリシー auth.uid() 制限
- [ ] **116** 外部キー & Index
- [ ] **117** `supabase/migrations` コミット
- [ ] **118** 接続テスト
- [ ] **119** トランザクション方針
- [ ] **120** commit `chore(backend): db schema`

#### 4.3 ルーティング & 認証 (121‑140)
- [ ] **121** `src/routes/index.ts` Router
- [ ] **122** `/api/v1/users` CRUD
- [ ] **123** `/api/v1/projects` CRUD
- [ ] **124** Zod バリデーション MW
- [ ] **125** GET `/projects` 実装
- [ ] **126** POST `/projects` 実装
- [ ] **127** GET `/tasks` 実装
- [ ] **128** 共通 ErrorHandler JSON
- [ ] **129** commit `feat(backend): basic routes`
- [ ] **130** CORS & morgan ログ
- [ ] **131** JWT ミドルウェア
- [ ] **132** POST `/auth/login`
- [ ] **133** POST `/auth/signup`
- [ ] **134** `/auth/logout`
- [ ] **135** オーナーチェック MW
- [ ] **136** 役割ベース guard
- [ ] **137** 401/403 共通レスポンス
- [ ] **138** 認証 E2E テスト
- [ ] **139** commit `feat(backend): auth`
- [ ] **140** 認証テスト pass

#### 4.4 CRUD & AI API (141‑170)
- [ ] **141** projectController 実装
- [ ] **142** taskService 実装
- [ ] **143** createProject(userId, data)
- [ ] **144** controller ↔ service 分離
- [ ] **145** GET `/projects` (owner only)
- [ ] **146** PUT `/tasks/:id`
- [ ] **147** try‑catch → ErrorHandler
- [ ] **148** 所有権チェック
- [ ] **149** commit `feat(backend): controllers`
- [ ] **150** Service ユニットテスト
- [ ] **151** POST `/ai/coach` (OpenAI)
- [ ] **152** ユーザー별モデル設定取得
- [ ] **153** OpenAI API 呼び出し
- [ ] **154** タスク分解 API
- [ ] **155** redis‑rate‑limit
- [ ] **156** OpenAI エラーリトライ
- [ ] **157** ai_messages テーブル保存
- [ ] **158** レスポンスフォーマット確定
- [ ] **159** commit `feat(backend): ai endpoints`
- [ ] **160** AI API テスト
- [ ] **161** task_groups CRUD
- [ ] **162** `/task-groups` ルート
- [ ] **163** tasks CRUD
- [ ] **164** subtasks CRUD
- [ ] **165** 並び順更新 API
- [ ] **166** 期限/完了更新 API
- [ ] **167** bulk 更新トランザクション
- [ ] **168** 所有権チェック強化
- [ ] **169** commit `feat(backend): task crud`
- [ ] **170** CRUD 結合テスト pass

#### 4.5 テスト・デプロイ・運用 (171‑200)
- [ ] **171** Supertest 統合テスト雛形
- [ ] **172** 認証フロー統合テスト
- [ ] **173** CRUD 正常/異常系テスト
- [ ] **174** AI API モックテスト
- [ ] **175** 共通レスポンス型テスト
- [ ] **176** Jest カバレッジ >85%
- [ ] **177** pino ロガー導入
- [ ] **178** DB 例外 & 未知例外ハンドリング
- [ ] **179** commit `test(backend): coverage`
- [ ] **180** コードリファクタリング
- [ ] **181** Dockerfile (multi‑stage)
- [ ] **182** GitHub Actions: Docker build & push
- [ ] **183** Fly.io app 作成 & Secrets 登録
- [ ] **184** fly deploy
- [ ] **185** Supabase Realtime 設定 (任意)
- [ ] **186** ヘルスチェックエンドポイント
- [ ] **187** CloudWatch / Logtail 等監視
- [ ] **188** UptimeRobot 監視設定
- [ ] **189** commit `build(backend): deploy config`
- [ ] **190** 環境差分 (dev/stg/prod) 設定
- [ ] **191** Datadog/Sentry APM
- [ ] **192** DB バックアップスケジュール
- [ ] **193** npm 依存アップデートフロー
- [ ] **194** SLA / 障害対応手順書
- [ ] **195** 新機能影響調査テンプレ
- [ ] **196** コード & スキーマ定期リファクタ
- [ ] **197** データアーカイブ & レポート
- [ ] **198** レトロスペクティブ実施
- [ ] **199** commit `chore(backend): ops docs`
- [ ] **200** プロジェクト総括 & 次期ロードマップ策定
```

</details>

---

## 4. 改訂履歴
| Ver | 日付 | 変更概要 | 編集者 |
|-----|------|----------|--------|
| 3.0 | 2025‑04‑22 | docs を全面再生成。フロント dnd‑kit & 分離型構成を正式反映、200 Step を完備 | ChatGPT |

