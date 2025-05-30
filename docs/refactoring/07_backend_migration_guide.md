# 07\_Backend\_Migration\_Guide

> **バージョン:** 2025-05-30 (draft)
>
<!-- > **移行対象ブランチ:** `safe/004-ui-simple-dashboard` → `feature/remove-dashboard` -->
>
> **DB 環境:** Supabase (Postgres 16) `commitcoach-prod`
>
> **責任者:** @nakazawatarou

---

## 1. ガイドの目的

**不要となったテーブル・ビュー・Edge Function を整理** し、一貫性のあるスキーマへリファクタリングするのが本書の目的です。作業は **ゼロダウンタイム** を前提に、ステップバイステップで進めます。

<!-- 元の記述: フロントエンドから Dashboard 機能を撤去したことに伴い、**不要となったテーブル・ビュー・Edge Function を整理** し、一貫性のあるスキーマへリファクタリングするのが本書の目的です。作業は **ゼロダウンタイム** を前提に、ステップバイステップで進めます。 -->

---

## 2. 影響範囲

<!-- | 種別            | オブジェクト                     | 状態                     |
| ------------- | -------------------------- | ---------------------- |
| Table         | `dashboard_summary`        | **削除**                 |
| View          | `v_dashboard_metrics`      | **削除**                 |
| Function      | `fn_refresh_dashboard()`   | **削除**                 |
| Edge Function | `dashboard-feed`           | **削除** (Supabase Edge) |
| RLS Policy    | `dashboard_summary_rls`    | **削除**                 |
| CRON Job      | `dashboard_refresh_hourly` | **無効化**                | -->

> ⚠️ `snapshot_*` 系のテーブルは **保持** します。将来的なレトロスペクティブ分析で再利用予定。

---

## 3. 事前準備

1. **バックアップ**

   ```bash
   supabase db dump --file backups/2025-05-30_pre-dashboard-drop.sql
   ```
2. **メンテナンスページ** を Netlify Preview に準備 (切替無しで進めるが念のため)
3. Supabase **保護ブランチ** `env=prod` にプッシュ権限を持つのは DBA のみ

---

## 4. マイグレーション手順

### 4.1 DDL 生成

`prisma migrate diff` を使用して削除スクリプトを作成。

```bash
prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datamodel prisma/schema_no_dashboard.prisma \
  --script > prisma/migrations/20250530120000_remove_dashboard.sql
```

### 4.2 SQL 内容 (抜粋)

```sql
BEGIN;

-- Drop Edge Function (supabase functions remove dashboard-feed)
-- (Edge Runtime は CLI で削除)

-- 1. Disable CRON
UPDATE netlify_cron
SET    enabled = false
WHERE  job_name = 'dashboard_refresh_hourly';

-- 2. Drop RLS policy
DROP POLICY IF EXISTS dashboard_summary_rls ON public.dashboard_summary;

-- 3. Drop dependent views
DROP VIEW IF EXISTS public.v_dashboard_metrics CASCADE;

-- 4. Drop table
DROP TABLE IF EXISTS public.dashboard_summary CASCADE;

COMMIT;
```

> **Note:** `CASCADE` が連鎖していないか必ず `pg_depend` を確認。

### 4.3 マイグレーション適用

```bash
supabase db push --file prisma/migrations/20250530120000_remove_dashboard.sql
```

### 4.4 Edge Function 削除

```bash
# デプロイ履歴ごと削除
supabase functions delete dashboard-feed --project commitcoach-prod
```

---

## 5. Row Level Security (RLS) 更新

* 既存テーブル `project`, `task`, `subtask` には変更なし
* `role = 'owner'` かつ `user_id = auth.uid()` 制約を再確認
* 不要になった `dashboard_role` は **削除** (`DROP ROLE dashboard_reader;`)

---

## 6. データバックフィル (オプション)

| テーブル      | カラム            | 処理                                             |
| --------- | -------------- | ---------------------------------------------- |
| `project` | `lastViewedAt` | Dashboard の最終閲覧日時を `project_activity` から計算しコピー |

```sql
UPDATE public.project p
SET    "lastViewedAt" = a.last_seen
FROM   (
  SELECT project_id, MAX(viewed_at) AS last_seen
  FROM   public.project_activity
  GROUP  BY project_id
) a
WHERE  a.project_id = p.id;
```

---

## 7. 検証手順

1. **Schema diff**

   ```bash
   supabase db diff --from prod --to local --schema public
   ```

   * `dashboard_*` が存在しないことを確認
2. **Smoke test** (`/projects` CRUD) が API 200
3. **Edge Logs** に `dashboard-feed` 呼び出しが無いことを確認
4. **Sentry** Error 率が baseline ±0.1% 以内

---

## 8. ロールバック手順

1. バックアップ SQL をリストア

   ```bash
   supabase db reset --file backups/2025-05-30_pre-dashboard-drop.sql
   ```
2. Edge Function 再デプロイ

   ```bash
   supabase functions deploy dashboard-feed
   ```
3. Netlify 本番サイトを Redeploy (`safe/004-ui-simple-dashboard`)

---

## 9. 監視 & アフターケア

| レイヤ  | ツール              | 監視項目                    |
| ---- | ---------------- | ----------------------- |
| DB   | Supabase Metrics | Failed Query Count, CPU |
| API  | Fastify Healthz  | 5xx Rate                |
| Logs | Logflare         | Error, Warning          |

ダッシュボード削除後 72 時間はアラート閾値を 20% 低めに設定。

---

## 10. 既知の懸念事項

| ID    | 内容                                      | 対策                        |
| ----- | --------------------------------------- | ------------------------- |
| BK-01 | 他サービスが `dashboard_summary` を REST fetch | Postman Collection を検索し廃止 |
| BK-02 | Zapier スクリプトが Edge Function を参照         | Zapier 側でフロー停止            |

---

## 11. 参考リンク

* **Supabase CLI Docs:** [https://supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)
* **Prisma Migrate:** [https://www.prisma.io/docs/concepts/components/prisma-migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
* **Postgres RLS:** [https://www.postgresql.org/docs/current/ddl-rowsecurity.html](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

<!-- End of File -->
