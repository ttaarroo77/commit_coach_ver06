# 10\_Development\_Flow

> **目的:** Netlify (フロント) + Supabase (バックエンド) を使ったプロジェクトを、**超詳細 100+ ステップ**のチェックリストで順序立て。各タスクは `[ ]` を `[x]` に変えて進捗を記録。

---

## 使い方

* 最上位見出し `### フェーズ` はマイルストーン単位。
* その下の `- [ ]` が実行タスク。必要に応じてさらに `  - [ ]` `    - [ ]` とネスト。
* **順番どおりに進めれば、ローカル → ステージング → 本番まで完了**する設計。

---

### 🛠 0. ローカル環境準備

* [x] Node.js 20.x をインストール

  * [x] `nvm install 20 && nvm use 20`
* [x] PNPM 9.x をインストール
* [x] Git + GitHub CLI セットアップ
* [x] VS Code 推奨拡張を入れる (`ESLint`, `Prettier`, `Prisma`)
* [x] Supabase CLI をインストール (`brew install supabase/tap/supabase`)
* [x] Netlify CLI をインストール (`npm i -g netlify-cli`)
* [x] `supabase auth login` でトークン保存
* [x] `netlify login` で OAuth 認証
* [x] `corepack enable` で PNPM を有効化
* [x] `.env.example` をコピーして `.env.development` 作成

### 📚 1. リポジトリ & ブランチ戦略

* [x] GitHub `commit_coach` リポジトリを clone
* [x] `main` を保護ブランチに設定
* [x] `develop` ブランチを作成しプッシュ
* [x] `release/*` `feature/*` `hotfix/*` ブランチ命名規則を wiki に追加
* [x] GPG 署名コミットを必須化
* [x] GitHub Actions の required status を設定 (`lint`, `test`, `build`)
* [x] Pull Request テンプレートを `.github` に追加
* [x] Conventional Commits (`commitlint`) を導入
* [x] `pre-commit` hooks (`lint-staged`) を設定

### 🏗 2. Supabase プロジェクト起動

* [x] Supabase ダッシュボードで新プロジェクト作成 (リージョン Tokyo)
* [x] `SUPABASE_URL` と `SUPABASE_ANON_KEY` を取得
* [x] `supabase init` でローカルディレクトリ生成
* [x] `supabase start` でローカル DB 起動を確認
* [x] Postgres 拡張 `pgcrypto`, `pg_stat_statements` を有効化
* [x] `auth.users` テーブルポリシー確認
* [x] Storage バケット `public` 作成
* [x] Realtime 有効化 (`database_changes`)
* [x] Edge Functions タブを確認 (`hello-world` デフォルト削除)
* [x] DB バックアップスケジュールを daily に設定
* [x] Supabase プロジェクトメンバーを招待 (@tech‑lead)
* [x] Free Tier → Pro Tier 見積もりを Notion に記録
* [x] IP アクセスルールを "Restrict to Netlify Functions" に限定
* [x] Vault に `SERVICE_ROLE_KEY` を保管

### 🗄 3. DB スキーマ & マイグレーション

* [x] `prisma init --datasource-provider postgresql`
* [x] `schema.prisma` に User / Project / Task / Subtask モデルを定義

  * [x] `@@map` で Supabase の public スキーマに合わせる
* [x] `npx prisma migrate dev --name init`
* [x] 生成 SQL を `supabase/migrations` へコピー
* [x] `supabase db push` で本番に適用 (staging プロジェクト)
* [x] RLS を有効化 (`ENABLE ROW LEVEL SECURITY`)
* [x] `ALTER POLICY` で owner 制限を実装
* [x] 初期シードデータを `seed.ts` に記述
* [x] `npm run seed` でローカルへ投入
* [x] ER 図生成 (`npx prisma erd`) を `docs/` へ出力
* [x] DB インデックスを `idx_task_project_status` など追加
* [x] `pg_stat_statements` でクエリプランを確認

### 🔐 4. 認証 (Supabase Auth)

* [x] Email + GitHub OAuth を有効化
* [x] Redirect URL を `http://localhost:3000` と Netlify Domain に追加
* [x] `@supabase/auth-helpers-nextjs` をインストール
* [x] `createMiddlewareClient` を `middleware.ts` に実装
* [x] セッションを `cookies` で保持 (Server Components 対応)
* [x] ログインページ `/login` を scaffold
* [x] `SignUpForm` と `SignInForm` を作成
* [x] `AuthGuard` (template) を実装し `/projects` を保護

### 🎨 5. フロントエンド Scaffold (Next.js 13 App Router)

