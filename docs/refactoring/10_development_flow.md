# 10\_Development\_Flow

> **目的:** Netlify (フロント) + Supabase (バックエンド) を使ったプロジェクトを、**超詳細 100+ ステップ**のチェックリストで順序立て。各タスクは `[ ]` を `[x]` に変えて進捗を記録。

---

## 使い方

* 最上位見出し `### フェーズ` はマイルストーン単位。
* その下の `- [ ]` が実行タスク。必要に応じてさらに `  - [ ]` `    - [ ]` とネスト。
* **順番どおりに進めれば、ローカル → ステージング → 本番まで完了**する設計。

---

### 🛠 0. ローカル環境準備

* [ ] Node.js 20.x をインストール

  * [ ] `nvm install 20 && nvm use 20`
* [ ] PNPM 9.x をインストール
* [ ] Git + GitHub CLI セットアップ
* [ ] VS Code 推奨拡張を入れる (`ESLint`, `Prettier`, `Prisma`)
* [ ] Supabase CLI をインストール (`brew install supabase/tap/supabase`)
* [ ] Netlify CLI をインストール (`npm i -g netlify-cli`)
* [ ] `supabase auth login` でトークン保存
* [ ] `netlify login` で OAuth 認証
* [ ] `corepack enable` で PNPM を有効化
* [ ] `.env.example` をコピーして `.env.development` 作成

### 📚 1. リポジトリ & ブランチ戦略

* [ ] GitHub `commit_coach` リポジトリを clone
* [ ] `main` を保護ブランチに設定
* [ ] `develop` ブランチを作成しプッシュ
* [ ] `release/*` `feature/*` `hotfix/*` ブランチ命名規則を wiki に追加
* [ ] GPG 署名コミットを必須化
* [ ] GitHub Actions の required status を設定 (`lint`, `test`, `build`)
* [ ] Pull Request テンプレートを `.github` に追加
* [ ] Conventional Commits (`commitlint`) を導入
* [ ] `pre-commit` hooks (`lint-staged`) を設定

### 🏗 2. Supabase プロジェクト起動

* [ ] Supabase ダッシュボードで新プロジェクト作成 (リージョン Tokyo)
* [ ] `SUPABASE_URL` と `SUPABASE_ANON_KEY` を取得
* [ ] `supabase init` でローカルディレクトリ生成
* [ ] `supabase start` でローカル DB 起動を確認
* [ ] Postgres 拡張 `pgcrypto`, `pg_stat_statements` を有効化
* [ ] `auth.users` テーブルポリシー確認
* [ ] Storage バケット `public` 作成
* [ ] Realtime 有効化 (`database_changes`)
* [ ] Edge Functions タブを確認 (`hello-world` デフォルト削除)
* [ ] DB バックアップスケジュールを daily に設定
* [ ] Supabase プロジェクトメンバーを招待 (@tech‑lead)
* [ ] Free Tier → Pro Tier 見積もりを Notion に記録
* [ ] IP アクセスルールを “Restrict to Netlify Functions” に限定
* [ ] Vault に `SERVICE_ROLE_KEY` を保管

### 🗄 3. DB スキーマ & マイグレーション

* [ ] `prisma init --datasource-provider postgresql`
* [ ] `schema.prisma` に User / Project / Task / Subtask モデルを定義

  * [ ] `@@map` で Supabase の public スキーマに合わせる
* [ ] `npx prisma migrate dev --name init`
* [ ] 生成 SQL を `supabase/migrations` へコピー
* [ ] `supabase db push` で本番に適用 (staging プロジェクト)
* [ ] RLS を有効化 (`ENABLE ROW LEVEL SECURITY`)
* [ ] `ALTER POLICY` で owner 制限を実装
* [ ] 初期シードデータを `seed.ts` に記述
* [ ] `npm run seed` でローカルへ投入
* [ ] ER 図生成 (`npx prisma erd`) を `docs/` へ出力
* [ ] DB インデックスを `idx_task_project_status` など追加
* [ ] `pg_stat_statements` でクエリプランを確認

### 🔐 4. 認証 (Supabase Auth)

* [ ] Email + GitHub OAuth を有効化
* [ ] Redirect URL を `http://localhost:3000` と Netlify Domain に追加
* [ ] `@supabase/auth-helpers-nextjs` をインストール
* [ ] `createMiddlewareClient` を `middleware.ts` に実装
* [ ] セッションを `cookies` で保持 (Server Components 対応)
* [ ] ログインページ `/login` を scaffold
* [ ] `SignUpForm` と `SignInForm` を作成
* [ ] `AuthGuard` (template) を実装し `/projects` を保護

### 🎨 5. フロントエンド Scaffold (Next.js 13 App Router)

