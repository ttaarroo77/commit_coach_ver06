# 08\_Data\_Model

> **バージョン:** 2025-05-30 (draft)
>
> **DB:** Supabase / PostgreSQL 16 (`commitcoach-prod`)
>
> **責任者:** @nakazawatarou

---

## 1. ドキュメントの目的

本書では Dashboard 撤去後の Commit Coach における **論理データモデル (ER 図) と物理スキーマ定義** を示します。フロントエンド、バックエンド、分析チームが共通言語でエンティティ・リレーションを理解し、クエリ最適化やマイグレーション計画の基盤とすることを目的とします。

---

## 2. ER 図 (PlantUML)

```
@startuml
!define table(x) class "x" as x << (T,#FFAAAA) >>
!define primaryKey(x) <b>x</b>

table(User) {
  primaryKey(id): uuid
  email: varchar
  name: varchar
  created_at: timestamptz
}

table(Project) {
  primaryKey(id): uuid
  name: varchar
  description: text
  owner_id: uuid
  created_at: timestamptz
  updated_at: timestamptz
}

table(Task) {
  primaryKey(id): uuid
  project_id: uuid
  title: varchar
  status: varchar
  order_index: int
  due_date: timestamptz
  created_at: timestamptz
  updated_at: timestamptz
}

table(Subtask) {
  primaryKey(id): uuid
  task_id: uuid
  title: varchar
  status: varchar
  order_index: int
  created_at: timestamptz
  updated_at: timestamptz
}

table(Tag) {
  primaryKey(id): uuid
  name: varchar
  color: varchar
}

table(ProjectTag) {
  project_id: uuid
  tag_id: uuid
}

User ||--o{ Project : "owns"
Project ||--o{ Task : "has"
Task ||--o{ Subtask : "has"
Project ||--o{ ProjectTag : "tagged"
Tag ||--o{ ProjectTag : "tagged"
@enduml
```

> 🗒️ **プレビュー方法:** `plantuml -tsvg 08_data_model.md` で SVG 生成。

---

## 3. エンティティ定義

### 3.1 User

| カラム          | 型              | 制約                | 説明                  |
| ------------ | -------------- | ----------------- | ------------------- |
| `id`         | `uuid`         | `PRIMARY KEY`     | Clerk JWT `sub` を保持 |
| `email`      | `varchar(320)` | `UNIQUE NOT NULL` | **lowercase** 保持    |
| `name`       | `varchar(120)` | NOT NULL          | -                   |
| `created_at` | `timestamptz`  | `DEFAULT now()`   | -                   |

### 3.2 Project

| カラム           | 型              | 制約                    | 説明          |
| ------------- | -------------- | --------------------- | ----------- |
| `id`          | `uuid`         | PK                    | -           |
| `name`        | `varchar(120)` | NOT NULL              | -           |
| `description` | `text`         | -                     | Markdown 可能 |
| `owner_id`    | `uuid`         | `REFERENCES User(id)` | RLS の基準     |
| `created_at`  | `timestamptz`  | `DEFAULT now()`       | -           |
| `updated_at`  | `timestamptz`  | `DEFAULT now()`       | trigger 更新  |

**インデックス**

```sql
CREATE INDEX idx_project_owner ON public.project(owner_id);
```

### 3.3 Task

| カラム           | 型              | 制約                                                           | 説明      |
| ------------- | -------------- | ------------------------------------------------------------ | ------- |
| `id`          | `uuid`         | PK                                                           | -       |
| `project_id`  | `uuid`         | `REFERENCES Project(id) ON DELETE CASCADE`                   | -       |
| `title`       | `varchar(140)` | NOT NULL                                                     | -       |
| `status`      | `varchar(20)`  | `CHECK (status IN ('TODO','IN_PROGRESS','DONE','ARCHIVED'))` | Enum 代替 |
| `order_index` | `int`          | `DEFAULT 0`                                                  | ドラッグ順序  |
| `due_date`    | `timestamptz`  | NULL                                                         | -       |
| `created_at`  | `timestamptz`  | `DEFAULT now()`                                              | -       |
| `updated_at`  | `timestamptz`  | `DEFAULT now()`                                              | -       |

**インデックス**

```sql
CREATE INDEX idx_task_project_status ON public.task(project_id, status);
```

### 3.4 Subtask