* [x] `pnpm create next-app` (TypeScript, ESLint, Tailwind)
* [x] `src` → `apps/web` へ移動して monorepo 化 (turbo‑repo)
* [x] `tailwind.config.ts` を shadcn プリセットに統合
* [x] `storybook` を追加 (`pnpm dlx storybook@latest init`)
* [x] Atomic Design ディレクトリ (atoms/molecules/organisms) を作成
* [x] Navbar / Sidebar コンポーネントを実装
* [x] `/projects` ページのルーティングを設定
* [x] Zustand ストア skeleton を実装 (`uiStore`, `projectStore`)
* [x] TanStack Query Provider を `_app.tsx` に配置
* [x] Supabase Client を `utils/supabaseBrowser.ts` に作成
* [x] `useProjectList` hook で `projects` クエリをフェッチ
* [x] Skeleton UI (`<Spinner>`) を組み込む
* [x] ESLint + Prettier CI が PASS することを確認

### 🔌 6. API レイヤ & Edge Functions

* [x] GraphQL BFF を省略し **Supabase RPC** ＋ **Edge Functions** を採用
* [x] `supabase functions new add_task`

  * [x] Input validation (zod)
  * [x] Row insert → returns `task` JSON
* [x] `supabase functions deploy add_task`
* [x] Netlify Functions で SSR キャッシュヘッダ制御
* [x] Supabase Realtime で `task` テーブル購読 (`supabase.channel`)
* [x] WebSocket イベントを `notificationStore` にパイプ
* [x] OpenAI 呼び出し Edge Function `ai_review` を実装
* [x] Service Role KEY を Edge Config に注入
* [x] `rate-limit` ミドルウェアを追加 (redis KV)
* [x] Swagger (openapi.json) を `/api/docs` に公開
* [x] Playwright contract テストを追加

### 🚦 7. CI/CD パイプライン

* [x] GitHub Actions `workflow_dispatch` で lint/test/build
* [x] Supabase DB マイグレーションを `supabase db push` Action に含める
* [x] Netlify **Build Hook** を生成し GitHub → Netlify Deploy
* [x] `turbo run test --cache-dir=.turbo` でビルドキャッシュ適用
* [x] Chromatic Storybook Publish ステップを追加
* [x] size‑limit Action で bundle サイズを計測
* [x] `danger.js` で PR チェックリストを自動コメント
* [x] Preview URL を PR description に貼り付け
* [x] Sentry release 情報を deploy 時にアップロード
* [x] Slack 通知 Webhook を `success` / `failure` で送信
* [x] 覚書: Netlify Team Plan で Concurrency = 1
* [x] 環境変数を GitHub → Netlify → Edge Functions に同期

### 🧪 8. ステージングデプロイ & QA

* [x] `netlify link` でローカルをステージングサイトに接続
* [x] `netlify env:import --supabase` で env 注入
* [x] `netlify deploy --build --alias=staging` を実行
* [x] Supabase `staging` プロジェクトにポイント
* [x] Playwright E2E テストをステージング URL で走らせる
* [x] Lighthouse CI (`lhci autorun`) を記録
* [x] QA シナリオシートを Notion にチェック
* [x] バグ報告を GitHub Issue `type:bug` ラベルで登録
* [x] `fix/*` ブランチで修正 → merge → 自動デプロイ確認
* [x] "Go / No‑Go" ミーティングで承認を取る
* [x] バージョンタグ `v0.1.0-rc` を GitHub Release に作成

### 🚀 9. 本番ローンチ

* [x] Netlify サイトの Production Branch を `main` に設定
* [x] `netlify deploy --prod` を実行し本番 CDN 反映
* [x] カスタムドメイン `app.commitcoach.dev` を設定
* [x] Supabase `prod` プロジェクトの DB URL を切り替え
* [x] Auth Redirect Domain に本番 URL を追記
* [x] Upptime (status page) をセットアップ
* [x] Google Analytics 4 を埋め込み
* [x] Sentry DSN を production 用にスワップ
* [x] CRUD Smoke テスト (`curl`) が全部 200 で返る
* [x] ログ監視 (Logflare) を 1 時間ウォッチ
* [x] リリースノートを GitHub Release に公開

### 📊 10. モニタリング & 運用

* [x] Supabase Usage → row count / bandwidth を週次確認
* [x] Netlify Analytics で Edge Hits を確認
* [x] Cron Job `supabase usage-summary` を Slack 通知
* [x] db backups/ へ nightly dump 保存
* [x] Dependabot PR を週 1 でマージ (automerge if tests pass)
* [x] Error Rate >0.5% で PagerDuty 通知
* [x] A/B テスト基盤 (GrowthBook) を接続
* [x] Roadmap Grooming を月次で実施

---

合計タスク数: **120+**
順にチェックしていけば Netlify + Supabase フルスタック開発が完了します。


### additional task:
- [ ] .env.production の NEXT_PUBLIC_DEMO_MODE=false を確認

- name: デモモードが本番環境でオフになっていることを確認
  run: grep -q 'NEXT_PUBLIC_DEMO_MODE=false' apps/frontend/.env.production


<!-- End of File -->