* [ ] `pnpm create next-app` (TypeScript, ESLint, Tailwind)
* [ ] `src` → `apps/web` へ移動して monorepo 化 (turbo‑repo)
* [ ] `tailwind.config.ts` を shadcn プリセットに統合
* [ ] `storybook` を追加 (`pnpm dlx storybook@latest init`)
* [ ] Atomic Design ディレクトリ (atoms/molecules/organisms) を作成
* [ ] Navbar / Sidebar コンポーネントを実装
* [ ] `/projects` ページのルーティングを設定
* [ ] Zustand ストア skeleton を実装 (`uiStore`, `projectStore`)
* [ ] TanStack Query Provider を `_app.tsx` に配置
* [ ] Supabase Client を `utils/supabaseBrowser.ts` に作成
* [ ] `useProjectList` hook で `projects` クエリをフェッチ
* [ ] Skeleton UI (`<Spinner>`) を組み込む
* [ ] ESLint + Prettier CI が PASS することを確認

### 🔌 6. API レイヤ & Edge Functions

* [ ] GraphQL BFF を省略し **Supabase RPC** ＋ **Edge Functions** を採用
* [ ] `supabase functions new add_task`

  * [ ] Input validation (zod)
  * [ ] Row insert → returns `task` JSON
* [ ] `supabase functions deploy add_task`
* [ ] Netlify Functions で SSR キャッシュヘッダ制御
* [ ] Supabase Realtime で `task` テーブル購読 (`supabase.channel`)
* [ ] WebSocket イベントを `notificationStore` にパイプ
* [ ] OpenAI 呼び出し Edge Function `ai_review` を実装
* [ ] Service Role KEY を Edge Config に注入
* [ ] `rate-limit` ミドルウェアを追加 (redis KV)
* [ ] Swagger (openapi.json) を `/api/docs` に公開
* [ ] Playwright contract テストを追加

### 🚦 7. CI/CD パイプライン

* [ ] GitHub Actions `workflow_dispatch` で lint/test/build
* [ ] Supabase DB マイグレーションを `supabase db push` Action に含める
* [ ] Netlify **Build Hook** を生成し GitHub → Netlify Deploy
* [ ] `turbo run test --cache-dir=.turbo` でビルドキャッシュ適用
* [ ] Chromatic Storybook Publish ステップを追加
* [ ] size‑limit Action で bundle サイズを計測
* [ ] `danger.js` で PR チェックリストを自動コメント
* [ ] Preview URL を PR description に貼り付け
* [ ] Sentry release 情報を deploy 時にアップロード
* [ ] Slack 通知 Webhook を `success` / `failure` で送信
* [ ] 覚書: Netlify Team Plan で Concurrency = 1
* [ ] 環境変数を GitHub → Netlify → Edge Functions に同期

### 🧪 8. ステージングデプロイ & QA

* [ ] `netlify link` でローカルをステージングサイトに接続
* [ ] `netlify env:import --supabase` で env 注入
* [ ] `netlify deploy --build --alias=staging` を実行
* [ ] Supabase `staging` プロジェクトにポイント
* [ ] Playwright E2E テストをステージング URL で走らせる
* [ ] Lighthouse CI (`lhci autorun`) を記録
* [ ] QA シナリオシートを Notion にチェック
* [ ] バグ報告を GitHub Issue `type:bug` ラベルで登録
* [ ] `fix/*` ブランチで修正 → merge → 自動デプロイ確認
* [ ] “Go / No‑Go” ミーティングで承認を取る
* [ ] バージョンタグ `v0.1.0-rc` を GitHub Release に作成

### 🚀 9. 本番ローンチ

* [ ] Netlify サイトの Production Branch を `main` に設定
* [ ] `netlify deploy --prod` を実行し本番 CDN 反映
* [ ] カスタムドメイン `app.commitcoach.dev` を設定
* [ ] Supabase `prod` プロジェクトの DB URL を切り替え
* [ ] Auth Redirect Domain に本番 URL を追記
* [ ] Upptime (status page) をセットアップ
* [ ] Google Analytics 4 を埋め込み
* [ ] Sentry DSN を production 用にスワップ
* [ ] CRUD Smoke テスト (`curl`) が全部 200 で返る
* [ ] ログ監視 (Logflare) を 1 時間ウォッチ
* [ ] リリースノートを GitHub Release に公開

### 📊 10. モニタリング & 運用

* [ ] Supabase Usage → row count / bandwidth を週次確認
* [ ] Netlify Analytics で Edge Hits を確認
* [ ] Cron Job `supabase usage-summary` を Slack 通知
* [ ] db backups/ へ nightly dump 保存
* [ ] Dependabot PR を週 1 でマージ (automerge if tests pass)
* [ ] Error Rate >0.5% で PagerDuty 通知
* [ ] A/B テスト基盤 (GrowthBook) を接続
* [ ] Roadmap Grooming を月次で実施

---

合計タスク数: **120+**
順にチェックしていけば Netlify + Supabase フルスタック開発が完了します。

<!-- End of File -->