| カラム           | 型              | 制約                                      | 説明 |
| ------------- | -------------- | --------------------------------------- | -- |
| `id`          | `uuid`         | PK                                      | -  |
| `task_id`     | `uuid`         | `REFERENCES Task(id) ON DELETE CASCADE` | -  |
| `title`       | `varchar(140)` | NOT NULL                                | -  |
| `status`      | `varchar(20)`  | 同上                                      | -  |
| `order_index` | `int`          | `DEFAULT 0`                             | -  |
| `created_at`  | `timestamptz`  | DEFAULT now()                           | -  |
| `updated_at`  | `timestamptz`  | DEFAULT now()                           | -  |

### 3.5 Tag & ProjectTag (M\:N)

Tag はカラーパレット・カテゴリを提供し、`ProjectTag` が中間テーブル。

| Tag カラム | 型             | 制約                                 |
| ------- | ------------- | ---------------------------------- |
| `id`    | `uuid`        | PK                                 |
| `name`  | `varchar(30)` | UNIQUE NOT NULL                    |
| `color` | `varchar(7)`  | CHECK (`color ~ '^#[0-9A-F]{6}$'`) |

| ProjectTag                     | 型      | 制約                                 |
| ------------------------------ | ------ | ---------------------------------- |
| `project_id`                   | `uuid` | FK → Project(id) ON DELETE CASCADE |
| `tag_id`                       | `uuid` | FK → Tag(id) ON DELETE CASCADE     |
| **PK** (`project_id`,`tag_id`) |        |                                    |

---

## 4. トリガー & モデルロジック

| トリガー                     | テーブル                   | 動作                                          |
| ------------------------ | ---------------------- | ------------------------------------------- |
| `set_updated_at`         | Project, Task, Subtask | `BEFORE UPDATE` で `updated_at = now()`      |
| `order_reindex`          | Task                   | タスク削除後、`order_index` を詰め直す                  |
| `snapshot_project_daily` | Project                | `AFTER UPDATE OF updated_at` で Snapshot へ書込 |

---

## 5. 制約 & ポリシー

### 5.1 RLS

```sql
ALTER TABLE public.project ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_owner_read" ON public.project
FOR SELECT USING ( owner_id = auth.uid() );
```

* **Task/Subtask** は親 Project の RLS を継承 (Postgres 15 の `WITH CHECK (EXISTS)`)

### 5.2 Foreign Key Cascades

* **Project → Task → Subtask** で **CASCADE** を採用し、データ残りを防止
* **Tag** は Project 削除時に不要 Tag が残らないよう `ProjectTag ON DELETE CASCADE`

---

## 6. インデックス設計

| 目的               | テーブル    | カラム                            | 種類    |
| ---------------- | ------- | ------------------------------ | ----- |
| Owner + List     | Project | `(owner_id, updated_at DESC)`  | BTREE |
| Task ステータス       | Task    | `(project_id, status)`         | BTREE |
| Full‑text Search | Task    | `to_tsvector('simple', title)` | GIN   |

> 🔬 フルテキスト検索は将来的に Supabase `pgvector` + Embeddings へ置換予定。

---

## 7. Soft Delete 戦略

* **現状未採用**。削除は物理削除。
* Recycle Bin 機能導入時に `deleted_at` カラム追加を検討。

---

## 8. サンプルクエリ

### 8.1 オーナー毎の最新 5 件プロジェクト

```sql
SELECT id, name, updated_at
FROM   public.project
WHERE  owner_id = :uid
ORDER  BY updated_at DESC
LIMIT  5;
```

### 8.2 プロジェクト毎のタスクステータス集計

```sql
SELECT   project_id,
         status,
         COUNT(*)
FROM     public.task
WHERE    project_id = :pid
GROUP BY project_id, status;
```

---

## 9. 変更履歴管理

* **Prisma Migrate** により `prisma/migrations/` へ DDL を保存
* GitHub の PR で schema diff bot がコメント

---

## 10. 今後の拡張計画

| 四半期     | 施策                   | 詳細                           |
| ------- | -------------------- | ---------------------------- |
| 2025 Q4 | `ActivityLog` テーブル追加 | AI レコメンド用イベントストア             |
| 2026 Q1 | `pgvector` 導入        | コードクローン検出向け Embedding 保存     |
| 2026 Q2 | Sharding 検証          | `project_id` hash でパーティショニング |

---

## 11. 参考リンク

* **Postgres Best Practices:** [https://www.postgresql.org/docs/current/index.html](https://www.postgresql.org/docs/current/index.html)
* **Supabase RLS Guide:** [https://supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)
* **Prisma Schema:** `prisma/schema.prisma`

---

<!-- End of File -->
