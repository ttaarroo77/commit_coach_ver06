# Task Breakdown 機能 復旧指示書

<!-- 本ドキュメントは Windsurf チームへの引き継ぎ用です -->

## 目的

Task Breakdown (AI タスク分解) 機能を **デモモード** から **実運用モード** に戻し、Supabase Edge Functions とフロントエンドを再連携させて **2025‑06‑07** までに本番環境で動作させる。

---

## TL;DR

1. **Supabase CLI にログイン**

   ```bash
   npx supabase login
   supabase link --project-ref <your-project-ref>
   ```
2. **Edge Function をデプロイ**

   ```bash
   supabase functions deploy task_breakdown
   ```
3. **Secrets 登録** (`OPENAI_KEY` / `SERVICE_ROLE_KEY`)
4. `.env.local` の `NEXT_PUBLIC_DEMO_MODE=false` を確認
5. Next.js 側で `supabase.functions.invoke('task_breakdown')` が呼ばれているかを確認
6. `pnpm test && pnpm cypress:ci` が全てグリーンになることを GitHub Actions で検証

---

## 1. 現状把握 (2025‑06‑05 時点)

| 項目                             | 状態                            | 備考                                                 |
| ------------------------------ | ----------------------------- | -------------------------------------------------- |
| Edge Function `task_breakdown` | **未デプロイ**                     | `supabase/functions/task_breakdown/index.ts` は実装済み |
| Supabase Secrets               | **未設定**                       | `OPENAI_KEY`, `SUPABASE_SERVICE_ROLE_KEY`          |
| フロントエンド `.env.local`           | `NEXT_PUBLIC_DEMO_MODE=false` | API 呼び出しは 404                                      |
| ブラウザコンソール                      | `AI からの応答取得に失敗しました`           | Edge Function 不在のため                                |

---

## 2. 事前準備

| ツール          | バージョン     |
| ------------ | --------- |
| Node.js      | 20.x      |
| Supabase CLI | ≥ 1.165.2 |
| pnpm         | 9.x       |

```bash
pnpm install
pnpm dlx supabase@latest --version # CLI が古い場合はアップグレード
```

---

## 3. Edge Function デプロイ手順

```bash
# 1) Supabase にログイン & プロジェクト紐付け
npx supabase login                        # ブラウザが開く
supabase link --project-ref <project-ref> # 1 度実行すれば OK

# 2) 環境変数 (Secrets) を登録
supabase secrets set \
  OPENAI_KEY=$OPENAI_API_KEY \
  SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY

# 3) ローカルテスト (JWT 検証をオフ)
supabase functions serve task_breakdown --no-verify-jwt --env-file supabase/.env.dev
# POST http://localhost:54321/functions/v1/task_breakdown で動作確認

# 4) 本番デプロイ
supabase functions deploy task_breakdown
```

> **NOTE:** `OPENAI_KEY` は 51 文字以上のため直接 CLI に打たず、 `.env.prod` を用意して `--env-file` を渡すことを推奨。

---

## 4. `.env.local` の見直し

```dotenv
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

* `NEXT_PUBLIC_DEMO_MODE=true` が残っている場合は **false** に変更。
* ブラウザの Cookie `demo_mode` を削除してキャッシュをクリア。

---

## 5. フロントエンド呼び出しコードを確認

```ts
// src/lib/api/taskBreakdown.ts
import { createBrowserClient } from '@supabase/ssr'

export async function taskBreakdown(text: string) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.functions.invoke('task_breakdown', {
    body: { prompt: text },
  })
  if (error) throw error
  return data
}
```

### 型定義の自動生成 (任意)

```bash
npx supabase gen types typescript --linked > src/generated/database.types.ts
```

---

## 6. テスト項目

| 種類   | コマンド                       | 合格基準                        |
| ---- | -------------------------- | --------------------------- |
| Unit | `pnpm test -r packages/ai` | 全テスト PASS                   |
| E2E  | `pnpm cypress:ci`          | Task Breakdown が 5 件以上生成される |
| CI   | GitHub Actions `ai.yml`    | ✅ Green                     |

---

## 7. デバッグ Tips

* Supabase Studio → **Logs > Functions** で `task_breakdown` をフィルター
* `supabase functions logs task_breakdown --follow` でリアルタイム確認
* `error.status` が `401 / 404` の場合 … JWT or project‐ref を確認
* `429` の場合 … OpenAI Rate Limit。`OPENAI_ORG` を設定しバースト緩和

---

## 8. ロールバック手順

1. Supabase Dashboard → **Functions > Deployments** → 前バージョンで **Activate** をクリック
2. `.env.local` の `NEXT_PUBLIC_DEMO_MODE=true` に戻し `pnpm dev` 再起動
3. 影響範囲を確認し、GitHub Issue にタイムラインを残す

---

## 9. スケジュール案 (担当 TBD)

| 日付    | 担当        | 作業内容                 |
| ----- | --------- | -------------------- |
| 06‑05 | @alice    | Secrets 登録 & ローカルテスト |
| 06‑06 | @bob      | 本番デプロイ & E2E テスト     |
| 06‑07 | @windsurf | リリース判定 & QA          |

---

### 連絡チャネル

* **Slack:** `#commit-coach`
* **GitHub:** Issue label `AI-007`
* **緊急:** @ttaarroo77 まで DM

---

以上。不明点があればコメントまたは Slack にてご連絡ください。
