# バックエンド要件定義書 — Dashboard & Projects 統合

## 1. 目的

フロントエンド要件 2‑1 に対応し、単一 Truth Table 方式でタスク状態を管理する API／データモデルを整備する。フェイルセーフかつリアルタイム性を確保し、タスクの移動・並び替え・状態変更を競合なく処理する。

## 2. アーキテクチャ概要

| レイヤ          | 採用技術                                 | 役割                                |
| ------------ | ------------------------------------ | --------------------------------- |
| **Database** | Supabase/PostgreSQL 15               | 永続ストア、RLS、論理削除                    |
| **API**      | Supabase Edge Functions (Deno) + RPC | 集約操作（move, reorder）をトランザクション実行    |
| **Realtime** | Supabase Realtime (pg\_notify)       | tasks/subtasks テーブルの変更を broadcast |
| **Auth**     | Supabase Auth (JWT)                  | GitHub OAuth 連携                   |

## 3. データモデル

### 3.1 テーブル ER 図（論理）

```
users (id PK)
  └─< projects (id PK, owner_id FK)
          └─< tasks (id PK, project_id FK)
                  └─< subtasks (id PK, task_id FK)
```

### 3.2 テーブル定義（DDL 抜粋）

```sql
CREATE TYPE status AS ENUM ('today', 'unscheduled', 'done', 'deleted');

CREATE TABLE projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  title       text NOT NULL,
  sort_index  int  NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid REFERENCES projects (id) ON DELETE CASCADE,
  title       text NOT NULL,
  status      status NOT NULL DEFAULT 'unscheduled',
  sort_index  int  NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE subtasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     uuid REFERENCES tasks (id) ON DELETE CASCADE,
  title       text NOT NULL,
  status      status NOT NULL DEFAULT 'unscheduled',
  sort_index  int  NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

/* Indexes */
CREATE INDEX ON tasks (project_id, status, sort_index);
CREATE INDEX ON subtasks (task_id, status, sort_index);
```

### 3.3 Row‑Level Security (RLS)

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY proj_is_owner
  ON projects FOR ALL
  USING (owner_id = auth.uid());
-- tasks / subtasks も同様 (JOIN 経由で owner_id をチェック)
```

## 4. API 仕様

| RPC 名                | メソッド | 引数                                | 処理                                             | 返値    |
| -------------------- | ---- | --------------------------------- | ---------------------------------------------- | ----- |
| `move_subtask`       | POST | `subtask_id, to_status, to_index` | 1. 対象行を更新<br>2. 当該 status 内の sort\_index をリシフト | 成功/失敗 |
| `reorder_subtasks`   | POST | `task_id, ordered_ids[]`          | sort\_index を一括更新                              | 行数    |
| `bulk_update_status` | POST | `subtask_ids[], to_status`        | まとめて status & sort\_index 更新                   | 行数    |
| `get_dashboard`      | GET  | なし                                | today 状態のサブタスクツリーを JSON 返却                     | JSON  |

* すべて単一トランザクションで実行。
* 失敗時は 409 (Conflict) を返し、フロントでリトライ。

## 5. Realtime チャネル設計

| チャネル名                | 監視テーブル   | 備考             |
| -------------------- | -------- | -------------- |
| `projects:<user_id>` | projects | owner\_id フィルタ |
| `tasks:<project_id>` | tasks    | project 単位     |
| `subtasks:<task_id>` | subtasks | task 単位        |

変更時に `payload = row_to_json(NEW)` を publish。

## 6. バリデーション & ビジネスルール

1. status 遷移許可表

   | from \ to   | today    | unscheduled | done | deleted |
   | ----------- | -------- | ----------- | ---- | ------- |
   | today       | –        | ✅           | ✅    | ✅       |
   | unscheduled | ✅        | –           | ✅    | ✅       |
   | done        | ✅        | ✅           | –    | ✅       |
   | deleted     | ❌ (復元不可) | ❌           | ❌    | –       |

2. `deleted` は物理削除せず 30 日後に自動 purge（DB cron job）。

3. sort\_index は 0 から連番、ギャップ可。

## 7. 非機能要件

* **tx latency ≤ 150 ms (p95)** @ 500 writes/min。
* **実効 QPS ≥ 200** on Hobby Supabase tier。
* **データ保持**: logical deletion & PITR 7 days。
* **可観測性**: pgbouncer logs → Logflare, Sentry Deno edge。

## 8. マイグレーション手順

1. `ALTER TYPE` で `status` enum を追加。
2. 旧列 `is_today_flag` からデータ移行。
3. 新インデックス作成。
4. トリガ & RLS を有効化。
5. アプリ切替デプロイ。

## 9. テスト

* Unit: Edge Functionごとに Happy / Error / Concurrency ケース。
* Integration: Playwright でフロント→RPC→DB 一気通し。
* DB: pgTAP で関数パスカバレッジ 90%以上。

## 10. スケジュール（暫定）

| フェーズ           | 期間            | Deliverables                       |
| -------------- | ------------- | ---------------------------------- |
| DB スキーマ実装      | 05/27 – 05/30 | PR #db-schema                      |
| Edge Functions | 06/01 – 06/05 | `move_subtask`, `reorder_subtasks` |
| Realtime & RLS | 06/06 – 06/10 | チャネル設計 & ポリシー                      |
| 負荷試験 & 調整      | 06/11 – 06/14 | k6 レポート                            |
| リリース           | 06/15         | tag `backend-v0.9`                 |

## 11. オープン課題

* Realtime チャネルの多重購読コスト（Nested task が多い場合）。
* `deleted` ステータス後の 30 日ルールをユーザー設定可能にするか。
* マルチユーザー共有（Collaborator 追加）のアクセス制御仕様。

---

最終更新: 2025-05-22
